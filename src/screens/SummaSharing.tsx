import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Chip, Kicker, ToggleSwitch } from '../components/primitives';
import { FitPaper, defaultSelForFocus } from '../cv/CVRenderer';
import { CV_STYLES } from '../data/seed';
import type { BaseCV, Pov, TrimmedCV, CvStyleId } from '../types';

interface FlatCV extends TrimmedCV {
  uid: string;
  pov: Pov;
}

interface RecruiterViewerProps {
  base: BaseCV;
  included: FlatCV[];
}

function RecruiterViewer({ base, included }: RecruiterViewerProps) {
  const [tab, setTab] = useState(included[0]?.uid || null);

  useEffect(() => {
    if (!included.find((c) => c.uid === tab)) {
      setTab(included[0]?.uid || null);
    }
  }, [included.map((c) => c.uid).join('|')]);

  const active = included.find((c) => c.uid === tab) || included[0];

  return (
    <div style={{ border: '1.5px solid var(--ink)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow)', background: '#fff' }}>
      {/* Browser chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--night)', borderBottom: '1.5px solid #000' }}>
        <div style={{ display: 'flex', gap: 7 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <span key={c} style={{ width: 11, height: 11, borderRadius: 99, background: c }} />
          ))}
        </div>
        <div className="mono" style={{
          flex: 1, background: '#000', color: 'rgba(244,236,219,.66)',
          borderRadius: 7, padding: '6px 12px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 7,
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        }}>
          <Icon name="lock" size={11} color="var(--teal)" /> summa.cv/s/your-share-link
        </div>
        <span className="chip chip--teal" style={{ background: 'rgba(15,174,142,.16)', color: '#7fe6cf', borderColor: 'rgba(15,174,142,.5)' }}>
          <Icon name="users" size={11} color="#7fe6cf" /> Recruiter view
        </span>
      </div>

      {included.length === 0 ? (
        <div style={{ padding: '80px 30px', textAlign: 'center', background: 'var(--paper)' }}>
          <div style={{ opacity: .4, marginBottom: 10 }}><Icon name="share" size={32} /></div>
          <p className="serif" style={{ fontSize: 17, fontWeight: 700 }}>Nothing shared yet.</p>
          <p className="muted" style={{ fontSize: 13, maxWidth: 320, margin: '6px auto 0' }}>
            Flip on a CV from the left and it appears here as a tab the recruiter can open.
          </p>
        </div>
      ) : (
        <>
          {/* Tab strip */}
          <div style={{
            display: 'flex', gap: 0, background: 'var(--paper-2)', padding: '0 8px',
            borderBottom: '1.5px solid var(--line)', overflowX: 'auto',
          }}>
            {included.map((c) => {
              const on = c.uid === active?.uid;
              return (
                <button key={c.uid} onClick={() => setTab(c.uid)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
                  border: 0, borderBottom: on ? '2.5px solid var(--ink)' : '2.5px solid transparent',
                  marginBottom: -1.5, cursor: 'pointer', background: 'transparent', whiteSpace: 'nowrap',
                  fontFamily: 'var(--sans)', fontSize: 13, fontWeight: on ? 700 : 500,
                  color: on ? 'var(--ink)' : 'var(--ink-faint)',
                }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: `var(--${c.pov.accent})`, boxShadow: '1px 1px 0 var(--ink)' }} />
                  {c.name}
                </button>
              );
            })}
          </div>

          {/* Document */}
          {active && (
            <div style={{ background: '#e8e0cf', padding: '26px 26px 30px', maxHeight: 560, overflowY: 'auto' }}>
              <FitPaper
                base={base}
                style={active.style as CvStyleId}
                sel={defaultSelForFocus(base, active.pov.focus)}
                accent={active.pov.accent}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface SummaSharingProps {
  base: BaseCV;
  povs: Pov[];
  onBack: () => void;
}

export function SummaSharing({ base, povs, onBack }: SummaSharingProps) {
  const all: FlatCV[] = [];
  povs.forEach((p) => p.cvs.forEach((cv) => all.push({ ...cv, uid: `${p.id}::${cv.id}`, pov: p })));

  const [onIds, setOnIds] = useState<string[]>(() => all.slice(0, 3).map((c) => c.uid));
  const [copied, setCopied] = useState(false);

  const toggle = (uid: string) =>
    setOnIds((s) => (s.includes(uid) ? s.filter((x) => x !== uid) : [...s, uid]));

  const included = all.filter((c) => onIds.includes(c.uid));

  const copy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
      {/* Top bar */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '16px 28px',
        borderBottom: '1.5px solid var(--line)', background: 'var(--card)', flexShrink: 0,
      }}>
        <button className="iconbtn" onClick={onBack} title="Back to studio"><Icon name="arrowL" size={18} /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 30, height: 30, borderRadius: 9, background: 'var(--accent)', color: '#fff',
            display: 'grid', placeItems: 'center', boxShadow: '2px 2px 0 var(--ink)',
          }}>
            <Icon name="share" size={17} color="#fff" />
          </span>
          <div>
            <div className="serif" style={{ fontWeight: 800, fontSize: 17, lineHeight: 1 }}>Summa Sharing</div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--ink-faint)', marginTop: 3 }}>
              One link · many readings
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <span className="chip">{included.length} of {all.length} shared</span>
      </header>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '390px 1fr', minHeight: 0 }}>
        {/* Selection rail */}
        <div style={{ borderRight: '1.5px solid var(--line)', overflowY: 'auto', padding: '26px 22px 80px', background: 'var(--paper-2)' }}>
          <Kicker>Choose what to share</Kicker>
          <h2 className="serif" style={{ fontSize: 23, fontWeight: 800, marginTop: 8, letterSpacing: '-.01em' }}>
            Pick the readings
          </h2>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, margin: '8px 0 20px' }}>
            Flip on any finished CV. Whoever opens your link can switch between exactly these — and nothing else.
          </p>

          {/* Human-not-bot callout */}
          <div className="card" style={{ display: 'flex', gap: 12, padding: '13px 14px', marginBottom: 22, borderColor: 'var(--accent)', background: '#fff' }}>
            <span style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center' }}>
              <Icon name="user" size={17} color="#fff" />
            </span>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 3 }}>Best for human eyes</div>
              <p style={{ fontSize: 11.5, lineHeight: 1.5, color: 'var(--ink-soft)', margin: 0 }}>
                Recommended when you're sure your CVs will be seen by a person, not a bot. Tracking software
                can't switch tabs — for those, export the ATS-friendly PDF instead.
              </p>
            </div>
          </div>

          {povs.filter((p) => p.cvs.length > 0).map((p) => (
            <div key={p.id} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: `var(--${p.accent})`, boxShadow: '1px 1px 0 var(--ink)' }} />
                <span className="mono" style={{ fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--ink-soft)' }}>
                  {p.name}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {p.cvs.map((cv) => {
                  const uid = `${p.id}::${cv.id}`;
                  const on = onIds.includes(uid);
                  const styleName = (CV_STYLES.find((s) => s.id === cv.style) || {}).name || cv.style;
                  return (
                    <div key={cv.id} onClick={() => toggle(uid)} style={{
                      display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 9, cursor: 'pointer',
                      border: on ? '1.5px solid var(--ink)' : '1.5px solid var(--line-strong)',
                      background: on ? 'var(--card)' : 'transparent',
                      boxShadow: on ? '2px 2px 0 var(--ink)' : 'none', transition: 'all .12s',
                    }}>
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cv.name}</span>
                        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)' }}>{styleName} · {cv.role}</span>
                      </span>
                      <ToggleSwitch on={on} onClick={(e) => { e.stopPropagation(); toggle(uid); }} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {all.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-faint)' }}>
              <Icon name="share" size={28} />
              <p className="mono" style={{ fontSize: 12, marginTop: 10 }}>No CVs yet — create some in Studio first.</p>
            </div>
          )}
        </div>

        {/* Preview + share */}
        <div style={{ overflowY: 'auto', padding: '28px 36px 80px' }}>
          {/* Share link bar */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px 12px 18px', marginBottom: 24, borderColor: 'var(--ink)', borderWidth: 1.5 }}>
            <Icon name="link" size={17} color="var(--accent)" />
            <span className="mono" style={{ flex: 1, fontSize: 13, color: 'var(--ink)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              summa.cv/s/your-share-link
            </span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>
              {included.length} {included.length === 1 ? 'reading' : 'readings'}
            </span>
            <button className={'btn btn--sm ' + (copied ? 'btn--accent' : 'btn--primary')} onClick={copy}>
              <Icon name={copied ? 'check' : 'copy'} size={14} color={copied ? '#fff' : 'var(--paper)'} />
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Chip tone="blue"><Icon name="eye" size={12} /> What the recruiter sees</Chip>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>
              they switch tabs freely — no login, no download wall
            </span>
          </div>

          <div style={{ maxWidth: 780 }}>
            <RecruiterViewer base={base} included={included} />
          </div>
        </div>
      </div>
    </div>
  );
}
