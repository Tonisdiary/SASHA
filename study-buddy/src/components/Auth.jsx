import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Adjust path if needed

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Added password state

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password }); // Use signInWithPassword

    if (error) {
      alert(error.error_description || error.message);
    } else {
      // Login successful, App component will detect session change
      // No explicit navigation needed here if App handles session state
      console.log('Login successful!');
    }
    setLoading(false);
  };

   const handleSignUp = async (event) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.error_description || error.message);
    } else {
      alert('Check your email for the login link!'); // Or handle signup confirmation
    }
    setLoading(false);
  };


  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-xs p-6 bg-white rounded shadow-md">
        <h1 className="text-xl font-semibold text-center mb-4 text-gray-700">Study Buddy Login</h1>
        <p className="text-sm text-center text-gray-500 mb-6">Sign in or sign up below</p>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              id="email"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
              type="email"
              placeholder="Your email"
              value={email}
              required={true}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
           <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <input
              id="password"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
              type="password"
              placeholder="Your password"
              value={password}
              required={true}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              disabled={loading}
            >
              {loading ? <span>Loading...</span> : <span>Login</span>}
            </button>
             <button
              type="button" // Important: type="button" to prevent form submission
              onClick={handleSignUp}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              disabled={loading}
            >
              {loading ? <span>Loading...</span> : <span>Sign Up</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
