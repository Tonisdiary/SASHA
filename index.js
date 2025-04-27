// index.js

import './polyfills';
import 'expo/build/Expo.fx';
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// Simple error screen component
function ErrorScreen({ error }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Error Loading App</Text>
      <Text style={styles.errorMessage}>{error?.message || 'Unknown error'}</Text>
      <Text style={styles.errorStack}>{error?.stack}</Text>
      
      {Platform.OS === 'web' && (
        <div style={{ marginTop: 20 }}>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reload App
          </button>
        </div>
      )}
    </View>
  );
}

// Must be exported or Fast Refresh won't update the context
export function App() {
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Log that the app is starting
    console.log('App is starting...');
    console.log('Environment variables in index.js:');
    console.log('EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
    console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
  }, []);
  
  try {
    // Try to load the app context
    const ctx = require.context('./app');
    return <ExpoRoot context={ctx} />;
  } catch (err) {
    // If there's an error loading the context, show the error screen
    console.error('Error loading app context:', err);
    return <ErrorScreen error={err} />;
  }
}

// Styles for the error screen
const styles = StyleSheet.create({
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
  errorStack: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    width: '100%',
    maxWidth: 500,
    fontFamily: 'monospace',
  },
});

// Register the root component
registerRootComponent(App);
