import { Stack, SplashScreen as ExpoSplashScreen, useRouter, useSegments } from 'expo-router';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState, useRef } from 'react'; // Added useRef
import { ActivityIndicator, View, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { supabaseClient } from 'lib/supabaseClient'; // Import Supabase client
import { Session } from '@supabase/supabase-js'; // Import Session type

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
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

const queryClient = new QueryClient();

function InitialLayout() {
  const { isLoaded: clerkIsLoaded, isSignedIn: clerkIsSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const isNavigationAttempted = useRef(false); // Track if navigation logic ran

  let [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Poppins_600SemiBold,
  });

  // Effect for checking Supabase session
  useEffect(() => {
    const checkSupabaseSession = async () => {
      try {
        console.log('Checking Supabase session in _layout...');
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) {
          console.error('Supabase session check error:', error);
          // Potentially handle error differently, e.g., show error message
        }
        console.log('Supabase session data:', data.session ? 'Exists' : 'Null');
        setSupabaseSession(data.session);
      } catch (error) {
        console.error('Error fetching Supabase session:', error);
        setSupabaseSession(null); // Ensure session is null on error
      } finally {
        setSessionLoading(false);
        console.log('Supabase session check finished.');
      }
    };

    checkSupabaseSession();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        console.log('Supabase Auth State Change:', _event, session ? 'Exists' : 'Null');
        setSupabaseSession(session);
        // Reset navigation attempt flag if auth state changes significantly
        // to allow re-evaluation in the other effect.
        isNavigationAttempted.current = false;
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);


  // Effect for handling navigation and hiding splash screen
  useEffect(() => {
    // Ensure all loading states are finished
    if (!clerkIsLoaded || !fontsLoaded || sessionLoading) {
      console.log(`Waiting for resources: Clerk Loaded=${clerkIsLoaded}, Fonts Loaded=${fontsLoaded}, Session Loading=${sessionLoading}`);
      return; // Keep splash screen visible
    }

    // Prevent running navigation logic multiple times unnecessarily
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

    // Determine authentication status (prioritize Supabase session)
    const isAuthenticated = !!supabaseSession || clerkIsSignedIn;
    let performNavigation = false;

    if (isAuthenticated) {
      if (!inTabsGroup) {
        console.log('Authenticated: Navigating to (tabs)');
        router.replace('/(tabs)');
        performNavigation = true;
      } else {
        console.log('Authenticated: Already in (tabs)');
      }
    } else { // Not authenticated
      // Redirect to custom splash screen if not already there or in the auth flow
      if (!isOnCustomSplash && !inAuthGroup) {
         console.log('Not authenticated: Navigating to /splash');
         router.replace('/splash');
         performNavigation = true;
      } else {
         console.log('Not authenticated: Already on splash or in auth group.');
      }
    }

    // Mark that navigation logic has been attempted
    isNavigationAttempted.current = true;

    // Hide the splash screen *after* navigation logic is complete
    // Use a small timeout if navigation was performed to allow the router to process
    const hideSplash = async () => {
        console.log('Hiding native splash screen.');
        await ExpoSplashScreen.hideAsync();
        console.log('Native splash screen hidden.');
    };

    if (performNavigation) {
        // Give router a moment to potentially start transition after replace()
        setTimeout(hideSplash, 50);
    } else {
        // If no navigation needed, hide immediately
        hideSplash();
    }

  }, [clerkIsLoaded, clerkIsSignedIn, fontsLoaded, segments, router, supabaseSession, sessionLoading]); // Dependencies

  // Render loading state or null while waiting
  if (!clerkIsLoaded || !fontsLoaded || sessionLoading) {
    // Keep returning null (or a minimal loader) while waiting for all checks.
    // The native splash screen is controlled by preventAutoHideAsync/hideAsync.
    console.log('InitialLayout: Still loading resources, returning null.');
    // Optionally return a very basic loading indicator if needed, but null is usually fine.
    // return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>;
    return null;
  }

  // Once all loaded, render the main stack navigator
  console.log('InitialLayout: Rendering Stack Navigator.');
  return (
    <Stack>
      {/* Redirect root to splash initially? Or let the effect handle it.
          Letting effect handle it is generally better for auth flows. */}
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
@echo off
echo Cleaning up node_modules and build directories...

rem Delete node_modules directories
rd /s /q "C:\Users\tonys\Downloads\study-buddy\node_modules"
rd /s /q "C:\Users\tonys\Downloads\study-buddy\auth_app\node_modules"
rd /s /q "C:\Users\tonys\Downloads\study-buddy\study-buddy\node_modules"
rd /s /q "C:\Users\tonys\Downloads\study-buddy\project\node_modules"

rem Delete build and cache directories
rd /s /q "C:\Users\tonys\Downloads\study-buddy\web-build"
rd /s /q "C:\Users\tonys\Downloads\study-buddy\.expo"
rd /s /q "C:\Users\tonys\Downloads\study-buddy\android\.gradle"

rem Clean iOS and Android build artifacts
rd /s /q "C:\Users\tonys\Downloads\study-buddy\ios\build"
rd /s /q "C:\Users\tonys\Downloads\study-buddy\android\app\build"

rem Delete any temporary files or logs
del /s /q "C:\Users\tonys\Downloads\study-buddy\*.log"

echo Cleanup completed!