/**
 * Security Headers Configuration
 * 
 * Implements comprehensive security headers to protect against
 * various attacks including XSS, clickjacking, MIME sniffing, etc.
 */

import { NextResponse } from 'next/server';

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string;
  strictTransportSecurity?: string;
  xFrameOptions?: string;
  xContentTypeOptions?: string;
  referrerPolicy?: string;
  permissionsPolicy?: string;
  xXSSProtection?: string;
  crossOriginOpenerPolicy?: string;
  crossOriginEmbedderPolicy?: string;
}

/**
 * Default security headers configuration
 */
export const DEFAULT_SECURITY_HEADERS: SecurityHeadersConfig = {
  // Content Security Policy - prevents XSS attacks
  contentSecurityPolicy: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.vercel.app https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com https://*.analytics.google.com https://accounts.google.com",
    "frame-src 'self' https://www.google.com https://*.firebaseapp.com https://accounts.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  
  // HTTP Strict Transport Security - enforces HTTPS
  strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
  
  // X-Frame-Options - prevents clickjacking
  xFrameOptions: 'DENY',
  
  // X-Content-Type-Options - prevents MIME sniffing
  xContentTypeOptions: 'nosniff',
  
  // Referrer Policy - controls referrer information
  referrerPolicy: 'strict-origin-when-cross-origin',
  
  // Permissions Policy - controls browser features
  permissionsPolicy: [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
  ].join(', '),
  
  // X-XSS-Protection - legacy XSS protection
  xXSSProtection: '1; mode=block',
  
  // Cross-Origin-Opener-Policy - allows OAuth popups
  crossOriginOpenerPolicy: 'same-origin-allow-popups',
  
  // Cross-Origin-Embedder-Policy - relaxed for OAuth
  crossOriginEmbedderPolicy: 'unsafe-none',
};

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(
  response: NextResponse,
  config: SecurityHeadersConfig = DEFAULT_SECURITY_HEADERS
): NextResponse {
  const headers = response.headers;
  
  // Content Security Policy
  if (config.contentSecurityPolicy) {
    headers.set('Content-Security-Policy', config.contentSecurityPolicy);
  }
  
  // HSTS
  if (config.strictTransportSecurity) {
    headers.set('Strict-Transport-Security', config.strictTransportSecurity);
  }
  
  // X-Frame-Options
  if (config.xFrameOptions) {
    headers.set('X-Frame-Options', config.xFrameOptions);
  }
  
  // X-Content-Type-Options
  if (config.xContentTypeOptions) {
    headers.set('X-Content-Type-Options', config.xContentTypeOptions);
  }
  
  // Referrer Policy
  if (config.referrerPolicy) {
    headers.set('Referrer-Policy', config.referrerPolicy);
  }
  
  // Permissions Policy
  if (config.permissionsPolicy) {
    headers.set('Permissions-Policy', config.permissionsPolicy);
  }
  
  // X-XSS-Protection
  if (config.xXSSProtection) {
    headers.set('X-XSS-Protection', config.xXSSProtection);
  }
  
  // Cross-Origin-Opener-Policy
  if (config.crossOriginOpenerPolicy) {
    headers.set('Cross-Origin-Opener-Policy', config.crossOriginOpenerPolicy);
  }
  
  // Cross-Origin-Embedder-Policy
  if (config.crossOriginEmbedderPolicy) {
    headers.set('Cross-Origin-Embedder-Policy', config.crossOriginEmbedderPolicy);
  }
  
  // Additional security headers
  headers.set('X-DNS-Prefetch-Control', 'off');
  headers.set('X-Download-Options', 'noopen');
  headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  return response;
}

/**
 * CORS configuration for API endpoints
 */
export function applyCORSHeaders(
  response: NextResponse,
  allowedOrigins: string[] = []
): NextResponse {
  const headers = response.headers;
  
  // Strict CORS - only allow specific origins
  if (allowedOrigins.length > 0) {
    headers.set('Access-Control-Allow-Origin', allowedOrigins.join(', '));
  } else {
    // Default: only same origin
    headers.set('Access-Control-Allow-Origin', 'same-origin');
  }
  
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  headers.set('Access-Control-Allow-Credentials', 'true');
  
  return response;
}

/**
 * Rate limit headers
 */
export function applyRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  resetTime: number
): NextResponse {
  const headers = response.headers;
  
  headers.set('X-RateLimit-Limit', limit.toString());
  headers.set('X-RateLimit-Remaining', remaining.toString());
  headers.set('X-RateLimit-Reset', resetTime.toString());
  
  return response;
}

