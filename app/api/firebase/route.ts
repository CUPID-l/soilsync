import { NextResponse } from 'next/server'
import { firebaseAdmin } from '@/lib/firebase-admin'

export async function GET() {
  try {
    if (!firebaseAdmin) {
      throw new Error('Firebase Admin not initialized')
    }

    const db = firebaseAdmin.database()
    const ref = db.ref('sensors')
    const snapshot = await ref.once('value')
    const data = snapshot.val()

    if (!data) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Firebase Admin Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sensor data' },
      { status: 500 }
    )
  }
} 