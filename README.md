# SoilSync - Smart Fertilizer Prediction System

SoilSync is a web application that predicts optimal fertilizer recommendations based on soil sensor data. It features both manual data entry and automatic reporting capabilities, powered by AI models from Hugging Face and Google's Gemini.

## Features

- **Manual Entry Mode**: Enter soil sensor values manually and get instant fertilizer recommendations
- **Automatic Report Mode**: Connect to Firebase database for real-time sensor data and generate comprehensive reports
- **AI-Powered Analysis**: Uses Hugging Face transformer model for fertilizer prediction and Gemini for detailed analysis
- **Modern UI**: Clean, responsive interface with a professional color scheme

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Firebase Realtime Database
- **AI Models**: 
  - Hugging Face Transformer Model
  - Google Gemini API
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_HF_API_URL=https://cupid-i-fertilizer-pred.hf.space/predict
   NEXT_PUBLIC_HF_API_TOKEN=your_huggingface_token
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
soilsync/
├── app/
│   ├── page.tsx           # Landing page
│   ├── manual/
│   │   └── page.tsx       # Manual entry page
│   └── automatic/
│       └── page.tsx       # Automatic report page
├── components/            # Reusable components
├── public/               # Static assets
└── styles/              # Global styles
```

## API Integration

### Hugging Face Model
The application uses a transformer model hosted on Hugging Face Spaces for fertilizer prediction. The model expects the following input format:

```json
{
  "topsoil": {
    "temperature": number,
    "moisture": number,
    "ph": number,
    "nitrogen": number,
    "phosphorus": number,
    "potassium": number
  },
  "subsoil": {
    // same structure as topsoil
  },
  "deepsoil": {
    // same structure as topsoil
  },
  "soil_type": number,
  "crop_type": number
}
```

### Firebase Integration
The automatic report mode connects to a Firebase Realtime Database to fetch the latest sensor readings. The database structure should match the input format expected by the Hugging Face model.

### Gemini API
The application uses Google's Gemini API to generate comprehensive reports based on the sensor data and fertilizer predictions.

## Deployment

The application is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel and deploy. Make sure to add all environment variables in the Vercel project settings.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 