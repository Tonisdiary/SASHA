import React from 'react';
import { View, Text, StyleSheet, Button, Platform } from 'react-native';

export default function SimpleLayout() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple Layout</Text>
      <Text style={styles.subtitle}>If you can see this, basic rendering is working</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Reload App" 
          onPress={() => {
            if (Platform.OS === 'web') {
              window.location.reload();
            }
          }}
        />
      </View>
    </View>
  );
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
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    marginTop: 20,
  },
});