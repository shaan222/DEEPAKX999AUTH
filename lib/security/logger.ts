/**
 * Security Logging and Monitoring System
 * 
 * Comprehensive logging for security events, attacks, and suspicious activities
 */

import { NextRequest } from 'next/server';

export type LogLevel = 'info' | 'warn' | 'error' | 'critical';
export type SecurityEventType = 
  | 'auth_success'
  | 'auth_failure'
  | 'rate_limit_exceeded'
  | 'suspicious_activity'
  | 'injection_attempt'
  | 'ip_blocked'
  | 'hwid_mismatch'
  | 'license_validation'
  | 'api_error'
  | 'unauthorized_access'
  | 'api_access';

export interface SecurityLogEntry {
  timestamp: string;
  level: LogLevel;
  eventType: SecurityEventType;
  message: string;
  ip?: string;
  userAgent?: string;
  userId?: string;
  apiKey?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  details?: Record<string, any>;
}

// In-memory log store (use a proper logging service in production like Winston, Datadog, etc.)
const securityLogs: SecurityLogEntry[] = [];
const MAX_LOGS_IN_MEMORY = 10000;

/**
 * Log a security event
 */
export function logSecurityEvent(entry: Omit<SecurityLogEntry, 'timestamp'>): void {
  const logEntry: SecurityLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };
  
  // Add to in-memory store
  securityLogs.push(logEntry);
  
  // Trim if exceeds max
  if (securityLogs.length > MAX_LOGS_IN_MEMORY) {
    securityLogs.shift();
  }
  
  // Console output with color coding
  const logMessage = formatLogMessage(logEntry);
  
  switch (entry.level) {
    case 'critical':
    case 'error':
      console.error(logMessage);
      break;
    case 'warn':
      console.warn(logMessage);
      break;
    default:
      console.log(logMessage);
  }
  
  // Trigger alerts for critical events
  if (entry.level === 'critical') {
    triggerSecurityAlert(logEntry);
  }
}

/**
 * Format log message for console output
 */
function formatLogMessage(entry: SecurityLogEntry): string {
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.eventType}] ${entry.message}${
    entry.ip ? ` | IP: ${entry.ip}` : ''
  }${
    entry.endpoint ? ` | Endpoint: ${entry.endpoint}` : ''
  }`;
}

/**
 * Log authentication attempt
 */
export function logAuthAttempt(
  success: boolean,
  request: NextRequest,
  userId?: string,
  details?: Record<string, any>
): void {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  logSecurityEvent({
    level: success ? 'info' : 'warn',
    eventType: success ? 'auth_success' : 'auth_failure',
    message: success ? 'Authentication successful' : 'Authentication failed',
    ip,
    userAgent: request.headers.get('user-agent') || undefined,
    userId,
    endpoint: new URL(request.url).pathname,
    method: request.method,
    details,
  });
}

/**
 * Log rate limit violation
 */
export function logRateLimitViolation(
  request: NextRequest,
  identifier: string,
  details?: Record<string, any>
): void {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  logSecurityEvent({
    level: 'warn',
    eventType: 'rate_limit_exceeded',
    message: `Rate limit exceeded for identifier: ${identifier}`,
    ip,
    userAgent: request.headers.get('user-agent') || undefined,
    endpoint: new URL(request.url).pathname,
    method: request.method,
    details,
  });
}

/**
 * Log suspicious activity
 */
export function logSuspiciousActivity(
  request: NextRequest,
  reasons: string[],
  severity: 'low' | 'medium' | 'high'
): void {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const level: LogLevel = severity === 'high' ? 'critical' : severity === 'medium' ? 'error' : 'warn';
  
  logSecurityEvent({
    level,
    eventType: 'suspicious_activity',
    message: `Suspicious activity detected: ${reasons.join(', ')}`,
    ip,
    userAgent: request.headers.get('user-agent') || undefined,
    endpoint: new URL(request.url).pathname,
    method: request.method,
    details: { reasons, severity },
  });
}

/**
 * Log injection attempt
 */
export function logInjectionAttempt(
  request: NextRequest,
  type: 'sql' | 'xss' | 'path_traversal',
  input: string
): void {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  logSecurityEvent({
    level: 'critical',
    eventType: 'injection_attempt',
    message: `${type.toUpperCase()} injection attempt detected`,
    ip,
    userAgent: request.headers.get('user-agent') || undefined,
    endpoint: new URL(request.url).pathname,
    method: request.method,
    details: { type, input: input.substring(0, 200) }, // Truncate for logging
  });
}

/**
 * Log HWID mismatch
 */
export function logHWIDMismatch(
  request: NextRequest,
  userId: string,
  expectedHWID: string,
  attemptedHWID: string
): void {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  logSecurityEvent({
    level: 'error',
    eventType: 'hwid_mismatch',
    message: 'HWID mismatch detected - possible account compromise',
    ip,
    userId,
    endpoint: new URL(request.url).pathname,
    details: {
      expectedHWID: expectedHWID.substring(0, 12) + '...',
      attemptedHWID: attemptedHWID.substring(0, 12) + '...',
    },
  });
}

/**
 * Get recent security logs
 */
export function getRecentSecurityLogs(
  limit: number = 100,
  eventType?: SecurityEventType
): SecurityLogEntry[] {
  let logs = [...securityLogs];
  
  if (eventType) {
    logs = logs.filter(log => log.eventType === eventType);
  }
  
  return logs.slice(-limit).reverse(); // Most recent first
}

/**
 * Get security statistics
 */
export function getSecurityStats(): {
  totalEvents: number;
  byLevel: Record<LogLevel, number>;
  byEventType: Record<SecurityEventType, number>;
  uniqueIPs: number;
  recentCritical: number;
} {
  const stats = {
    totalEvents: securityLogs.length,
    byLevel: { info: 0, warn: 0, error: 0, critical: 0 } as Record<LogLevel, number>,
    byEventType: {} as Record<SecurityEventType, number>,
    uniqueIPs: new Set<string>(),
    recentCritical: 0,
  };
  
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  
  for (const log of securityLogs) {
    stats.byLevel[log.level]++;
    stats.byEventType[log.eventType] = (stats.byEventType[log.eventType] || 0) + 1;
    
    if (log.ip) {
      stats.uniqueIPs.add(log.ip);
    }
    
    if (log.level === 'critical' && new Date(log.timestamp).getTime() > oneHourAgo) {
      stats.recentCritical++;
    }
  }
  
  return {
    ...stats,
    uniqueIPs: stats.uniqueIPs.size,
  };
}

/**
 * Trigger security alert (implement email/webhook/SMS notifications here)
 */
function triggerSecurityAlert(entry: SecurityLogEntry): void {
  // TODO: Implement alert mechanism
  // - Send email to admins
  // - POST to webhook (Discord, Slack, PagerDuty)
  // - Send SMS for critical events
  
  console.error('🚨 SECURITY ALERT 🚨');
  console.error(JSON.stringify(entry, null, 2));
  
  // Example: Send to webhook (uncomment and configure)
  /*
  fetch('https://your-webhook-url.com/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  }).catch(error => console.error('Failed to send alert:', error));
  */
}

/**
 * Clear old logs (call periodically)
 */
export function cleanupSecurityLogs(olderThanDays: number = 7): void {
  const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
  
  const initialLength = securityLogs.length;
  
  // Remove old logs
  while (securityLogs.length > 0 && 
         new Date(securityLogs[0].timestamp).getTime() < cutoffTime) {
    securityLogs.shift();
  }
  
  const removed = initialLength - securityLogs.length;
  if (removed > 0) {
    console.log(`[SECURITY] Cleaned up ${removed} old log entries`);
  }
}

