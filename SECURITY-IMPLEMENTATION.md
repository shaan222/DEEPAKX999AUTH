# 🔒 Security Implementation Guide

This document outlines the comprehensive security measures implemented in the Authentication API System.

## 🛡️ Overview

The system implements multiple layers of defense to protect against:
- Brute force attacks
- SQL injection and XSS attacks
- DDoS and resource exhaustion
- License key theft and piracy
- Account compromise and credential stuffing
- API abuse and bot traffic

---

## 📋 Implemented Security Features

### 1. Rate Limiting (`lib/security/rate-limiter.ts`)

**Purpose:** Prevent brute force attacks, credential stuffing, and API abuse

**Features:**
- Multi-tier rate limiting based on endpoint type:
  - **Authentication endpoints**: 5 attempts / 15 minutes
  - **License validation**: 10 attempts / minute
  - **General API**: 30 attempts / minute
  - **Dashboard**: 60 attempts / minute

- Composite client identification using:
  - IP address
  - User agent fingerprint
  - API key

- Progressive blocking with exponential backoff
- IP reputation scoring (0-100 scale)
- Automatic blacklisting for IPs with reputation < 20
- Suspicious pattern detection for:
  - Missing/invalid user agents
  - Bot signatures (curl, wget, scrapers)
  - SQL injection patterns
  - XSS patterns
  - Path traversal attempts

**Usage:**
```typescript
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limiter';

const identifier = getClientIdentifier(request);
const limit = checkRateLimit(identifier, 'auth');

if (!limit.allowed) {
  return NextResponse.json({
    error: 'Rate limit exceeded',
    resetTime: limit.resetTime
  }, { status: 429 });
}
```

---

### 2. Input Validation (`lib/security/input-validator.ts`)

**Purpose:** Prevent injection attacks and data corruption

**Features:**
- Comprehensive validation for:
  - Email addresses
  - Usernames (alphanumeric + hyphens/underscores)
  - Passwords (strength scoring)
  - API keys (format: `sk_[hex]`)
  - License keys (uppercase alphanumeric + hyphens)
  - Hardware IDs (hex format with entropy checking)
  - IP addresses (IPv4/IPv6)

- Attack detection:
  - SQL injection patterns
  - XSS attempts
  - Path traversal attempts

- JSON payload validation:
  - Maximum nesting depth (5 levels)
  - Maximum array length (1000 items)
  - Maximum object keys (100)
  - Maximum string length (10,000 characters)

**Usage:**
```typescript
import { validateInput } from '@/lib/security/input-validator';

const validation = validateInput(username, 'username');
if (!validation.valid) {
  return NextResponse.json({
    error: validation.error
  }, { status: 400 });
}
```

---

### 3. Security Headers (`lib/security/headers.ts`)

**Purpose:** Protect against various client-side attacks

**Implemented Headers:**
- **Content-Security-Policy**: Prevents XSS attacks
- **Strict-Transport-Security**: Enforces HTTPS
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features
- **X-XSS-Protection**: Legacy XSS protection

**Applied Automatically via Middleware**

---

### 4. Security Logging (`lib/security/logger.ts`)

**Purpose:** Monitor security events and detect attack patterns

**Logged Events:**
- Authentication attempts (success/failure)
- Rate limit violations
- Suspicious activity
- Injection attempts
- HWID mismatches
- IP blocking events
- License validations
- API errors
- Unauthorized access attempts

**Features:**
- In-memory log store (10,000 most recent events)
- Security statistics dashboard
- Critical event alerting
- Structured logging with correlation
- Log level classification (info, warn, error, critical)

**Access Statistics:**
```typescript
import { getSecurityStats } from '@/lib/security/logger';

const stats = getSecurityStats();
// Returns: totalEvents, byLevel, byEventType, uniqueIPs, recentCritical
```

**View Logs:**
- API endpoint: `/api/security/stats` (requires authentication)

---

### 5. License Key Signing (`lib/security/license-signing.ts`)

**Purpose:** Prevent license key generators and unauthorized key creation

**Features:**
- HMAC-SHA256 signature generation
- Key format: `XXXX-XXXX-XXXX-XXXX-SIGNATURE`
- Metadata embedding (userId, appId, tier, expiry)
- One-way hashing for secure storage
- Watermarking for user traceability
- Honeypot key generation for trap detection

**Generate License:**
```typescript
import { generateLicenseKey } from '@/lib/security/license-signing';

const { fullKey, signature } = generateLicenseKey({
  userId: 'user123',
  appId: 'app456',
  tier: 'pro',
});
```

**Verify License:**
```typescript
import { verifyLicenseKeySignature } from '@/lib/security/license-signing';

const result = verifyLicenseKeySignature(fullKey, metadata);
if (!result.valid) {
  // Invalid or tampered license key
}
```

---

### 6. Global Middleware (`middleware.ts`)

**Purpose:** Apply security measures to all incoming requests

**Protections:**
1. IP blacklist checking
2. Suspicious pattern detection
3. Adaptive rate limiting
4. Security header application
5. IP reputation scoring
6. Request logging

**Automatically Applied** to all routes except:
- Static assets (images, fonts)
- Next.js internal routes
- Favicon

---

### 7. IP-HWID Uniqueness Enforcement

**Purpose:** Prevent license sharing and ensure one IP = one device

**Implementation:**
- Global database check in `/api/user/login`
- Prevents multiple devices from same IP
- Allows IP changes for same device (logged)
- Detailed error messages for violations

**Behavior:**
- ✅ Same IP + Same HWID = Allowed
- ✅ Different IP + Same HWID = Allowed (logged)
- ❌ Same IP + Different HWID = Blocked
- ❌ Different IP + Different HWID (for same user) = Depends on HWID lock

---

## 🚨 Alert System

### Critical Events Trigger Alerts:
1. SQL/XSS injection attempts
2. HWID mismatches
3. Multiple failed login attempts
4. IP blacklisting
5. Suspicious activity (high severity)

### Alert Destinations (configurable in `logger.ts`):
- Console (enabled by default)
- Email notifications (TODO: implement)
- Webhooks (Discord, Slack, PagerDuty)
- SMS for critical events

---

## 📊 Security Dashboard

**Access:** `/api/security/stats` (protected endpoint)

**Statistics Provided:**
- Total security events
- Events by level (info, warn, error, critical)
- Events by type
- Unique IP addresses tracked
- Recent critical events (last hour)
- Recent log entries (last 50)

**Sample Response:**
```json
{
  "success": true,
  "stats": {
    "totalEvents": 1523,
    "byLevel": {
      "info": 1200,
      "warn": 250,
      "error": 60,
      "critical": 13
    },
    "byEventType": {
      "auth_success": 980,
      "auth_failure": 220,
      "rate_limit_exceeded": 150,
      "suspicious_activity": 40,
      "hwid_mismatch": 13
    },
    "uniqueIPs": 345,
    "recentCritical": 2
  },
  "recentLogs": [...]
}
```

---

## 🔐 Password Security

- **Hashing Algorithm:** bcrypt with salt rounds = 10
- **Minimum Requirements:**
  - 8 characters minimum
  - 3 of 4: lowercase, uppercase, numbers, special characters
- **Strength Scoring:** weak / medium / strong
- **Maximum Length:** 128 characters (DoS prevention)

---

## 🎯 Rate Limit Headers

All responses include rate limit information:
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1699564800000
```

---

## 🛠️ Configuration

### Environment Variables Required:

```env
# License key signing secret (change in production)
LICENSE_SIGNING_SECRET=your-secret-key-here

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

### Rate Limit Customization:

Edit `lib/security/rate-limiter.ts`:
```typescript
export const RATE_LIMITS = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
    blockDurationMs: 60 * 60 * 1000, // 1 hour
  },
  // ... other configurations
};
```

---

## 📈 Performance Considerations

1. **In-Memory Storage:**
   - Rate limit data stored in memory
   - Suitable for serverless/edge deployment
   - For high-traffic: migrate to Redis

2. **Cleanup Routines:**
   - Automatic cleanup every 15 minutes
   - Removes expired rate limit records
   - Removes logs older than 7 days

3. **Database Queries:**
   - Indexed fields: `apiKey`, `username`, `lastIp`, `hwid`
   - Efficient compound queries
   - Caching recommendations: implement Redis for API keys

---

## 🚀 Production Deployment Checklist

- [ ] Change `LICENSE_SIGNING_SECRET` to a strong random value
- [ ] Enable Firebase security rules
- [ ] Configure webhook alerts in `logger.ts`
- [ ] Set up monitoring dashboard (Datadog, NewRelic)
- [ ] Enable Cloudflare or AWS Shield for DDoS protection
- [ ] Configure backup and disaster recovery
- [ ] Implement Redis for rate limiting (high traffic)
- [ ] Set up automated security audits
- [ ] Configure SIEM integration
- [ ] Enable Firebase App Check
- [ ] Review and tighten CSP directives
- [ ] Set up log archival and retention policies
- [ ] Configure intrusion detection system (IDS)
- [ ] Enable database encryption at rest
- [ ] Implement API key rotation policy
- [ ] Set up incident response procedures

---

## 📚 Security Best Practices for Developers

1. **Never Log Sensitive Data:**
   - Passwords (even hashed)
   - Full license keys (truncate to 12 chars)
   - Complete HWIDs (truncate to 12 chars)
   - Full IP addresses in public logs

2. **Always Validate Input:**
   - Use `validateInput()` for all user-provided data
   - Check `validateJSONPayload()` for request bodies
   - Sanitize before database operations

3. **Use Prepared Statements:**
   - Firebase methods are safe by default
   - Never concatenate user input into queries

4. **Check Authentication:**
   - Verify Firebase ID tokens on protected routes
   - Check user roles/permissions
   - Validate ownership of resources

5. **Rate Limit Everything:**
   - Applied automatically via middleware
   - Extra rate limits for critical operations
   - Monitor rate limit violations

6. **Log Security Events:**
   - All authentication attempts
   - All authorization failures
   - All suspicious activities
   - All data modifications

---

## 🔍 Monitoring and Alerting

### Key Metrics to Monitor:

1. **Authentication Failure Rate:**
   - Threshold: >10% failures = investigate
   - Alert: >25% failures = critical

2. **Rate Limit Hit Rate:**
   - Threshold: >5% requests limited = review limits
   - Alert: Sudden spike = possible attack

3. **Unique IPs per Day:**
   - Baseline: establish normal range
   - Alert: 3x spike = possible DDoS

4. **HWID Mismatches:**
   - Threshold: >5 per day = investigate
   - Alert: >20 per day = critical

5. **License Validation Failures:**
   - Threshold: >5% failures = investigate
   - Alert: Sudden spike = possible key generator

---

## 📞 Incident Response

### Attack Detected - Action Steps:

1. **Identify Attack Type:**
   - Check security logs and statistics
   - Determine affected endpoints
   - Identify attacker IPs/patterns

2. **Immediate Response:**
   - Block malicious IPs (automatic if reputation < 20)
   - Temporarily increase rate limits severity
   - Enable additional logging

3. **Mitigation:**
   - Review and patch vulnerabilities
   - Update security rules
   - Notify affected users if necessary

4. **Post-Incident:**
   - Document incident details
   - Review response effectiveness
   - Update security measures
   - Conduct team debrief

---

## 🎓 Training Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Next.js Security](https://nextjs.org/docs/going-to-production#security)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

## 📝 Changelog

### Version 1.0 - Initial Implementation
- ✅ Rate limiting system
- ✅ Input validation and sanitization
- ✅ Security headers
- ✅ Comprehensive logging
- ✅ IP reputation system
- ✅ Suspicious activity detection
- ✅ License key signing
- ✅ IP-HWID uniqueness enforcement
- ✅ Security statistics API
- ✅ Global middleware protection

### Planned Features (v1.1)
- [ ] CAPTCHA integration after failed attempts
- [ ] Two-factor authentication (2FA)
- [ ] Device fingerprinting (browser-based)
- [ ] Geolocation-based blocking
- [ ] Machine learning anomaly detection
- [ ] Real-time threat intelligence feeds
- [ ] Automated penetration testing
- [ ] Bug bounty program integration

---

## 🤝 Contributing

Security improvements are always welcome! Please:
1. Review existing security measures
2. Test thoroughly in development
3. Document security implications
4. Follow secure coding practices
5. Submit detailed pull requests

---

## ⚠️ Disclaimer

While these security measures significantly improve system protection, no system is 100% secure. Continuous monitoring, regular updates, and defense-in-depth strategies are essential for maintaining security.

---

**Last Updated:** November 4, 2025  
**Maintained By:** Auth API System Security Team

