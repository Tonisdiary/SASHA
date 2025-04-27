import { registerRootComponent } from 'expo';
import '@expo/metro-runtime';
import './app/shim';
import 'expo-router/entry';

registerRootComponent(() => null);
