/**
 * Google reCAPTCHA Enterprise Verification Utility
 * 
 * This utility provides server-side verification for reCAPTCHA tokens.
 * 
 * Setup:
 * 1. Add RECAPTCHA_SECRET_KEY to your .env.local file
 * 2. Add RECAPTCHA_PROJECT_ID to your .env.local file
 * 3. Import and use this function in your API routes
 * 
 * Example:
 * ```typescript
 * import { verifyRecaptchaToken } from '@/lib/recaptcha-verify';
 * 
 * const result = await verifyRecaptchaToken(token, 'LOGIN');
 * if (!result.success || result.score < 0.5) {
 *   return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
 * }
 * ```
 */

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_PROJECT_ID = process.env.RECAPTCHA_PROJECT_ID;
const RECAPTCHA_SITE_KEY = '6LeHsQIsAAAAAJCU87uTTHGx61lUEE5K7lKNpoz1';

interface RecaptchaVerificationResult {
  success: boolean;
  score: number;
  action?: string;
  reasons?: string[];
  errorMessage?: string;
}

/**
 * Verify a reCAPTCHA Enterprise token
 * 
 * @param token - The reCAPTCHA token from the frontend
 * @param expectedAction - The expected action name (e.g., 'LOGIN', 'REGISTER')
 * @param minScore - Minimum acceptable score (0.0-1.0, default 0.5)
 * @returns Verification result with success status and score
 */
export async function verifyRecaptchaToken(
  token: string,
  expectedAction: string,
  minScore: number = 0.5
): Promise<RecaptchaVerificationResult> {
  // Skip verification if not configured (development mode)
  if (!RECAPTCHA_SECRET_KEY || !RECAPTCHA_PROJECT_ID) {
    console.warn(
      '⚠️  reCAPTCHA verification skipped: RECAPTCHA_SECRET_KEY or RECAPTCHA_PROJECT_ID not configured'
    );
    return {
      success: true,
      score: 1.0,
      errorMessage: 'Verification skipped (not configured)',
    };
  }

  // Validate token
  if (!token || typeof token !== 'string') {
    return {
      success: false,
      score: 0,
      errorMessage: 'Invalid or missing reCAPTCHA token',
    };
  }

  try {
    // Create assessment request
    const response = await fetch(
      `https://recaptchaenterprise.googleapis.com/v1/projects/${RECAPTCHA_PROJECT_ID}/assessments?key=${RECAPTCHA_SECRET_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: {
            token,
            expectedAction,
            siteKey: RECAPTCHA_SITE_KEY,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('reCAPTCHA API error:', response.status, errorText);
      
      return {
        success: false,
        score: 0,
        errorMessage: `API error: ${response.status}`,
      };
    }

    const data = await response.json();

    // Check if token is valid
    if (!data.tokenProperties?.valid) {
      return {
        success: false,
        score: 0,
        errorMessage: 'Invalid token',
        reasons: data.tokenProperties?.invalidReason ? [data.tokenProperties.invalidReason] : [],
      };
    }

    // Verify action matches
    if (data.tokenProperties.action !== expectedAction) {
      return {
        success: false,
        score: 0,
        errorMessage: `Action mismatch: expected ${expectedAction}, got ${data.tokenProperties.action}`,
      };
    }

    // Get risk score
    const score = data.riskAnalysis?.score || 0;
    const reasons = data.riskAnalysis?.reasons || [];

    // Log assessment for monitoring
    console.log(`✅ reCAPTCHA verified: action=${expectedAction}, score=${score.toFixed(2)}`);

    // Check if score meets minimum threshold
    const success = score >= minScore;

    return {
      success,
      score,
      action: data.tokenProperties.action,
      reasons,
      errorMessage: success ? undefined : `Score too low: ${score.toFixed(2)} < ${minScore}`,
    };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    
    return {
      success: false,
      score: 0,
      errorMessage: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Middleware-style verification function
 * Throws an error if verification fails
 * 
 * @param token - The reCAPTCHA token
 * @param action - The expected action
 * @param minScore - Minimum score (default 0.5)
 * @throws Error if verification fails
 */
export async function requireRecaptchaVerification(
  token: string,
  action: string,
  minScore: number = 0.5
): Promise<void> {
  const result = await verifyRecaptchaToken(token, action, minScore);
  
  if (!result.success) {
    throw new Error(result.errorMessage || 'reCAPTCHA verification failed');
  }
}

/**
 * Get recommended score threshold based on action type
 * 
 * @param action - The action type
 * @returns Recommended minimum score
 */
export function getRecommendedScore(action: string): number {
  const scoreMap: Record<string, number> = {
    LOGIN: 0.5,           // Medium security
    REGISTER: 0.7,        // High security (prevent fake accounts)
    RESELLER_LOGIN: 0.6,  // Medium-high security
    CREATE_LICENSE: 0.5,  // Medium security
    DELETE_USER: 0.8,     // Very high security
    PAYMENT: 0.9,         // Maximum security
    COMMENT: 0.3,         // Low security
    SEARCH: 0.1,          // Very low security
  };

  return scoreMap[action] || 0.5; // Default to 0.5
}

/**
 * Log reCAPTCHA statistics (for monitoring)
 * 
 * @param action - The action that was verified
 * @param score - The score received
 * @param success - Whether verification succeeded
 */
export function logRecaptchaStats(action: string, score: number, success: boolean): void {
  const emoji = success ? '✅' : '❌';
  const status = success ? 'PASSED' : 'FAILED';
  
  console.log(
    `${emoji} reCAPTCHA ${status} | Action: ${action} | Score: ${score.toFixed(2)}`
  );
}

