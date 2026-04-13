import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminAuth: Auth;
let adminDb: Firestore;

function initializeFirebaseAdmin() {
  const apps = getApps();
  
  // Check if environment variables are available
  // Prioritize the explicit admin project ID
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;

  if (process.env.NODE_ENV === 'development') {
    console.log('Initializing Firebase Admin with Project ID:', projectId);
  }

  if (!projectId || !clientEmail || !privateKey) {
    // During build time or when env vars are not set, return null
    // This prevents the app from crashing during build
    console.warn('Firebase Admin environment variables not set. Skipping initialization.');
    return null;
  }

  if (!apps.length) {
    try {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      return null;
    }
  }

  adminAuth = getAuth();
  adminDb = getFirestore();
  
  return { adminAuth, adminDb };
}

// Only initialize if we're not in build time
if (typeof window === 'undefined') {
  const initialized = initializeFirebaseAdmin();
  if (initialized) {
    adminAuth = initialized.adminAuth;
    adminDb = initialized.adminDb;
  }
}

export { adminAuth, adminDb };

