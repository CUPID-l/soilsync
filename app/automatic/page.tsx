'use client'

import { useState, useEffect } from 'react'
import { FaArrowLeft, FaChartLine, FaFileAlt } from 'react-icons/fa'
import Link from 'next/link'
import { database } from '@/lib/firebase'
import { ref, onValue } from 'firebase/database'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)

export default function AutomaticReport() {
  const [sensorData, setSensorData] = useState<any>(null)
  const [prediction, setPrediction] = useState<string | null>(null)
  const [report, setReport] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const sensorRef = ref(database, 'sensors')
    const unsubscribe = onValue(sensorRef, 
      (snapshot) => {
        try {
          const data = snapshot.val()
          if (data) {
            // Validate data structure
            if (!data.topsoil || !data.subsoil || !data.deepsoil) {
              setError('Invalid sensor data structure received from Firebase')
              return
            }
            setSensorData(data)
            setError(null)
          } else {
            setError('No sensor data available')
          }
        } catch (error) {
          console.error('Error processing sensor data:', error)
          setError('Error processing sensor data. Please try again.')
        }
      },
      (error) => {
        console.error('Firebase error:', error)
        setError('Failed to connect to Firebase. Please check your connection and try again.')
      }
    )

    return () => unsubscribe()
  }, [])

  const generateReport = async () => {
    if (!sensorData || !prediction) return

    setLoading(true)
    setError(null)
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })
      
      const prompt = `Based on the following soil sensor data and fertilizer prediction, provide a comprehensive analysis and recommendations:

Soil Data:
Topsoil:
- Temperature: ${sensorData.topsoil.temperature}°C
- Moisture: ${sensorData.topsoil.moisture}%
- pH: ${sensorData.topsoil.ph}
- Nitrogen: ${sensorData.topsoil.nitrogen} mg/kg
- Phosphorus: ${sensorData.topsoil.phosphorus} mg/kg
- Potassium: ${sensorData.topsoil.potassium} mg/kg

Subsoil:
- Temperature: ${sensorData.subsoil.temperature}°C
- Moisture: ${sensorData.subsoil.moisture}%
- pH: ${sensorData.subsoil.ph}
- Nitrogen: ${sensorData.subsoil.nitrogen} mg/kg
- Phosphorus: ${sensorData.subsoil.phosphorus} mg/kg
- Potassium: ${sensorData.subsoil.potassium} mg/kg

Deepsoil:
- Temperature: ${sensorData.deepsoil.temperature}°C
- Moisture: ${sensorData.deepsoil.moisture}%
- pH: ${sensorData.deepsoil.ph}
- Nitrogen: ${sensorData.deepsoil.nitrogen} mg/kg
- Phosphorus: ${sensorData.deepsoil.phosphorus} mg/kg
- Potassium: ${sensorData.deepsoil.potassium} mg/kg

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
      setError('Failed to generate report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPrediction = async () => {
    if (!sensorData) return

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_HF_API_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HF_API_TOKEN}`
        },
        body: JSON.stringify(sensorData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Prediction failed')
      }
      
      const result = await response.json()
      setPrediction(result.fertilizer)
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Failed to get prediction. Please try again.')
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

        {error && (
          <div className="mb-8 bg-red-900/50 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4 text-red-400">Error</h2>
            <p className="text-red-300">{error}</p>
          </div>
        )}

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
                  <p>Nitrogen: {sensorData.topsoil.nitrogen} mg/kg</p>
                  <p>Phosphorus: {sensorData.topsoil.phosphorus} mg/kg</p>
                  <p>Potassium: {sensorData.topsoil.potassium} mg/kg</p>
                </div>
                <div className="bg-dark-600 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Subsoil</h3>
                  <p>Temperature: {sensorData.subsoil.temperature}°C</p>
                  <p>Moisture: {sensorData.subsoil.moisture}%</p>
                  <p>pH: {sensorData.subsoil.ph}</p>
                  <p>Nitrogen: {sensorData.subsoil.nitrogen} mg/kg</p>
                  <p>Phosphorus: {sensorData.subsoil.phosphorus} mg/kg</p>
                  <p>Potassium: {sensorData.subsoil.potassium} mg/kg</p>
                </div>
                <div className="bg-dark-600 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Deepsoil</h3>
                  <p>Temperature: {sensorData.deepsoil.temperature}°C</p>
                  <p>Moisture: {sensorData.deepsoil.moisture}%</p>
                  <p>pH: {sensorData.deepsoil.ph}</p>
                  <p>Nitrogen: {sensorData.deepsoil.nitrogen} mg/kg</p>
                  <p>Phosphorus: {sensorData.deepsoil.phosphorus} mg/kg</p>
                  <p>Potassium: {sensorData.deepsoil.potassium} mg/kg</p>
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
              <div className="bg-dark-700 p-8 rounded-xl">
                <div className="flex items-center gap-3 mb-8">
                  <FaFileAlt className="text-primary-500 text-3xl" />
                  <h2 className="text-3xl font-bold">Comprehensive Report</h2>
                </div>
                <div className="prose prose-invert max-w-none">
                  {report.split('\n').map((paragraph, index) => {
                    // Skip empty lines
                    if (!paragraph.trim()) return null

                    // Handle main title
                    if (paragraph.startsWith('## ')) {
                      return (
                        <h1 key={index} className="text-4xl font-bold text-primary-400 mb-8">
                          {paragraph.replace('## ', '')}
                        </h1>
                      )
                    }

                    // Handle section titles (1., 2., etc.)
                    if (paragraph.match(/^\d+\./)) {
                      const title = paragraph.replace(/\*\*/g, '').replace(':', '').trim()
                      return (
                        <div key={index} className="mt-12 mb-6">
                          <h2 className="text-2xl font-bold text-primary-400">{title}</h2>
                          <div className="h-1 w-24 bg-primary-500 mt-2 mb-6"></div>
                        </div>
                      )
                    }

                    // Handle subheadings in Specific Actions and Timeline
                    if (paragraph.includes(':')) {
                      const [title, content] = paragraph.split(':')
                      if (content) {
                        return (
                          <div key={index} className="mb-6">
                            <h3 className="text-xl font-semibold text-primary-400 mb-3">{title}:</h3>
                            <p className="text-gray-300 ml-6">{content.trim()}</p>
                          </div>
                        )
                      }
                    }

                    // Handle bullet points in Specific Actions and Timeline
                    if (paragraph.startsWith('* ')) {
                      const content = paragraph.replace('* ', '').replace(/\*\*/g, '').trim()
                      return (
                        <div key={index} className="flex items-start mb-4">
                          <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 mr-3"></div>
                          <p className="text-gray-300">{content}</p>
                        </div>
                      )
                    }

                    // Handle important note
                    if (paragraph.startsWith('Important Note:')) {
                      return (
                        <div key={index} className="mt-12 pt-6 border-t border-dark-500">
                          <h3 className="text-xl font-semibold text-primary-400 mb-4">Important Note</h3>
                          <p className="text-gray-300">
                            {paragraph.replace('Important Note:', '').trim()}
                          </p>
                        </div>
                      )
                    }

                    // Regular paragraphs
                    return (
                      <p key={index} className="text-gray-300 mb-6 leading-relaxed">
                        {paragraph.replace(/\*\*/g, '')}
                      </p>
                    )
                  })}
                </div>
                <div className="mt-12 pt-6 border-t border-dark-500">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Generated by SoilSync AI</span>
                    <span className="text-sm text-gray-400">{new Date().toLocaleDateString()}</span>
                  </div>
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