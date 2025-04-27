import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function DebugScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Study Buddy Web Debug</Text>
      <Text style={styles.subtitle}>If you can see this, the web build is working!</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          This is a debug screen to help verify that the web build is functioning correctly.
        </Text>
        <Text style={styles.infoText}>
          You should be able to navigate to other screens from here.
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Link href="/splash" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Go to Splash Screen</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#94a3b8',
    marginBottom: 32,
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
    maxWidth: 500,
  },
  infoText: {
    color: '#e2e8f0',
    fontSize: 16,
    marginBottom: 12,
  },
  buttonContainer: {
    width: 200,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});