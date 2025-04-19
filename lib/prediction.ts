interface SensorData {
  temperature: number
  humidity: number
  moisture: number
  ph: number
  nitrogen: number
  phosphorus: number
  potassium: number
}

interface SoilLayers {
  top_layer: SensorData
  mid_layer: SensorData
  bottom_layer: SensorData
}

export async function getPrediction(soilLayers: SoilLayers): Promise<string> {
  // Format the data according to the API requirements
  const formattedData = {
    topsoil: [
      soilLayers.top_layer.temperature,
      soilLayers.top_layer.moisture,
      soilLayers.top_layer.ph,
      soilLayers.top_layer.nitrogen,
      soilLayers.top_layer.phosphorus,
      soilLayers.top_layer.potassium
    ],
    subsoil: [
      soilLayers.mid_layer.temperature,
      soilLayers.mid_layer.moisture,
      soilLayers.mid_layer.ph,
      soilLayers.mid_layer.nitrogen,
      soilLayers.mid_layer.phosphorus,
      soilLayers.mid_layer.potassium
    ],
    deepsoil: [
      soilLayers.bottom_layer.temperature,
      soilLayers.bottom_layer.moisture,
      soilLayers.bottom_layer.ph,
      soilLayers.bottom_layer.nitrogen,
      soilLayers.bottom_layer.phosphorus,
      soilLayers.bottom_layer.potassium
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