export type SubscriptionTier = 'free' | 'pro' | 'advance';

export type ClientRank = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';

export type RankSubTier = 'invite' | 'client' | 'subscription';

export interface RankProgressionCriteria {
  invites: number;      // Number of invite codes created
  clients: number;      // Number of licenses/clients created
  subscriptions: number; // Number of paid subscriptions (pro/advance)
}

/**
 * Rank progression criteria for each tier
 * Users need to meet ANY ONE of these criteria to progress to the next tier
 */
export const RANK_PROGRESSION_CRITERIA: Record<ClientRank, RankProgressionCriteria | null> = {
  bronze: null, // Starting rank, no criteria needed
  silver: {
    invites: 100,
    clients: 50,
    subscriptions: 2,
  },
  gold: {
    invites: 250,
    clients: 150,
    subscriptions: 5,
  },
  platinum: {
    invites: 500,
    clients: 300,
    subscriptions: 10,
  },
  diamond: {
    invites: 1000,
    clients: 600,
    subscriptions: 20,
  },
  master: {
    invites: 2500,
    clients: 1500,
    subscriptions: 50,
  },
};

export interface RankInfo {
  rank: ClientRank;
  displayName: string;
  level: number;
  color: string;
  gradient: string;
  badgeColor: string;
  icon: string;
  gradientColors: {
    from: string;
    via?: string;
    to: string;
  };
  subTiers: {
    invite: {
      name: string;
      displayName: string;
      icon: string;
      color: string;
    };
    client: {
      name: string;
      displayName: string;
      icon: string;
      color: string;
    };
    subscription: {
      name: string;
      displayName: string;
      icon: string;
      color: string;
    };
  };
}

export const RANK_CONFIG: Record<ClientRank, RankInfo> = {
  bronze: {
    rank: 'bronze',
    displayName: 'Bronze',
    level: 1,
    color: '#cd7f32',
    gradient: 'from-amber-700 to-amber-800',
    badgeColor: 'bg-amber-700',
    icon: '🥉',
    gradientColors: {
      from: '#78350f',
      to: '#92400e',
    },
    subTiers: {
      invite: {
        name: 'bronze-invite',
        displayName: 'Bronze (Invite)',
        icon: '📨',
        color: '#cd7f32',
      },
      client: {
        name: 'bronze-client',
        displayName: 'Bronze (Client)',
        icon: '👥',
        color: '#cd7f32',
      },
      subscription: {
        name: 'bronze-subscription',
        displayName: 'Bronze (Pro)',
        icon: '⭐',
        color: '#cd7f32',
      },
    },
  },
  silver: {
    rank: 'silver',
    displayName: 'Silver',
    level: 2,
    color: '#c0c0c0',
    gradient: 'from-slate-400 to-slate-500',
    badgeColor: 'bg-slate-400',
    icon: '🥈',
    gradientColors: {
      from: '#94a3b8',
      to: '#64748b',
    },
    subTiers: {
      invite: {
        name: 'silver-invite',
        displayName: 'Silver (Invite)',
        icon: '📨',
        color: '#c0c0c0',
      },
      client: {
        name: 'silver-client',
        displayName: 'Silver (Client)',
        icon: '👥',
        color: '#c0c0c0',
      },
      subscription: {
        name: 'silver-subscription',
        displayName: 'Silver (Pro)',
        icon: '⭐',
        color: '#c0c0c0',
      },
    },
  },
  gold: {
    rank: 'gold',
    displayName: 'Gold',
    level: 3,
    color: '#ffd700',
    gradient: 'from-yellow-300 to-yellow-400',
    badgeColor: 'bg-yellow-300',
    icon: '🥇',
    gradientColors: {
      from: '#ca8a04',
      to: '#a16207',
    },
    subTiers: {
      invite: {
        name: 'gold-invite',
        displayName: 'Gold (Invite)',
        icon: '📨',
        color: '#ffd700',
      },
      client: {
        name: 'gold-client',
        displayName: 'Gold (Client)',
        icon: '👥',
        color: '#ffd700',
      },
      subscription: {
        name: 'gold-subscription',
        displayName: 'Gold (Pro)',
        icon: '⭐',
        color: '#ffd700',
      },
    },
  },
  platinum: {
    rank: 'platinum',
    displayName: 'Platinum',
    level: 4,
    color: '#71717a',
    gradient: 'from-zinc-200 to-zinc-300',
    badgeColor: 'bg-zinc-200',
    icon: '🔷',
    gradientColors: {
      from: '#52525b',
      to: '#3f3f46',
    },
    subTiers: {
      invite: {
        name: 'platinum-invite',
        displayName: 'Platinum (Invite)',
        icon: '📨',
        color: '#71717a',
      },
      client: {
        name: 'platinum-client',
        displayName: 'Platinum (Client)',
        icon: '👥',
        color: '#71717a',
      },
      subscription: {
        name: 'platinum-subscription',
        displayName: 'Platinum (Pro)',
        icon: '⭐',
        color: '#71717a',
      },
    },
  },
  diamond: {
    rank: 'diamond',
    displayName: 'Diamond',
    level: 5,
    color: '#3b82f6',
    gradient: 'from-sky-400 via-blue-500 to-cyan-500',
    badgeColor: 'bg-gradient-to-r from-sky-400 to-cyan-500',
    icon: '💎',
    gradientColors: {
      from: '#38bdf8',
      via: '#3b82f6',
      to: '#06b6d4',
    },
    subTiers: {
      invite: {
        name: 'diamond-invite',
        displayName: 'Diamond (Invite)',
        icon: '📨',
        color: '#3b82f6',
      },
      client: {
        name: 'diamond-client',
        displayName: 'Diamond (Client)',
        icon: '👥',
        color: '#3b82f6',
      },
      subscription: {
        name: 'diamond-subscription',
        displayName: 'Diamond (Pro)',
        icon: '⭐',
        color: '#3b82f6',
      },
    },
  },
  master: {
    rank: 'master',
    displayName: 'Master',
    level: 6,
    color: '#9333ea',
    gradient: 'from-indigo-600 via-purple-600 to-violet-600',
    badgeColor: 'bg-gradient-to-r from-indigo-600 to-violet-600',
    icon: '👑',
    gradientColors: {
      from: '#4f46e5',
      via: '#7c3aed',
      to: '#8b5cf6',
    },
    subTiers: {
      invite: {
        name: 'master-invite',
        displayName: 'Master (Invite)',
        icon: '📨',
        color: '#9333ea',
      },
      client: {
        name: 'master-client',
        displayName: 'Master (Client)',
        icon: '👥',
        color: '#9333ea',
      },
      subscription: {
        name: 'master-subscription',
        displayName: 'Master (Pro)',
        icon: '⭐',
        color: '#9333ea',
      },
    },
  },
};

export interface Subscription {
  tier: SubscriptionTier;
  startDate: string;
  endDate?: string;  // For paid subscriptions
  isActive: boolean;
  stripeSubscriptionId?: string;  // Stripe subscription ID for paid plans
  stripeCustomerId?: string;  // Stripe customer ID
}

export interface SubscriptionLimits {
  maxApplications: number;
  maxLicenses: number;
  maxUsers: number;  // Total users across all applications
  maxUsersPerApp: number;  // Per application limit
  maxResellersPerApp: number;  // Maximum resellers per application
  resellersEnabled: boolean;  // Whether reseller feature is enabled
}

export interface User {
  uid: string;
  email: string;
  username?: string;  // Permanent, non-changeable username for security
  role: 'user' | 'admin';
  clientRank?: ClientRank;  // Client-side rank for visual enhancements
  rankSubTier?: RankSubTier;  // Sub-tier: invite, client, or subscription
  createdAt: Date;
  subscription?: Subscription;
}

export interface Application {
  id: string;
  name: string;
  apiKey: string;
  userId: string;
  createdAt: string;
  isActive: boolean;
  description?: string;
  webhookUrl?: string;
  currentVersion?: string;  // Current version of the application (e.g., "1.0.0")
  minimumVersion?: string;  // Minimum version required to login
}

export interface IPRecord {
  ip: string;
  firstSeen: string;
  lastSeen: string;
  country?: string;
  city?: string;
  isp?: string;
  isSuspicious?: boolean;
}

export interface DeviceInfo {
  hwid: string;  // Hashed hardware ID
  label?: string;  // User-friendly name like "Work Laptop"
  lockedAt: string;  // When this device was bound
  lastUsed: string;  // Last activity timestamp
  ipAddresses: string[];  // IPs used from this device
}

export interface License {
  id: string;
  key: string;
  userId: string;
  appId: string;
  appName: string;
  expiresAt: Date;
  createdAt: Date;
  isActive: boolean;
  maxDevices: number;  // How many devices can bind to this license
  currentDevices: string[];  // Legacy: Array of device IDs
  lastUsed?: Date;
  hwid?: string;  // Legacy: Single HWID (for backward compatibility)
  
  // Enhanced HWID Binding Fields
  lockedAt?: string;  // When the first device was bound
  authorizedHWIDs?: DeviceInfo[];  // Array of authorized devices with details
  ipAddresses?: IPRecord[];  // All IP addresses that accessed this license
  suspiciousActivityDetected?: boolean;  // Flag for admin review
  gracePeriodEndsAt?: string;  // 48-hour grace period for HWID changes
  
  metadata?: {
    [key: string]: any;
  };
}

export interface ValidationResponse {
  valid: boolean;
  message: string;
  license?: License;
  userData?: {
    email?: string;
    createdAt?: string;
  };
}

export interface ApiKeyStats {
  totalKeys: number;
  activeKeys: number;
  expiredKeys: number;
  totalValidations: number;
}

export interface Reseller {
  id: string;
  email: string;
  name: string;
  ownerId: string;  // The main account owner who created this reseller
  appId: string;  // The application this reseller can sell for
  appName: string;
  apiKey: string;  // Unique API key for the reseller
  isActive: boolean;
  createdAt: string;
  
  // Permissions
  canCreateLicenses: boolean;
  canViewLicenses: boolean;
  canDeleteLicenses: boolean;
  
  // Limits
  maxLicenses: number;  // How many licenses this reseller can create (-1 = unlimited)
  currentLicenses: number;  // How many licenses they've created
  
  // Sales tracking
  totalSales: number;  // Total number of licenses sold
  totalRevenue: number;  // Total revenue (if you track pricing)
  commissionRate: number;  // Commission percentage (0-100)
  
  // Analytics
  lastSaleAt?: string;
  lastLoginAt?: string;
  
  // Contact & notes
  phone?: string;
  company?: string;
  notes?: string;
  
  metadata?: {
    [key: string]: any;
  };
}

export interface ResellerStats {
  totalResellers: number;
  activeResellers: number;
  inactiveResellers: number;
  totalLicensesSold: number;
  totalRevenue: number;
  topReseller?: {
    id: string;
    name: string;
    sales: number;
  };
}
