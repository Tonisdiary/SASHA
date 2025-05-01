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
          console.log('LoadingScreen: Attempting to hide native splash screen');
          await ExpoSplashScreen.hideAsync();
          console.log('LoadingScreen: Native splash screen hidden successfully');
        } catch (e) {
          console.warn('LoadingScreen: Error hiding splash screen:', e);
          // Continue even if there's an error hiding the splash screen
        }
      };
      
      hideSplash();
    } else {
      console.log('LoadingScreen: Not hiding native splash screen (not requested)');
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
