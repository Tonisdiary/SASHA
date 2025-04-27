import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure environment variables are prefixed with VITE_
  // Example: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
  // No specific node polyfill configuration needed unless a dependency explicitly requires it.
  // Vite handles most browser compatibility automatically.
})
