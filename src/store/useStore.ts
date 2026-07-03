import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BaseCV, Pov, AccentColor, AuthProvider } from '../types';

const EMPTY_BASE_CV: BaseCV = {
  general: { name: '', title: '', location: '', email: '', phone: '', links: [], summary: '' },
  work: [], education: [], portfolio: [], other: [], certs: [], skills: [], languages: [],
};

const now = () => new Date().toISOString();

interface AppState {
  // Auth
  isLoggedIn: boolean;
  isNewUser: boolean;
  authProvider: AuthProvider;
  lastSaved: string | null;

  // Google session — token is NOT persisted (re-auth on next visit for security)
  googleToken: string | null;
  googleUser: { name: string; email: string } | null;
  /** Drive file ID of cv-data.json — persisted so we can update without searching */
  driveFileId: string | null;

  // CV data
  baseCV: BaseCV;
  povs: Pov[];
  accentColor: AccentColor;

  // Actions
  login: (provider?: AuthProvider) => void;
  logout: () => void;
  setGoogleSession: (token: string, user: { name: string; email: string }) => void;
  clearGoogleSession: () => void;
  setDriveFileId: (id: string) => void;
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
      authProvider: 'none',
      lastSaved: null,

      googleToken: null,
      googleUser: null,
      driveFileId: null,

      baseCV: EMPTY_BASE_CV,
      povs: [],
      accentColor: 'pink',

      login: (provider = 'none') => set({ isLoggedIn: true, authProvider: provider }),
      logout: () => set({ isLoggedIn: false, authProvider: 'none', googleToken: null, googleUser: null }),
      setGoogleSession: (token, user) => set({ googleToken: token, googleUser: user }),
      clearGoogleSession: () => set({ googleToken: null, googleUser: null }),
      setDriveFileId: (id) => set({ driveFileId: id }),

      setBaseCV: (cv) => set({ baseCV: cv, isNewUser: false, lastSaved: now() }),
      setPovs: (povs) => set({ povs, lastSaved: now() }),
      addPov: (pov) => set((s) => ({ povs: [...s.povs, pov], lastSaved: now() })),
      updatePov: (pov) => set((s) => ({
        povs: s.povs.map((p) => (p.id === pov.id ? pov : p)),
        lastSaved: now(),
      })),
      deletePov: (id) => set((s) => ({ povs: s.povs.filter((p) => p.id !== id), lastSaved: now() })),
      deleteCv: (povId, cvId) => set((s) => ({
        povs: s.povs.map((p) => p.id === povId
          ? { ...p, cvs: p.cvs.filter((c) => c.id !== cvId) }
          : p),
        lastSaved: now(),
      })),
      setAccentColor: (color) => set({ accentColor: color }),
    }),
    {
      name: 'summa-vitae',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        isNewUser: state.isNewUser,
        authProvider: state.authProvider,
        lastSaved: state.lastSaved,
        googleUser: state.googleUser,   // name/email persisted, token is not
        driveFileId: state.driveFileId,
        baseCV: state.baseCV,
        povs: state.povs,
        accentColor: state.accentColor,
      }),
    }
  )
);
