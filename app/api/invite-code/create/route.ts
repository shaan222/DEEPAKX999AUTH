import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { generateInviteCode } from '@/lib/utils';
import { checkAndPromoteRank } from '@/lib/rank-progression';

export const dynamic = 'force-dynamic';

/**
 * Create Invite Code
 * Generates a new invite code for user registration
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Check if user is admin
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data() as any;
    
    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can create invite codes.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      maxUses = -1,  // -1 = unlimited
      expiresInDays = null,
      description = '',
      customCode = null,
    } = body;

    // Generate or use custom code
    let code = customCode?.trim().toUpperCase();
    
    if (!code) {
      // Generate random code
      code = generateInviteCode();
    }

    // Check if code already exists
    const existingCodeSnapshot = await adminDb
      .collection('inviteCodes')
      .where('code', '==', code)
      .get();

    if (!existingCodeSnapshot.empty) {
      return NextResponse.json(
        { error: 'This invite code already exists' },
        { status: 400 }
      );
    }

    // Calculate expiry date
    let expiresAt = null;
    if (expiresInDays && expiresInDays > 0) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiresInDays);
      expiresAt = expiryDate.toISOString();
    }

    // Create invite code document
    const inviteCodeRef = await adminDb.collection('inviteCodes').add({
      code,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      isActive: true,
      maxUses: maxUses,
      currentUses: 0,
      expiresAt,
      description,
      usedBy: [],
      lastUsedAt: null,
    });

    // Check and promote rank if criteria are met (non-blocking)
    checkAndPromoteRank(userId).catch((error) => {
      console.error('Error checking rank progression after invite creation:', error);
    });

    return NextResponse.json({
      success: true,
      inviteCode: {
        id: inviteCodeRef.id,
        code,
        maxUses,
        currentUses: 0,
        expiresAt,
        description,
      },
    });

  } catch (error: any) {
    console.error('Error creating invite code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create invite code' },
      { status: 500 }
    );
  }
}

