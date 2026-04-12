/**
 * Next.js Middleware - Security Layer
 * 
 * Applies comprehensive security measures to all requests:
 * - Rate limiting
 * - Security headers
 * - Suspicious activity detection
 * - IP reputation checking
 * - Request logging
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  checkRateLimit,
  getClientIdentifier,
  getClientIP,
  isIPBlacklisted,
  updateIPReputation,
  detectSuspiciousPattern,
  RATE_LIMITS,
} from './lib/security/rate-limiter';
import {
  applySecurityHeaders,
  applyRateLimitHeaders,
} from './lib/security/headers';
import {
  logSecurityEvent,
  logRateLimitViolation,
  logSuspiciousActivity,
} from './lib/security/logger';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);
  const clientIdentifier = getClientIdentifier(request);
  const origin = request.headers.get('origin') || '';
  const referer = request.headers.get('referer') || '';
  const host = request.headers.get('host') || '';
  
  // Allowed origins (your domain)
  const allowedOrigins = [
    'https://www.licensify.space',
    'http://localhost:3000',
    'http://localhost:3001',
  ];
  
  const isAllowedOrigin = allowedOrigins.some(allowed => 
    origin.includes(allowed) || referer.includes(allowed) || host.includes(allowed.replace('https://', '').replace('http://', ''))
  );
  
  // Block direct access to documentation files
  if (pathname.endsWith('.md') || pathname.includes('/hwid-examples') || pathname.includes('/integration-example')) {
    logSecurityEvent({
      level: 'warn',
      eventType: 'unauthorized_access',
      message: `Blocked direct access to documentation: ${pathname}`,
      ip: clientIP,
      endpoint: pathname,
      method: request.method,
    });
    
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  // Block direct API access from external sources (except for legitimate API endpoints)
  if (pathname.startsWith('/api/')) {
    // Allow public API endpoints (login, validate) but log them
    const publicEndpoints = ['/api/user/login', '/api/auth/validate', '/api/public/'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => pathname.startsWith(endpoint));
    
    if (!isPublicEndpoint && !isAllowedOrigin) {
      // Block access to protected API endpoints from external sources
      logSecurityEvent({
        level: 'error',
        eventType: 'unauthorized_access',
        message: `Blocked direct API access from external source: ${pathname}`,
        ip: clientIP,
        endpoint: pathname,
        method: request.method,
        details: { origin, referer },
      });
      
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Unauthorized',
          message: 'Direct API access is not allowed. Please use the website interface.',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // For public endpoints, still validate they're using proper API keys
    if (isPublicEndpoint && request.method === 'POST') {
      // These will be validated in the endpoint itself
      // Just log the access attempt
      logSecurityEvent({
        level: 'info',
        eventType: 'api_access',
        message: `API access to public endpoint: ${pathname}`,
        ip: clientIP,
        endpoint: pathname,
        method: request.method,
      });
    }
  }
  
  // Skip security checks for static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    (pathname.includes('.') && !pathname.endsWith('.md'))
  ) {
    return NextResponse.next();
  }
  
  // Check if IP is blacklisted
  if (isIPBlacklisted(clientIP)) {
    logSecurityEvent({
      level: 'critical',
      eventType: 'ip_blocked',
      message: `Blocked request from blacklisted IP: ${clientIP}`,
      ip: clientIP,
      endpoint: pathname,
      method: request.method,
    });
    
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Access denied',
        message: 'Your IP address has been blocked due to suspicious activity.',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  
  // Detect suspicious patterns (only for API endpoints, not for dashboard/website pages)
  const isAPIEndpoint = pathname.startsWith('/api/');
  
  if (isAPIEndpoint) {
    const suspiciousCheck = detectSuspiciousPattern(request);
    if (suspiciousCheck.suspicious) {
      logSuspiciousActivity(request, suspiciousCheck.reasons, suspiciousCheck.severity);
      
      // Update IP reputation (negative score)
      updateIPReputation(clientIP, -10);
      
      // Block high severity threats immediately
      if (suspiciousCheck.severity === 'high') {
        updateIPReputation(clientIP, -50); // Severe penalty
        
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: 'Suspicious activity detected',
            message: 'Your request has been blocked due to suspicious patterns.',
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }
  }
  
  // Determine rate limit type based on endpoint
  let rateLimitType: keyof typeof RATE_LIMITS = 'api';
  let skipRateLimit = false;
  
  // Check if login is from website dashboard (browser) - no rate limit
  // vs API login (programmatic) - apply rate limit
  if (pathname.includes('/api/user/login') || pathname.includes('/api/user/register')) {
    // If referer is from our own website, it's a dashboard login - skip rate limit
    if (isAllowedOrigin) {
      skipRateLimit = true; // Website users can login unlimited times
    } else {
      rateLimitType = 'auth'; // API users have rate limit
    }
  } else if (pathname.includes('/api/auth/validate')) {
    rateLimitType = 'validation';
  } else if (pathname.startsWith('/dashboard')) {
    rateLimitType = 'dashboard';
  }
  
  // Check rate limit (skip for website dashboard logins)
  const rateLimitCheck = skipRateLimit 
    ? { allowed: true, remaining: 999, resetTime: Date.now() } 
    : checkRateLimit(clientIdentifier, rateLimitType);
  
  if (!rateLimitCheck.allowed) {
    logRateLimitViolation(request, clientIdentifier, {
      reason: rateLimitCheck.reason,
      resetTime: rateLimitCheck.resetTime,
    });
    
    // Update IP reputation (negative score)
    updateIPReputation(clientIP, -5);
    
    const response = new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Rate limit exceeded',
        message: rateLimitCheck.reason || 'Too many requests. Please try again later.',
        resetTime: rateLimitCheck.resetTime,
      }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      }
    );
    
    // Apply rate limit headers
    applyRateLimitHeaders(
      response,
      RATE_LIMITS[rateLimitType].maxAttempts,
      0,
      rateLimitCheck.resetTime
    );
    
    return applySecurityHeaders(response);
  }
  
  // Update IP reputation (positive score for legitimate requests)
  updateIPReputation(clientIP, 1);
  
  // Continue to the requested page
  const response = NextResponse.next();
  
  // Apply security headers
  applySecurityHeaders(response);
  
  // Apply rate limit headers
  applyRateLimitHeaders(
    response,
    RATE_LIMITS[rateLimitType].maxAttempts,
    rateLimitCheck.remaining,
    rateLimitCheck.resetTime
  );
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

