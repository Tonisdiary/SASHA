import { View, Text, StyleSheet, Image, Pressable, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { supabaseClient } from 'lib/supabaseClient';
import { LoadingScreen } from 'components/LoadingScreen';
import { useRouter } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins';

export default function SplashScreenPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [fontsReady, setFontsReady] = useState(false);
  
  // Load fonts directly in the splash screen for better control
  let [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Poppins_600SemiBold,
  });
  
  // Handle font loading
  useEffect(() => {
    if (fontsLoaded || fontError) {
      console.log('Fonts loaded or error occurred:', fontsLoaded, fontError);
      setFontsReady(true);
      
      // If there was an error loading fonts, we'll still proceed
      if (fontError) {
        console.warn('Font loading error in splash screen:', fontError);
        // Even with font errors, we should continue with system fonts
        console.log('Continuing with system fonts');
      } else {
        console.log('Custom fonts loaded successfully');
      }
    } else {
      console.log('Waiting for fonts to load...');
    }
  }, [fontsLoaded, fontError]);

  // Check session once fonts are ready
  useEffect(() => {
    if (fontsReady) {
      checkSession();
    }
  }, [fontsReady]);

  const checkSession = async () => {
    try {
      // Ensure the native splash screen is hidden
      try {
        console.log('Attempting to hide native splash screen from splash.tsx');
        await ExpoSplashScreen.hideAsync();
        console.log('Native splash screen hidden successfully');
      } catch (e) {
        console.warn('Error hiding native splash screen:', e);
        // Continue even if there's an error hiding the splash screen
      }
      
      // Check URL for demo mode parameter
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.search.includes('demo=true')) {
        console.log('Demo mode detected in URL, skipping authentication');
        router.push('/(tabs)' as any);
        return;
      }
      
      console.log('Checking session in splash screen...');
      // For demo purposes, we'll just show the splash screen without checking auth
      setIsLoading(false);
      console.log('Splash screen ready to display');
      
      /* Commented out for demo purposes
      const { data, error } = await supabaseClient.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        throw error;
      }

      console.log('Session check result:', !!data.session);
      if (data.session?.user) {
        console.log('User is authenticated, redirecting to tabs');
        router.replace('/(tabs)');
      } else {
        console.log('No session found, showing splash screen');
        setIsLoading(false);
      }
      */
    } catch (error) {
      console.error('Error in session check:', error);
      setIsLoading(false);
    }
  };

  const handleGetStarted = () => {
    console.log('Get Started pressed, navigating to sign-in');
    router.push('/(auth)/sign-in' as any);
  };
  
  const enterDemoMode = () => {
    console.log('Demo mode activated, bypassing authentication');
    router.push('/(tabs)' as any);
  };

  if (isLoading || !fontsReady) {
    return <LoadingScreen message={!fontsReady ? "Loading fonts..." : "Checking session..."} hideNativeSplash={true} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../assets/images/icon.png')}
          style={styles.iconImage}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <Text style={[styles.title, fontError ? {fontFamily: 'System'} : null]}>Study Buddy</Text>
          <Text style={[styles.subtitle, fontError ? {fontFamily: 'System'} : null]}>Your Smart Study Assistant</Text>
        </View>
        <Pressable 
          style={styles.button}
          onPress={handleGetStarted}
        >
          <Text style={[styles.buttonText, fontError ? {fontFamily: 'System'} : null]}>Get Started</Text>
        </Pressable>
        
        <Pressable 
          style={[styles.button, styles.demoButton]}
          onPress={enterDemoMode}
        >
          <Text style={[styles.buttonText, fontError ? {fontFamily: 'System'} : null]}>Enter Demo Mode</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconImage: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 48,
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: 250,
    alignItems: 'center',
  },
  demoButton: {
    backgroundColor: '#059669', // Green color for demo button
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
});
