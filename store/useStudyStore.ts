import { create } from 'zustand';
import { POINTS_PER_MINUTE, POINTS_PER_LEVEL, POINTS_FOR_AI } from './constants';

interface StudySession {
  id: string;
  subject: string;
  duration: number;
  date: string;
  completed: boolean;
  points: number;
}

interface SearchHistoryItem {
  query: string;
  type: 'web' | 'image';
  timestamp: string;
}

interface Material {
  id: string;
  name: string;
  type: string;
  subject: string;
  size: string;
  date: string;
  downloads: number;
  views: number;
  url: string;
  preview?: string;
}

interface StudyStore {
  sessions: StudySession[];
  totalPoints: number;
  level: number;
  aiEnabled: boolean;
  searchHistory: SearchHistoryItem[];
  materials: Material[];

  addSession: (session: Omit<StudySession, 'id' | 'points'>) => void;
  completeSession: (id: string) => void;
  addSearchHistory: (item: SearchHistoryItem) => void;
  addMaterial: (materials: Material[]) => void;
  removeMaterial: (id: string) => void;
}

export const useStudyStore = create<StudyStore>((set) => ({
  sessions: [],
  totalPoints: 0,
  level: 1,
  aiEnabled: false,
  searchHistory: [],
  materials: [],

  addSession: (sessionData) => {
    set((state) => {
      const points = Math.floor((sessionData.duration / 60) * POINTS_PER_MINUTE);
      const newSession: StudySession = {
        id: Date.now().toString(),
        ...sessionData,
        points,
      };

      const newTotalPoints =
        state.totalPoints + (sessionData.completed ? points : 0);
      const newLevel = Math.floor(newTotalPoints / POINTS_PER_LEVEL) + 1;

      return {
        sessions: [newSession, ...state.sessions],
        totalPoints: newTotalPoints,
        level: newLevel,
        aiEnabled: newTotalPoints >= POINTS_FOR_AI,
      };
    });
  },

  completeSession: (id) => {
    set((state) => {
      const session = state.sessions.find((s) => s.id === id);
      if (!session || session.completed) return state;

      const newTotalPoints = state.totalPoints + session.points;
      const newLevel = Math.floor(newTotalPoints / POINTS_PER_LEVEL) + 1;

      return {
        sessions: state.sessions.map((s) =>
          s.id === id ? { ...s, completed: true } : s
        ),
        totalPoints: newTotalPoints,
        level: newLevel,
        aiEnabled: newTotalPoints >= POINTS_FOR_AI,
      };
    });
  },

  addSearchHistory: (item) => {
    set((state) => ({
      searchHistory: [...state.searchHistory, item],
    }));
  },

  addMaterial: (materials) => set(state => ({
    materials: [...new Set([...state.materials, ...materials])]
  })),

  removeMaterial: (id) => set(state => ({
    materials: state.materials.filter(m => m.id !== id)
  })),
}));