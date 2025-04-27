import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Platform, View, Text, StyleSheet, Button } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { 
  Inter_400Regular, 
  Inter_600SemiBold, 
  Inter_700Bold 
} from '@expo-google-fonts/inter';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { SplashScreen } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LoadingScreen } from '@/components/LoadingScreen';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const [layoutError, setLayoutError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('RootLayout initializing...');
  const [forceShowDebug, setForceShowDebug] = useState(false);
  
  // Set a timeout to force showing debug info if loading takes too long
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('Layout timeout reached, forcing debug view');
      setForceShowDebug(true);
      setDebugInfo(prev => prev + '\nLayout timeout reached - forcing debug view');
    }, 5000); // 5 seconds timeout
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Try-catch the font loading to prevent crashes
  let fontsLoaded = false;
  let fontError: Error | null = null;
  try {
    useFrameworkReady();
    [fontsLoaded, fontError] = useFonts({
      Inter_400Regular,
      Inter_600SemiBold,
      Inter_700Bold,
      Poppins_600SemiBold,
    });
    
    setDebugInfo(prev => prev + `\nFonts loaded: ${fontsLoaded}`);
    if (fontError) {
      setDebugInfo(prev => prev + `\nFont error: ${fontError?.message || 'Unknown font error'}`);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error loading fonts';
    console.error('Error in RootLayout:', errorMessage);
    setLayoutError(errorMessage);
    setDebugInfo(prev => prev + `\nCaught error: ${errorMessage}`);
  }

  useEffect(() => {
    console.log('RootLayout mounted');
    setDebugInfo(prev => prev + '\nRootLayout useEffect running');
    
    try {
      if (fontsLoaded || fontError) {
        setDebugInfo(prev => prev + '\nFonts loaded or error occurred, hiding splash screen');
        // Only hide splash screen if not on web or if web is ready
        if (Platform.OS !== 'web' || document.readyState === 'complete') {
          SplashScreen.hideAsync().catch(err => {
            console.warn('Error hiding splash screen:', err);
            setDebugInfo(prev => prev + `\nError hiding splash: ${err.message}`);
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error in useEffect';
      console.error('Error in RootLayout useEffect:', errorMessage);
      setLayoutError(errorMessage);
      setDebugInfo(prev => prev + `\nCaught error in useEffect: ${errorMessage}`);
    }
  }, [fontsLoaded, fontError]);

  // Add special handling for web
  useEffect(() => {
    if (Platform.OS === 'web') {
      setDebugInfo(prev => prev + '\nWeb platform detected');
      // Force navigation to debug page if there are issues
      const forceDebug = new URLSearchParams(window.location.search).get('debug') === 'true';
      if (forceDebug) {
        setDebugInfo(prev => prev + '\nForce debug mode enabled, redirecting');
        window.location.href = '/debug';
      }
    }
  }, []);

  // Show debug screen if there's an error in the layout or if forced
  if ((layoutError || forceShowDebug) && Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Layout {layoutError ? 'Error' : 'Debug'}</Text>
        {layoutError && <Text style={styles.error}>{layoutError}</Text>}
        <Text style={getDebugInfoStyle()}>{debugInfo}</Text>
        <View style={styles.buttonContainer}>
          <Button 
            title="Go to Debug Screen" 
            onPress={() => window.location.href = '/debug'}
          />
          <Button 
            title="Go to Debug HTML" 
            onPress={() => window.location.href = '/debug.html'}
          />
          <Button 
            title="Reload App" 
            onPress={() => window.location.reload()}
          />
        </View>
      </View>
    );
  }

  if (!fontsLoaded && !fontError) {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Loading Fonts...</Text>
          <Text style={getDebugInfoStyle()}>{debugInfo}</Text>
        </View>
      );
    }
    return <LoadingScreen message="Loading fonts..." />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="splash" options={{ headerShown: false }} />
          <Stack.Screen name="debug" options={{ headerShown: false }} />
          <Stack.Screen name="emergency-debug" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Define base styles
const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1e293b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  error: {
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
  debugInfo: {
    fontSize: 14,
    color: '#e2e8f0',
    marginBottom: 24,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    width: '100%',
    maxWidth: 500,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    maxWidth: 300,
    marginTop: 20,
  },
});

// Merge styles
const styles = baseStyles;

// Apply web-specific styles for the debugInfo text component
const getDebugInfoStyle = () => {
  if (Platform.OS === 'web') {
    return [
      styles.debugInfo, 
      { whiteSpace: 'pre-wrap' as 'pre-wrap' }
    ];
  }
  return styles.debugInfo;
};