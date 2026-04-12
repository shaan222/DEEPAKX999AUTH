/**
 * Advanced Rate Limiting System
 * 
 * Implements multiple layers of rate limiting:
 * - Per IP address
 * - Per API key
 * - Per user agent fingerprint
 * - Adaptive rate limiting based on behavior
 */

import { NextRequest } from 'next/server';

// In-memory store (for development/serverless - use Redis in production)
interface RateLimitRecord {
  count: number;
  resetTime: number;
  violations: number;
  lastViolation?: number;
  blocked?: boolean;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const ipReputationStore = new Map<string, number>(); // reputation score 0-100

// Rate limit configurations for different endpoint types
export const RATE_LIMITS = {
  // Authentication endpoints - strict limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
    blockDurationMs: 60 * 60 * 1000, // 1 hour block after violations
  },
  // License validation - moderate limits
  validation: {
    windowMs: 60 * 1000, // 1 minute
    maxAttempts: 10,
    blockDurationMs: 30 * 60 * 1000, // 30 minutes block
  },
  // General API - relaxed limits
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxAttempts: 100, // Increased for better UX
    blockDurationMs: 10 * 60 * 1000, // 10 minutes block
  },
  // Dashboard/authenticated users - very high limits for normal browsing
  dashboard: {
    windowMs: 60 * 1000, // 1 minute
    maxAttempts: 1000, // Very high limit for normal website browsing
    blockDurationMs: 2 * 60 * 1000, // 2 minutes block
  },
};

/**
 * Extract client identifier from request
 */
export function getClientIdentifier(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             request.headers.get('cf-connecting-ip') ||
             'unknown';
  
  const userAgent = request.headers.get('user-agent') || '';
  const apiKey = request.headers.get('x-api-key') || '';
  
  // Create composite identifier
  return `${ip}:${userAgent.substring(0, 50)}:${apiKey}`;
}

/**
 * Get IP address from request
 */
export function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         request.headers.get('cf-connecting-ip') ||
         'unknown';
}

/**
 * Check rate limit for a request
 */
export function checkRateLimit(
  identifier: string,
  limitType: keyof typeof RATE_LIMITS = 'api'
): { allowed: boolean; remaining: number; resetTime: number; reason?: string } {
  const config = RATE_LIMITS[limitType];
  const now = Date.now();
  
  let record = rateLimitStore.get(identifier);
  
  // Initialize or reset if window expired
  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + config.windowMs,
      violations: record?.violations || 0,
      lastViolation: record?.lastViolation,
      blocked: false,
    };
    rateLimitStore.set(identifier, record);
  }
  
  // Check if blocked
  if (record.blocked && record.blockedUntil && now < record.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.blockedUntil,
      reason: `Blocked due to repeated violations. Unblocked at ${new Date(record.blockedUntil).toISOString()}`,
    };
  }
  
  // Clear block if expired
  if (record.blocked && record.blockedUntil && now >= record.blockedUntil) {
    record.blocked = false;
    record.blockedUntil = undefined;
    record.violations = Math.max(0, record.violations - 1); // Reduce violations on good behavior
  }
  
  // Increment counter
  record.count++;
  
  // Check if exceeded
  if (record.count > config.maxAttempts) {
    record.violations++;
    record.lastViolation = now;
    
    // Progressive blocking: more violations = longer blocks
    const blockMultiplier = Math.min(record.violations, 5);
    record.blocked = true;
    record.blockedUntil = now + (config.blockDurationMs * blockMultiplier);
    
    rateLimitStore.set(identifier, record);
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.blockedUntil,
      reason: `Rate limit exceeded. Violation #${record.violations}. Blocked until ${new Date(record.blockedUntil).toISOString()}`,
    };
  }
  
  rateLimitStore.set(identifier, record);
  
  return {
    allowed: true,
    remaining: config.maxAttempts - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * IP Reputation System
 * Scores IPs based on behavior (0 = bad, 100 = good)
 */
export function getIPReputation(ip: string): number {
  return ipReputationStore.get(ip) || 50; // Default neutral score
}

export function updateIPReputation(ip: string, delta: number) {
  const current = getIPReputation(ip);
  const newScore = Math.max(0, Math.min(100, current + delta));
  ipReputationStore.set(ip, newScore);
  
  // Log significant reputation changes
  if (newScore < 30) {
    console.warn(`[SECURITY] Low reputation IP detected: ${ip} (score: ${newScore})`);
  }
}

/**
 * Check if IP is blacklisted
 */
export function isIPBlacklisted(ip: string): boolean {
  const reputation = getIPReputation(ip);
  return reputation < 20; // Blacklist threshold
}

/**
 * Detect suspicious patterns
 */
export function detectSuspiciousPattern(request: NextRequest): {
  suspicious: boolean;
  reasons: string[];
  severity: 'low' | 'medium' | 'high';
} {
  const reasons: string[] = [];
  let severity: 'low' | 'medium' | 'high' = 'low';
  
  const userAgent = request.headers.get('user-agent') || '';
  const _referer = request.headers.get('referer') || '';
  
  // Check for missing or suspicious user agent
  if (!userAgent || userAgent.length < 10) {
    reasons.push('Missing or invalid user agent');
    severity = 'medium';
  }
  
  // Check for common bot signatures
  const botPatterns = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests'];
  if (botPatterns.some(pattern => userAgent.toLowerCase().includes(pattern))) {
    reasons.push('Bot-like user agent detected');
    severity = 'medium';
  }
  
  // Check for SQL injection patterns in URL
  const url = request.url;
  const sqlPatterns = ['union select', 'drop table', '1=1', '--', 'or 1=1', 'xp_cmdshell'];
  if (sqlPatterns.some(pattern => url.toLowerCase().includes(pattern))) {
    reasons.push('SQL injection attempt detected');
    severity = 'high';
  }
  
  // Check for XSS patterns
  const xssPatterns = ['<script', 'javascript:', 'onerror=', 'onload='];
  if (xssPatterns.some(pattern => url.toLowerCase().includes(pattern))) {
    reasons.push('XSS attempt detected');
    severity = 'high';
  }
  
  // Check for path traversal
  if (url.includes('..') || url.includes('%2e%2e')) {
    reasons.push('Path traversal attempt detected');
    severity = 'high';
  }
  
  return {
    suspicious: reasons.length > 0,
    reasons,
    severity,
  };
}

/**
 * Cleanup old rate limit records (call periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  
  // Convert to array to avoid iterator issues
  const entries = Array.from(rateLimitStore.entries());
  
  for (const [key, record] of entries) {
    // Remove expired records
    if (record.resetTime < oneHourAgo && (!record.blockedUntil || record.blockedUntil < now)) {
      rateLimitStore.delete(key);
    }
  }
  
  console.log(`[SECURITY] Cleanup: ${rateLimitStore.size} active rate limit records`);
}

// Auto-cleanup every 15 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 15 * 60 * 1000);
}

