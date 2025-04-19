import admin from 'firebase-admin'

function getFirebaseAdmin() {
  if (admin.apps.length) {
    return admin.apps[0]
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  if (!privateKey) {
    throw new Error('FIREBASE_PRIVATE_KEY is not set')
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      })
    })
  } catch (error) {
    console.error('Firebase Admin initialization error:', error)
    throw error
  }
}

export const firebaseAdmin = getFirebaseAdmin() 