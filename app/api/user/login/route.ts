import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { validateInput, validateJSONPayload } from '@/lib/security/input-validator';
import { logAuthAttempt, logInjectionAttempt } from '@/lib/security/logger';

/**
 * Public endpoint for authenticating end-users
 * This is what client applications use to login their users
 * 
 * Security features enabled:
 * - Rate limiting (via middleware)
 * - Input validation and sanitization
 * - Injection attack detection
 * - Comprehensive logging
 * - IP-HWID uniqueness enforcement
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, username, password, version } = body;
    let hwid = body.hwid; // Use 'let' so we can auto-generate if not provided

    // Get client IP address from request headers
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('cf-connecting-ip') ||
                     'unknown';

    // Validate JSON payload structure
    const payloadValidation = validateJSONPayload(body);
    if (!payloadValidation.valid) {
      logInjectionAttempt(request, 'sql', JSON.stringify(body));
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid request payload' 
        },
        { status: 400 }
      );
    }

    if (!apiKey || !username || !password) {
      logAuthAttempt(false, request, undefined, { reason: 'missing_fields' });
      return NextResponse.json(
        { 
          success: false,
          message: 'Missing required fields: apiKey, username, and password are required' 
        },
        { status: 400 }
      );
    }

    // Verify API key belongs to an active application FIRST
    const appsRef = adminDb.collection('applications');
    const appSnapshot = await appsRef.where('apiKey', '==', apiKey).get();

    if (appSnapshot.empty) {
      logAuthAttempt(false, request, undefined, { reason: 'invalid_api_key_not_found' });
      return NextResponse.json({
        success: false,
        message: 'Invalid API key',
      }, { status: 401 });
    }

    const appDoc = appSnapshot.docs[0];
    const app = appDoc.data();

    if (!app.isActive) {
      logAuthAttempt(false, request, undefined, { reason: 'app_deactivated', appId: appDoc.id });
      return NextResponse.json({
        success: false,
        message: 'Application has been deactivated',
      }, { status: 403 });
    }

    // Version is REQUIRED if app has minimumVersion set
    if (app.minimumVersion && !version) {
      logAuthAttempt(false, request, undefined, { 
        reason: 'version_required', 
        appId: appDoc.id,
        minimumVersion: app.minimumVersion 
      });
      return NextResponse.json({
        success: false,
        message: `Version is required. Please provide your application version. Minimum required version is ${app.minimumVersion}.`,
        error: 'VERSION_REQUIRED',
        details: {
          minimumVersion: app.minimumVersion,
          latestVersion: app.currentVersion || app.minimumVersion
        }
      }, { status: 400 });
    }

    // Version Control: Check if client version is allowed (REQUIRED check)
    if (app.minimumVersion && version) {
      // Compare versions (simple string comparison for now, assumes semantic versioning)
      const clientVersion = version.split('.').map(Number);
      const minVersion = app.minimumVersion.split('.').map(Number);
      
      let isVersionValid = true;
      for (let i = 0; i < Math.max(clientVersion.length, minVersion.length); i++) {
        const client = clientVersion[i] || 0;
        const minimum = minVersion[i] || 0;
        
        if (client < minimum) {
          isVersionValid = false;
          break;
        } else if (client > minimum) {
          break;  // Client version is higher, no need to check further
        }
      }
      
      if (!isVersionValid) {
        logAuthAttempt(false, request, undefined, { 
          reason: 'outdated_version', 
          clientVersion: version, 
          minimumVersion: app.minimumVersion,
          appId: appDoc.id 
        });
        return NextResponse.json({
          success: false,
          message: `Your application version (${version}) is outdated. Minimum required version is ${app.minimumVersion}. Please contact the developer to update your application.`,
          error: 'VERSION_OUTDATED',
          details: {
            currentVersion: version,
            minimumVersion: app.minimumVersion,
            latestVersion: app.currentVersion || app.minimumVersion
          }
        }, { status: 426 }); // 426 Upgrade Required
      }
    }

    // Auto-generate HWID if not provided (based on device fingerprint)
    if (!hwid) {
      const userAgent = request.headers.get('user-agent') || 'unknown';
      // Generate deterministic HWID based on IP + User Agent
      hwid = createHash('sha256')
        .update(`${clientIp}-${userAgent}`)
        .digest('hex');
      console.log(`Auto-generated HWID for ${username}: ${hwid.substring(0, 12)}...`);
    }

    // Validate and sanitize inputs
    const apiKeyValidation = validateInput(apiKey, 'apiKey');
    if (!apiKeyValidation.valid) {
      logAuthAttempt(false, request, undefined, { reason: 'invalid_api_key', error: apiKeyValidation.error });
      return NextResponse.json({
        success: false,
        message: apiKeyValidation.error || 'Invalid API key format',
      }, { status: 400 });
    }

    const usernameValidation = validateInput(username, 'username');
    if (!usernameValidation.valid) {
      logAuthAttempt(false, request, undefined, { reason: 'invalid_username', error: usernameValidation.error });
      return NextResponse.json({
        success: false,
        message: usernameValidation.error || 'Invalid username format',
      }, { status: 400 });
    }

    // Validate HWID format (skip validation for auto-generated HWIDs)
    if (hwid && body.hwid) { // Only validate if client explicitly sent it
      const hwidValidation = validateInput(hwid, 'hwid');
      if (!hwidValidation.valid) {
        logAuthAttempt(false, request, undefined, { reason: 'invalid_hwid', error: hwidValidation.error });
        return NextResponse.json({
          success: false,
          message: hwidValidation.error || 'Invalid HWID format',
        }, { status: 400 });
      }
    }


    // Find user by username
    const usersRef = adminDb.collection('appUsers');
    const userSnapshot = await usersRef
      .where('appId', '==', appDoc.id)
      .where('username', '==', username)
      .get();

    if (userSnapshot.empty) {
      logAuthAttempt(false, request, undefined, { reason: 'user_not_found', username });
      return NextResponse.json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const userDoc = userSnapshot.docs[0];
    const user = userDoc.data();

    // Check if user is banned
    if (user.banned === true) {
      logAuthAttempt(false, request, userDoc.id, { reason: 'user_banned', username });
      return NextResponse.json({
        success: false,
        message: 'Your account has been banned. Please contact support.',
      }, { status: 403 });
    }

    // Check if user is paused
    if (user.paused === true) {
      logAuthAttempt(false, request, userDoc.id, { reason: 'user_paused', username });
      return NextResponse.json({
        success: false,
        message: 'Your account has been temporarily paused. Please contact support.',
      }, { status: 403 });
    }

    // Check if user has expired
    if (user.expiresAt) {
      const expiryDate = new Date(user.expiresAt);
      const now = new Date();
      if (now > expiryDate) {
        logAuthAttempt(false, request, userDoc.id, { reason: 'user_expired', username, expiresAt: user.expiresAt });
        return NextResponse.json({
          success: false,
          message: 'Your account has expired. Please contact support to renew.',
        }, { status: 403 });
      }
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      logAuthAttempt(false, request, userDoc.id, { reason: 'password_mismatch', username });
      return NextResponse.json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    // HWID Lock Logic:
    // - First login: Save HWID and lock it automatically
    // - Subsequent logins: Verify HWID matches
    
    if (user.hwid) {
      // User has logged in before - HWID must match exactly
      if (user.hwid !== hwid) {
        const { logHWIDMismatch } = await import('@/lib/security/logger');
        logHWIDMismatch(request, userDoc.id, user.hwid, hwid);
        return NextResponse.json({
          success: false,
          message: 'Hardware ID mismatch. This account is locked to a different device. Contact support if you need to change devices.',
          errorCode: 'HWID_LOCKED',
          hwidLocked: true,
          details: {
            lockedHwid: user.hwid,
            attemptedHwid: hwid,
          }
        }, { status: 403 });
      }
    }
    // If user.hwid is null/undefined, this is first login - we'll save it below

    // If user has a license key, validate it
    if (user.licenseKey) {
      const licensesRef = adminDb.collection('licenses');
      const licenseSnapshot = await licensesRef
        .where('key', '==', user.licenseKey)
        .where('appId', '==', appDoc.id)
        .get();

      if (!licenseSnapshot.empty) {
        const license = licenseSnapshot.docs[0].data();
        
        // Check if license is still valid
        if (!license.isActive || new Date(license.expiresAt) < new Date()) {
          logAuthAttempt(false, request, userDoc.id, { reason: 'license_expired', username, licenseKey: user.licenseKey });
          return NextResponse.json({
            success: false,
            message: 'Your license has expired or been deactivated',
          });
        }
      }
    }

    // IP tracking (no blocking - just for monitoring)
    // Users can have different IPs (traveling, VPN, etc.)
    if (hwid && clientIp !== 'unknown' && user.lastIp && user.lastIp !== clientIp) {
      console.log(`User ${username} IP changed from ${user.lastIp} to ${clientIp}`);
    }

    // Store previous login timestamp before updating
    const previousLoginAt = user.lastLogin || null;

    // Update last login, HWID, and IP address
    const updateData: any = {
      lastLogin: new Date().toISOString(),
      lastIp: clientIp,
    };

    // Save HWID on first login and lock it automatically
    if (!user.hwid) {
      // First time login - save HWID and lock it
      updateData.hwid = hwid;
      updateData.hwidLocked = true;
      console.log(`First login for user ${username} - HWID auto-saved and locked: ${hwid.substring(0, 12)}...`);
    }
    // If user already has HWID, it's already validated above, no need to update
    
    const isFirstLogin = !user.hwid;

    await usersRef.doc(userDoc.id).update(updateData);

    // Log successful authentication
    logAuthAttempt(true, request, userDoc.id, { 
      username, 
      appId: appDoc.id,
      hwid: hwid ? hwid.substring(0, 12) + '...' : null 
    });

    return NextResponse.json({
      success: true,
      message: isFirstLogin ? 'First login successful - Device locked' : 'Login successful',
      user: {
        id: userDoc.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        licenseKey: user.licenseKey,
        hwid: updateData.hwid || user.hwid, // Return the HWID (auto-generated or existing)
        ip: clientIp,
        hwidLocked: true, // Always locked after first login
        expiresAt: user.expiresAt || null,
        lastLoginAt: previousLoginAt, // Return the previous login timestamp
        currentLoginAt: updateData.lastLogin, // Return the current login timestamp
        isFirstLogin: isFirstLogin, // Let client know if this was first login
      },
    });
  } catch (error: any) {
    console.error('Error logging in user:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Login failed. Please try again.' 
      },
      { status: 500 }
    );
  }
}

