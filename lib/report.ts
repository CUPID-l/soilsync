interface SensorData {
  temperature: number
  humidity: number
  moisture: number
  ph: number
  nitrogen: number
  phosphorus: number
  potassium: number
}

export async function generateReport(soilData: SensorData, fertilizer: string): Promise<string> {
  const prompt = `Based on the following soil sensor readings and recommended fertilizer, generate a detailed report:
  
  Soil Data:
  - Temperature: ${soilData.temperature}°C
  - Humidity: ${soilData.humidity}%
  - Moisture: ${soilData.moisture}%
  - pH: ${soilData.ph}
  - Nitrogen: ${soilData.nitrogen} ppm
  - Phosphorus: ${soilData.phosphorus} ppm
  - Potassium: ${soilData.potassium} ppm
  
  Recommended Fertilizer: ${fertilizer}
  
  Please provide a comprehensive report including:
  1. Current Soil Conditions Analysis
  2. Fertilizer Explanation
  3. Specific Actions to Take
  4. Implementation Timeline
  5. Expected Outcomes`

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Report generation failed')
  }

  const result = await response.json()
  return result.candidates[0].content.parts[0].text
} 