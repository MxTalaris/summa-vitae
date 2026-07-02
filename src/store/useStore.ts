import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BaseCV, Pov, AccentColor } from '../types';

const EMPTY_BASE_CV: BaseCV = {
  general: { name: '', title: '', location: '', email: '', phone: '', links: [], summary: '' },
  work: [], education: [], portfolio: [], other: [], certs: [], skills: [], languages: [],
};

interface AppState {
  isLoggedIn: boolean;
  isNewUser: boolean;
  baseCV: BaseCV;
  povs: Pov[];
  accentColor: AccentColor;

  login: () => void;
  logout: () => void;
  setBaseCV: (cv: BaseCV) => void;
  setPovs: (povs: Pov[]) => void;
  addPov: (pov: Pov) => void;
  updatePov: (pov: Pov) => void;
  deletePov: (id: string) => void;
  deleteCv: (povId: string, cvId: string) => void;
  setAccentColor: (color: AccentColor) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      isNewUser: true,
      baseCV: EMPTY_BASE_CV,
      povs: [],
      accentColor: 'pink',

      login: () => set({ isLoggedIn: true }),
      logout: () => set({ isLoggedIn: false }),
      setBaseCV: (cv) => set({ baseCV: cv, isNewUser: false }),
      setPovs: (povs) => set({ povs }),
      addPov: (pov) => set((s) => ({ povs: [...s.povs, pov] })),
      updatePov: (pov) => set((s) => ({
        povs: s.povs.map((p) => (p.id === pov.id ? pov : p)),
      })),
      deletePov: (id) => set((s) => ({ povs: s.povs.filter((p) => p.id !== id) })),
      deleteCv: (povId, cvId) => set((s) => ({
        povs: s.povs.map((p) => p.id === povId
          ? { ...p, cvs: p.cvs.filter((c) => c.id !== cvId) }
          : p),
      })),
      setAccentColor: (color) => set({ accentColor: color }),
    }),
    {
      name: 'summa-vitae',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        isNewUser: state.isNewUser,
        baseCV: state.baseCV,
        povs: state.povs,
        accentColor: state.accentColor,
      }),
    }
  )
);
