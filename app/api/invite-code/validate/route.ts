import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * Validate Invite Code
 * Checks if an invite code is valid and available for use
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Invite code is required' },
        { status: 400 }
      );
    }

    // Normalize code to uppercase
    const normalizedCode = code.trim().toUpperCase();

    // Find invite code in database
    const inviteCodesSnapshot = await adminDb
      .collection('inviteCodes')
      .where('code', '==', normalizedCode)
      .limit(1)
      .get();

    if (inviteCodesSnapshot.empty) {
      return NextResponse.json(
        { valid: false, error: 'Invalid invite code' },
        { status: 404 }
      );
    }

    const inviteCodeDoc = inviteCodesSnapshot.docs[0];
    const inviteCodeData = inviteCodeDoc.data() as any;

    // Check if code is active
    if (!inviteCodeData.isActive) {
      return NextResponse.json(
        { valid: false, error: 'This invite code has been deactivated' },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (inviteCodeData.expiresAt) {
      const expiryDate = new Date(inviteCodeData.expiresAt);
      if (expiryDate < new Date()) {
        return NextResponse.json(
          { valid: false, error: 'This invite code has expired' },
          { status: 400 }
        );
      }
    }

    // Check usage limit
    if (inviteCodeData.maxUses !== -1) {
      if (inviteCodeData.currentUses >= inviteCodeData.maxUses) {
        return NextResponse.json(
          { valid: false, error: 'This invite code has reached its usage limit' },
          { status: 400 }
        );
      }
    }

    // Code is valid
    return NextResponse.json({
      valid: true,
      code: normalizedCode,
      remainingUses: inviteCodeData.maxUses === -1 
        ? 'Unlimited' 
        : inviteCodeData.maxUses - inviteCodeData.currentUses,
    });

  } catch (error: any) {
    console.error('Error validating invite code:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate invite code' },
      { status: 500 }
    );
  }
}

