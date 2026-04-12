import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import * as bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * Protected endpoint for updating users from the dashboard
 * Only the application owner can update users
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { appId, userId: targetUserId, updates } = await request.json();

    if (!appId || !targetUserId || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the application belongs to the user
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
        { error: 'Unauthorized to update users for this application' },
        { status: 403 }
      );
    }

    // Get user document from appUsers collection
    const userRef = adminDb.collection('appUsers').doc(targetUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    
    // Verify user belongs to this app
    if (userData?.appId !== appId) {
      return NextResponse.json(
        { error: 'User does not belong to this application' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    // Handle password update (hash it)
    if (updates.password) {
      updateData.password = await bcrypt.hash(updates.password, 10);
    }

    // Handle other fields
    if (updates.username !== undefined) {
      updateData.username = updates.username;
    }
    if (updates.email !== undefined) {
      updateData.email = updates.email;
    }
    if (updates.expiresAt !== undefined) {
      updateData.expiresAt = updates.expiresAt;
    }
    if (updates.hwidLocked !== undefined) {
      updateData.hwidLocked = updates.hwidLocked;
    }

    // Update user document
    await userRef.update({
      ...updateData,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

