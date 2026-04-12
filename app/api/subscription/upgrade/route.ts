import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { SubscriptionTier } from '@/lib/types';
import { checkAndPromoteRank } from '@/lib/rank-progression';

export const dynamic = 'force-dynamic';

/**
 * Upgrade user subscription to Pro or Advance
 * 
 * Note: In production, this should integrate with a payment provider (Stripe, PayPal, etc.)
 * For now, this upgrades the user immediately (useful for testing or manual upgrades)
 * 
 * To add payment integration:
 * 1. Create a checkout session endpoint that redirects to payment provider
 * 2. Use webhooks to update subscription when payment is confirmed
 * 3. Set endDate based on subscription period (monthly/yearly)
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
    const { tier = 'pro', durationMonths = 1 } = body;

    // Verify tier is valid
    if (!['pro', 'advance'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier. Must be "pro" or "advance"' },
        { status: 400 }
      );
    }

    // Get current user document
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const currentSubscription = userData?.subscription || {};

    // Calculate subscription end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + parseInt(durationMonths.toString()));

    // Update subscription to Pro or Advance
    const newSubscription = {
      tier: tier as SubscriptionTier,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      isActive: true,
      // Preserve Stripe IDs if they exist (for payment integration)
      stripeSubscriptionId: currentSubscription.stripeSubscriptionId,
      stripeCustomerId: currentSubscription.stripeCustomerId,
    };

    await adminDb.collection('users').doc(userId).update({
      subscription: newSubscription,
    });

    // Check and promote rank if criteria are met (non-blocking)
    checkAndPromoteRank(userId).catch((error) => {
      console.error('Error checking rank progression after subscription upgrade:', error);
    });

    return NextResponse.json({
      success: true,
      message: `Subscription upgraded to ${tier.charAt(0).toUpperCase() + tier.slice(1)} successfully`,
      subscription: newSubscription,
      expiresAt: endDate.toISOString(),
    });
  } catch (error: any) {
    console.error('Error upgrading subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upgrade subscription' },
      { status: 500 }
    );
  }
}

