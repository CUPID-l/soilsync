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
  const response = await fetch(process.env.NEXT_PUBLIC_HF_API_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HF_API_TOKEN}`
    },
    body: JSON.stringify(soilData)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Prediction failed')
  }

  const result = await response.json()
  return result.fertilizer
} 