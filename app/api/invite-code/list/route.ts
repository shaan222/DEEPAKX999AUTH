import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * List Invite Codes
 * Returns all invite codes created by the authenticated user
 */
export async function GET(request: NextRequest) {
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
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Get all invite codes created by this user
    const inviteCodesSnapshot = await adminDb
      .collection('inviteCodes')
      .where('createdBy', '==', userId)
      .get();

    const inviteCodes = inviteCodesSnapshot.docs.map((doc) => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        code: data.code,
        isActive: data.isActive,
        maxUses: data.maxUses,
        currentUses: data.currentUses,
        expiresAt: data.expiresAt,
        description: data.description || '',
        createdAt: data.createdAt,
        lastUsedAt: data.lastUsedAt,
        usedByCount: data.usedBy?.length || 0,
      };
    }).sort((a, b) => {
      // Sort by createdAt descending (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Calculate stats
    const stats = {
      total: inviteCodes.length,
      active: inviteCodes.filter((code) => code.isActive).length,
      expired: inviteCodes.filter((code) => {
        if (!code.expiresAt) {
          return false;
        }
        return new Date(code.expiresAt) < new Date();
      }).length,
      totalUses: inviteCodes.reduce((sum, code) => sum + code.currentUses, 0),
    };

    return NextResponse.json({
      success: true,
      inviteCodes,
      stats,
    });

  } catch (error: any) {
    console.error('Error listing invite codes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list invite codes' },
      { status: 500 }
    );
  }
}

