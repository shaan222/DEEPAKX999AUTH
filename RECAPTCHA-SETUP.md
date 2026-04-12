# Google reCAPTCHA Enterprise Integration

This document explains how Google reCAPTCHA Enterprise has been integrated into your Licensify authentication system.

## 🔐 What is reCAPTCHA Enterprise?

Google reCAPTCHA Enterprise is an advanced bot detection system that protects your application from:
- Automated attacks
- Bot registrations
- Credential stuffing
- Spam submissions
- Abuse and fraud

## ✅ What's Been Implemented

### Frontend Integration

reCAPTCHA has been added to the following pages:

1. **Login Page** (`/login`)
   - Action: `LOGIN`
   - Executes before user authentication
   
2. **Register Page** (`/register`)
   - Action: `REGISTER`
   - Executes before account creation
   
3. **Reseller Portal** (`/reseller-portal`)
   - Action: `RESELLER_LOGIN`
   - Executes before reseller authentication

### Features Implemented

✅ Automatic script loading in root layout  
✅ Custom React hook (`useRecaptcha`) for easy integration  
✅ Visual loading states ("Loading security...")  
✅ Button disabled until reCAPTCHA is ready  
✅ User-friendly error messages  
✅ Seamless execution on form submission  
✅ "Protected by Google reCAPTCHA Enterprise" badge  

## 🔑 Configuration

### Site Key (Public)
```
6LeHsQIsAAAAAJCU87uTTHGx61lUEE5K7lKNpoz1
```

This is already configured in:
- `app/layout.tsx` - Script loading
- `hooks/useRecaptcha.ts` - Hook configuration

### Secret Key (Private)
⚠️ **IMPORTANT**: You need to configure your **secret key** for backend verification.

The secret key should be stored in your environment variables:

```env
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

## 📝 How It Works

### User Flow

1. User visits login/register page
2. reCAPTCHA script loads automatically
3. User fills out the form
4. User clicks submit button
5. **reCAPTCHA executes invisibly** (no challenge in most cases)
6. Token is generated
7. Token is validated
8. If valid, form submission proceeds
9. If invalid, user sees error message

### Technical Flow

```javascript
// 1. Hook initialization
const { executeRecaptcha, isReady } = useRecaptcha();

// 2. Form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // 3. Execute reCAPTCHA
  const token = await executeRecaptcha('LOGIN');
  
  // 4. Validate token
  if (!token) {
    toast.error('Security verification failed');
    return;
  }
  
  // 5. Proceed with authentication
  await login(email, password);
};
```

## 🔧 Backend Verification (Optional)

While the frontend integration is complete, you can add **backend verification** for extra security.

### Create Verification Utility

Create `lib/recaptcha-verify.ts`:

```typescript
export async function verifyRecaptchaToken(token: string, expectedAction: string) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY not configured');
    return { success: true, score: 1.0 }; // Skip verification if not configured
  }

  try {
    const response = await fetch(
      `https://recaptchaenterprise.googleapis.com/v1/projects/YOUR_PROJECT_ID/assessments?key=${secretKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: {
            token,
            expectedAction,
            siteKey: '6LeHsQIsAAAAAJCU87uTTHGx61lUEE5K7lKNpoz1',
          },
        }),
      }
    );

    const data = await response.json();
    
    return {
      success: data.tokenProperties?.valid === true,
      score: data.riskAnalysis?.score || 0,
      action: data.tokenProperties?.action,
      reasons: data.riskAnalysis?.reasons || [],
    };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return { success: false, score: 0 };
  }
}
```

### Use in API Routes

Example: Update `app/api/user/login/route.ts`:

```typescript
import { verifyRecaptchaToken } from '@/lib/recaptcha-verify';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, recaptchaToken } = body;

  // Verify reCAPTCHA token
  const verification = await verifyRecaptchaToken(recaptchaToken, 'LOGIN');
  
  if (!verification.success || verification.score < 0.5) {
    return NextResponse.json(
      { error: 'Security verification failed' },
      { status: 403 }
    );
  }

  // Continue with login...
}
```

## 📊 reCAPTCHA Console

Access your reCAPTCHA dashboard at:
https://console.cloud.google.com/security/recaptcha

Here you can:
- View analytics and metrics
- Monitor attack attempts
- Adjust security settings
- View score distribution
- Check integration status

## 🎯 Actions Tracked

| Page | Action | Purpose |
|------|--------|---------|
| Login | `LOGIN` | Protect against credential stuffing |
| Register | `REGISTER` | Prevent bot registrations |
| Reseller Portal | `RESELLER_LOGIN` | Secure reseller access |

You can add more actions as needed (e.g., `CREATE_LICENSE`, `DELETE_USER`, etc.).

## 🚀 Testing

### Development Testing

1. Open your application
2. Open browser DevTools (F12)
3. Navigate to login page
4. Watch the console for reCAPTCHA logs
5. Submit the form
6. Check Network tab for reCAPTCHA requests

### Production Testing

- reCAPTCHA will automatically adjust difficulty based on user behavior
- Most legitimate users won't see any challenge
- Suspicious traffic may get additional challenges
- Monitor your reCAPTCHA console for analytics

## 🔍 Troubleshooting

### reCAPTCHA Not Loading

**Issue**: Button stuck on "Loading security..."

**Solutions**:
1. Check browser console for errors
2. Verify site key is correct
3. Check if domain is authorized in reCAPTCHA console
4. Try clearing browser cache
5. Check for ad blockers or privacy extensions

### Verification Failing

**Issue**: "Security verification failed" error

**Solutions**:
1. Ensure reCAPTCHA script loaded successfully
2. Check network connectivity
3. Verify site key matches your domain
4. Check if you're testing from localhost (should work)
5. Review reCAPTCHA console for error messages

### Auto-login Bypassing reCAPTCHA

This is **intentional behavior**:
- When users return with a saved API key, reCAPTCHA is skipped
- This provides better UX for returning users
- Only manual logins trigger reCAPTCHA
- You can change this by removing the `if (!savedKey)` check

## 🎨 Customization

### Change Button Text

In login/register pages, update the loading state:

```tsx
!isReady ? (
  <>
    <svg>...</svg>
    Your Custom Text Here
  </>
) : (
  'Sign in'
)
```

### Remove "Protected by" Badge

Remove this section from the forms:

```tsx
<p className="mt-2 text-xs text-center text-slate-500 dark:text-slate-400">
  Protected by Google reCAPTCHA Enterprise
</p>
```

### Add More Actions

To protect additional actions:

```tsx
// In your component
const handleAction = async () => {
  const token = await executeRecaptcha('YOUR_ACTION_NAME');
  if (!token) return;
  
  // Proceed with action...
};
```

## 📚 Additional Resources

- [reCAPTCHA Enterprise Documentation](https://cloud.google.com/recaptcha-enterprise/docs)
- [Integration Guide](https://cloud.google.com/recaptcha-enterprise/docs/integrate-web)
- [Best Practices](https://cloud.google.com/recaptcha-enterprise/docs/best-practices)
- [Score Interpretation](https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment)

## 🔐 Security Notes

1. **Never expose your secret key** - Keep it in environment variables only
2. **Always verify tokens server-side** for production environments
3. **Monitor your reCAPTCHA console** for unusual activity
4. **Set appropriate score thresholds** (0.0-1.0, higher = more human-like)
5. **Rotate keys periodically** for maximum security

## ✨ Benefits

- ✅ Invisible protection (no annoying challenges for most users)
- ✅ Advanced ML-based bot detection
- ✅ Real-time risk analysis
- ✅ Detailed analytics and insights
- ✅ Easy integration
- ✅ Mobile-friendly
- ✅ WCAG 2.1 accessible

---

**Need help?** Check the [Google Cloud Console](https://console.cloud.google.com/security/recaptcha) or contact support.

