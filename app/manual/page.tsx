'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaArrowLeft } from 'react-icons/fa'
import Link from 'next/link'

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
  const { register, handleSubmit, watch } = useForm<FormData>()
  const [prediction, setPrediction] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_HF_API_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HF_API_TOKEN}`
        },
        body: JSON.stringify(data)
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

        <h1 className="text-4xl font-bold mb-8">Manual Data Entry</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Topsoil Section */}
          <div className="bg-dark-700 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-6">Topsoil Data</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2">Temperature (°C)</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.1"
                  {...register('topsoil.temperature')}
                  className="w-full"
                />
                <span className="text-primary-500">{watch('topsoil.temperature') || 25}°C</span>
              </div>
              <div>
                <label className="block mb-2">Moisture (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  {...register('topsoil.moisture')}
                  className="w-full"
                />
                <span className="text-primary-500">{watch('topsoil.moisture') || 50}%</span>
              </div>
              <div>
                <label className="block mb-2">pH</label>
                <input
                  type="range"
                  min="0"
                  max="14"
                  step="0.1"
                  {...register('topsoil.ph')}
                  className="w-full"
                />
                <span className="text-primary-500">{watch('topsoil.ph') || 7}</span>
              </div>
              <div>
                <label className="block mb-2">Nitrogen (mg/kg)</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  {...register('topsoil.nitrogen')}
                  className="w-full"
                />
                <span className="text-primary-500">{watch('topsoil.nitrogen') || 5} mg/kg</span>
              </div>
              <div>
                <label className="block mb-2">Phosphorus (mg/kg)</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  {...register('topsoil.phosphorus')}
                  className="w-full"
                />
                <span className="text-primary-500">{watch('topsoil.phosphorus') || 5} mg/kg</span>
              </div>
              <div>
                <label className="block mb-2">Potassium (mg/kg)</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  {...register('topsoil.potassium')}
                  className="w-full"
                />
                <span className="text-primary-500">{watch('topsoil.potassium') || 5} mg/kg</span>
              </div>
            </div>
          </div>

          {/* Subsoil Section */}
          <div className="bg-dark-700 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-6">Subsoil Data</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Similar inputs as topsoil */}
            </div>
          </div>

          {/* Deepsoil Section */}
          <div className="bg-dark-700 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-6">Deepsoil Data</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Similar inputs as topsoil */}
            </div>
          </div>

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
            {loading ? 'Predicting...' : 'Get Prediction'}
          </button>
        </form>

        {prediction && (
          <div className="mt-8 bg-dark-700 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4">Prediction Result</h2>
            <p className="text-primary-500 text-xl">{prediction}</p>
          </div>
        )}
      </div>
    </main>
  )
} 