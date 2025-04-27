import React from 'react';
import { Platform, ViewStyle } from 'react-native';

let MapView: any;
let Marker: any;

if (Platform.OS === 'web') {
  const WebComponents = require('./Map.web');
  MapView = WebComponents.Map;
  Marker = WebComponents.Marker;
} else {
  // Use createElement instead of JSX
  const Maps = require('react-native-maps');
  MapView = (props: any) => {
    return React.createElement(Maps.default, {
      ...props,
      provider: Maps.PROVIDER_GOOGLE,
      style: [{ flex: 1 }, props.style]
    }, props.children);
  };
  
  Marker = (props: any) => {
    return React.createElement(Maps.Marker, props);
  };
}

export interface MapProps {
  style?: ViewStyle;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  googleMapsApiKey?: string;
  children?: React.ReactNode;
}

export interface MarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
}

export { MapView, Marker };