'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaArrowLeft, FaFileAlt } from 'react-icons/fa'
import Link from 'next/link'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)

type FormData = {
  topsoil: {
    temperature: number
    moisture: number
    ph: number
    nitrogen: number
    phosphorus: number
    potassium: number
  }
  subsoil: {
    temperature: number
    moisture: number
    ph: number
    nitrogen: number
    phosphorus: number
    potassium: number
  }
  deepsoil: {
    temperature: number
    moisture: number
    ph: number
    nitrogen: number
    phosphorus: number
    potassium: number
  }
  soil_type: number
  crop_type: number
}

export default function ManualEntry() {
  const { register, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      topsoil: {
        temperature: 25,
        moisture: 50,
        ph: 7,
        nitrogen: 5,
        phosphorus: 5,
        potassium: 5
      },
      subsoil: {
        temperature: 25,
        moisture: 50,
        ph: 7,
        nitrogen: 5,
        phosphorus: 5,
        potassium: 5
      },
      deepsoil: {
        temperature: 25,
        moisture: 50,
        ph: 7,
        nitrogen: 5,
        phosphorus: 5,
        potassium: 5
      },
      soil_type: 0,
      crop_type: 0
    }
  })
  const [prediction, setPrediction] = useState<string | null>(null)
  const [report, setReport] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateReport = async (data: FormData, fertilizer: string) => {
    setLoading(true)
    setError(null)
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
      
      const prompt = `Based on the following soil sensor data and fertilizer prediction, provide a comprehensive analysis and recommendations:

Soil Data:
Topsoil:
- Temperature: ${data.topsoil.temperature}°C
- Moisture: ${data.topsoil.moisture}%
- pH: ${data.topsoil.ph}
- Nitrogen: ${data.topsoil.nitrogen} mg/kg
- Phosphorus: ${data.topsoil.phosphorus} mg/kg
- Potassium: ${data.topsoil.potassium} mg/kg

Subsoil:
- Temperature: ${data.subsoil.temperature}°C
- Moisture: ${data.subsoil.moisture}%
- pH: ${data.subsoil.ph}
- Nitrogen: ${data.subsoil.nitrogen} mg/kg
- Phosphorus: ${data.subsoil.phosphorus} mg/kg
- Potassium: ${data.subsoil.potassium} mg/kg

Deepsoil:
- Temperature: ${data.deepsoil.temperature}°C
- Moisture: ${data.deepsoil.moisture}%
- pH: ${data.deepsoil.ph}
- Nitrogen: ${data.deepsoil.nitrogen} mg/kg
- Phosphorus: ${data.deepsoil.phosphorus} mg/kg
- Potassium: ${data.deepsoil.potassium} mg/kg

Soil Type: ${['Clayey', 'Alluvial', 'Clay Loam', 'Coastal', 'Laterite', 'Sandy', 'Silty Clay'][data.soil_type]}
Crop Type: ${['Coconut', 'Rice'][data.crop_type]}
Predicted Fertilizer: ${fertilizer}

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
      setLoading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)
    setReport(null)
    try {
      // Format the data according to the API requirements
      const formattedData = {
        topsoil: [
          data.topsoil.temperature,
          data.topsoil.moisture,
          data.topsoil.ph,
          data.topsoil.nitrogen,
          data.topsoil.phosphorus,
          data.topsoil.potassium
        ],
        subsoil: [
          data.subsoil.temperature,
          data.subsoil.moisture,
          data.subsoil.ph,
          data.subsoil.nitrogen,
          data.subsoil.phosphorus,
          data.subsoil.potassium
        ],
        deepsoil: [
          data.deepsoil.temperature,
          data.deepsoil.moisture,
          data.deepsoil.ph,
          data.deepsoil.nitrogen,
          data.deepsoil.phosphorus,
          data.deepsoil.potassium
        ],
        soil_type: data.soil_type,
        crop_type: data.crop_type
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
      // Automatically generate report after getting prediction
      await generateReport(data, result.fertilizer)
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Failed to get prediction. Please try again.')
    } finally {
      setLoading(false)
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
        <div>
          <label className="block mb-2">Nitrogen (mg/kg)</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            {...register(`${prefix}.nitrogen`)}
            className="w-full"
          />
          <span className="text-primary-500">{watch(`${prefix}.nitrogen`)} mg/kg</span>
        </div>
        <div>
          <label className="block mb-2">Phosphorus (mg/kg)</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            {...register(`${prefix}.phosphorus`)}
            className="w-full"
          />
          <span className="text-primary-500">{watch(`${prefix}.phosphorus`)} mg/kg</span>
        </div>
        <div>
          <label className="block mb-2">Potassium (mg/kg)</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            {...register(`${prefix}.potassium`)}
            className="w-full"
          />
          <span className="text-primary-500">{watch(`${prefix}.potassium`)} mg/kg</span>
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
                  {...register('soil_type')}
                  className="w-full bg-dark-600 border border-dark-500 rounded-lg p-2"
                >
                  <option value="0">Clayey</option>
                  <option value="1">Alluvial</option>
                  <option value="2">Clay Loam</option>
                  <option value="3">Coastal</option>
                  <option value="4">Laterite</option>
                  <option value="5">Sandy</option>
                  <option value="6">Silty Clay</option>
                </select>
              </div>
              <div>
                <label className="block mb-2">Crop Type</label>
                <select
                  {...register('crop_type')}
                  className="w-full bg-dark-600 border border-dark-500 rounded-lg p-2"
                >
                  <option value="0">Coconut</option>
                  <option value="1">Rice</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Get Prediction & Report'}
          </button>
        </form>

        {error && (
          <div className="mt-8 bg-red-900/50 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4 text-red-400">Error</h2>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {prediction && (
          <div className="mt-8 bg-dark-700 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4">Prediction Result</h2>
            <p className="text-primary-500 text-xl">{prediction}</p>
          </div>
        )}

        {report && (
          <div className="mt-8 bg-dark-700 p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-6">
              <FaFileAlt className="text-primary-500 text-2xl" />
              <h2 className="text-2xl font-semibold">Comprehensive Report</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              {report.split('\n').map((paragraph, index) => {
                // Skip empty lines
                if (!paragraph.trim()) return null

                // Handle main title
                if (paragraph.startsWith('## ')) {
                  return (
                    <h1 key={index} className="text-3xl font-bold text-primary-400 mb-6">
                      {paragraph.replace('## ', '')}
                    </h1>
                  )
                }

                // Handle section titles (1., 2., etc.)
                if (paragraph.match(/^\d+\./)) {
                  const title = paragraph.replace(/\*\*/g, '').replace(':', '')
                  return (
                    <div key={index} className="mt-8 mb-4">
                      <h2 className="text-2xl font-semibold text-primary-400">{title}</h2>
                      <div className="h-1 w-20 bg-primary-500 mt-2 mb-4"></div>
                    </div>
                  )
                }

                // Handle subheadings in Specific Actions and Timeline
                if (paragraph.includes(':')) {
                  const [title, content] = paragraph.split(':')
                  if (content) {
                    return (
                      <div key={index} className="mb-4">
                        <h3 className="text-xl font-semibold text-primary-400 mb-2">{title}:</h3>
                        <p className="text-gray-300 ml-4">{content.trim()}</p>
                      </div>
                    )
                  }
                }

                // Handle bullet points in Expected Outcomes
                if (paragraph.startsWith('* ')) {
                  const content = paragraph.replace('* ', '')
                  return (
                    <li key={index} className="ml-6 text-gray-300 mb-2 list-disc">
                      {content}
                    </li>
                  )
                }

                // Handle important note
                if (paragraph.startsWith('Important Note:')) {
                  return (
                    <div key={index} className="mt-8 pt-4 border-t border-dark-500">
                      <h3 className="text-lg font-semibold text-primary-400 mb-2">Important Note</h3>
                      <p className="text-gray-300">
                        {paragraph.replace('Important Note:', '')}
                      </p>
                    </div>
                  )
                }

                // Regular paragraphs
                return (
                  <p key={index} className="text-gray-300 mb-4">
                    {paragraph}
                  </p>
                )
              })}
            </div>
            <div className="mt-6 pt-6 border-t border-dark-500">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Generated by SoilSync AI</span>
                <span className="text-sm text-gray-400">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
} 