import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Ensure environment variables are available
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

const isServer = typeof window === 'undefined';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isServer ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: !isServer
  }
});

// Subject management helpers
export const createSubject = async (subjectData: {
  name: string;
  category?: string;
  semester?: string;
  description?: string;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('subjects')
      .insert([{
        user_id: user.id,
        ...subjectData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating subject:', error);
    return { data: null, error };
  }
};

export const fetchSubjects = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return { data: null, error };
  }
};

export const deleteSubject = async (subjectId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subjectId)
      .eq('user_id', user.id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting subject:', error);
    return { error };
  }
};

// Storage helpers
export const uploadStudyMaterial = async (
  file: File,
  subjectId: string,
  fileName: string
): Promise<{ path: string; error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Generate a unique file path
    const timestamp = Date.now();
    const path = `${user.id}/${subjectId}/${timestamp}_${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('study-materials')
      .upload(path, file);

    if (uploadError) throw uploadError;

    return { path, error: null };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { path: '', error: error as Error };
  }
};

export const deleteStudyMaterial = async (path: string): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.storage
      .from('study-materials')
      .remove([path]);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { error: error as Error };
  }
};

export const getStudyMaterialUrl = async (path: string): Promise<string> => {
  const { data } = await supabase.storage
    .from('study-materials')
    .createSignedUrl(path, 3600); // 1 hour expiry

  return data?.signedUrl || '';
};

// Subscribe to presence updates for study buddies
export const subscribeToStudyBuddies = (callback: (payload: any) => void) => {
  const channel = supabase.channel('study_buddies_presence');
  
  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      callback(state);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      callback({ type: 'join', key, newPresences });
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      callback({ type: 'leave', key, leftPresences });
    })
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
};

// Subscribe to new messages in a chat room
export const subscribeToMessages = (roomId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`
      },
      callback
    )
    .subscribe();
};

// Create or get a direct chat room between two users
export const getDirectChatRoom = async (otherUserId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .rpc('create_direct_chat_room', {
      user1_id: user.id,
      user2_id: otherUserId
    });

  if (error) throw error;
  return data;
};

// Send a message in a chat room
export const sendMessage = async (roomId: string, content: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      room_id: roomId,
      sender_id: user.id,
      content
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update user's last read timestamp in a chat room
export const updateLastRead = async (roomId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('chat_room_participants')
    .update({ last_read: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('user_id', user.id);

  if (error) throw error;
};