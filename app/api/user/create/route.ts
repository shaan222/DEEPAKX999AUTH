import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import * as bcrypt from 'bcryptjs';
import { canCreateUser } from '@/lib/subscription-utils';

export const dynamic = 'force-dynamic';

/**
 * Protected endpoint for creating users from the dashboard
 * Only the application owner can create users
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { appId, username, password, email, licenseKey, expiresAt, hwidLocked } = body;

    if (!appId || !username || !password) {
      return NextResponse.json(
        { error: 'Application ID, username, and password are required' },
        { status: 400 }
      );
    }

    // Verify the app belongs to this user
    const appDoc = await adminDb.collection('applications').doc(appId).get();
    if (!appDoc.exists) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const app = appDoc.data();
    if (app?.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to create users for this application' },
        { status: 403 }
      );
    }

    // Check subscription limits
    const limitCheck = await canCreateUser(userId, appId);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { 
          error: limitCheck.reason || 'User limit reached',
          limitReached: true,
          currentTotal: limitCheck.currentTotal,
          currentPerApp: limitCheck.currentPerApp,
          limitTotal: limitCheck.limitTotal,
          limitPerApp: limitCheck.limitPerApp,
        },
        { status: 403 }
      );
    }

    // Check if username already exists in this app
    const usersRef = adminDb.collection('appUsers');
    const existingUser = await usersRef
      .where('appId', '==', appId)
      .where('username', '==', username)
      .get();

    if (!existingUser.empty) {
      return NextResponse.json(
        { error: 'Username already exists in this application' },
        { status: 400 }
      );
    }

    // If license key is provided, verify it belongs to this app
    if (licenseKey) {
      const licensesRef = adminDb.collection('licenses');
      const licenseSnapshot = await licensesRef
        .where('key', '==', licenseKey)
        .where('appId', '==', appId)
        .get();

      if (licenseSnapshot.empty) {
        return NextResponse.json(
          { error: 'License key not found or does not belong to this application' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    // NOTE: HWID and IP are NOT set here - they will be captured from the ACTUAL USER
    // when they login from their client application for the first time
    const userData: any = {
      appId,
      username,
      password: hashedPassword,
      email: email || null,
      licenseKey: licenseKey || null,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      hwid: null,  // Will be set on first login from client app
      lastIp: null,  // Will be set on first login from client app (NOT admin's IP)
      hwidLocked: hwidLocked === true,  // Default to false if not provided
      metadata: {},
    };

    // Add expiration date if provided
    if (expiresAt) {
      // Convert datetime-local format to ISO string
      userData.expiresAt = new Date(expiresAt).toISOString();
    }

    const userDoc = await usersRef.add(userData);

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: userDoc.id,
        username,
        email,
        licenseKey,
        createdAt: userData.createdAt,
        expiresAt: userData.expiresAt || null,
        hwidLocked: userData.hwidLocked || false,
      },
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}

