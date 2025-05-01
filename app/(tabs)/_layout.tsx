import '../shim.js'; // Ensure this polyfill is loaded first

import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Platform, Pressable, StyleSheet } from 'react-native';
import {
  LogOut,
  Book,
  Calendar,
  FolderOpen,
  Chrome as Home,
  Settings as SettingsIcon,
  Users,
  BrainCircuit
} from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { LoadingScreen } from '../../components/LoadingScreen';
import { useRouter } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function TabLayout() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/sign-in');
    }
  }, [loading, user, router]);

  if (loading) {
    return <LoadingScreen message="Loading your profile..." />;
  }

  if (!user) {
    return <LoadingScreen message="Redirecting to sign in..." />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 32 : 12,
          paddingTop: 12,
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#64748b',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: 'Study',
          tabBarIcon: ({ color }) => <BrainCircuit size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="subjects"
        options={{
          title: 'Subjects',
          tabBarIcon: ({ color }) => <Book size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="study-buddies"
        options={{
          title: 'Buddies',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="materials"
        options={{
          title: 'Materials',
          tabBarIcon: ({ color }) => <FolderOpen size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
          headerRight: () => (
            <Pressable 
              style={{ marginRight: 16 }}
              onPress={signOut}
            >
              <LogOut size={24} color="#64748b" />
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff' 
  },
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    ...Platform.select({
      web: { position: 'fixed', bottom: 0, left: 0, right: 0 },
    }),
  },
  logoutButton: { 
    marginRight: 16, 
    padding: 8, 
    borderRadius: 8 
  },
});
