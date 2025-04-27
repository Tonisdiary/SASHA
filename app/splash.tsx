import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { supabaseClient } from 'lib/supabaseClient';
import { LoadingScreen } from 'components/LoadingScreen';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Check URL for demo mode parameter
      if (typeof window !== 'undefined' && window.location.search.includes('demo=true')) {
        console.log('Demo mode detected in URL, skipping authentication');
        router.push('tabs' as any);
        return;
      }
      
      console.log('Checking session in splash screen...');
      // For demo purposes, we'll just show the splash screen without checking auth
      setIsLoading(false);
      
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
    router.push('auth/sign-in' as any);
  };
  
  const enterDemoMode = () => {
    console.log('Demo mode activated, bypassing authentication');
    router.push('tabs' as any);
  };

  if (isLoading) {
    return <LoadingScreen message="Checking session..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('assets/images/icon.png')}
          style={styles.iconImage}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Study Buddy</Text>
          <Text style={styles.subtitle}>Your Smart Study Assistant</Text>
        </View>
        <Pressable 
          style={styles.button}
          onPress={handleGetStarted}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
        
        <Pressable 
          style={[styles.button, styles.demoButton]}
          onPress={enterDemoMode}
        >
          <Text style={styles.buttonText}>Enter Demo Mode</Text>
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
