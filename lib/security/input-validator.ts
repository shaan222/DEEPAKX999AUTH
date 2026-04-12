/**
 * Input Validation and Sanitization
 * 
 * Provides strict validation and sanitization for all user inputs
 * to prevent injection attacks, XSS, and data corruption
 */

import { z } from 'zod';

/**
 * Sanitize string input - remove dangerous characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000); // Max length
}

/**
 * Validate and sanitize email
 */
export function validateEmail(email: string): { valid: boolean; email?: string; error?: string } {
  const emailSchema = z.string().email().max(255);
  
  try {
    const validated = emailSchema.parse(email.toLowerCase().trim());
    return { valid: true, email: validated };
  } catch {
    return { valid: false, error: 'Invalid email format' };
  }
}

/**
 * Validate username
 */
export function validateUsername(username: string): { valid: boolean; username?: string; error?: string } {
  const usernameSchema = z.string()
    .min(1, 'Username is required')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores');
  
  try {
    const validated = usernameSchema.parse(username.trim());
    return { valid: true, username: validated };
  } catch (error: any) {
    return { valid: false, error: error.errors[0]?.message || 'Invalid username' };
  }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { 
  valid: boolean; 
  error?: string;
  strength?: 'weak' | 'medium' | 'strong';
} {
  if (typeof password !== 'string' || password.length < 1) {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length > 128) {
    return { valid: false, error: 'Password must be less than 128 characters' };
  }
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  let score = 0;
  
  // Check for different character types
  if (/[a-z]/.test(password)) {
    score++;
  }
  if (/[A-Z]/.test(password)) {
    score++;
  }
  if (/[0-9]/.test(password)) {
    score++;
  }
  if (/[^a-zA-Z0-9]/.test(password)) {
    score++;
  }
  
  // Check length
  if (password.length >= 12) {
    score++;
  }
  if (password.length >= 16) {
    score++;
  }
  
  if (score >= 5) {
    strength = 'strong';
  } else if (score >= 3) {
    strength = 'medium';
  }
  
  // No minimum strength requirement - allow any password
  return { valid: true, strength };
}

/**
 * Validate API key format
 */
export function validateAPIKey(apiKey: string): { valid: boolean; error?: string } {
  const apiKeySchema = z.string()
    .min(1, 'Invalid API key format')
    .max(100, 'Invalid API key format')
    .regex(/^sk_[a-f0-9]+$/, 'Invalid API key format');
  
  try {
    apiKeySchema.parse(apiKey);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid API key format' };
  }
}

/**
 * Validate license key format
 */
export function validateLicenseKey(licenseKey: string): { valid: boolean; error?: string } {
  // Expected format: XXXXX-XXXXX-XXXXX-XXXXX or similar
  const licenseKeySchema = z.string()
    .min(1, 'License key is required')
    .max(100, 'Invalid license key format')
    .regex(/^[A-Z0-9-]+$/, 'License key can only contain uppercase letters, numbers, and hyphens');
  
  try {
    licenseKeySchema.parse(licenseKey.toUpperCase());
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid license key format' };
  }
}

/**
 * Validate HWID format
 */
export function validateHWID(hwid: string): { valid: boolean; error?: string } {
  const hwidSchema = z.string()
    .min(1, 'HWID is required')
    .max(256, 'Invalid HWID format - too long')
    .regex(/^[a-fA-F0-9-]+$/, 'Invalid HWID format - contains invalid characters');
  
  try {
    hwidSchema.parse(hwid);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid HWID format' };
  }
}

/**
 * Validate IP address
 */
export function validateIP(ip: string): { valid: boolean; error?: string; type?: 'ipv4' | 'ipv6' } {
  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 pattern (simplified)
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/;
  
  if (ipv4Pattern.test(ip)) {
    // Validate IPv4 ranges
    const parts = ip.split('.').map(Number);
    if (parts.every(part => part >= 0 && part <= 255)) {
      return { valid: true, type: 'ipv4' };
    }
  } else if (ipv6Pattern.test(ip)) {
    return { valid: true, type: 'ipv6' };
  }
  
  return { valid: false, error: 'Invalid IP address format' };
}

/**
 * Validate JSON payload structure
 */
export function validateJSONPayload(data: any, maxDepth: number = 5, currentDepth: number = 0): {
  valid: boolean;
  error?: string;
} {
  if (currentDepth > maxDepth) {
    return { valid: false, error: 'JSON payload exceeds maximum nesting depth' };
  }
  
  if (data === null || data === undefined) {
    return { valid: true };
  }
  
  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      if (data.length > 1000) {
        return { valid: false, error: 'Array exceeds maximum length' };
      }
      for (const item of data) {
        const result = validateJSONPayload(item, maxDepth, currentDepth + 1);
        if (!result.valid) {
          return result;
        }
      }
    } else {
      const keys = Object.keys(data);
      if (keys.length > 100) {
        return { valid: false, error: 'Object has too many keys' };
      }
      for (const key of keys) {
        // Check key length
        if (key.length > 100) {
          return { valid: false, error: 'Object key too long' };
        }
        const result = validateJSONPayload(data[key], maxDepth, currentDepth + 1);
        if (!result.valid) {
          return result;
        }
      }
    }
  } else if (typeof data === 'string') {
    if (data.length > 10000) {
      return { valid: false, error: 'String value too long' };
    }
  }
  
  return { valid: true };
}

/**
 * Detect SQL injection attempts
 */
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\bunion\b.*\bselect\b)/i,
    /(\bselect\b.*\bfrom\b)/i,
    /(\binsert\b.*\binto\b)/i,
    /(\bdelete\b.*\bfrom\b)/i,
    /(\bdrop\b.*\btable\b)/i,
    /(\bupdate\b.*\bset\b)/i,
    /(--)/,
    /(;.*)/,
    /(\bor\b.*=.*)/i,
    /(\band\b.*=.*)/i,
    /(xp_cmdshell)/i,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Detect XSS attempts
 */
export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script/i,
    /<iframe/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /onclick=/i,
    /<img.*src/i,
    /eval\(/i,
    /expression\(/i,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Detect path traversal attempts
 */
export function detectPathTraversal(input: string): boolean {
  const traversalPatterns = [
    /\.\./,
    /%2e%2e/i,
    /\.\.%2f/i,
    /%2e%2e%2f/i,
  ];
  
  return traversalPatterns.some(pattern => pattern.test(input));
}

/**
 * Comprehensive input validation
 */
export function validateInput(input: string, type: 'string' | 'email' | 'username' | 'password' | 'apiKey' | 'licenseKey' | 'hwid'): {
  valid: boolean;
  sanitized?: string;
  error?: string;
} {
  // Check for injection attempts
  if (detectSQLInjection(input)) {
    return { valid: false, error: 'Suspicious input detected - SQL injection attempt' };
  }
  
  if (detectXSS(input)) {
    return { valid: false, error: 'Suspicious input detected - XSS attempt' };
  }
  
  if (detectPathTraversal(input)) {
    return { valid: false, error: 'Suspicious input detected - path traversal attempt' };
  }
  
  // Type-specific validation
  switch (type) {
    case 'email':
      return validateEmail(input);
    case 'username':
      return validateUsername(input);
    case 'password':
      return validatePassword(input);
    case 'apiKey':
      return validateAPIKey(input);
    case 'licenseKey':
      return validateLicenseKey(input);
    case 'hwid':
      return validateHWID(input);
    default:
      return { valid: true, sanitized: sanitizeString(input) };
  }
}

