import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { isLicenseExpired } from '@/lib/utils';
import {
  hashHWID,
  getIPGeolocation,
  detectSuspiciousActivity,
  updateIPRecords,
  isWithinGracePeriod,
  calculateGracePeriodEnd,
  findDeviceByHWID,
  addAuthorizedDevice,
  updateDeviceActivity,
} from '@/lib/hwid-utils';
import { DeviceInfo } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * Enhanced License Validation Endpoint with HWID Binding and IP Tracking
 * Implements device locking, IP geolocation, suspicious activity detection, and grace periods
 * 
 * @param hwid - Required: Hardware identifier from the client application
 * @param apiKey - Required: Application API key
 * @param licenseKey - Required: License key to validate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, licenseKey, hwid } = body;

    // Capture client IP address
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('cf-connecting-ip') ||
                     'unknown';

    // Validate required fields
    if (!apiKey || !licenseKey) {
      return NextResponse.json(
        { 
          valid: false, 
          message: 'Missing required fields: apiKey and licenseKey are required' 
        },
        { status: 400 }
      );
    }

    if (!hwid) {
      return NextResponse.json(
        { 
          valid: false, 
          message: 'Hardware ID (hwid) is required for license validation. Please provide your device identifier.' 
        },
        { status: 400 }
      );
    }

    // Verify API key belongs to an active application
    const appsRef = adminDb.collection('applications');
    const appSnapshot = await appsRef.where('apiKey', '==', apiKey).get();

    if (appSnapshot.empty) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid API key',
      }, { status: 401 });
    }

    const appDoc = appSnapshot.docs[0];
    const app = appDoc.data();

    if (!app.isActive) {
      return NextResponse.json({
        valid: false,
        message: 'Application has been deactivated',
      }, { status: 403 });
    }

    // Find license by key
    const licensesRef = adminDb.collection('licenses');
    const licenseSnapshot = await licensesRef
      .where('key', '==', licenseKey)
      .where('appId', '==', appDoc.id)
      .get();

    if (licenseSnapshot.empty) {
      return NextResponse.json({
        valid: false,
        message: 'License key not found or does not belong to this application',
      });
    }

    const licenseDoc = licenseSnapshot.docs[0];
    const license = licenseDoc.data();

    // Check if license is active
    if (!license.isActive) {
      return NextResponse.json({
        valid: false,
        message: 'License has been deactivated. Please contact support.',
      });
    }

    // Check if license is expired
    if (isLicenseExpired(license.expiresAt)) {
      return NextResponse.json({
        valid: false,
        message: 'License has expired. Please renew your license.',
      });
    }

    // Hash the incoming HWID for secure storage and comparison
    const hashedHWID = hashHWID(hwid);

    // Get IP geolocation data
    const geoData = await getIPGeolocation(clientIp);

    // Update IP records
    const updatedIPRecords = updateIPRecords(license.ipAddresses, clientIp, geoData);

    // Initialize authorized devices array if it doesn't exist
    let authorizedHWIDs: DeviceInfo[] = license.authorizedHWIDs || [];
    const maxDevices = license.maxDevices || 1;

    // Find if this device is already authorized
    const existingDevice = findDeviceByHWID(authorizedHWIDs, hashedHWID);

    if (existingDevice) {
      // Device is already authorized - update activity
      const deviceIndex = authorizedHWIDs.findIndex(d => d.hwid === hashedHWID);
      authorizedHWIDs[deviceIndex] = updateDeviceActivity(existingDevice, clientIp);

      // Update license with latest activity
      await licensesRef.doc(licenseDoc.id).update({
        lastUsed: new Date().toISOString(),
        authorizedHWIDs: authorizedHWIDs,
        ipAddresses: updatedIPRecords,
      });

      // Check for suspicious activity
      const isSuspicious = detectSuspiciousActivity(updatedIPRecords, maxDevices);
      if (isSuspicious && !license.suspiciousActivityDetected) {
        await licensesRef.doc(licenseDoc.id).update({
          suspiciousActivityDetected: true,
        });
      }

      return NextResponse.json({
        valid: true,
        message: 'License is valid - device recognized',
        license: {
          key: license.key,
          appName: license.appName,
          expiresAt: license.expiresAt,
          maxDevices: maxDevices,
          boundDevices: authorizedHWIDs.length,
          deviceLabel: existingDevice.label || 'Unnamed Device',
        },
      });
    }

    // New device attempting to bind
    
    // Check if we're within grace period for HWID changes
    const inGracePeriod = isWithinGracePeriod(license.gracePeriodEndsAt);

    if (authorizedHWIDs.length >= maxDevices && !inGracePeriod) {
      // Device limit reached and not in grace period
      return NextResponse.json({
        valid: false,
        message: `Maximum device limit (${maxDevices}) reached. This license is already bound to ${maxDevices} device(s). Please contact support to reset your devices or upgrade your license.`,
        errorCode: 'DEVICE_LIMIT_REACHED',
        boundDevices: authorizedHWIDs.length,
        maxDevices: maxDevices,
      }, { status: 403 });
    }

    // Allow new device binding
    authorizedHWIDs = addAuthorizedDevice(authorizedHWIDs, hashedHWID, clientIp);

    // Set grace period if this is the first device
    const updateData: any = {
      authorizedHWIDs: authorizedHWIDs,
      ipAddresses: updatedIPRecords,
      lastUsed: new Date().toISOString(),
      // Legacy fields for backward compatibility
      currentDevices: authorizedHWIDs.map(d => d.hwid),
      hwid: hashedHWID,
    };

    // If first device binding, set lockedAt and grace period
    if (!license.lockedAt) {
      updateData.lockedAt = new Date().toISOString();
      updateData.gracePeriodEndsAt = calculateGracePeriodEnd();
    }

    await licensesRef.doc(licenseDoc.id).update(updateData);

    // Check for suspicious activity
    const isSuspicious = detectSuspiciousActivity(updatedIPRecords, maxDevices);
    if (isSuspicious) {
      await licensesRef.doc(licenseDoc.id).update({
        suspiciousActivityDetected: true,
      });
    }

    return NextResponse.json({
      valid: true,
      message: 'License is valid - new device bound successfully',
      license: {
        key: license.key,
        appName: license.appName,
        expiresAt: license.expiresAt,
        maxDevices: maxDevices,
        boundDevices: authorizedHWIDs.length,
        deviceLabel: 'New Device',
        gracePeriodActive: !license.lockedAt || inGracePeriod,
        gracePeriodEndsAt: updateData.gracePeriodEndsAt || license.gracePeriodEndsAt,
      },
      notice: authorizedHWIDs.length === 1 
        ? 'This device has been bound to your license. You have 48 hours to make any device changes if needed.'
        : `Device ${authorizedHWIDs.length} of ${maxDevices} bound successfully.`,
    });

  } catch (error: any) {
    console.error('Error validating license:', error);
    return NextResponse.json(
      { 
        valid: false, 
        message: 'Validation failed. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

