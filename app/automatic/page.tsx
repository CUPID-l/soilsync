'use client'

import { useState, useEffect } from 'react'
import { FaArrowLeft, FaChartLine } from 'react-icons/fa'
import Link from 'next/link'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue } from 'firebase/database'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)

export default function AutomaticReport() {
  const [sensorData, setSensorData] = useState<any>(null)
  const [prediction, setPrediction] = useState<string | null>(null)
  const [report, setReport] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const sensorRef = ref(database, 'sensors')
    onValue(sensorRef, (snapshot) => {
      const data = snapshot.val()
      setSensorData(data)
    })
  }, [])

  const generateReport = async () => {
    if (!sensorData || !prediction) return

    setLoading(true)
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })
      
      const prompt = `Based on the following soil sensor data and fertilizer prediction, provide a comprehensive analysis and recommendations:

Sensor Data:
${JSON.stringify(sensorData, null, 2)}

Predicted Fertilizer: ${prediction}

Please provide:
1. Analysis of current soil conditions
2. Explanation of the fertilizer recommendation
3. Specific actions to take
4. Timeline for implementation
5. Expected outcomes`

      const result = await model.generateContent(prompt)
      const response = await result.response
      setReport(response.text())
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPrediction = async () => {
    if (!sensorData) return

    setLoading(true)
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_HF_API_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HF_API_TOKEN}`
        },
        body: JSON.stringify(sensorData)
      })

      if (!response.ok) throw new Error('Prediction failed')
      
      const result = await response.json()
      setPrediction(result.fertilizer)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to get prediction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Link 
          href="/" 
          className="inline-flex items-center text-primary-500 hover:text-primary-400 mb-8"
        >
          <FaArrowLeft className="mr-2" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Automatic Report</h1>

        {sensorData ? (
          <div className="space-y-8">
            {/* Current Sensor Data */}
            <div className="bg-dark-700 p-6 rounded-xl">
              <h2 className="text-2xl font-semibold mb-6">Current Sensor Data</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-dark-600 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Topsoil</h3>
                  <p>Temperature: {sensorData.topsoil.temperature}°C</p>
                  <p>Moisture: {sensorData.topsoil.moisture}%</p>
                  <p>pH: {sensorData.topsoil.ph}</p>
                </div>
                <div className="bg-dark-600 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Subsoil</h3>
                  <p>Temperature: {sensorData.subsoil.temperature}°C</p>
                  <p>Moisture: {sensorData.subsoil.moisture}%</p>
                  <p>pH: {sensorData.subsoil.ph}</p>
                </div>
                <div className="bg-dark-600 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Deepsoil</h3>
                  <p>Temperature: {sensorData.deepsoil.temperature}°C</p>
                  <p>Moisture: {sensorData.deepsoil.moisture}%</p>
                  <p>pH: {sensorData.deepsoil.ph}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={getPrediction}
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Get Prediction
              </button>
              {prediction && (
                <button
                  onClick={generateReport}
                  disabled={loading}
                  className="bg-dark-600 hover:bg-dark-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Generate Report
                </button>
              )}
            </div>

            {/* Prediction Result */}
            {prediction && (
              <div className="bg-dark-700 p-6 rounded-xl">
                <h2 className="text-2xl font-semibold mb-4">Prediction Result</h2>
                <p className="text-primary-500 text-xl">{prediction}</p>
              </div>
            )}

            {/* Generated Report */}
            {report && (
              <div className="bg-dark-700 p-6 rounded-xl">
                <h2 className="text-2xl font-semibold mb-4">Comprehensive Report</h2>
                <div className="prose prose-invert max-w-none">
                  {report.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaChartLine className="text-6xl text-primary-500 mx-auto mb-4" />
            <p className="text-xl text-gray-400">Waiting for sensor data...</p>
          </div>
        )}
      </div>
    </main>
  )
} 