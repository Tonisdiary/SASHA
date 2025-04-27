import { ExpoRouter } from 'expo-router';

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      '/(tabs)': undefined;
      '/splash': undefined;
      '/auth/sign-in': undefined;
      '/auth/sign-up': undefined;
      '/messages': { roomId?: string };
    }
  }
}

export type RootStackParamList = {
  '/(tabs)': undefined;
  '/splash': undefined;
  '/auth/sign-in': undefined;
  '/auth-sign-up': undefined;
  '/messages': { roomId?: string };
};

export type TabParamList = {
  '/index': undefined;
  '/study': undefined;
  '/subjects': undefined;
  '/study-buddies': undefined;
  '/materials': undefined;
  '/calendar': undefined;
  '/settings': undefined;
};

// This type allows us to use route names as literal types
export type RouteNames = keyof RootStackParamList;