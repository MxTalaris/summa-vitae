import { useState, useEffect, useRef } from 'react';
import { useStore } from './store/useStore';
import { Login } from './screens/Login';
import { Home, Sidebar, NewPovModal } from './screens/Home';
import { BaseCVScreen } from './screens/BaseCV';
import { TrimmedBuilder } from './screens/TrimmedBuilder';
import { SummaSharing } from './screens/SummaSharing';
import { Icon } from './components/Icon';
import {
  requestGoogleToken,
  getGoogleUser,
  findDriveFile,
  readDriveData,
  writeDriveData,
} from './lib/google';
import type { RemoteData } from './lib/google';
import type { BaseCV, Pov, TrimmedCV, BuildStep, CvStyleId, AccentColor } from './types';

type Screen = 'home' | 'home-new' | 'base' | 'sharing' | 'build';
interface BuilderInit { povId: string; step: BuildStep; name?: string; style?: CvStyleId | ''; cvId?: string; }

// ── Shared overlay primitives ─────────────────────────────────────────────────

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(24,20,16,.55)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      {children}
    </div>
  );
}

function ModalCard({ children, maxWidth = 440 }: { children: React.ReactNode; maxWidth?: number }) {
  return (
    <div className="card" style={{
      width: '100%', maxWidth, padding: '36px 36px 28px',
      border: '2px solid var(--ink)', boxShadow: 'var(--shadow-lg)',
    }}>
      {children}
    </div>
  );
}

// ── Sync warning ──────────────────────────────────────────────────────────────

function SyncWarningModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <Overlay>
      <ModalCard>
        <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
          <span style={{
            width: 40, height: 40, borderRadius: 10, background: 'var(--yellow)',
            display: 'grid', placeItems: 'center', flexShrink: 0, border: '1.5px solid var(--ink)',
          }}>
            <Icon name="lock" size={18} color="var(--ink)" />
          </span>
          <div>
            <div className="serif" style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>Connecting your Google account</div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>Heads up</div>
          </div>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--ink-soft)', marginBottom: 24 }}>
          You're about to sync with an account. Conflict resolution of your saved CV data
          may be prompted if you proceed — your local record will be compared against any
          existing Google data.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn--ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onCancel}>Cancel</button>
          <button className="btn btn--accent" style={{ flex: 1, justifyContent: 'center' }} onClick={onConfirm}>Continue</button>
        </div>
      </ModalCard>
    </Overlay>
  );
}

// ── Conflict modal ────────────────────────────────────────────────────────────

interface DataSnapshot { label: string; lastSaved: string | null; entries: number; variations: number; cvCount: number; }

function ConflictModal({ local, account, onKeepLocal, onKeepAccount, onCancel }: {
  local: DataSnapshot; account: DataSnapshot;
  onKeepLocal: () => void; onKeepAccount: () => void; onCancel: () => void;
}) {
  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  const Row = ({ label, a, b }: { label: string; a: string | number; b: string | number }) => (
    <tr>
      <td className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', paddingBottom: 10, paddingRight: 20 }}>{label}</td>
      <td style={{ fontSize: 13, fontWeight: 600, paddingBottom: 10, paddingRight: 20 }}>{a}</td>
      <td style={{ fontSize: 13, fontWeight: 600, paddingBottom: 10 }}>{b}</td>
    </tr>
  );

  return (
    <Overlay>
      <ModalCard maxWidth={520}>
        <div className="serif" style={{ fontWeight: 800, fontSize: 19, marginBottom: 6 }}>Data conflict detected</div>
        <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 24 }}>
          Your local record and your Google Drive record have different save times.
          Choose which one to keep — the other will be overwritten.
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', paddingBottom: 10, paddingRight: 20 }} />
              <th className="mono" style={{ textAlign: 'left', fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ink-faint)', paddingBottom: 10, paddingRight: 20 }}>{local.label}</th>
              <th className="mono" style={{ textAlign: 'left', fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ink-faint)', paddingBottom: 10 }}>{account.label}</th>
            </tr>
          </thead>
          <tbody>
            <Row label="Last saved" a={fmt(local.lastSaved)} b={fmt(account.lastSaved)} />
            <Row label="Entries" a={local.entries} b={account.entries} />
            <Row label="Variations" a={local.variations} b={account.variations} />
            <Row label="CVs" a={local.cvCount} b={account.cvCount} />
          </tbody>
        </table>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn--ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }} onClick={onCancel}>Cancel</button>
          <button className="btn" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }} onClick={onKeepAccount}>Keep Google</button>
          <button className="btn btn--accent" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }} onClick={onKeepLocal}>Keep Local</button>
        </div>
      </ModalCard>
    </Overlay>
  );
}

// ── Error modal ───────────────────────────────────────────────────────────────

function ErrorModal({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <Overlay>
      <ModalCard>
        <div className="serif" style={{ fontWeight: 800, fontSize: 17, marginBottom: 10 }}>Something went wrong</div>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.65, marginBottom: 20 }}>
          {message}
        </p>
        <button className="btn btn--accent" style={{ width: '100%', justifyContent: 'center' }} onClick={onDismiss}>
          Dismiss
        </button>
      </ModalCard>
    </Overlay>
  );
}

// ── Syncing overlay ───────────────────────────────────────────────────────────

function SyncingOverlay() {
  return (
    <Overlay>
      <ModalCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Spinner />
          <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Syncing with Google Drive…</span>
        </div>
      </ModalCard>
    </Overlay>
  );
}

function Spinner() {
  return (
    <span style={{ display: 'inline-flex', gap: 4 }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: 'var(--ink-faint)',
          animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite`,
        }} />
      ))}
      <style>{`@keyframes pulse{0%,80%,100%{opacity:.2}40%{opacity:1}}`}</style>
    </span>
  );
}

// ── Data helpers ──────────────────────────────────────────────────────────────

function entryCount(base: BaseCV) {
  return base.work.length + base.education.length + base.portfolio.length +
    base.other.length + base.certs.length + base.skills.length + base.languages.length;
}
function variationCount(base: BaseCV) {
  return base.work.reduce((n, e) => n + (e.versions?.length ?? 0), 0) +
    base.education.reduce((n, e) => n + (e.versions?.length ?? 0), 0) +
    (base.general.summaryVersions?.length ?? 0);
}
function cvCount(povs: Pov[]) { return povs.reduce((n, p) => n + p.cvs.length, 0); }

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const {
    isLoggedIn, isNewUser, authProvider, lastSaved,
    googleToken, googleUser, driveFileId,
    baseCV, povs,
    login, logout, setGoogleSession, clearGoogleSession, setDriveFileId,
    setBaseCV, setPovs, addPov, updatePov, deletePov, deleteCv,
  } = useStore();

  const [screen, setScreen] = useState<Screen>('home');
  const [showNewPov, setShowNewPov] = useState(false);
  const [builderInit, setBuilderInit] = useState<BuilderInit>({ povId: povs[0]?.id || '', step: 'create' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showWarn, setShowWarn] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [conflictData, setConflictData] = useState<{ remote: DataSnapshot; remoteRaw: RemoteData; fileId: string } | null>(null);

  const hasLocalData = lastSaved !== null || baseCV.general.name !== '';


  // ── Drive sync ────────────────────────────────────────────────────────────

  const syncWithDrive = async (token: string): Promise<'imported' | 'pushed' | 'in-sync' | 'conflict'> => {
    const existingId = driveFileId ?? await findDriveFile(token);

    if (!existingId) {
      if (!hasLocalData) return 'in-sync'; // nothing local, nothing remote
      const newId = await writeDriveData(token, makeRemoteData());
      setDriveFileId(newId);
      return 'pushed';
    }

    setDriveFileId(existingId);
    const remote = await readDriveData(token, existingId);

    // No local data but remote has data — silently pull from Google
    if (!hasLocalData && remote.lastSaved) {
      setBaseCV(remote.baseCV as BaseCV);
      setPovs(remote.povs as Pov[]);
      return 'imported';
    }

    if (!remote.lastSaved || remote.lastSaved === lastSaved) {
      // Remote has no timestamp, or already in sync — push local
      await writeDriveData(token, makeRemoteData(), existingId);
      return 'in-sync';
    }

    // Real conflict
    setConflictData({
      fileId: existingId,
      remoteRaw: remote,
      remote: {
        label: 'Google Drive',
        lastSaved: remote.lastSaved,
        entries: entryCount(remote.baseCV as BaseCV),
        variations: variationCount(remote.baseCV as BaseCV),
        cvCount: cvCount(remote.povs as Pov[]),
      },
    });
    return 'conflict';
  };

  const makeRemoteData = (): RemoteData => ({
    schemaVersion: 1,
    lastSaved: lastSaved ?? new Date().toISOString(),
    baseCV,
    povs,
  });

  // ── Read-only Drive check: only shows conflict if remote is strictly newer ──

  const checkDriveForUpdates = async (token: string) => {
    const existingId = driveFileId ?? await findDriveFile(token);
    if (!existingId) return;
    if (existingId !== driveFileId) setDriveFileId(existingId);
    const remote = await readDriveData(token, existingId);
    if (!remote.lastSaved || remote.lastSaved === lastSaved) return;
    if (lastSaved && remote.lastSaved < lastSaved) return; // local is already newer
    setConflictData({
      fileId: existingId,
      remoteRaw: remote,
      remote: {
        label: 'Google Drive',
        lastSaved: remote.lastSaved,
        entries: entryCount(remote.baseCV as BaseCV),
        variations: variationCount(remote.baseCV as BaseCV),
        cvCount: cvCount(remote.povs as Pov[]),
      },
    });
  };

  // ── Auto-save to Drive when local data changes ────────────────────────────

  useEffect(() => {
    if (!googleToken || !lastSaved) return;
    const snapshot = makeRemoteData();
    const token = googleToken;
    const fid = driveFileId; // capture; may be null if file not yet created
    const id = setTimeout(async () => {
      try {
        const returnedId = await writeDriveData(token, snapshot, fid);
        if (!fid) setDriveFileId(returnedId); // first-ever write — store the new file ID
      } catch (err) {
        console.error('Drive auto-save failed', err);
      }
    }, 400);
    return () => clearTimeout(id);
  }, [lastSaved]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Home screen Drive check ───────────────────────────────────────────────

  const lastDriveCheckRef = useRef(0);
  const prevScreenRef = useRef<Screen | null>(null);

  useEffect(() => {
    const arrivedAtHome = (screen === 'home' || screen === 'home-new') && prevScreenRef.current !== screen;
    prevScreenRef.current = screen;
    if (!arrivedAtHome) return;
    if (Date.now() - lastDriveCheckRef.current < 10_000) return; // skip right after login sync

    const run = async () => {
      lastDriveCheckRef.current = Date.now();
      if (!googleToken) return;
      try { await checkDriveForUpdates(googleToken); }
      catch (err) { console.error('Home Drive check failed', err); }
    };
    run();
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth flow ─────────────────────────────────────────────────────────────

  const initiateGoogleLogin = () => {
    if (hasLocalData && authProvider === 'none') {
      setShowWarn(true);
    } else {
      proceedWithGoogle();
    }
  };

  const proceedWithGoogle = async () => {
    setShowWarn(false);
    setAuthError(null);
    setSyncing(true);
    try {
      const token = await requestGoogleToken(); // opens popup — no redirect
      const user = await getGoogleUser(token);
      setGoogleSession(token, { name: user.name, email: user.email });
      login('google');
      lastDriveCheckRef.current = Date.now(); // prevent home-screen effect from double-checking
      const result = await syncWithDrive(token);
      // 'imported' means we just pulled data from Google — always go to home (data is present)
      setScreen(result === 'imported' || !isNewUser ? 'home' : 'home-new');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg !== 'popup_closed') setAuthError(msg); // ignore deliberate cancel
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = () => {
    logout();
    clearGoogleSession();
  };

  // ── Conflict resolution ───────────────────────────────────────────────────

  const keepLocal = async () => {
    if (!googleToken || !conflictData) return;
    setSyncing(true);
    try {
      await writeDriveData(googleToken, makeRemoteData(), conflictData.fileId);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : String(err));
    } finally {
      setSyncing(false);
      setConflictData(null);
    }
  };

  const keepRemote = async () => {
    if (!conflictData) return;
    setBaseCV(conflictData.remoteRaw.baseCV as BaseCV);
    setPovs(conflictData.remoteRaw.povs as Pov[]);
    setConflictData(null);
  };

  // ── Login screen ──────────────────────────────────────────────────────────

  if (!isLoggedIn) {
    return (
      <>
        <Login
          onContinueWithout={() => { login('none'); setScreen(isNewUser ? 'home-new' : 'home'); }}
          onLoginGoogle={initiateGoogleLogin}
        />
        {syncing && <SyncingOverlay />}
        {showWarn && <SyncWarningModal onConfirm={proceedWithGoogle} onCancel={() => setShowWarn(false)} />}
        {authError && <ErrorModal message={authError} onDismiss={() => setAuthError(null)} />}
      </>
    );
  }

  // ── Fullscreen screens ────────────────────────────────────────────────────

  const openBuilder = (init: BuilderInit) => { setBuilderInit(init); setScreen('build'); };
  const handleNewCv = (pov: Pov) => openBuilder({ povId: pov.id, step: 'create' });
  const handleOpenCv = (pov: Pov, cv: TrimmedCV) => openBuilder({ povId: pov.id, cvId: cv.id, name: cv.name, style: cv.style, step: 'compose' });
  const handlePreview = (pov: Pov, cv: TrimmedCV) => openBuilder({ povId: pov.id, cvId: cv.id, name: cv.name, style: cv.style, step: 'export' });
  const handleDeletePov = (pov: Pov) => deletePov(pov.id);
  const handleDeleteCv = (pov: Pov, cv: TrimmedCV) => deleteCv(pov.id, cv.id);
  const handleEditPov = (pov: Pov, data: { name: string; accent: string }) =>
    updatePov({ ...pov, name: data.name, accent: data.accent as Pov['accent'] });
  const handleDuplicateCv = (pov: Pov, cv: TrimmedCV) =>
    updatePov({ ...pov, cvs: [...pov.cvs, { ...cv, id: `cv-${Date.now()}`, name: `Copy of ${cv.name}` }] });
  const handleSaveCv = (povId: string, cv: TrimmedCV) => {
    const pov = povs.find((p) => p.id === povId);
    if (!pov) return;
    const exists = pov.cvs.some((c) => c.id === cv.id);
    updatePov({ ...pov, cvs: exists ? pov.cvs.map((c) => (c.id === cv.id ? cv : c)) : [...pov.cvs, cv] });
  };

  if (screen === 'base') return <BaseCVScreen base={baseCV} onBack={() => setScreen('home')} onDone={(cv) => { setBaseCV(cv); setScreen('home'); }} />;
  if (screen === 'sharing') return <SummaSharing base={baseCV} povs={povs} onBack={() => setScreen('home')} />;
  if (screen === 'build') return <TrimmedBuilder base={baseCV} povs={povs} init={builderInit} onExit={() => setScreen('home')} onSave={handleSaveCv} />;

  const empty = screen === 'home-new';
  const localSnapshot: DataSnapshot = {
    label: 'This device',
    lastSaved,
    entries: entryCount(baseCV),
    variations: variationCount(baseCV),
    cvCount: cvCount(povs),
  };

  return (
    <>
      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div className="mobile-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar
          nav="home"
          onNav={(k) => { setScreen(k as Screen); setSidebarOpen(false); }}
          povs={empty ? [] : povs}
          onNewPov={() => setShowNewPov(true)}
          onNewCv={handleNewCv}
          onOpenCv={handleOpenCv}
          userName={googleUser?.name ?? baseCV.general.name}
          authProvider={authProvider}
          onLoginGoogle={initiateGoogleLogin}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="home-main" style={{ flex: 1, minWidth: 0 }}>
          {/* Mobile-only top bar with hamburger */}
          <div className="mobile-hamburger" style={{
            padding: '12px 16px', borderBottom: '1.5px solid var(--line)',
            background: 'var(--paper)', alignItems: 'center', gap: 12,
          }}>
            <button className="iconbtn" onClick={() => setSidebarOpen(true)} title="Open menu">
              <Icon name="menu" size={20} />
            </button>
            <span className="serif" style={{ fontWeight: 800, fontSize: 16 }}>Σ Summa Vitae</span>
          </div>
          <Home
            base={baseCV}
            povs={empty ? [] : povs}
            empty={empty}
            onEditBase={() => setScreen('base')}
            onNewPov={() => setShowNewPov(true)}
            onNewCv={handleNewCv}
            onPreview={handlePreview}
            onEdit={handleOpenCv}
            onDuplicateCv={handleDuplicateCv}
            onEditPov={handleEditPov}
            onDeletePov={handleDeletePov}
            onDeleteCv={handleDeleteCv}
          />
        </main>
      </div>

      {showNewPov && (
        <NewPovModal
          onClose={() => setShowNewPov(false)}
          onCreate={({ name, accent }: { name: string; accent: AccentColor }) => {
            addPov({ id: 'pov-' + Date.now(), name, accent, focus: null, desc: 'New lens.', cvs: [] });
            setShowNewPov(false);
          }}
        />
      )}

      {syncing && <SyncingOverlay />}
      {showWarn && <SyncWarningModal onConfirm={proceedWithGoogle} onCancel={() => setShowWarn(false)} />}
      {authError && <ErrorModal message={authError} onDismiss={() => setAuthError(null)} />}

      {conflictData && (
        <ConflictModal
          local={localSnapshot}
          account={conflictData.remote}
          onKeepLocal={keepLocal}
          onKeepAccount={keepRemote}
          onCancel={() => setConflictData(null)}
        />
      )}
    </>
  );
}
