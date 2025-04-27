// store/useSettingsStore.ts
import { create } from 'zustand';

interface Settings {
  studyDuration: number;
  shortBreak: number;
  longBreak: number;
}

interface SettingsStore {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: {
    studyDuration: 25,
    shortBreak: 5,
    longBreak: 15
  },
  updateSettings: (newSettings) => 
    set(state => ({ settings: { ...state.settings, ...newSettings } }))
}));