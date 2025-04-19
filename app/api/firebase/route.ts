import { NextResponse } from 'next/server'
import { firebaseAdmin } from '@/lib/firebase-admin'

export async function GET() {
  try {
    if (!firebaseAdmin) {
      throw new Error('Firebase Admin not initialized')
    }

    const db = firebaseAdmin.firestore()
    const snapshot = await db.collection('sensors').get()
    
    if (snapshot.empty) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 })
    }

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error('Firebase Admin Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sensor data' },
      { status: 500 }
    )
  }
} 