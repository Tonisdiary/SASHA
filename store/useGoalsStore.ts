// store/useGoalsStore.ts
import { create } from 'zustand';

interface Goals {
  daily: number;
  weekly: number;
  currentDaily: number;
  currentWeekly: number;
}

interface GoalsStore {
  goals: Goals;
  setGoals: (newGoals: Partial<Goals>) => void;
  addStudyTime: (minutes: number) => void;
}

export const useGoalsStore = create<GoalsStore>((set) => ({
  goals: {
    daily: 120, // Default 2 hours
    weekly: 420, // Default 7 hours
    currentDaily: 0,
    currentWeekly: 0,
  },
  setGoals: (newGoals) =>
    set((state) => ({ goals: { ...state.goals, ...newGoals } })),
  addStudyTime: (minutes) =>
    set((state) => ({
      goals: {
        ...state.goals,
        currentDaily: state.goals.currentDaily + minutes,
        currentWeekly: state.goals.currentWeekly + minutes,
      },
    })),
}));
