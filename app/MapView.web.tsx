// app/MapView.web.tsx
import React from 'react';
import { Map } from '@/components/Map';
import Constants from 'expo-constants';

export default function MapViewWeb() {
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  return (
    <Map 
      googleMapsApiKey={googleMapsApiKey}
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    />
  );
}
