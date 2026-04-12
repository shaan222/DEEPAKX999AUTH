# reCAPTCHA Backend Verification Example

This document shows how to implement server-side reCAPTCHA verification in your API routes.

## 📋 Prerequisites

Add these environment variables to your `.env.local`:

```env
RECAPTCHA_SECRET_KEY=your_secret_key_here
RECAPTCHA_PROJECT_ID=your_project_id_here
```

## 🔧 Setup

The verification utility is already created at `lib/recaptcha-verify.ts`.

## 📝 Example Implementation

### Step 1: Update Frontend to Send Token

The token is already being generated in the frontend. Now we need to send it to the backend.

**Update `contexts/AuthContext.tsx`:**

```typescript
// Add recaptchaToken parameter to login function
const login = async (email: string, password: string, recaptchaToken?: string) => {
  const auth = getAuth();
  
  // First, verify with backend if token provided
  if (recaptchaToken) {
    const verifyResponse = await fetch('/api/verify-recaptcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: recaptchaToken, action: 'LOGIN' }),
    });
    
    if (!verifyResponse.ok) {
      throw new Error('Security verification failed');
    }
  }
  
  // Continue with Firebase auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential;
};
```

**Update Login Page:**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const recaptchaToken = await executeRecaptcha('LOGIN');
    if (!recaptchaToken) {
      toast.error('Security verification failed. Please try again.');
      setLoading(false);
      return;
    }

    // Pass token to login function
    await login(email, password, recaptchaToken);
    toast.success('Logged in successfully!');
    router.push('/dashboard');
  } catch (error: any) {
    toast.error(error.message || 'Failed to login');
  } finally {
    setLoading(false);
  }
};
```

### Step 2: Create Verification API Route

**Create `app/api/verify-recaptcha/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptchaToken, getRecommendedScore } from '@/lib/recaptcha-verify';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, action } = body;

    if (!token || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: token, action' },
        { status: 400 }
      );
    }

    // Get recommended score for this action
    const minScore = getRecommendedScore(action);

    // Verify token
    const result = await verifyRecaptchaToken(token, action, minScore);

    if (!result.success) {
      console.warn(`reCAPTCHA verification failed for action ${action}:`, result.errorMessage);
      return NextResponse.json(
        {
          error: 'Security verification failed',
          details: result.errorMessage,
          score: result.score,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      score: result.score,
      action: result.action,
    });
  } catch (error: any) {
    console.error('Error verifying reCAPTCHA:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
```

### Step 3: Protect API Endpoints

**Example: Protect User Registration**

**Update `app/api/user/register/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyRecaptchaToken } from '@/lib/recaptcha-verify';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, recaptchaToken } = body;

    // Verify reCAPTCHA token (score >= 0.7 for registration)
    if (recaptchaToken) {
      const verification = await verifyRecaptchaToken(recaptchaToken, 'REGISTER', 0.7);
      
      if (!verification.success) {
        return NextResponse.json(
          {
            error: 'Security verification failed. Please try again.',
            details: verification.errorMessage,
            score: verification.score,
          },
          { status: 403 }
        );
      }

      // Log for monitoring
      console.log(`✅ Registration verified: email=${email}, score=${verification.score}`);
    }

    // Continue with registration...
    const userRecord = await adminAuth.createUser({
      email,
      password,
      emailVerified: false,
    });

    // Create user document
    await adminDb.collection('users').doc(userRecord.uid).set({
      email,
      createdAt: new Date().toISOString(),
      subscription: 'free',
      recaptchaScore: verification?.score || null, // Store for analytics
    });

    return NextResponse.json({
      success: true,
      userId: userRecord.uid,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
```

**Example: Protect Reseller Portal**

**Update `app/api/reseller/auth/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyRecaptchaToken } from '@/lib/recaptcha-verify';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, recaptchaToken } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing required field: apiKey' },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA if token provided
    if (recaptchaToken) {
      const verification = await verifyRecaptchaToken(recaptchaToken, 'RESELLER_LOGIN', 0.6);
      
      if (!verification.success) {
        console.warn(`⚠️  Reseller login blocked: score=${verification.score}`);
        return NextResponse.json(
          { error: 'Security verification failed' },
          { status: 403 }
        );
      }
    }

    // Find reseller by API key
    const resellersSnapshot = await adminDb
      .collection('resellers')
      .where('apiKey', '==', apiKey)
      .limit(1)
      .get();

    if (resellersSnapshot.empty) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    const resellerDoc = resellersSnapshot.docs[0];
    const resellerData = resellerDoc.data() as any;

    // Check if reseller is active
    if (!resellerData.isActive) {
      return NextResponse.json(
        { error: 'Reseller account is inactive' },
        { status: 403 }
      );
    }

    // Update last login
    await adminDb.collection('resellers').doc(resellerDoc.id).update({
      lastLoginAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      reseller: {
        id: resellerDoc.id,
        name: resellerData.name,
        email: resellerData.email,
        // ... other fields
      },
    });
  } catch (error: any) {
    console.error('Error authenticating reseller:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
```

## 🎯 Recommended Score Thresholds

| Action | Min Score | Rationale |
|--------|-----------|-----------|
| `LOGIN` | 0.5 | Medium security - balance security vs UX |
| `REGISTER` | 0.7 | High security - prevent fake accounts |
| `RESELLER_LOGIN` | 0.6 | Medium-high - protect reseller access |
| `CREATE_LICENSE` | 0.5 | Medium - business operation |
| `DELETE_USER` | 0.8 | Very high - destructive action |
| `PAYMENT` | 0.9 | Maximum - financial transaction |

Scores range from 0.0 (very likely bot) to 1.0 (very likely human).

## 📊 Monitoring

Add logging to track reCAPTCHA performance:

```typescript
import { logRecaptchaStats } from '@/lib/recaptcha-verify';

const result = await verifyRecaptchaToken(token, 'LOGIN');
logRecaptchaStats('LOGIN', result.score, result.success);
```

This will output logs like:
```
✅ reCAPTCHA PASSED | Action: LOGIN | Score: 0.87
❌ reCAPTCHA FAILED | Action: REGISTER | Score: 0.23
```

## 🔍 Testing

### Test Valid User
1. Use your application normally
2. Check server logs for reCAPTCHA scores
3. Typical legitimate users score 0.7-1.0

### Test Bot Detection
1. Use automation tools (Selenium, Puppeteer)
2. Rapid-fire requests
3. Check if scores drop below threshold

### Development Mode
If `RECAPTCHA_SECRET_KEY` is not set, verification is automatically skipped with a warning.

## 🚨 Error Handling

Handle different verification failures:

```typescript
const result = await verifyRecaptchaToken(token, action);

if (!result.success) {
  switch (result.errorMessage) {
    case 'Invalid token':
      return res.status(400).json({ error: 'Invalid security token' });
    
    case 'Score too low':
      // Log potential bot
      console.warn(`🚨 Low score detected: ${result.score} for ${action}`);
      return res.status(403).json({ error: 'Security check failed' });
    
    case 'Action mismatch':
      return res.status(400).json({ error: 'Invalid action' });
    
    default:
      return res.status(500).json({ error: 'Verification error' });
  }
}
```

## 🔐 Security Best Practices

1. **Always verify server-side** - Never trust client-only verification
2. **Store scores in database** - Useful for analytics and fraud detection
3. **Adjust thresholds based on data** - Monitor false positives/negatives
4. **Rate limit endpoints** - Even with reCAPTCHA, use rate limiting
5. **Log suspicious activity** - Track low scores for security monitoring
6. **Don't expose scores to users** - Keep verification details private
7. **Use action-specific scores** - Different actions need different thresholds

## 📈 Analytics Integration

Store reCAPTCHA scores for analysis:

```typescript
// When creating a user
await adminDb.collection('users').doc(userId).set({
  // ... other fields
  recaptchaScore: result.score,
  registrationVerified: result.success,
  registrationTimestamp: new Date().toISOString(),
});

// Later, analyze your data
// - Average scores by time of day
// - Correlation between scores and user behavior
// - Identify score patterns in fraudulent accounts
```

## 🛠️ Troubleshooting

### "Verification skipped (not configured)"
Set `RECAPTCHA_SECRET_KEY` and `RECAPTCHA_PROJECT_ID` in `.env.local`

### "API error: 400"
Check that your project ID and secret key are correct

### "Action mismatch"
Ensure frontend and backend use the same action string

### Scores always 0.0
Your secret key might be invalid or domain not authorized

## 📚 Resources

- [reCAPTCHA Enterprise Console](https://console.cloud.google.com/security/recaptcha)
- [Official Documentation](https://cloud.google.com/recaptcha-enterprise/docs)
- [Score Interpretation Guide](https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment)

---

**Implementation Status:**
- ✅ Frontend integration complete
- ⏳ Backend verification (optional - add when ready)
- 📊 Monitoring dashboard (use Google Cloud Console)

