// types/react-native-maps.d.ts
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
    provider?: 'google' | null;
    showsUserLocation?: boolean;
    googleMapsApiKey?: string;
  }

  export interface MarkerProps {
    coordinate: {
      latitude: number;
      longitude: number;
    };
    title?: string;
    description?: string;
    onPress?: () => void;
  }

  export const MapView: ComponentType<MapViewProps>;
  export const Marker: ComponentType<MarkerProps>;
  export const Polyline: ComponentType<any>;
  export const Polygon: ComponentType<any>;
  export const Circle: ComponentType<any>;
  export const PROVIDER_DEFAULT: string;
  export const PROVIDER_GOOGLE: string;
  export function enableLatestRenderer(): void;

  export default MapView;
}