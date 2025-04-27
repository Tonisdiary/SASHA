import { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, StyleSheet, Platform, Button } from 'react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(error => {
  console.warn('Error preventing splash screen auto hide:', error);
});

// Simple loading component
function AppLoading() {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading Study Buddy...</Text>
    </View>
  );
}

// Simple error component
function AppError({ error }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Error Loading App</Text>
      <Text style={styles.errorMessage}>{error?.message || 'Unknown error'}</Text>
      
      {Platform.OS === 'web' && (
        <View style={styles.buttonContainer}>
          <Button 
            title="Reload App" 
            onPress={() => window.location.reload()}
          />
        </View>
      )}
    </View>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('App.tsx mounted');
    
    async function prepare() {
      try {
        console.log('Preparing app...');
        
        // Check environment variables
        console.log('Environment variables in App.tsx:');
        console.log('EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
        console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
        
        // Pre-load fonts, make API calls, etc.
        // Artificially delay for a moment to ensure everything is loaded
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('App preparation complete');
      } catch (e) {
        console.warn('Error preparing app:', e);
        setError(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
    
    // Set a timeout to force the app to render after 5 seconds
    const timeoutId = setTimeout(() => {
      console.log('Timeout reached, forcing app to render');
      setAppIsReady(true);
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (appIsReady) {
      console.log('App is ready, hiding splash screen');
      // This tells the splash screen to hide immediately
      SplashScreen.hideAsync().catch(e => {
        console.warn('Error hiding splash screen:', e);
      });
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return <AppLoading />;
  }
  
  if (error) {
    return <AppError error={error} />;
  }

  return (
    <ErrorBoundary>
      <Slot />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1e293b',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 24,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    width: '100%',
    maxWidth: 500,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
  },
});