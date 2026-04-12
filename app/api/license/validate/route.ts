import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { isLicenseExpired } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, appName, deviceId } = body;

    if (!key || !appName) {
      return NextResponse.json(
        { valid: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find license by key
    const licensesRef = adminDb.collection('licenses');
    const snapshot = await licensesRef.where('key', '==', key).get();

    if (snapshot.empty) {
      return NextResponse.json({
        valid: false,
        message: 'License key not found',
      });
    }

    const licenseDoc = snapshot.docs[0];
    const license = { id: licenseDoc.id, ...licenseDoc.data() } as any;

    // Check if license is active
    if (!license.isActive) {
      return NextResponse.json({
        valid: false,
        message: 'License has been deactivated',
      });
    }

    // Check if license matches the app
    if (license.appName !== appName) {
      return NextResponse.json({
        valid: false,
        message: 'License key is not valid for this application',
      });
    }

    // Check if license is expired
    if (isLicenseExpired(license.expiresAt)) {
      return NextResponse.json({
        valid: false,
        message: 'License has expired',
      });
    }

    // Check device limit if deviceId is provided
    if (deviceId) {
      const currentDevices = license.currentDevices || [];
      
      if (!currentDevices.includes(deviceId)) {
        if (currentDevices.length >= license.maxDevices) {
          return NextResponse.json({
            valid: false,
            message: 'Maximum device limit reached',
          });
        }
        
        // Add device to the list
        currentDevices.push(deviceId);
        await licensesRef.doc(licenseDoc.id).update({
          currentDevices,
          lastUsed: new Date().toISOString(),
        });
      } else {
        // Update last used
        await licensesRef.doc(licenseDoc.id).update({
          lastUsed: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      valid: true,
      message: 'License is valid',
      license: {
        key: license.key,
        appName: license.appName,
        expiresAt: license.expiresAt,
        maxDevices: license.maxDevices,
        currentDevices: license.currentDevices?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('Error validating license:', error);
    return NextResponse.json(
      { valid: false, message: 'Validation failed' },
      { status: 500 }
    );
  }
}

