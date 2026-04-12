import { useEffect, useState } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

const RECAPTCHA_SITE_KEY = '6LeHsQIsAAAAAJCU87uTTHGx61lUEE5K7lKNpoz1';

// Check if we're in development/localhost
const isDevelopment = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.includes('localhost')
);

export function useRecaptcha() {
  const [isReady, setIsReady] = useState(isDevelopment); // Skip reCAPTCHA in development

  useEffect(() => {
    // Skip reCAPTCHA in development
    if (isDevelopment) {
      return;
    }

    // Check if grecaptcha is already loaded
    if (typeof window !== 'undefined' && window.grecaptcha?.enterprise) {
      window.grecaptcha.enterprise.ready(() => {
        setIsReady(true);
      });
    } else {
      // Wait for script to load
      const checkRecaptcha = setInterval(() => {
        if (window.grecaptcha?.enterprise) {
          window.grecaptcha.enterprise.ready(() => {
            setIsReady(true);
            clearInterval(checkRecaptcha);
          });
        }
      }, 100);

      return () => clearInterval(checkRecaptcha);
    }
  }, []);

  const executeRecaptcha = async (action: string): Promise<string | null> => {
    // Skip reCAPTCHA in development - return a mock token
    if (isDevelopment) {
      return 'dev-token-skip-recaptcha';
    }

    if (!isReady) {
      console.warn('reCAPTCHA is not ready yet');
      return null;
    }

    try {
      const token = await window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, {
        action,
      });
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution failed:', error);
      return null;
    }
  };

  return { isReady, executeRecaptcha };
}

