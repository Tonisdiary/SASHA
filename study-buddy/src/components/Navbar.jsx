import React from 'react';

// Accept session and handleSignOut as props
function Navbar({ session, handleSignOut }) {
  return (
    <nav className="bg-indigo-600 shadow-md"> {/* Primary color */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-white text-2xl font-bold">StudyBuddy</span>
            {/* Display user email if available */}
            {session?.user?.email && (
              <span className="ml-4 text-indigo-200 text-sm hidden sm:block">
                {session.user.email}
              </span>
            )}
          </div>
          {/* Sign Out Button */}
          {session && (
             <button
               onClick={handleSignOut}
               className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
             >
               Sign Out
             </button>
          )}
          {/* Add navigation links here if needed in the future */}
          {/* <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#" className="text-gray-300 hover:bg-indigo-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
              <a href="#" className="text-gray-300 hover:bg-indigo-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Settings</a>
            </div>
          </div> */}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
