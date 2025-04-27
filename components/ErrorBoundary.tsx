import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, Button, Platform } from 'react-native';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  errorStack: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorStack: ''
    };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error,
      errorStack: error.stack || 'No stack trace available'
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log the error to the console
    console.error('ErrorBoundary caught an error', error, errorInfo);
    
    // Update state with error info
    this.setState({
      errorInfo: errorInfo
    });
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log additional information that might help diagnose the issue
    console.log('React version:', React.version);
    console.log('Platform:', Platform.OS);
    console.log('OS Version:', Platform.Version);
    
    // Log environment variables
    console.log('Environment variables in ErrorBoundary:');
    console.log('EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
    console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
  }

  render() {
    if (this.state.hasError) {
      // If a fallback component was provided, use it
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }
      
      // Otherwise, render our default error UI
      return (
        <View style={styles.container}>
          <Text style={styles.heading}>Something went wrong</Text>
          
          <Text style={styles.errorText}>
            {this.state.error?.message || 'An unknown error occurred'}
          </Text>
          
          <View style={styles.stackContainer}>
            <Text style={styles.stackHeading}>Error Details:</Text>
            <Text style={styles.stackText}>{this.state.errorStack}</Text>
          </View>
          
          {Platform.OS === 'web' && (
            <View style={styles.buttonContainer}>
              <Button 
                title="Reload App" 
                onPress={() => window.location.reload()}
              />
              
              <View style={{ height: 12 }} />
              
              <Button 
                title="Go to Debug HTML" 
                onPress={() => window.location.href = '/debug.html'}
              />
            </View>
          )}
        </View>
      );
    }

    // If there's no error, render the children
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  errorText: {
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
  stackContainer: {
    width: '100%',
    maxWidth: 500,
    marginBottom: 24,
  },
  stackHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  stackText: {
    fontSize: 14,
    color: '#94a3b8',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
    ...(Platform.OS === 'web' ? { whiteSpace: 'pre-wrap' as 'pre-wrap' } : {}),
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
});
