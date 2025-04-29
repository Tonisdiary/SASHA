import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabaseClient as supabase } from '../lib/supabaseClient';
import { Platform, View, Text, StyleSheet, Button } from 'react-native';
import { LoadingScreen } from '../components/LoadingScreen';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('Initializing...');
  const [forceShowDebug, setForceShowDebug] = useState(true); // DEMO MODE: Always show debug

  useEffect(() => {
    console.log('Index component mounted');
    setDebugInfo(prev => prev + '\nComponent mounted');
    
    // Set a timeout to force showing debug info if loading takes too long
    const timeoutId = setTimeout(() => {
      console.log('Loading timeout reached, forcing debug view');
      setForceShowDebug(true);
      setIsLoading(false);
      setDebugInfo(prev => prev + '\nLoading timeout reached - forcing debug view');
    }, 5000); // 5 seconds timeout
    
    // Add a more aggressive timeout for extreme cases
    const emergencyTimeoutId = setTimeout(() => {
      console.log('EMERGENCY: App appears completely stuck, forcing navigation');
      setDebugInfo(prev => prev + '\nEMERGENCY: App appears completely stuck');
      
      // Force navigation to splash screen as a last resort
      if (Platform.OS === 'web') {
        window.location.href = '/splash';
      }
    }, 10000); // 10 seconds timeout
    
    // Check if we're on web and add a window error handler
    if (Platform.OS === 'web') {
      const originalOnError = window.onerror;
      window.onerror = function(message, source, lineno, colno, error) {
        console.error('Window error:', message, error);
        setError(`Window error: ${message}`);
        setForceShowDebug(true);
        setIsLoading(false);
        
        // Call original handler if it exists
        if (originalOnError) {
          return originalOnError(message, source, lineno, colno, error);
        }
        return false;
      };
    }
    
    // Start the auth check process
    checkInitialAuth();
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(emergencyTimeoutId);
      
      // Clean up error handler on web
      if (Platform.OS === 'web') {
        window.onerror = null;
      }
    };
  }, []);

  const checkInitialAuth = async () => {
    try {
      setDebugInfo(prev => prev + '\nStarting auth check');
      
      // Check for demo mode in URL
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const isDemoMode = window.location.search.includes('demo=true');
        if (isDemoMode) {
          console.log('Demo mode detected, bypassing authentication');
          setDebugInfo(prev => prev + '\nDemo mode detected, bypassing authentication');
          setHasSession(true); // Pretend we have a session
          setIsLoading(false);
          
          // Navigate directly to tabs
          setTimeout(() => {
            window.location.href = '/(tabs)';
          }, 500);
          return;
        }
      }
      
      // Log environment variables for debugging
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      setDebugInfo(prev => prev + `\nSupabase URL exists: ${!!supabaseUrl}`);
      setDebugInfo(prev => prev + `\nSupabase Key exists: ${!!supabaseKey}`);
      
      console.log('Supabase URL exists:', !!supabaseUrl);
      console.log('Supabase Key exists:', !!supabaseKey);
      
      // For demo purposes, skip authentication and go to splash screen
      setDebugInfo(prev => prev + '\nSkipping authentication for demo purposes');
      setHasSession(false);
      setIsLoading(false);
      
      // Force navigation to splash screen
      if (Platform.OS === 'web') {
        setTimeout(() => {
          window.location.href = '/splash';
        }, 500);
      }
      
      /* Commented out for demo purposes
      // Check if we're using fallback values from supabaseClient.ts
      const usingFallback = !process.env.EXPO_PUBLIC_SUPABASE_URL && !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      if (usingFallback) {
        console.log('Using fallback Supabase credentials from supabaseClient.ts');
        setDebugInfo(prev => prev + '\nUsing fallback Supabase credentials');
      }
      
      // Add a small delay to ensure everything is initialized
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDebugInfo(prev => prev + '\nAttempting to get session');
      
      try {
        // Verify that supabase client exists and has auth property
        if (!supabase || !supabase.auth) {
          throw new Error('Supabase client is not properly initialized');
        }
        
        // Wrap the getSession call in a timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timed out')), 3000)
        );
        
        // Race the promises to handle potential hanging
        const { data, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (error) {
          console.error('Auth error:', error);
          setError(error.message);
          setDebugInfo(prev => prev + `\nAuth error: ${error.message}`);
          
          // Even with an error, we'll proceed to the splash screen
          setHasSession(false);
        } else {
          console.log('Auth session check:', !!data.session);
          setHasSession(!!data.session);
          setDebugInfo(prev => prev + `\nSession exists: ${!!data.session}`);
        }
      } catch (supabaseError) {
        console.error('Supabase client error:', supabaseError);
        setError(`Supabase client error: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`);
        setDebugInfo(prev => prev + `\nSupabase client error: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`);
        
        // In case of error, assume no session and proceed to splash screen
        setHasSession(false);
      }
      */
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Unexpected error:', err);
      setError(errorMessage);
      setDebugInfo(prev => prev + `\nCaught error: ${errorMessage}`);
      
      // In case of error, assume no session and proceed to splash screen
      setHasSession(false);
      setIsLoading(false);
      
      // Force navigation to splash screen
      if (Platform.OS === 'web') {
        setTimeout(() => {
          window.location.href = '/splash';
        }, 500);
      }
    }
  };

  // Always show debug info on web or when forced
  if (Platform.OS === 'web' || forceShowDebug) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Study Buddy Debug</Text>
        
        {error && (
          <Text style={styles.error}>Error: {error}</Text>
        )}
        
        <Text style={[
          styles.debugInfo, 
          { whiteSpace: 'pre-wrap' as 'pre-wrap' }
        ]}>{debugInfo}</Text>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Go to Debug Screen" 
            onPress={() => {
              if (Platform.OS === 'web') {
                window.location.href = '/debug';
              } else {
                // For native, we would use router.push but for simplicity we'll just log
                console.log('Would navigate to debug screen');
              }
            }}
          />
          
          <Button 
            title="Go to Debug HTML" 
            onPress={() => {
              if (Platform.OS === 'web') {
                window.location.href = '/debug.html';
              }
            }}
          />
          
          <Button 
            title="Go to Splash Screen" 
            onPress={() => {
              if (Platform.OS === 'web') {
                window.location.href = '/splash';
              } else {
                // For native, we would use router.push but for simplicity we'll just log
                console.log('Would navigate to splash screen');
              }
            }}
          />
          
          <Button 
            title="Retry Auth Check" 
            onPress={() => {
              setIsLoading(true);
              setError(null);
              setForceShowDebug(false);
              setDebugInfo('Retrying...');
              checkInitialAuth();
            }}
          />
          
          <Button 
            title="Skip Auth & Go to Splash" 
            onPress={() => {
              if (Platform.OS === 'web') {
                window.location.href = '/splash';
              } else {
                console.log('Would navigate to splash screen');
              }
            }}
          />
          
          <Button 
            title="Enter Demo Mode (Skip Login)" 
            onPress={() => {
              if (Platform.OS === 'web') {
                window.location.href = '/(tabs)';
              } else {
                console.log('Would navigate directly to tabs');
              }
            }}
            color="#059669" // Green color for demo button
          />
          
          <Button 
            title="Emergency Reset" 
            onPress={() => {
              // Clear any cached data that might be causing issues
              if (Platform.OS === 'web') {
                // Clear session storage
                sessionStorage.clear();
                
                // Clear only auth-related local storage items
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && (key.includes('supabase') || key.includes('auth'))) {
                    keysToRemove.push(key);
                  }
                }
                
                keysToRemove.forEach(key => localStorage.removeItem(key));
                
                // Reload the page
                window.location.reload();
              }
            }}
          />
        </View>
      </View>
    );
  }

  if (isLoading) {
    return <LoadingScreen message="Starting app..." />;
  }

  // Use useEffect for navigation to avoid potential issues with Redirect
  useEffect(() => {
    if (!isLoading) {
      if (!hasSession) {
        console.log('No session, navigating to splash screen');
        if (Platform.OS === 'web') {
          window.location.href = '/splash';
        } else {
          // For native platforms, still use Redirect as a fallback
          // but wrapped in a try-catch to prevent crashes
          try {
            // This will only execute on native platforms
            return;
          } catch (e) {
            console.error('Navigation error:', e);
            setError(`Navigation error: ${e instanceof Error ? e.message : 'Unknown error'}`);
            setForceShowDebug(true);
          }
        }
      } else {
        console.log('Session found, navigating to tabs');
        if (Platform.OS === 'web') {
          window.location.href = '/(tabs)';
        } else {
          // For native platforms, still use Redirect as a fallback
          // but wrapped in a try-catch to prevent crashes
          try {
            // This will only execute on native platforms
            return;
          } catch (e) {
            console.error('Navigation error:', e);
            setError(`Navigation error: ${e instanceof Error ? e.message : 'Unknown error'}`);
            setForceShowDebug(true);
          }
        }
      }
    }
  }, [isLoading, hasSession]);
  
  // Fallback to Redirect for native platforms
  if (!isLoading) {
    if (!hasSession) {
      return <Redirect href={{ pathname: "/splash" }} />;
    }
    return <Redirect href={{ pathname: "/(tabs)" }} />;
  }
}

const styles = StyleSheet.create({
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
  message: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 16,
  },
  link: {
    color: '#60a5fa',
    textDecorationLine: 'underline',
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