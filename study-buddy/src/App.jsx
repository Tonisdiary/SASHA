import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import TaskList from './components/TaskList';
import SerpApiSearch from './components/SerpApiSearch'; // Import SerpAPI component
import MapComponent from './components/GoogleMap'; // Import Google Maps component
// import Navbar from './components/Navbar'; // Assuming Navbar component exists - uncomment if needed

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    setLoading(true); // Start loading
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false); // Finish loading after getting session
    }).catch(error => {
        console.error("Error getting session:", error);
        setLoading(false); // Finish loading even on error
    });


    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // No need to setLoading here, initial load is handled above
    });

    // Cleanup subscription on unmount
    return () => subscription?.unsubscribe();
  }, []);

  // Display loading indicator
  if (loading) {
      return <div className="text-center p-10">Loading application...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Optional Navbar */}
      {/* <Navbar session={session} /> */}

      {!session ? (
        // Show Auth component if user is not logged in
        <Auth />
      ) : (
        // Show main content if user is logged in
        <div>
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome back!</h1>
          {/* Pass the user ID to TaskList */}
          <TaskList key={session.user.id} userId={session.user.id} />

          {/* Add the demonstration components */}
          <SerpApiSearch />
          <MapComponent />

           {/* Simple Sign Out Button - Consider moving to Navbar */}
           <div className="text-center mt-8">
             <button
               onClick={() => supabase.auth.signOut()}
               className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
             >
               Sign Out
             </button>
           </div>
        </div>
      )}
    </div>
  );
}

export default App;
