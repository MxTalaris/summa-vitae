import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../components/Icon';
import { Chip } from '../components/primitives';
import { CVThumb } from '../cv/CVRenderer';
import { defaultSelForFocus } from '../cv/CVRenderer';
import type { BaseCV, Pov, TrimmedCV, AccentColor, AuthProvider } from '../types';
import { CV_STYLES } from '../data/seed';

/* ---- Sidebar ---- */
interface SidebarProps {
  nav: string;
  onNav: (key: string) => void;
  povs: Pov[];
  onNewPov: () => void;
  onNewCv: (pov: Pov) => void;
  onOpenCv: (pov: Pov, cv: TrimmedCV) => void;
  userName: string;
  authProvider: AuthProvider;
  onLoginGoogle: () => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ nav, onNav, povs, onNewPov, onNewCv, onOpenCv, userName, authProvider, onLoginGoogle, onLogout, isOpen, onClose }: SidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);
  const items: [string, string, string][] = [
    ['home',    'home',  'Studio'],
    ['base',    'doc',   'Base CV'],
    // TODO: URL sharing — re-enable when Summa Sharing is wired up
    // ['sharing', 'share', 'Summa Sharing'],
  ];

  return (
    <aside
      className={`home-sidebar${isOpen ? ' home-sidebar--open' : ''}`}
      style={{
        width: 248, flexShrink: 0, borderRight: '1.5px solid var(--line)',
        background: 'var(--paper-2)', display: 'flex', flexDirection: 'column', padding: '22px 14px',
        height: '100vh', position: 'sticky', top: 0,
      }}
    >
      {/* Logo row + mobile close button */}
      <div style={{ padding: '0 6px 22px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="serif" style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-.01em', flex: 1 }}>Σ Summa Vitae</span>
        <button className="iconbtn sidebar-mobile-close" onClick={onClose} title="Close menu">
          <Icon name="x" size={18} />
        </button>
      </div>

      <div className="kicker" style={{ padding: '0 10px 8px' }}>Workspace</div>
      {items.map(([key, icon, label]) => {
        const on = nav === key;
        return (
          <button key={key} onClick={() => { onNav(key); onClose?.(); }} style={{
            display: 'flex', alignItems: 'center', gap: 11,
            padding: '9px 12px', marginBottom: 3, cursor: 'pointer', borderRadius: 9, width: '100%',
            textAlign: 'left', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: on ? 700 : 500,
            background: on ? 'var(--card)' : 'transparent', color: on ? 'var(--ink)' : 'var(--ink-soft)',
            boxShadow: on ? '2px 2px 0 var(--ink)' : 'none',
            border: on ? '1.5px solid var(--ink)' : '1.5px solid transparent', transition: 'all .12s',
          }}>
            <Icon name={icon} size={17} color={on ? 'var(--accent)' : 'var(--ink-faint)'} /> {label}
          </button>
        );
      })}

      {/* POV tree — scrollable container keeps logo/nav/user-card fixed */}
      <div className="sidebar-pov-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '22px 10px 8px' }}>
          <span className="kicker">Points of View</span>
          <div style={{ flex: 1 }} />
          <button onClick={onNewPov} className="iconbtn" title="New POV" style={{ width: 22, height: 22, borderRadius: 6 }}>
            <Icon name="plus" size={13} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {povs.map((pov) => (
            <div key={pov.id} style={{ marginBottom: 6 }}>
              <div className="row" style={{ gap: 8, padding: '6px 8px 6px 10px', borderRadius: 7 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: 2, background: `var(--${pov.accent})`,
                  boxShadow: '1px 1px 0 var(--ink)', flexShrink: 0,
                }} />
                <span className="serif" style={{
                  flex: 1, fontSize: 13.5, fontWeight: 800, letterSpacing: '-.005em',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{pov.name}</span>
                <button onClick={() => onNewCv(pov)} className="iconbtn" title={'Add CV to ' + pov.name}
                  style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0 }}>
                  <Icon name="plus" size={12} />
                </button>
              </div>
              <div style={{ borderLeft: '1.5px solid var(--line)', marginLeft: 13, paddingLeft: 6 }}>
                {pov.cvs.length === 0 ? (
                  <button onClick={() => onNewCv(pov)} className="mono" style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '6px 9px',
                    border: 0, background: 'transparent', cursor: 'pointer', fontSize: 11, color: 'var(--ink-faint)', borderRadius: 6,
                  }}>+ first CV</button>
                ) : pov.cvs.map((cv) => (
                  <button key={cv.id} onClick={() => { onOpenCv(pov, cv); onClose?.(); }} style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
                    padding: '6px 9px', border: 0, cursor: 'pointer', background: 'transparent', borderRadius: 6,
                    color: 'var(--ink-soft)', fontFamily: 'var(--sans)', fontSize: 12.5, transition: 'background .1s',
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--card)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <Icon name="doc" size={13} color="var(--ink-faint)" />
                    <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cv.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User card with context menu */}
      <div ref={menuRef} style={{ position: 'relative', marginTop: 8 }}>
        {menuOpen && (
          <div style={{
            position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, right: 0,
            background: 'var(--card)', border: '1.5px solid var(--ink)', borderRadius: 10,
            boxShadow: 'var(--shadow-lg)', padding: '6px 0', zIndex: 50,
          }}>
            {authProvider === 'none' && (
              <button onClick={() => { setMenuOpen(false); onLoginGoogle(); }} style={menuItemStyle}>
                <Icon name="google" size={15} /> Log in with Google
              </button>
            )}
            {authProvider === 'google' && (
              <button onClick={() => { setMenuOpen(false); onLogout(); }} style={menuItemStyle}>
                <Icon name="google" size={15} /> Log out of Google
              </button>
            )}
            <hr style={{ margin: '6px 0', border: 0, borderTop: '1px solid var(--line)' }} />
            <button onClick={() => { setMenuOpen(false); onLogout(); }} style={{ ...menuItemStyle, color: 'var(--ink-soft)' }}>
              <Icon name="x" size={14} color="currentColor" /> Sign out
            </button>
          </div>
        )}
        <div
          className="card"
          onClick={() => setMenuOpen((o) => !o)}
          style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}
        >
          <span style={{
            width: 36, height: 36, borderRadius: 9, background: 'var(--ink)', color: 'var(--paper)',
            display: 'grid', placeItems: 'center', fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 16,
            flexShrink: 0,
          }}>
            {userName.charAt(0) || 'Σ'}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName || 'Anonymous'}
            </div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)' }}>
              {authProvider === 'none' ? 'Local only' : 'Google'}
            </div>
          </div>
          <Icon name="chevD" size={14} color="var(--ink-faint)" style={{ flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 9,
  width: '100%', textAlign: 'left', padding: '8px 14px',
  background: 'transparent', border: 0, cursor: 'pointer',
  fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink)',
  transition: 'background .1s',
};

/* ---- New POV modal ---- */
interface NewPovModalProps {
  onClose: () => void;
  onCreate: (data: { name: string; accent: AccentColor }) => void;
}

export function NewPovModal({ onClose, onCreate }: NewPovModalProps) {
  const [name, setName] = useState('');
  const [accent, setAccent] = useState<AccentColor>('orange');
  const accents: AccentColor[] = ['pink', 'blue', 'teal', 'yellow', 'orange'];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(22,18,14,.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={onClose}>
      <div className="card sv-pop" style={{ width: 440, padding: 28, borderColor: 'var(--ink)', borderWidth: 2 }}
        onClick={(e) => e.stopPropagation()}>
        <div className="kicker">New point of view</div>
        <h3 className="serif" style={{ fontSize: 24, fontWeight: 800, margin: '8px 0 4px', letterSpacing: '-.01em' }}>
          Name a lens
        </h3>
        <p className="muted" style={{ fontSize: 13.5, marginBottom: 20 }}>
          Usually a job title you're pursuing. You'll compose tailored CVs inside it.
        </p>
        <div className="field" style={{ marginBottom: 16 }}>
          <label>POV name</label>
          <input className="input" autoFocus value={name} placeholder="e.g. Engineering Management"
            onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field" style={{ marginBottom: 24 }}>
          <label>Accent</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {accents.map((a) => (
              <button key={a} onClick={() => setAccent(a)} style={{
                width: 34, height: 34, borderRadius: 8,
                background: `var(--${a})`, cursor: 'pointer',
                border: accent === a ? '2.5px solid var(--ink)' : '1.5px solid var(--line-strong)',
                boxShadow: accent === a ? '2px 2px 0 var(--ink)' : 'none',
              }} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" disabled={!name} onClick={() => onCreate({ name, accent })}>
            Create POV
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- CV card ---- */
const STATUS_TONE: Record<string, 'teal' | 'yellow' | 'blue'> = {
  ready: 'teal', draft: 'yellow', sent: 'blue',
};

interface CvCardProps {
  base: BaseCV;
  pov: Pov;
  cv: TrimmedCV;
  onPreview: (pov: Pov, cv: TrimmedCV) => void;
  onEdit: (pov: Pov, cv: TrimmedCV) => void;
  onExport: (pov: Pov, cv: TrimmedCV) => void;
  onDelete: (pov: Pov, cv: TrimmedCV) => void;
}

function CvCard({ base, pov, cv, onPreview, onEdit, onExport, onDelete }: CvCardProps) {
  const sel = defaultSelForFocus(base, pov.focus);
  const styleName = (CV_STYLES.find((s) => s.id === cv.style) || {}).name || cv.style;
  return (
    <div className="card sv-pop" style={{ padding: 14, display: 'flex', gap: 16, alignItems: 'stretch' }}>
      <CVThumb base={base} style={cv.style} sel={sel} w={104} accent={pov.accent} />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="serif" style={{
              fontWeight: 800, fontSize: 17, letterSpacing: '-.01em',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{cv.name}</div>
            <div className="mono" style={{
              fontSize: 11, color: 'var(--ink-faint)', marginTop: 4,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {cv.role} · {cv.pages} pp · {cv.sections} sections
            </div>
          </div>
          <Chip tone={STATUS_TONE[cv.status]}>{cv.status}</Chip>
        </div>
        <div style={{ display: 'flex', gap: 7, marginTop: 8, flexWrap: 'wrap' }}>
          <Chip>{styleName}</Chip>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)', alignSelf: 'center' }}>
            <Icon name="clock" size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />
            updated {cv.updated}
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button className="btn btn--sm" onClick={() => onEdit(pov, cv)}>
            <Icon name="pencil" size={14} /> Edit
          </button>
          <button className="btn btn--sm btn--ghost" onClick={() => onPreview(pov, cv)}>
            <Icon name="eye" size={14} /> Preview
          </button>
          <button className="btn btn--sm btn--ghost" onClick={() => onExport(pov, cv)} title="Export / download">
            <Icon name="download" size={14} />
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn btn--sm btn--ghost" onClick={() => onDelete(pov, cv)} title="Delete CV"
            style={{ color: 'var(--ink-faint)' }}>
            <Icon name="trash" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function NewCvCard({ accent, onClick }: { accent: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} className="sv-pop" style={{
      cursor: 'pointer', textAlign: 'left',
      border: `1.5px dashed ${hover ? `var(--${accent})` : 'var(--line-strong)'}`,
      borderRadius: 'var(--r-lg)', background: hover ? 'var(--card)' : 'transparent',
      padding: 14, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--ink-soft)',
      transition: 'all .14s ease', minHeight: 132,
    }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>
      <span style={{
        width: 38, height: 38, borderRadius: 10, background: `var(--${accent})`, color: '#fff',
        display: 'grid', placeItems: 'center', flexShrink: 0,
      }}>
        <Icon name="plus" size={20} color="#fff" />
      </span>
      <span>
        <span className="serif" style={{ fontWeight: 700, fontSize: 15, display: 'block' }}>New tailored CV</span>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>draw a reading for this POV</span>
      </span>
    </button>
  );
}

interface PovGroupProps {
  base: BaseCV;
  pov: Pov;
  idx: number;
  onNewCv: (pov: Pov) => void;
  onPreview: (pov: Pov, cv: TrimmedCV) => void;
  onEdit: (pov: Pov, cv: TrimmedCV) => void;
  onExport: (pov: Pov, cv: TrimmedCV) => void;
  onDeletePov: (pov: Pov) => void;
  onDeleteCv: (pov: Pov, cv: TrimmedCV) => void;
}

function PovGroup({ base, pov, idx, onNewCv, onPreview, onEdit, onExport, onDeletePov, onDeleteCv }: PovGroupProps) {
  return (
    <section className="sv-enter" style={{ marginTop: idx === 0 ? 0 : 36, animationDelay: `${idx * 60}ms` }}>
      <div className="pov-group-header" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{
          width: 11, height: 11, borderRadius: 3, background: `var(--${pov.accent})`,
          boxShadow: '1.5px 1.5px 0 var(--ink)', flexShrink: 0,
        }} />
        <h3 className="serif" style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-.01em' }}>{pov.name}</h3>
        <Chip>{pov.cvs.length} {pov.cvs.length === 1 ? 'CV' : 'CVs'}</Chip>
        <span className="muted" style={{ fontSize: 13, marginLeft: 2 }}>{pov.desc}</span>
        <div style={{ flex: 1 }} />
        <div className="pov-header-actions" style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn--sm btn--ghost" onClick={() => onNewCv(pov)}>
            <Icon name="plus" size={14} /> New CV
          </button>
          <button className="btn btn--sm btn--ghost" onClick={() => onDeletePov(pov)} title="Delete POV"
            style={{ color: 'var(--ink-faint)' }}>
            <Icon name="trash" size={14} />
          </button>
        </div>
      </div>
      <div className="pov-cv-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {pov.cvs.map((cv) => (
          <CvCard key={cv.id} base={base} pov={pov} cv={cv}
            onPreview={onPreview} onEdit={onEdit} onExport={onExport} onDelete={onDeleteCv} />
        ))}
        <NewCvCard accent={pov.accent} onClick={() => onNewCv(pov)} />
      </div>
    </section>
  );
}

/* ---- Base CV banner ---- */
interface BaseCardProps {
  base: BaseCV;
  empty: boolean;
  onEdit: () => void;
  highlight?: boolean;
}

function BaseCard({ base, empty, onEdit, highlight }: BaseCardProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allEntries: any[] = empty ? [] : [
    ...base.work, ...base.education, ...base.portfolio,
    ...base.other, ...base.certs, ...base.skills, ...base.languages,
  ];
  const entryCount = allEntries.length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variationCount = allEntries.filter((e: any) => Array.isArray(e.versions) && e.versions.length >= 2).length;
  return (
    <div className="grain" style={{
      position: 'relative', overflow: 'hidden',
      background: 'var(--night)', color: 'var(--paper)', borderRadius: 'var(--r-lg)', padding: '30px 34px',
      boxShadow: highlight ? '0 0 0 3px var(--yellow), var(--shadow-lg)' : 'var(--shadow)',
      transition: 'box-shadow .3s ease',
    }}>
      <span aria-hidden style={{
        position: 'absolute', right: -40, top: -90, fontFamily: 'var(--serif)',
        fontWeight: 800, fontSize: 300, lineHeight: .8, color: 'rgba(244,236,219,.05)',
      }}>Σ</span>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
        <div className="base-card-inner" style={{ flex: 1, minWidth: 280 }}>
          <div className="kicker" style={{ color: 'var(--yellow)' }}>Source of Record</div>
          <h2 className="serif" style={{
            fontSize: 30, fontWeight: 800, marginTop: 10, color: 'var(--paper)', letterSpacing: '-.01em',
          }}>Your Base CV</h2>
          <p className="serif" style={{
            fontSize: 15, lineHeight: 1.5, color: 'rgba(244,236,219,.72)', margin: '8px 0 0', maxWidth: 520,
          }}>
            {empty
              ? 'The canonical record of everything you\'ve done. Every tailored CV is drawn from this — so start here.'
              : 'Everything you\'ve done, kept in one honest place. Every POV below draws its readings from this record.'}
          </p>
          <div style={{ display: 'flex', gap: 22, marginTop: 20, alignItems: 'center' }}>
            <button className="btn btn--lg"
              style={{ background: 'var(--yellow)', borderColor: 'var(--paper)', color: 'var(--ink)' }}
              onClick={onEdit}>
              <Icon name={empty ? 'plus' : 'pencil'} size={18} color="var(--ink)" />
              {empty ? 'Create your Base CV' : 'Edit Base CV'}
            </button>
            {!empty && (
              <div style={{ display: 'flex', gap: 24 }}>
                <Stat n={entryCount} label="entries" />
                <Stat n={variationCount} label="variations" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ n, label }: { n: number | string; label: string }) {
  return (
    <div>
      <div className="serif" style={{ fontSize: 26, fontWeight: 800, color: 'var(--paper)', lineHeight: 1 }}>{n}</div>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(244,236,219,.5)', marginTop: 5 }}>
        {label}
      </div>
    </div>
  );
}

/* ---- Tutorial overlay ---- */
interface TutorialProps {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}

function Tutorial({ step, onNext, onSkip }: TutorialProps) {
  const steps = [
    { title: 'Welcome to Summa Vitae', body: 'This is your studio. Everything starts with one canonical record of your career — your Base CV.', cta: 'Show me' },
    { title: 'Step 1 — Build your Base CV', body: 'Pour in everything: roles, projects, education, skills. Don\'t edit for any one job yet. Be exhaustive — you\'ll trim later.', cta: 'Got it' },
    { title: 'Step 2 — Create a POV', body: 'A POV is a lens — usually a job title you\'re pursuing. Inside it you compose tailored CVs that pull only the relevant parts of your record.', cta: 'Finish' },
  ];
  const s = steps[step];
  if (!s) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(22,18,14,.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div className="card sv-pop grain" style={{
        position: 'relative', overflow: 'hidden', maxWidth: 460,
        padding: '34px 34px 28px', borderColor: 'var(--ink)', borderWidth: 2, boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span className="mono" style={{ fontSize: 10.5, letterSpacing: '.2em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
              Getting started · {step + 1} / {steps.length}
            </span>
          </div>
          <h3 className="serif" style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-.01em' }}>{s.title}</h3>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink-soft)', marginTop: 10 }}>{s.body}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 24 }}>
            {steps.map((_, i) => (
              <span key={i} style={{
                width: i === step ? 22 : 8, height: 8, borderRadius: 99,
                background: i === step ? 'var(--pink)' : 'var(--line-strong)', transition: 'all .2s',
              }} />
            ))}
            <div style={{ flex: 1 }} />
            <button className="btn btn--sm btn--ghost" onClick={onSkip}>Skip</button>
            <button className="btn btn--sm btn--primary" onClick={onNext}>{s.cta}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Main Home screen ---- */
interface HomeProps {
  base: BaseCV;
  povs: Pov[];
  empty: boolean;
  onEditBase: () => void;
  onNewPov: () => void;
  onNewCv: (pov: Pov) => void;
  onPreview: (pov: Pov, cv: TrimmedCV) => void;
  onEdit: (pov: Pov, cv: TrimmedCV) => void;
  onExport: (pov: Pov, cv: TrimmedCV) => void;
  onDeletePov: (pov: Pov) => void;
  onDeleteCv: (pov: Pov, cv: TrimmedCV) => void;
}

export function Home({ base, povs, empty, onEditBase, onNewPov, onNewCv, onPreview, onEdit, onExport, onDeletePov, onDeleteCv }: HomeProps) {
  const [tour, setTour] = useState(empty ? 0 : -1);
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="home-content-wrap" style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 44px 120px' }}>
      <div className="sv-enter" style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        gap: 20, marginBottom: 28, flexWrap: 'wrap',
      }}>
        <div>
          <div className="kicker">{greet}</div>
          <h1 className="serif" style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-.02em', marginTop: 8 }}>
            {base.general.name ? `${base.general.name.split(' ')[0]}'s studio` : 'My Studio'}
          </h1>
        </div>
        <button className="btn btn--accent" onClick={onNewPov}>
          <Icon name="plus" size={16} color="#fff" /> New POV
        </button>
      </div>

      <BaseCard base={base} empty={empty} onEdit={onEditBase} highlight={empty && tour === 1} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '44px 0 4px' }}>
        <h2 className="serif" style={{
          fontSize: 15, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--ink-soft)',
        }}>Points of View</h2>
        <hr className="divider" style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{povs.length} lenses</span>
      </div>

      {empty ? (
        <div style={{
          textAlign: 'center', padding: '64px 20px', border: '1.5px dashed var(--line-strong)',
          borderRadius: 'var(--r-lg)', marginTop: 18,
        }}>
          <div style={{ opacity: .5, marginBottom: 12 }}><Icon name="folder" size={34} /></div>
          <p className="serif" style={{ fontSize: 18, fontWeight: 700 }}>No points of view yet.</p>
          <p className="muted" style={{ fontSize: 13.5, maxWidth: 360, margin: '6px auto 18px' }}>
            Build your Base CV first — then create a POV and start drawing tailored readings from it.
          </p>
          <button className="btn btn--ghost" disabled>
            <Icon name="plus" size={14} /> New POV
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 18 }}>
          {povs.map((pov, i) => (
            <PovGroup key={pov.id} base={base} pov={pov} idx={i}
              onNewCv={onNewCv} onPreview={onPreview} onEdit={onEdit} onExport={onExport}
              onDeletePov={onDeletePov} onDeleteCv={onDeleteCv} />
          ))}
        </div>
      )}

      {tour >= 0 && (
        <Tutorial step={tour}
          onNext={() => setTour((t) => (t >= 2 ? -1 : t + 1))}
          onSkip={() => setTour(-1)} />
      )}
    </div>
  );
}
