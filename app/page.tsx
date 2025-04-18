import Link from 'next/link'
import { FaLeaf, FaChartLine, FaDatabase } from 'react-icons/fa'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/20 to-dark-900 z-0" />
        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600">
            SoilSync
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Smart fertilizer prediction system powered by AI. Get optimal fertilizer recommendations based on real-time soil sensor data.
          </p>
          <div className="flex gap-6 justify-center">
            <Link 
              href="/manual" 
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Manual Entry
            </Link>
            <Link 
              href="/automatic" 
              className="bg-dark-700 hover:bg-dark-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Automatic Report
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-dark-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-dark-700 p-8 rounded-xl">
              <div className="text-primary-500 text-4xl mb-4">
                <FaLeaf />
              </div>
              <h3 className="text-xl font-semibold mb-4">Smart Prediction</h3>
              <p className="text-gray-400">
                Get accurate fertilizer recommendations using advanced AI models.
              </p>
            </div>
            <div className="bg-dark-700 p-8 rounded-xl">
              <div className="text-primary-500 text-4xl mb-4">
                <FaChartLine />
              </div>
              <h3 className="text-xl font-semibold mb-4">Real-time Analysis</h3>
              <p className="text-gray-400">
                Monitor soil conditions and get instant insights for better crop management.
              </p>
            </div>
            <div className="bg-dark-700 p-8 rounded-xl">
              <div className="text-primary-500 text-4xl mb-4">
                <FaDatabase />
              </div>
              <h3 className="text-xl font-semibold mb-4">Data Integration</h3>
              <p className="text-gray-400">
                Seamlessly connect with your existing sensor network and databases.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 