'use client'

import { useState, useEffect } from 'react'
import { FaArrowLeft, FaChartLine, FaFileAlt } from 'react-icons/fa'
import Link from 'next/link'
import { database } from '@/lib/firebase'
import { ref, onValue } from 'firebase/database'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getPrediction } from '@/lib/prediction'
import { generateReport } from '@/lib/report'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)

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

  useEffect(() => {
    if (!database) {
      setError('Firebase is not initialized')
      setLoading(false)
      return
    }

    const sensorRef = ref(database, 'sensor_data')
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setSensorData(data)
        setError(null)
      } else {
        setError('No sensor data available')
      }
      setLoading(false)
    }, (error) => {
      setError('Failed to fetch sensor data')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleGenerateReport = async () => {
    if (!sensorData) {
      setError('No sensor data available')
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
      setError('Failed to generate report')
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
          disabled={!sensorData || loading}
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