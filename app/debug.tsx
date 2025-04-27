import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabaseClient } from 'lib/supabaseClient';
import { useAuth } from '@/store/useAuth';

export default function DebugScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [sessionInfo, setSessionInfo] = useState<string>('Checking...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Collect environment variables
    const env: Record<string, string> = {};
    if (process.env.EXPO_PUBLIC_SUPABASE_URL) env['SUPABASE_URL'] = process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) env['SUPABASE_ANON_KEY'] = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10) + '...';
    setEnvVars(env);

    // Check session
    async function checkSession() {
      try {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) {
          setSessionInfo(`Error: ${error.message}`);
        } else {
          setSessionInfo(`Session exists: ${!!data.session}\n${data.session ? `User ID: ${data.session.user.id}` : 'No user'}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error checking session');
      }
    }

    checkSession();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        setError(error.message);
      } else {
        setSessionInfo('Signed out successfully');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error signing out');
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Study Buddy Debug</Text>
        <Text style={styles.subtitle}>If you can see this, the app is working!</Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoHeading}>Environment Variables:</Text>
          {Object.entries(envVars).map(([key, value]) => (
            <Text key={key} style={styles.infoText}>
              {key}: {value}
            </Text>
          ))}
          
          <Text style={styles.infoHeading}>Auth State:</Text>
          <Text style={styles.infoText}>
            Loading: {loading ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.infoText}>
            User: {user ? `Logged in (${user.id})` : 'Not logged in'}
          </Text>
          
          <Text style={styles.infoHeading}>Session Info:</Text>
          <Text style={styles.infoText}>{sessionInfo}</Text>
          
          {error && (
            <>
              <Text style={styles.infoHeading}>Error:</Text>
              <Text style={[styles.infoText, styles.errorText]}>{error}</Text>
            </>
          )}
        </View>
        
        <View style={styles.buttonContainer}>
          <Pressable 
            style={styles.button}
            onPress={() => router.push('/splash' as any)}
          >
            <Text style={styles.buttonText}>Go to Splash Screen</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => router.push('/auth/sign-in' as any)}
          >
            <Text style={styles.buttonText}>Go to Sign In</Text>
          </Pressable>
          
          {user && (
            <Pressable 
              style={[styles.button, styles.buttonDanger]}
              onPress={handleSignOut}
            >
              <Text style={styles.buttonText}>Sign Out</Text>
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#1e293b',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 60,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
    marginBottom: 32,
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
    width: '100%',
    maxWidth: 500,
  },
  infoHeading: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  infoText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginBottom: 12,
  },
  errorText: {
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonSecondary: {
    backgroundColor: '#475569',
  },
  buttonDanger: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  }
});
