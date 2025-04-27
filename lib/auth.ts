import { supabaseClient } from './supabaseClient';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    throw error;
  }
  return data.user;
}

export async function signUp(email: string, password: string, username?: string) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
  });
  if (error) {
    throw error;
  }
  // Optionally, save username in profiles table if needed
  if (username && data.user) {
    await supabaseClient.from('profiles').upsert({
      id: data.user.id,
      username,
    });
  }
  return data.user;
}

export async function signOut() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    throw error;
  }
}
