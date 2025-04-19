/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        'firebase-admin': false,
      }
    }
    return config
  },
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  env: {
    HF_API_URL: 'https://cupid-i-fertilizer-pred.hf.space/predict',
    HF_API_TOKEN: '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',
    GEMINI_API_KEY: 'AIzaSyDLdUqGZqoLuWAIpxktvxmj3_Id1Syx67c',
    FIREBASE_API_KEY: 'AIzaSyCRv8OHtSnlTIlmwnOZ0T4fQGw44_p-ce0',
    FIREBASE_AUTH_DOMAIN: 'iotml-b12.firebaseapp.com',
    FIREBASE_PROJECT_ID: 'iotml-b12',
    FIREBASE_STORAGE_BUCKET: 'iotml-b12.firebasestorage.app',
    FIREBASE_MESSAGING_SENDER_ID: '354739607047',
    FIREBASE_APP_ID: '1:354739607047:android:78c921355dc7bb1e3c7ca2'
  }
}

module.exports = nextConfig 