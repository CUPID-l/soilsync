import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'

// Debug environment variables
const envVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

console.log('Firebase Environment Variables:', {
  ...envVars,
  apiKey: envVars.apiKey ? 'Present' : 'Missing',
  projectId: envVars.projectId ? 'Present' : 'Missing',
  appId: envVars.appId ? 'Present' : 'Missing'
})

const firebaseConfig = {
  apiKey: envVars.apiKey,
  authDomain: envVars.authDomain || `${envVars.projectId}.firebaseapp.com`,
  projectId: envVars.projectId,
  storageBucket: envVars.storageBucket || `${envVars.projectId}.appspot.com`,
  messagingSenderId: envVars.messagingSenderId,
  appId: envVars.appId
}

// Initialize Firebase only on the client side
let app: FirebaseApp | undefined
let db: Firestore | undefined
let auth: Auth | undefined

if (typeof window !== 'undefined') {
  try {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw new Error('Missing required Firebase configuration: apiKey and projectId are required')
    }

    console.log('Initializing Firebase with config:', {
      ...firebaseConfig,
      apiKey: 'Present',
      projectId: firebaseConfig.projectId
    })

    app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
    db = getFirestore(app)
    auth = getAuth(app)

    console.log('Firebase initialized successfully')
  } catch (error) {
    console.error('Firebase initialization error:', error)
    // Don't throw the error, just log it
  }
}

export { app, db, auth } 