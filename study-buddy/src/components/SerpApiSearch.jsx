import React, { useState } from 'react';

function SerpApiSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiKey = import.meta.env.VITE_SERPAPI_KEY;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!apiKey) {
      setError('Error: VITE_SERPAPI_KEY is not defined in your .env file.');
      return;
    }
    if (!query.trim()) {
      setError('Please enter a search query.');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    // !!! SECURITY WARNING !!!
    // Making API calls with sensitive keys directly from the client-side is insecure
    // and exposes your API key. This is for demonstration/verification ONLY.
    // In a real application, this call should be made from a backend server
    // or a secure serverless function (like Supabase Edge Functions)
    // where the API key is kept secret.

    // Example using Google Search endpoint (adjust as needed)
    const endpoint = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${apiKey}`;

    try {
      // NOTE: Direct browser requests to serpapi.com might be blocked by CORS.
      // This further emphasizes the need for a backend proxy/function.
      // We'll log the attempt and simulate a result for verification purposes.
      console.log(`Attempting to fetch (CORS might block): ${endpoint.replace(apiKey, 'YOUR_API_KEY')}`);
      // const response = await fetch(endpoint); // This line would likely fail due to CORS in browser
      // if (!response.ok) {
      //   throw new Error(`API request failed with status ${response.status}`);
      // }
      // const data = await response.json();
      // setResults(data);

      // Simulate successful setup for verification if key exists
      setResults({ message: "SerpAPI key is configured (actual fetch likely blocked by CORS in browser - use backend)." });
      console.warn("SerpAPI fetch simulated due to likely CORS issues in direct browser calls. Key presence verified.");

    } catch (err) {
      console.error('SerpAPI Error:', err);
      setError(`Failed to fetch results. Check console and CORS policy. Error: ${err.message}`);
      // Simulate error state for verification
      setResults({ error: `Failed to fetch results. Error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">SerpAPI Search (Demo)</h2>
      {!apiKey && <p className="text-red-500">VITE_SERPAPI_KEY is missing.</p>}
      <form onSubmit={handleSearch} className="flex mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter search query..."
          className="flex-grow px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring focus:ring-blue-200"
          disabled={!apiKey}
        />
        <button
          type="submit"
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline disabled:opacity-50"
          disabled={loading || !apiKey}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <p className="text-xs text-orange-600 mb-2">
        <strong>Warning:</strong> API calls here are insecure (expose key) and may be blocked by CORS. Use a backend function in production.
      </p>
      {results && (
        <div>
          <h3 className="font-semibold">Results:</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default SerpApiSearch;
