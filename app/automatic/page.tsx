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

interface SoilLayers {
  top_layer: SensorData | null
  mid_layer: SensorData | null
  bottom_layer: SensorData | null
}

export default function AutomaticReport() {
  const [soilLayers, setSoilLayers] = useState<SoilLayers>({
    top_layer: null,
    mid_layer: null,
    bottom_layer: null
  })
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
        console.log('Firebase initialized, setting up Firestore listeners')

        // Set up listeners for all three layers with exact collection names
        const topLayerRef = collection(db, 'top_layer')
        const midLayerRef = collection(db, 'mid_layer')
        const bottomLayerRef = collection(db, 'bottom_layer')

        console.log('Setting up Firestore listeners for all soil layers')
        
        const unsubscribeTop = onSnapshot(topLayerRef, 
          (snapshot) => {
            console.log('Received top layer snapshot:', snapshot.docs.length, 'documents')
            const data = snapshot.docs.map(doc => doc.data() as SensorData)
            if (data.length > 0) {
              console.log('Setting top layer data:', data[0])
              setSoilLayers(prev => ({ ...prev, top_layer: data[0] }))
              setError(null)
            } else {
              console.log('No top layer data available')
              setError('No top layer data available. Please check if sensors are connected.')
            }
          },
          (error) => {
            console.error('Top layer Firestore error:', error)
            setError('Failed to fetch top layer data. Please try again later.')
          }
        )

        const unsubscribeMid = onSnapshot(midLayerRef, 
          (snapshot) => {
            console.log('Received mid layer snapshot:', snapshot.docs.length, 'documents')
            const data = snapshot.docs.map(doc => doc.data() as SensorData)
            if (data.length > 0) {
              console.log('Setting mid layer data:', data[0])
              setSoilLayers(prev => ({ ...prev, mid_layer: data[0] }))
              setError(null)
            } else {
              console.log('No mid layer data available')
              setError('No mid layer data available. Please check if sensors are connected.')
            }
          },
          (error) => {
            console.error('Mid layer Firestore error:', error)
            setError('Failed to fetch mid layer data. Please try again later.')
          }
        )

        const unsubscribeBottom = onSnapshot(bottomLayerRef, 
          (snapshot) => {
            console.log('Received bottom layer snapshot:', snapshot.docs.length, 'documents')
            const data = snapshot.docs.map(doc => doc.data() as SensorData)
            if (data.length > 0) {
              console.log('Setting bottom layer data:', data[0])
              setSoilLayers(prev => ({ ...prev, bottom_layer: data[0] }))
              setError(null)
            } else {
              console.log('No bottom layer data available')
              setError('No bottom layer data available. Please check if sensors are connected.')
            }
          },
          (error) => {
            console.error('Bottom layer Firestore error:', error)
            setError('Failed to fetch bottom layer data. Please try again later.')
          }
        )

        setLoading(false)

        return () => {
          console.log('Cleaning up Firestore listeners')
          unsubscribeTop()
          unsubscribeMid()
          unsubscribeBottom()
        }
      } catch (error) {
        console.error('Error setting up Firestore listeners:', error)
        setError('Failed to connect to database. Please try again later.')
        setLoading(false)
      }
    }

    initializeFirebase()
  }, [])

  const handleGenerateReport = async () => {
    if (!soilLayers.top_layer || !soilLayers.mid_layer || !soilLayers.bottom_layer) {
      setError('Missing data from one or more soil layers')
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
        top_layer: soilLayers.top_layer,
        mid_layer: soilLayers.mid_layer,
        bottom_layer: soilLayers.bottom_layer
      })

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
      
      const prompt = `Based on the following soil sensor readings from three layers and recommended fertilizer, generate a detailed report:
      
      Top Layer Data:
      - Temperature: ${soilLayers.top_layer.temperature}°C
      - Humidity: ${soilLayers.top_layer.humidity}%
      - Moisture: ${soilLayers.top_layer.moisture}%
      - pH: ${soilLayers.top_layer.ph}
      - Nitrogen: ${soilLayers.top_layer.nitrogen} ppm
      - Phosphorus: ${soilLayers.top_layer.phosphorus} ppm
      - Potassium: ${soilLayers.top_layer.potassium} ppm
      
      Middle Layer Data:
      - Temperature: ${soilLayers.mid_layer.temperature}°C
      - Humidity: ${soilLayers.mid_layer.humidity}%
      - Moisture: ${soilLayers.mid_layer.moisture}%
      - pH: ${soilLayers.mid_layer.ph}
      - Nitrogen: ${soilLayers.mid_layer.nitrogen} ppm
      - Phosphorus: ${soilLayers.mid_layer.phosphorus} ppm
      - Potassium: ${soilLayers.mid_layer.potassium} ppm
      
      Bottom Layer Data:
      - Temperature: ${soilLayers.bottom_layer.temperature}°C
      - Humidity: ${soilLayers.bottom_layer.humidity}%
      - Moisture: ${soilLayers.bottom_layer.moisture}%
      - pH: ${soilLayers.bottom_layer.ph}
      - Nitrogen: ${soilLayers.bottom_layer.nitrogen} ppm
      - Phosphorus: ${soilLayers.bottom_layer.phosphorus} ppm
      - Potassium: ${soilLayers.bottom_layer.potassium} ppm
      
      Recommended Fertilizer: ${prediction}
      
      Please provide a comprehensive report including:
      1. Current Soil Conditions Analysis (for each layer)
      2. Fertilizer Explanation
      3. Specific Actions to Take
      4. Implementation Timeline
      5. Expected Outcomes`

      const result = await model.generateContent(prompt)
      const response = await result.response
      setReport(response.text())
    } catch (error) {
      console.error('Error generating report:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate report. Please try again later.')
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

        {soilLayers.top_layer && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4">Top Layer Data</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Temperature</p>
                <p className="text-xl">{soilLayers.top_layer.temperature}°C</p>
              </div>
              <div>
                <p className="text-gray-400">Humidity</p>
                <p className="text-xl">{soilLayers.top_layer.humidity}%</p>
              </div>
              <div>
                <p className="text-gray-400">Moisture</p>
                <p className="text-xl">{soilLayers.top_layer.moisture}%</p>
              </div>
              <div>
                <p className="text-gray-400">pH</p>
                <p className="text-xl">{soilLayers.top_layer.ph}</p>
              </div>
              <div>
                <p className="text-gray-400">Nitrogen</p>
                <p className="text-xl">{soilLayers.top_layer.nitrogen} ppm</p>
              </div>
              <div>
                <p className="text-gray-400">Phosphorus</p>
                <p className="text-xl">{soilLayers.top_layer.phosphorus} ppm</p>
              </div>
              <div>
                <p className="text-gray-400">Potassium</p>
                <p className="text-xl">{soilLayers.top_layer.potassium} ppm</p>
              </div>
              <div>
                <p className="text-gray-400">Last Updated</p>
                <p className="text-xl">
                  {new Date(soilLayers.top_layer.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {soilLayers.mid_layer && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4">Middle Layer Data</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Temperature</p>
                <p className="text-xl">{soilLayers.mid_layer.temperature}°C</p>
              </div>
              <div>
                <p className="text-gray-400">Humidity</p>
                <p className="text-xl">{soilLayers.mid_layer.humidity}%</p>
              </div>
              <div>
                <p className="text-gray-400">Moisture</p>
                <p className="text-xl">{soilLayers.mid_layer.moisture}%</p>
              </div>
              <div>
                <p className="text-gray-400">pH</p>
                <p className="text-xl">{soilLayers.mid_layer.ph}</p>
              </div>
              <div>
                <p className="text-gray-400">Nitrogen</p>
                <p className="text-xl">{soilLayers.mid_layer.nitrogen} ppm</p>
              </div>
              <div>
                <p className="text-gray-400">Phosphorus</p>
                <p className="text-xl">{soilLayers.mid_layer.phosphorus} ppm</p>
              </div>
              <div>
                <p className="text-gray-400">Potassium</p>
                <p className="text-xl">{soilLayers.mid_layer.potassium} ppm</p>
              </div>
              <div>
                <p className="text-gray-400">Last Updated</p>
                <p className="text-xl">
                  {new Date(soilLayers.mid_layer.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {soilLayers.bottom_layer && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4">Bottom Layer Data</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Temperature</p>
                <p className="text-xl">{soilLayers.bottom_layer.temperature}°C</p>
              </div>
              <div>
                <p className="text-gray-400">Humidity</p>
                <p className="text-xl">{soilLayers.bottom_layer.humidity}%</p>
              </div>
              <div>
                <p className="text-gray-400">Moisture</p>
                <p className="text-xl">{soilLayers.bottom_layer.moisture}%</p>
              </div>
              <div>
                <p className="text-gray-400">pH</p>
                <p className="text-xl">{soilLayers.bottom_layer.ph}</p>
              </div>
              <div>
                <p className="text-gray-400">Nitrogen</p>
                <p className="text-xl">{soilLayers.bottom_layer.nitrogen} ppm</p>
              </div>
              <div>
                <p className="text-gray-400">Phosphorus</p>
                <p className="text-xl">{soilLayers.bottom_layer.phosphorus} ppm</p>
              </div>
              <div>
                <p className="text-gray-400">Potassium</p>
                <p className="text-xl">{soilLayers.bottom_layer.potassium} ppm</p>
              </div>
              <div>
                <p className="text-gray-400">Last Updated</p>
                <p className="text-xl">
                  {new Date(soilLayers.bottom_layer.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleGenerateReport}
          disabled={!soilLayers.top_layer || !soilLayers.mid_layer || !soilLayers.bottom_layer || loading || !genAI}
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