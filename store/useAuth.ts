// store/useAuth.ts
import { create } from 'zustand';
import { supabase } from 'lib/supabase';

interface AuthStore {
  session: any;
  user: any | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set) => ({
  session: null,
  user: null,
  loading: true,
  checkAuth: async () => {
    set({ loading: true });
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      set({ session: null, user: null, loading: false });
    } else {
      set({ session, user: session?.user ?? null, loading: false });
    }
  }
}));
