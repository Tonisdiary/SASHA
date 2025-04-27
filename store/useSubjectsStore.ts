// store/useSubjectsStore.ts
// store/useSubjectsStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface Subject {
  id: string;
  user_id: string;
  name: string;
  category: string;
  semester: string;
  description: string;
}

interface SubjectsStore {
  subjects: Subject[];
  fetchSubjects: () => Promise<void>;
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<{ error?: any }>;
  deleteSubject: (id: string) => Promise<void>;
}

export const useSubjectsStore = create<SubjectsStore>((set) => ({
  subjects: [],
  fetchSubjects: async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) set({ subjects: data || [] });
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  },
  addSubject: async (subject) => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert([subject])
        .select();
      
      if (error) return { error };
      
      if (data) {
        set((state) => ({ subjects: [data[0], ...state.subjects] }));
        return {};
      }
      return { error: new Error('Unknown error') };
    } catch (error) {
      console.error('Error adding subject:', error);
      return { error };
    }
  },
  deleteSubject: async (id) => {
    try {
      await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
      
      set((state) => ({ subjects: state.subjects.filter(s => s.id !== id) }));
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  },
}));