/**
 * License Key Signing and Verification
 * 
 * Implements cryptographic signing of license keys to prevent
 * key generators and unauthorized key creation
 */

import { createHmac, randomBytes } from 'crypto';

// Secret key for signing (store in environment variable in production)
const SIGNING_SECRET = process.env.LICENSE_SIGNING_SECRET || 'default-secret-change-in-production';

/**
 * Generate a cryptographically secure license key with signature
 */
export function generateLicenseKey(
  metadata?: {
    userId?: string;
    appId?: string;
    tier?: string;
    expiresAt?: Date;
  }
): {
  key: string;
  signature: string;
  fullKey: string;
} {
  // Generate random key parts
  const part1 = randomBytes(4).toString('hex').toUpperCase();
  const part2 = randomBytes(4).toString('hex').toUpperCase();
  const part3 = randomBytes(4).toString('hex').toUpperCase();
  const part4 = randomBytes(4).toString('hex').toUpperCase();
  
  const baseKey = `${part1}-${part2}-${part3}-${part4}`;
  
  // Create metadata string
  const metadataStr = metadata ? JSON.stringify(metadata) : '';
  
  // Generate HMAC signature
  const hmac = createHmac('sha256', SIGNING_SECRET);
  hmac.update(baseKey + metadataStr);
  const signature = hmac.digest('hex').substring(0, 8).toUpperCase();
  
  return {
    key: baseKey,
    signature,
    fullKey: `${baseKey}-${signature}`,
  };
}

/**
 * Verify license key signature
 */
export function verifyLicenseKeySignature(
  fullKey: string,
  metadata?: {
    userId?: string;
    appId?: string;
    tier?: string;
    expiresAt?: Date;
  }
): {
  valid: boolean;
  baseKey?: string;
  signature?: string;
  error?: string;
} {
  const parts = fullKey.split('-');
  
  if (parts.length !== 5) {
    return { valid: false, error: 'Invalid license key format' };
  }
  
  const baseKey = parts.slice(0, 4).join('-');
  const providedSignature = parts[4];
  
  // Create metadata string
  const metadataStr = metadata ? JSON.stringify(metadata) : '';
  
  // Compute expected signature
  const hmac = createHmac('sha256', SIGNING_SECRET);
  hmac.update(baseKey + metadataStr);
  const expectedSignature = hmac.digest('hex').substring(0, 8).toUpperCase();
  
  if (providedSignature !== expectedSignature) {
    return {
      valid: false,
      baseKey,
      signature: providedSignature,
      error: 'Invalid license key signature',
    };
  }
  
  return {
    valid: true,
    baseKey,
    signature: providedSignature,
  };
}

/**
 * Hash license key for storage (one-way)
 */
export function hashLicenseKey(key: string): string {
  const hmac = createHmac('sha256', SIGNING_SECRET);
  hmac.update(key);
  return hmac.digest('hex');
}

/**
 * Verify hashed license key
 */
export function verifyHashedLicenseKey(key: string, hash: string): boolean {
  const computed = hashLicenseKey(key);
  return computed === hash;
}

/**
 * Generate honeypot license key (looks valid but triggers alerts)
 */
export function generateHoneypotLicenseKey(): string {
  const { fullKey } = generateLicenseKey({ tier: 'honeypot' });
  return fullKey;
}

/**
 * Check if license key is a honeypot
 */
export function isHoneypotLicenseKey(key: string): boolean {
  // In a real implementation, check against a database of honeypot keys
  // For now, we'll check if it contains specific patterns
  return key.includes('TRAP') || key.includes('BAIT');
}

/**
 * Add watermark to license key (embed user identifier)
 */
export function addLicenseWatermark(key: string, userId: string): string {
  // Encode user ID in the key for traceability
  const userIdHash = createHmac('sha256', SIGNING_SECRET)
    .update(userId)
    .digest('hex')
    .substring(0, 4)
    .toUpperCase();
  
  return `${key}-${userIdHash}`;
}

/**
 * Extract watermark from license key
 */
export function extractLicenseWatermark(key: string): string | null {
  const parts = key.split('-');
  if (parts.length >= 6) {
    return parts[5]; // Watermark is the 6th part
  }
  return null;
}

/**
 * Validate license key format
 */
export function validateLicenseKeyFormat(key: string): {
  valid: boolean;
  hasSignature: boolean;
  hasWatermark: boolean;
  error?: string;
} {
  const parts = key.split('-');
  
  if (parts.length < 4) {
    return {
      valid: false,
      hasSignature: false,
      hasWatermark: false,
      error: 'License key too short',
    };
  }
  
  if (parts.length > 6) {
    return {
      valid: false,
      hasSignature: false,
      hasWatermark: false,
      error: 'License key too long',
    };
  }
  
  // Check each part is hexadecimal and correct length
  for (let i = 0; i < Math.min(4, parts.length); i++) {
    if (!/^[A-F0-9]{8}$/.test(parts[i])) {
      return {
        valid: false,
        hasSignature: false,
        hasWatermark: false,
        error: `Invalid format in part ${i + 1}`,
      };
    }
  }
  
  return {
    valid: true,
    hasSignature: parts.length >= 5,
    hasWatermark: parts.length >= 6,
  };
}

