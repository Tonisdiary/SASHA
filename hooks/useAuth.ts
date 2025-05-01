// hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { supabaseClient } from 'lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if the user is authenticated
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Checking authentication status...');
      
      const { data, error } = await supabaseClient.auth.getSession();
      
      if (error) {
        console.error('Error checking auth status:', error);
        throw error;
      }
      
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      console.log('Auth check complete:', !!data.session);
      return data.session;
    } catch (error) {
      console.error('Auth check failed:', error);
      setSession(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Signing in with email...');
      
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      
      setSession(data.session);
      setUser(data.user);
      
      console.log('Sign in successful');
      return data;
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Signing up with email...');
      
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }
      
      console.log('Sign up successful');
      return data;
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Signing out...');
      
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      setSession(null);
      setUser(null);
      
      console.log('Sign out successful');
      router.replace('/auth/sign-in');
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Listen for auth changes
  useEffect(() => {
    console.log('Setting up auth listener...');
    
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );
    
    // Initial auth check
    checkAuth();
    
    return () => {
      console.log('Cleaning up auth listener...');
      authListener?.subscription.unsubscribe();
    };
  }, [checkAuth]);

  return {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    checkAuth,
  };
}