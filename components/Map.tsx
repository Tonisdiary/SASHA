import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MapProps {
  style?: any;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  googleMapsApiKey?: string;
  children?: React.ReactNode;
}

interface MarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
}

const MapComponent: React.FC<MapProps> = ({ style, initialRegion, googleMapsApiKey, children }) => {
  const mapStyles = [styles.container, style];
  
  if (!googleMapsApiKey) {
    return (
      <View style={mapStyles}>
        <Text style={styles.text}>Loading map...</Text>
      </View>
    );
  }

  const location = initialRegion 
    ? `${initialRegion.latitude},${initialRegion.longitude}` 
    : '0,0';
  const zoom = initialRegion
    ? Math.round(Math.log2(360 / initialRegion.longitudeDelta) - 1)
    : 13;

  return (
    <View style={mapStyles}>
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/view?key=${googleMapsApiKey}&center=${location}&zoom=${zoom}`}
      />
      {children}
    </View>
  );
};

const MarkerComponent: React.FC<MarkerProps> = () => null;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

MapComponent.displayName = 'MapComponent';
MarkerComponent.displayName = 'MarkerComponent';

export const Map = MapComponent;
export const Marker = MarkerComponent;