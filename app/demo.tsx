import { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function DemoScreen() {
  const router = useRouter();

  // Automatically redirect to tabs
  useEffect(() => {
    console.log('Demo screen mounted, redirecting to tabs...');
    
    // Short delay to ensure everything is loaded
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 500);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entering Demo Mode...</Text>
      <Text style={styles.subtitle}>Redirecting to the app...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#94a3b8',
    textAlign: 'center',
  },
});