interface SoilData {
  temperature: number
  humidity: number
  moisture: number
  ph: number
  nitrogen: number
  phosphorus: number
  potassium: number
}

export async function getPrediction(soilData: SoilData): Promise<string> {
  // Format the data according to the API requirements
  const formattedData = {
    topsoil: [
      soilData.temperature,
      soilData.moisture,
      soilData.ph,
      soilData.nitrogen,
      soilData.phosphorus,
      soilData.potassium
    ],
    subsoil: [
      soilData.temperature,
      soilData.moisture,
      soilData.ph,
      soilData.nitrogen,
      soilData.phosphorus,
      soilData.potassium
    ],
    deepsoil: [
      soilData.temperature,
      soilData.moisture,
      soilData.ph,
      soilData.nitrogen,
      soilData.phosphorus,
      soilData.potassium
    ],
    soil_type: 0, // Default to Clayey soil
    crop_type: 0  // Default to Coconut
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
  return result.fertilizer
} 