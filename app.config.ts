import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Study Buddy',
  slug: 'study-buddy',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'studybuddy',
  userInterfaceStyle: 'automatic',
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.yourcompany.studyapp',
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
    }
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#FFFFFF'
    },
    package: 'com.yourcompany.studyapp',
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION'
    ],
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
      }
    }
  },
  web: {
    bundler: 'metro'
  },
  plugins: [
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: "Allow Study Buddy to use your location."
      }
    ],
    'expo-router',
    'expo-document-picker'
  ],
  extra: {
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
  },
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true
  }
});