import React from 'react';

function StudyTimer() {
  // Basic timer display - functionality to be added later
  const time = "25:00"; // Mock time

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Study Timer</h2>
      <div className="text-6xl font-bold text-indigo-600 mb-6">{time}</div> {/* Primary color */}
      <div className="space-x-4">
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded transition duration-150 ease-in-out"> {/* Secondary color */}
          Start
        </button>
        <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded transition duration-150 ease-in-out"> {/* Accent color */}
          Reset
        </button>
      </div>
    </div>
  );
}

export default StudyTimer;
