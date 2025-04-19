"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaArrowLeft, FaRobot } from 'react-icons/fa'
import Link from 'next/link'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "")

interface SoilData {
  topsoil: {
    moisture: number
    temperature: number
    ph: number
  }
  subsoil: {
    moisture: number
    temperature: number
    ph: number
  }
  deepsoil: {
    moisture: number
    temperature: number
    ph: number
  }
  soilType: string
  cropType: string
}

interface PredictionResponse {
  fertilizer: string
  confidence: number
}

type FormData = {
  topsoil: {
    moisture: number
    temperature: number
    ph: number
  }
  subsoil: {
    moisture: number
    temperature: number
    ph: number
  }
  deepsoil: {
    moisture: number
    temperature: number
    ph: number
  }
  soilType: string
  cropType: string
}

export default function ManualEntry() {
  const { register, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      topsoil: {
        moisture: 50,
        temperature: 25,
        ph: 7
      },
      subsoil: {
        moisture: 50,
        temperature: 25,
        ph: 7
      },
      deepsoil: {
        moisture: 50,
        temperature: 25,
        ph: 7
      },
      soilType: 'Clayey',
      cropType: 'Coconut'
    }
  })
  const [prediction, setPrediction] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<string | null>(null)
  const [generatingReport, setGeneratingReport] = useState(false)

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)
    try {
      // Format the data according to the API requirements
      const formattedData = {
        topsoil: [
          data.topsoil.temperature,
          data.topsoil.moisture,
          data.topsoil.ph
        ],
        subsoil: [
          data.subsoil.temperature,
          data.subsoil.moisture,
          data.subsoil.ph
        ],
        deepsoil: [
          data.deepsoil.temperature,
          data.deepsoil.moisture,
          data.deepsoil.ph
        ],
        soilType: data.soilType,
        cropType: data.cropType
      }

      const response = await fetch(process.env.NEXT_PUBLIC_HF_API_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HF_API_TOKEN}`
        },
        body: JSON.stringify(formattedData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Prediction failed')
      }
      
      const result = await response.json()
      setPrediction(result.fertilizer)
      setReport(null) // Clear any previous report
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Failed to get prediction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    if (!prediction) return

    setGeneratingReport(true)
    setError(null)
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })
      
      const prompt = `Based on the following soil sensor data and fertilizer prediction, provide a comprehensive analysis and recommendations:

Soil Data:
Topsoil:
- Temperature: ${watch('topsoil.temperature')}°C
- Moisture: ${watch('topsoil.moisture')}%
- pH: ${watch('topsoil.ph')}

Subsoil:
- Temperature: ${watch('subsoil.temperature')}°C
- Moisture: ${watch('subsoil.moisture')}%
- pH: ${watch('subsoil.ph')}

Deepsoil:
- Temperature: ${watch('deepsoil.temperature')}°C
- Moisture: ${watch('deepsoil.moisture')}%
- pH: ${watch('deepsoil.ph')}

Soil Type: ${watch('soilType')}
Crop Type: ${watch('cropType')}
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
      setError(error instanceof Error ? error.message : 'Failed to generate report. Please try again.')
    } finally {
      setGeneratingReport(false)
    }
  }

  const renderSoilInputs = (prefix: 'topsoil' | 'subsoil' | 'deepsoil', title: string) => (
    <div className="bg-dark-700 p-6 rounded-xl">
      <h2 className="text-2xl font-semibold mb-6">{title}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2">Temperature (°C)</label>
          <input
            type="range"
            min="0"
            max="50"
            step="0.1"
            {...register(`${prefix}.temperature`)}
            className="w-full"
          />
          <span className="text-primary-500">{watch(`${prefix}.temperature`)}°C</span>
        </div>
        <div>
          <label className="block mb-2">Moisture (%)</label>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            {...register(`${prefix}.moisture`)}
            className="w-full"
          />
          <span className="text-primary-500">{watch(`${prefix}.moisture`)}%</span>
        </div>
        <div>
          <label className="block mb-2">pH</label>
          <input
            type="range"
            min="0"
            max="14"
            step="0.1"
            {...register(`${prefix}.ph`)}
            className="w-full"
          />
          <span className="text-primary-500">{watch(`${prefix}.ph`)}</span>
        </div>
      </div>
    </div>
  )

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

        <h1 className="text-4xl font-bold mb-8">Manual Data Entry</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {renderSoilInputs('topsoil', 'Topsoil Data')}
          {renderSoilInputs('subsoil', 'Subsoil Data')}
          {renderSoilInputs('deepsoil', 'Deepsoil Data')}

          {/* Soil and Crop Type */}
          <div className="bg-dark-700 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-6">Additional Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2">Soil Type</label>
                <select
                  {...register('soilType')}
                  className="w-full bg-dark-600 border border-dark-500 rounded-lg p-2"
                >
                  <option value="Clayey">Clayey</option>
                  <option value="Alluvial">Alluvial</option>
                  <option value="Clay Loam">Clay Loam</option>
                  <option value="Coastal">Coastal</option>
                  <option value="Laterite">Laterite</option>
                  <option value="Sandy">Sandy</option>
                  <option value="Silty Clay">Silty Clay</option>
                </select>
              </div>
              <div>
                <label className="block mb-2">Crop Type</label>
                <select
                  {...register('cropType')}
                  className="w-full bg-dark-600 border border-dark-500 rounded-lg p-2"
                >
                  <option value="Coconut">Coconut</option>
                  <option value="Rice">Rice</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Predicting...' : 'Get Prediction'}
          </button>
        </form>

        {error && (
          <div className="mt-8 bg-red-900/50 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4 text-red-400">Error</h2>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {prediction && (
          <div className="mt-8 space-y-4">
            <div className="bg-dark-700 p-6 rounded-xl">
              <h2 className="text-2xl font-semibold mb-4">Prediction Result</h2>
              <p className="text-primary-500 text-xl">{prediction}</p>
            </div>

            <button
              onClick={generateReport}
              disabled={generatingReport}
              className="w-full bg-dark-600 hover:bg-dark-500 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FaRobot />
              {generatingReport ? 'Generating Report...' : 'Generate AI Report'}
            </button>
          </div>
        )}

        {report && (
          <div className="mt-8 bg-dark-700 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4">AI Analysis Report</h2>
            <div className="prose prose-invert max-w-none">
              {report.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
} 