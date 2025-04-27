import React from 'react'
import { useAuth } from '../context/AuthContext'

const Home: React.FC = () => {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Welcome, {user?.email}</h1>
          <button
            onClick={signOut}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
