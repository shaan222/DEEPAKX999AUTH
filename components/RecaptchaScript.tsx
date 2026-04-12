'use client'

import { useEffect } from 'react';

export default function RecaptchaScript() {
  useEffect(() => {
    // Only load reCAPTCHA in production (not localhost)
    const isLocalhost = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('localhost')
    );

    if (!isLocalhost) {
      // Load reCAPTCHA script only in production
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/enterprise.js?render=6LeHsQIsAAAAAJCU87uTTHGx61lUEE5K7lKNpoz1';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      return () => {
        // Cleanup: remove script if component unmounts
        const existingScript = document.querySelector('script[src*="recaptcha/enterprise.js"]');
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, []);

  return null;
}

