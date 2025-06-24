// lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let googleProvider: GoogleAuthProvider;

// Function to initialize Firebase services
const initializeFirebase = () => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be initialized on the client side');
  }

  // Check if all required config values are present
  const missingFields: string[] = [];
  
  if (!firebaseConfig.apiKey) missingFields.push('apiKey');
  if (!firebaseConfig.authDomain) missingFields.push('authDomain');
  if (!firebaseConfig.projectId) missingFields.push('projectId');
  if (!firebaseConfig.appId) missingFields.push('appId');
  
  if (missingFields.length > 0) {
    throw new Error(`Missing Firebase config fields: ${missingFields.join(', ')}`);
  }

  try {
    // Initialize Firebase app
    app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    
    // Initialize Auth
    auth = getAuth(app);
    
    // Initialize Google Provider
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account',
      access_type: 'offline',
      include_granted_scopes: 'true'
    });

    return { app, auth, googleProvider };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

// Function to get Firebase services (initializes if needed)
export const getFirebaseServices = () => {
  if (typeof window === 'undefined') {
    return { auth: null, googleProvider: null };
  }

  // Initialize if not already done
  if (!app || !auth || !googleProvider) {
    const services = initializeFirebase();
    return services;
  }

  return { auth, googleProvider };
};

// For backward compatibility, but these might be undefined
export { auth, googleProvider };
export type { Auth, GoogleAuthProvider };