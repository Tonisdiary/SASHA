import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '300px'
};

// Example center (San Francisco)
const center = {
  lat: 37.7749,
  lng: -122.4194
};

function MapComponent() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || "" // Pass empty string if key is missing
  });

  const renderMap = () => (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
    >
      {/* Example Marker */}
      <Marker position={center} />
    </GoogleMap>
  );

  if (loadError) {
    console.error("Google Maps Load Error:", loadError);
    return <div className="text-red-500">Error loading Google Maps. Check API key and console.</div>;
  }

  return (
    <div className="mt-8 p-4 bg-white rounded shadow">
       <h2 className="text-lg font-semibold mb-4 text-gray-700">Google Map (Demo)</h2>
       {!apiKey && <p className="text-red-500 mb-2">VITE_GOOGLE_MAPS_KEY is missing. Map will not load correctly.</p>}
       {isLoaded ? renderMap() : <div>Loading Map...</div>}
    </div>
  );
}

export default MapComponent;
