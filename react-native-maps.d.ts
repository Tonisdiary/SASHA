declare module 'react-native-maps' {
  import { ComponentType } from 'react';
  import { ViewProps } from 'react-native';

  export interface MapViewProps extends ViewProps {
    initialRegion?: {
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    };
    showsUserLocation?: boolean;
  }

  export interface MarkerProps {
    coordinate: {
      latitude: number;
      longitude: number;
    };
    title?: string;
    description?: string;
  }

  export const MapView: ComponentType<MapViewProps>;
  export const Marker: ComponentType<MarkerProps>;
  export const PROVIDER_GOOGLE: string;
}