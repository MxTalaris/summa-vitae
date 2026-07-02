import { useState } from 'react';
import { useStore } from './store/useStore';
import { Login } from './screens/Login';
import { Home, Sidebar, NewPovModal } from './screens/Home';
import { BaseCVScreen } from './screens/BaseCV';
import { TrimmedBuilder } from './screens/TrimmedBuilder';
import { SummaSharing } from './screens/SummaSharing';
import type { Pov, TrimmedCV, BuildStep, CvStyleId, AccentColor } from './types';

type Screen = 'home' | 'home-new' | 'base' | 'sharing' | 'build';

interface BuilderInit {
  povId: string;
  step: BuildStep;
  name?: string;
  style?: CvStyleId | '';
  cvId?: string;
}

export default function App() {
  const { isLoggedIn, isNewUser, baseCV, povs, login, setBaseCV, addPov, updatePov, deletePov, deleteCv } = useStore();

  const [screen, setScreen] = useState<Screen>('home');
  const [showNewPov, setShowNewPov] = useState(false);
  const [builderInit, setBuilderInit] = useState<BuilderInit>({ povId: povs[0]?.id || '', step: 'create' });

  if (!isLoggedIn) {
    return <Login onLogin={() => { login(); setScreen(isNewUser ? 'home-new' : 'home'); }} />;
  }

  const openBuilder = (init: BuilderInit) => {
    setBuilderInit(init);
    setScreen('build');
  };

  const handleNewCv = (pov: Pov) => openBuilder({ povId: pov.id, step: 'create' });
  const handleOpenCv = (pov: Pov, cv: TrimmedCV) => openBuilder({ povId: pov.id, cvId: cv.id, name: cv.name, style: cv.style, step: 'compose' });
  const handlePreview = (pov: Pov, cv: TrimmedCV) => openBuilder({ povId: pov.id, cvId: cv.id, name: cv.name, style: cv.style, step: 'export' });
  const handleDeletePov = (pov: Pov) => { if (confirm(`Delete POV "${pov.name}" and all its CVs?`)) deletePov(pov.id); };
  const handleDeleteCv = (pov: Pov, cv: TrimmedCV) => { if (confirm(`Delete CV "${cv.name}"?`)) deleteCv(pov.id, cv.id); };
  const handleSaveCv = (povId: string, cv: TrimmedCV) => {
    const pov = povs.find((p) => p.id === povId);
    if (!pov) return;
    const exists = pov.cvs.some((c) => c.id === cv.id);
    updatePov({ ...pov, cvs: exists ? pov.cvs.map((c) => (c.id === cv.id ? cv : c)) : [...pov.cvs, cv] });
  };

  /* Fullscreen screens (no sidebar) */
  if (screen === 'base') {
    return <BaseCVScreen base={baseCV} onBack={() => setScreen('home')} onDone={(cv) => { setBaseCV(cv); setScreen('home'); }} />;
  }
  if (screen === 'sharing') {
    return <SummaSharing base={baseCV} povs={povs} onBack={() => setScreen('home')} />;
  }
  if (screen === 'build') {
    return (
      <TrimmedBuilder
        base={baseCV}
        povs={povs}
        init={builderInit}
        onExit={() => setScreen('home')}
        onSave={handleSaveCv}
      />
    );
  }

  /* Home (with sidebar) */
  const empty = screen === 'home-new';
  return (
    <>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar
          nav="home"
          onNav={(k) => setScreen(k as Screen)}
          povs={empty ? [] : povs}
          onNewPov={() => setShowNewPov(true)}
          onNewCv={handleNewCv}
          onOpenCv={handleOpenCv}
          userName={baseCV.general.name}
        />
        <main style={{ flex: 1, minWidth: 0 }}>
          <Home
            base={baseCV}
            povs={empty ? [] : povs}
            empty={empty}
            onEditBase={() => setScreen('base')}
            onNewPov={() => setShowNewPov(true)}
            onNewCv={handleNewCv}
            onPreview={handlePreview}
            onEdit={handleOpenCv}
            onExport={handlePreview}
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
    </>
  );
}
