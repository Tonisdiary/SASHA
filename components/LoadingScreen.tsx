import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';

interface LoadingScreenProps {
  message?: string;
  hideNativeSplash?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  hideNativeSplash = false 
}) => {
  useEffect(() => {
    if (hideNativeSplash) {
      // Hide the native splash screen if requested
      const hideSplash = async () => {
        try {
          await ExpoSplashScreen.hideAsync();
        } catch (e) {
          console.warn('Error hiding splash screen:', e);
        }
      };
      
      hideSplash();
    }
  }, [hideNativeSplash]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6366f1" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'System',
  },
});
