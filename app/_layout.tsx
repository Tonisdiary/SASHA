import { Stack, SplashScreen as ExpoSplashScreen, useRouter, useSegments } from 'expo-router';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, View, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { supabaseClient } from 'lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

// Ignore specific log warnings
LogBox.ignoreLogs([
  'Warning: Failed prop type: Invalid prop `textStyle` of type `array` supplied to `Cell`, expected `object`.',
  'Warning: Failed prop type: Invalid prop `dayNamesStyle` of type `array` supplied to `WeekCalendar`, expected `object`.',
  'Warning: Failed prop type: Invalid prop `style` of type `array` supplied to `WeekCalendar`, expected `object`.',
  'Warning: Failed prop type: Invalid prop `style` of type `array` supplied to `CalendarProvider`, expected `object`.',
  'Constants.platform.ios.model has been deprecated in favor of expo-device\'s Device.modelName property. This API will be removed in SDK 45.',
]);

// Prevent the splash screen from auto-hiding before asset loading is complete.
ExpoSplashScreen.preventAutoHideAsync();

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
}

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch {
      return;
    }
  },
};

const queryClient = new QueryClient();

function InitialLayout() {
  const { isLoaded: clerkIsLoaded, isSignedIn: clerkIsSignedIn } = useAuth();
  const segments = useSegments() as string[];
  const router = useRouter();
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const isNavigationAttempted = useRef(false);

  let [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Poppins_600SemiBold,
  });

  // Check Supabase session
  useEffect(() => {
    const checkSupabaseSession = async () => {
      try {
        console.log('Checking Supabase session in _layout...');
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) {
          console.error('Supabase session check error:', error);
        }
        setSupabaseSession(data.session);
      } catch (error) {
        console.error('Error fetching Supabase session:', error);
        setSupabaseSession(null);
      } finally {
        setSessionLoading(false);
        console.log('Supabase session check finished.');
      }
    };

    checkSupabaseSession();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        console.log('Supabase Auth State Change:', _event, !!session);
        setSupabaseSession(session);
        isNavigationAttempted.current = false;
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Navigation and splash screen handling
  useEffect(() => {
    if (!clerkIsLoaded || !fontsLoaded || sessionLoading) {
      console.log(`Waiting for resources: Clerk Loaded=${clerkIsLoaded}, Fonts Loaded=${fontsLoaded}, Session Loading=${sessionLoading}`);
      return;
    }

    if (isNavigationAttempted.current) {
      console.log('Navigation logic already attempted, skipping.');
      return;
    }

    console.log('All resources loaded. Evaluating navigation...');
    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const isOnCustomSplash = segments[0] === 'splash';

    console.log(`Clerk isSignedIn: ${clerkIsSignedIn}, Supabase Session: ${!!supabaseSession}`);
    console.log(`Current segment: ${segments.join('/') || 'root'}, In Auth Group: ${inAuthGroup}, In Tabs Group: ${inTabsGroup}, On Custom Splash: ${isOnCustomSplash}`);

    const isAuthenticated = !!supabaseSession || clerkIsSignedIn;
    let performNavigation = false;

    if (isAuthenticated) {
      if (!inTabsGroup) {
        console.log('Authenticated: Navigating to (tabs)');
        router.replace('/(tabs)' as any);
        performNavigation = true;
      } else {
        console.log('Authenticated: Already in (tabs)');
      }
    } else {
      if (!isOnCustomSplash && !inAuthGroup) {
        console.log('Not authenticated: Navigating to /splash');
        router.replace('/splash' as any);
        performNavigation = true;
      } else {
        console.log('Not authenticated: Already on splash or in auth group.');
      }
    }

    isNavigationAttempted.current = true;

    const hideSplash = async () => {
      console.log('Hiding native splash screen.');
      await ExpoSplashScreen.hideAsync();
      console.log('Native splash screen hidden.');
    };

    if (performNavigation) {
      setTimeout(hideSplash, 50);
    } else {
      hideSplash();
    }
  }, [clerkIsLoaded, clerkIsSignedIn, fontsLoaded, segments, router, supabaseSession, sessionLoading]);

  if (!clerkIsLoaded || !fontsLoaded || sessionLoading) {
    console.log('InitialLayout: Still loading resources, returning null.');
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  console.log('RootLayout: Rendering...');
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={CLERK_PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <InitialLayout />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
