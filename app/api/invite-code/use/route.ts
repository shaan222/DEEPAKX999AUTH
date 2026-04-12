import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { generatePermanentUsername } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * Mark Invite Code as Used
 * Records usage of an invite code by a user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userId, userEmail } = body;

    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: code, userId' },
        { status: 400 }
      );
    }

    // Normalize code
    const normalizedCode = code.trim().toUpperCase();

    // Find invite code
    const inviteCodesSnapshot = await adminDb
      .collection('inviteCodes')
      .where('code', '==', normalizedCode)
      .limit(1)
      .get();

    if (inviteCodesSnapshot.empty) {
      return NextResponse.json(
        { error: 'Invite code not found' },
        { status: 404 }
      );
    }

    const inviteCodeDoc = inviteCodesSnapshot.docs[0];
    const inviteCodeData = inviteCodeDoc.data() as any;

    // Update usage count and add user to usedBy array
    await adminDb.collection('inviteCodes').doc(inviteCodeDoc.id).update({
      currentUses: FieldValue.increment(1),
      usedBy: FieldValue.arrayUnion({
        userId,
        userEmail,
        usedAt: new Date().toISOString(),
      }),
      lastUsedAt: new Date().toISOString(),
    });

    // Get user document to check if username exists
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    // Update user document with invitedBy information
    const updateData: any = {
      invitedBy: inviteCodeData.createdBy,
      inviteCodeUsed: normalizedCode,
      clientRank: 'bronze', // Default rank for new users
      rankSubTier: 'client', // Default sub-tier
    };
    
    // Assign permanent username if not exists
    if (!userData?.username) {
      updateData.username = generatePermanentUsername();
    }
    
    await adminDb.collection('users').doc(userId).update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Invite code marked as used',
    });

  } catch (error: any) {
    console.error('Error marking invite code as used:', error);
    return NextResponse.json(
      { error: 'Failed to process invite code' },
      { status: 500 }
    );
  }
}

