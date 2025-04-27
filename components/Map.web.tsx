import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MapProps {
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  style?: any;
  children?: React.ReactNode;
  googleMapsApiKey?: string;
}

export const Map: React.FC<MapProps> = ({ style, initialRegion, googleMapsApiKey }) => {
  if (!googleMapsApiKey) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.text}>Map view requires Google Maps API key</Text>
        <Text style={styles.subText}>Please configure your API key for web platform</Text>
      </View>
    );
  }

  const q = initialRegion 
    ? `${initialRegion.latitude},${initialRegion.longitude}` 
    : '';
    
  return (
    <View style={[{ flex: 1 }, style]}>
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${q}`}
      />
    </View>
  );
};

export const Marker = () => null; // Markers not supported in web embed

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  text: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#888',
  },
});