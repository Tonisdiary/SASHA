import React from 'react';
import { View } from 'react-native';

// Mock navigation components for web
export const NavigationContainer = ({ children }: { children: React.ReactNode }) => (
  <View style={{ flex: 1 }}>{children}</View>
);

export const createNavigationContainerRef = () => ({
  current: null,
  isReady: () => false,
});

export const useNavigationContainerRef = () => ({
  current: null,
  isReady: () => false,
});

export const useNavigation = () => ({
  navigate: () => {},
  goBack: () => {},
});

export const useRoute = () => ({
  params: {},
});