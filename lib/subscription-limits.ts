/**
 * Subscription Limits Configuration
 * Defines limits for each subscription tier
 */

import { SubscriptionTier, SubscriptionLimits, Subscription } from './types';

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    maxApplications: 2,        // 2 applications
    maxLicenses: -1,          // Unlimited licenses (but limited by users)
    maxUsers: 50,             // 25 users per app × 2 apps = 50 total
    maxUsersPerApp: 25,       // 25 users per application
    maxResellersPerApp: 1,    // 1 reseller per application with 10 users under reseller
    resellersEnabled: true,   // Resellers enabled on free tier
  },
  pro: {
    maxApplications: 25,      // 25 applications
    maxLicenses: -1,         // Unlimited licenses
    maxUsers: 12500,         // 500 users per app × 25 apps = 12,500 total
    maxUsersPerApp: 500,     // 500 users per application
    maxResellersPerApp: 10,  // 10 resellers per application with 100 users each
    resellersEnabled: true,  // Resellers enabled on pro tier
  },
  advance: {
    maxApplications: 70,     // 70 applications
    maxLicenses: -1,         // Unlimited licenses
    maxUsers: 59500,         // 850 users per app × 70 apps = 59,500 total
    maxUsersPerApp: 850,     // 850 users per application
    maxResellersPerApp: 45,  // 45 resellers per application with 250 users each
    resellersEnabled: true,  // Resellers enabled on advance tier
  },
};

/**
 * Get subscription limits for a tier
 * Always returns a valid SubscriptionLimits object (falls back to 'free' if tier is invalid)
 */
export function getSubscriptionLimits(tier: SubscriptionTier): SubscriptionLimits {
  // Safety check: ensure tier exists in SUBSCRIPTION_LIMITS
  if (tier in SUBSCRIPTION_LIMITS) {
    return SUBSCRIPTION_LIMITS[tier];
  }
  // Fallback to free tier if tier is somehow invalid
  return SUBSCRIPTION_LIMITS.free;
}

/**
 * Check if a value is within limits (-1 means unlimited)
 */
export function isWithinLimit(current: number, limit: number): boolean {
  if (limit === -1) {
    return true; // Unlimited
  }
  return current < limit;
}

/**
 * Get remaining capacity for a limit
 */
export function getRemainingCapacity(current: number, limit: number): number {
  if (limit === -1) {
    return Infinity; // Unlimited
  }
  return Math.max(0, limit - current);
}

/**
 * Get effective subscription tier
 * Returns current tier or 'free' if inactive
 */
export function getEffectiveTier(subscription?: Subscription): SubscriptionTier {
  if (!subscription || !subscription.isActive) {
    return 'free';
  }
  
  // Check if paid subscription has expired
  if ((subscription.tier === 'pro' || subscription.tier === 'advance') && subscription.endDate) {
    const endDate = new Date(subscription.endDate);
    const now = new Date();
    if (now >= endDate) {
      return 'free'; // Subscription expired
    }
  }
  
  return subscription.tier;
}

/**
 * Check if subscription is active and not expired
 */
export function isSubscriptionActive(subscription?: Subscription): boolean {
  if (!subscription || !subscription.isActive) {
    return false;
  }
  
  // For paid subscriptions with end date, check if expired
  if ((subscription.tier === 'pro' || subscription.tier === 'advance') && subscription.endDate) {
    const endDate = new Date(subscription.endDate);
    const now = new Date();
    return now < endDate;
  }
  
  // Free tier is always active
  return true;
}

/**
 * Initialize subscription for new user
 * Gives them a free tier subscription
 */
export function initializeUserSubscription(): {
  tier: SubscriptionTier;
  startDate: string;
  isActive: boolean;
} {
  return {
    tier: 'free',
    startDate: new Date().toISOString(),
    isActive: true,
  };
}

