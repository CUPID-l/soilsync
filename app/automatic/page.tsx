'use client'

import { useState, useEffect } from 'react'
import { FaArrowLeft, FaChartLine, FaFileAlt } from 'react-icons/fa'
import Link from 'next/link'
import { db } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getPrediction } from '@/lib/prediction'
import { generateReport } from '@/lib/report'

// Initialize Gemini with error handling
let genAI: GoogleGenerativeAI | null = null
try {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new Error('Gemini API key is not set')
  }
  genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)
} catch (error) {
  console.error('Failed to initialize Gemini:', error)
}

interface SensorData {
  temperature: number
  humidity: number
  moisture: number
  ph: number
  nitrogen: number
  phosphorus: number
  potassium: number
  timestamp: number
}

export default function AutomaticReport() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<string | null>(null)
  const [firebaseInitialized, setFirebaseInitialized] = useState(false)

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        if (!db) {
          console.error('Firebase not initialized')
          setError('Firebase is not initialized. Please check your Firebase configuration.')
          setLoading(false)
          return
        }

        setFirebaseInitialized(true)
        console.log('Firebase initialized, setting up Firestore listener')

        const sensorRef = collection(db, 'sensors')
        console.log('Setting up Firestore listener for sensors collection')
        
        const unsubscribe = onSnapshot(sensorRef, 
          (snapshot) => {
            console.log('Received Firestore snapshot:', snapshot.docs.length, 'documents')
            const data = snapshot.docs.map(doc => doc.data() as SensorData)
            if (data.length > 0) {
              console.log('Setting sensor data:', data[0])
              setSensorData(data[0])
              setError(null)
            } else {
              console.log('No sensor data available')
              setError('No sensor data available. Please check if sensors are connected.')
            }
            setLoading(false)
          },
          (error) => {
            console.error('Firestore error:', error)
            setError('Failed to fetch sensor data. Please try again later.')
            setLoading(false)
          }
        )

        return () => {
          console.log('Cleaning up Firestore listener')
          unsubscribe()
        }
      } catch (error) {
        console.error('Error setting up Firestore listener:', error)
        setError('Failed to connect to database. Please try again later.')
        setLoading(false)
      }
    }

    initializeFirebase()
  }, [])

  const handleGenerateReport = async () => {
    if (!sensorData) {
      setError('No sensor data available')
      return
    }

    if (!genAI) {
      setError('AI service is not available. Please check your configuration.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const prediction = await getPrediction({
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        moisture: sensorData.moisture,
        ph: sensorData.ph,
        nitrogen: sensorData.nitrogen,
        phosphorus: sensorData.phosphorus,
        potassium: sensorData.potassium
      })

      const report = await generateReport(sensorData, prediction)
      setReport(report)
    } catch (error) {
      console.error('Error generating report:', error)
      setError('Failed to generate report. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Loading...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Automatic Report</h1>
        
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {sensorData && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4">Current Sensor Data</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Temperature</p>
                <p className="text-xl">{sensorData.temperature}°C</p>
              </div>
              <div>
                <p className="text-gray-400">Humidity</p>
                <p className="text-xl">{sensorData.humidity}%</p>
              </div>
              <div>
                <p className="text-gray-400">Moisture</p>
                <p className="text-xl">{sensorData.moisture}%</p>
              </div>
              <div>
                <p className="text-gray-400">pH</p>
                <p className="text-xl">{sensorData.ph}</p>
              </div>
              <div>
                <p className="text-gray-400">Nitrogen</p>
                <p className="text-xl">{sensorData.nitrogen} ppm</p>
              </div>
              <div>
                <p className="text-gray-400">Phosphorus</p>
                <p className="text-xl">{sensorData.phosphorus} ppm</p>
              </div>
              <div>
                <p className="text-gray-400">Potassium</p>
                <p className="text-xl">{sensorData.potassium} ppm</p>
              </div>
              <div>
                <p className="text-gray-400">Last Updated</p>
                <p className="text-xl">
                  {new Date(sensorData.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleGenerateReport}
          disabled={!sensorData || loading || !genAI}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg mb-8 disabled:opacity-50"
        >
          Generate Report
        </button>

        {report && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Fertilizer Report</h2>
            <div className="prose prose-invert max-w-none">
              {report.split('\n').map((line, index) => (
                <p key={index} className="mb-4">{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 