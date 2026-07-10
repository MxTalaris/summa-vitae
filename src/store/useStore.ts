import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BaseCV, Pov, AccentColor, AuthProvider, CvLanguage } from '../types';

export const EMPTY_BASE_CV: BaseCV = {
  general: { name: '', title: '', location: '', email: '', phone: '', links: [], summary: '' },
  work: [], education: [], portfolio: [], other: [], certs: [], skills: [], languages: [],
};

const now = () => new Date().toISOString();

export type Session = { baseCV: BaseCV; povs: Pov[] };
type Sessions = Partial<Record<CvLanguage, Session>>;

const EMPTY_SESSION: Session = { baseCV: EMPTY_BASE_CV, povs: [] };

/** Returns the active session for the given language, falling back to a stable empty constant. */
const getSession = (sessions: Sessions, lang: CvLanguage): Session =>
  sessions[lang] ?? EMPTY_SESSION;

/** Returns a new sessions map with the current language's session updated. */
const patchSession = (sessions: Sessions, lang: CvLanguage, patch: Partial<Session>): Sessions => ({
  ...sessions,
  [lang]: { ...getSession(sessions, lang), ...patch },
});

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

  // CV data — one session per language
  cvLanguage: CvLanguage;
  sessions: Sessions;
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
  setCvLanguage: (lang: CvLanguage) => void;
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

      cvLanguage: 'en',
      sessions: {},
      accentColor: 'pink',

      login: (provider = 'none') => set({ isLoggedIn: true, authProvider: provider }),
      logout: () => set({ isLoggedIn: false, authProvider: 'none', googleToken: null, googleUser: null }),
      setGoogleSession: (token, user) => set({ googleToken: token, googleUser: user }),
      clearGoogleSession: () => set({ googleToken: null, googleUser: null }),
      setDriveFileId: (id) => set({ driveFileId: id }),

      setBaseCV: (cv) => set((s) => ({
        sessions: patchSession(s.sessions, s.cvLanguage, { baseCV: cv }),
        isNewUser: false,
        lastSaved: now(),
      })),

      setPovs: (povs) => set((s) => ({
        sessions: patchSession(s.sessions, s.cvLanguage, { povs }),
        lastSaved: now(),
      })),

      addPov: (pov) => set((s) => ({
        sessions: patchSession(s.sessions, s.cvLanguage, {
          povs: [...getSession(s.sessions, s.cvLanguage).povs, pov],
        }),
        lastSaved: now(),
      })),

      updatePov: (pov) => set((s) => ({
        sessions: patchSession(s.sessions, s.cvLanguage, {
          povs: getSession(s.sessions, s.cvLanguage).povs.map((p) => (p.id === pov.id ? pov : p)),
        }),
        lastSaved: now(),
      })),

      deletePov: (id) => set((s) => ({
        sessions: patchSession(s.sessions, s.cvLanguage, {
          povs: getSession(s.sessions, s.cvLanguage).povs.filter((p) => p.id !== id),
        }),
        lastSaved: now(),
      })),

      deleteCv: (povId, cvId) => set((s) => ({
        sessions: patchSession(s.sessions, s.cvLanguage, {
          povs: getSession(s.sessions, s.cvLanguage).povs.map((p) =>
            p.id === povId ? { ...p, cvs: p.cvs.filter((c) => c.id !== cvId) } : p
          ),
        }),
        lastSaved: now(),
      })),

      setAccentColor: (color) => set({ accentColor: color }),
      setCvLanguage: (lang) => set((s) => {
        // If the target language already has data, just switch
        if (s.sessions[lang]) return { cvLanguage: lang };

        // Seed from the session with the most entries so the user isn't starting from scratch
        const countEntries = (sess: Session) =>
          sess.baseCV.work.length + sess.baseCV.education.length +
          sess.baseCV.portfolio.length + sess.baseCV.other.length +
          sess.baseCV.certs.length + sess.baseCV.skills.length +
          sess.baseCV.languages.length;

        const existing = Object.values(s.sessions).filter((sess): sess is Session => !!sess);
        const best = existing.sort((a, b) => countEntries(b) - countEntries(a))[0];

        if (!best) return { cvLanguage: lang };

        return {
          cvLanguage: lang,
          sessions: patchSession(s.sessions, lang, {
            baseCV: structuredClone(best.baseCV),
          }),
        };
      }),
    }),
    {
      name: 'summa-vitae',
      version: 1,
      migrate: (persistedState: unknown, version: number): AppState => {
        // v0 had top-level baseCV and povs — migrate them into sessions.en
        if (version === 0) {
          const old = persistedState as Record<string, unknown>;
          return {
            ...old,
            sessions: {
              en: {
                baseCV: (old.baseCV as BaseCV) ?? EMPTY_BASE_CV,
                povs: (old.povs as Pov[]) ?? [],
              },
            },
            cvLanguage: (old.cvLanguage as CvLanguage) ?? 'en',
          } as AppState;
        }
        return persistedState as AppState;
      },
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        isNewUser: state.isNewUser,
        authProvider: state.authProvider,
        lastSaved: state.lastSaved,
        googleUser: state.googleUser,   // name/email persisted, token is not
        driveFileId: state.driveFileId,
        sessions: state.sessions,
        accentColor: state.accentColor,
        cvLanguage: state.cvLanguage,
      }),
    }
  )
);

/** Selector hook: returns the baseCV and povs for the currently active language. */
export function useCurrentSession(): Session {
  return useStore((s) => getSession(s.sessions, s.cvLanguage));
}
