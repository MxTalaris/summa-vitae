import { Fragment, useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Chip, Kicker, SECTION_META } from '../components/primitives';
import { FitPaper, defaultSelForFocus, pickItems, SECTION_TITLES, CVDocument } from '../cv/CVRenderer';
import { CV_STYLES } from '../data/seed';
import type { BaseCV, Pov, CvSelection, BuilderDraft, BuildStep, CvStyleId, TrimmedCV } from '../types';

const COMPOSE_ORDER = ['work', 'education', 'portfolio', 'other', 'certs', 'skills', 'languages'];

function itemLabel(section: string, it: Record<string, unknown>): { main: string; sub: string } {
  switch (section) {
    case 'work':      return { main: it.role as string, sub: `${it.org} · ${it.start}–${it.end}` };
    case 'education': return { main: it.degree as string, sub: it.org as string };
    case 'portfolio': return { main: it.name as string, sub: `${it.role} · ${it.year}` };
    case 'other':     return { main: it.title as string, sub: `${it.org} · ${it.period}` };
    case 'certs':     return { main: it.name as string, sub: `${it.org} · ${it.year}` };
    case 'skills':    return { main: it.group as string, sub: `${(it.items as unknown[]).length} skills` };
    case 'languages': return { main: it.name as string, sub: it.level as string };
    default:          return { main: '', sub: '' };
  }
}

/* ---- STEP 1: Style picker ---- */
interface StyleCardProps {
  base: BaseCV;
  style: typeof CV_STYLES[0];
  accent: string;
  selected: boolean;
  onPick: (id: CvStyleId) => void;
}

function StyleCard({ base, style, accent, selected, onPick }: StyleCardProps) {
  const sel = defaultSelForFocus(base, accent === 'blue' ? 'fe' : 'pm');
  return (
    <button onClick={() => onPick(style.id)} className="sv-pop" style={{
      cursor: 'pointer', textAlign: 'left', padding: 0,
      border: selected ? '2.5px solid var(--ink)' : '1.5px solid var(--line-strong)',
      borderRadius: 'var(--r-lg)', background: 'var(--card)', overflow: 'hidden',
      boxShadow: selected ? '4px 4px 0 var(--ink)' : 'var(--shadow-sm)', transition: 'all .15s',
    }}>
      <div style={{ height: 230, overflow: 'hidden', background: '#e8e0cf', display: 'flex', justifyContent: 'center', paddingTop: 18, position: 'relative' }}>
        <div style={{ width: 794 * 0.30, height: 1123 * 0.30, overflow: 'hidden', background: '#fff', boxShadow: '0 8px 24px -8px rgba(0,0,0,.4)' }}>
          <div style={{ transform: 'scale(0.30)', transformOrigin: 'top left', width: 794, ['--mono-accent' as string]: `var(--${accent})` }}>
            <CVDocument base={base} style={style.id} sel={sel} />
          </div>
        </div>
        {selected && (
          <span style={{ position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: 99, background: 'var(--ink)', color: 'var(--paper)', display: 'grid', placeItems: 'center' }}>
            <Icon name="check" size={16} color="var(--paper)" />
          </span>
        )}
      </div>
      <div style={{ padding: '16px 18px 18px', borderTop: '1.5px solid var(--line)' }}>
        <h3 className="serif" style={{ fontSize: 19, fontWeight: 800 }}>{style.name}</h3>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.45, margin: '7px 0 10px' }}>{style.blurb}</p>
        <Chip>{style.best}</Chip>
      </div>
    </button>
  );
}

interface CreationStepProps {
  base: BaseCV;
  povs: Pov[];
  draft: BuilderDraft;
  setDraft: (d: BuilderDraft) => void;
  onContinue: () => void;
}

function CreationStep({ base, povs, draft, setDraft, onContinue }: CreationStepProps) {
  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '36px 44px 80px' }}>
      <div className="sv-enter">
        <Kicker>Step 1 — choose a reading</Kicker>
        <h1 className="serif" style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-.02em', marginTop: 10 }}>
          How should this CV read?
        </h1>
        <p className="serif" style={{ fontSize: 16, color: 'var(--ink-soft)', marginTop: 8, maxWidth: 560 }}>
          Pick a style — it sets the typography and layout of the printed document. You can change it any time; your content stays untouched.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 26, flexWrap: 'wrap' }}>
        <div className="field" style={{ flex: 1, minWidth: 220 }}>
          <label>Point of view</label>
          <select className="input" value={draft.povId} onChange={(e) => {
            const pov = povs.find((p) => p.id === e.target.value);
            setDraft({ ...draft, povId: e.target.value, accent: pov?.accent || 'pink' });
          }}>
            {povs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="field" style={{ flex: 2, minWidth: 260 }}>
          <label>CV name</label>
          <input className="input" value={draft.name} placeholder="e.g. Senior PM — Developer Platforms"
            onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </div>
      </div>

      <div className="kicker" style={{ marginTop: 30, marginBottom: 14 }}>Styles · {CV_STYLES.length}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
        {CV_STYLES.map((s) => (
          <StyleCard key={s.id} base={base} style={s} accent={draft.accent}
            selected={draft.style === s.id} onPick={(id) => setDraft({ ...draft, style: id })} />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 34 }}>
        <button className="btn btn--primary btn--lg" disabled={!draft.style || !draft.name} onClick={onContinue}>
          Compose content <Icon name="arrowR" size={18} color="var(--paper)" />
        </button>
      </div>
    </div>
  );
}

/* ---- STEP 2: Compose ---- */
interface AddPickerProps {
  base: BaseCV;
  section: string;
  sel: CvSelection;
  onAdd: (id: string) => void;
  onClose: () => void;
}

function AddPicker({ base, section, sel, onAdd, onClose }: AddPickerProps) {
  const included = (sel[section] as string[]) || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const all = ((base as any)[section] as { id: string }[]) || [];
  const avail = all.filter((it) => !included.includes(it.id));

  return (
    <div className="card sv-pop" style={{ marginTop: 8, padding: 10, borderColor: 'var(--ink)', boxShadow: 'var(--shadow)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 6px 8px' }}>
        <span className="mono" style={{ fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
          From your Base CV · {SECTION_TITLES[section]}
        </span>
        <Icon name="x" size={14} style={{ cursor: 'pointer' }} onClick={onClose} />
      </div>
      {avail.length === 0 ? (
        <div style={{ padding: '14px 8px', textAlign: 'center' }} className="muted">
          <span className="mono" style={{ fontSize: 12 }}>Everything from this section is already in.</span>
        </div>
      ) : avail.map((it) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lab = itemLabel(section, it as any);
        return (
          <button key={it.id} onClick={() => onAdd(it.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
            border: 0, borderRadius: 7, cursor: 'pointer', background: 'transparent', textAlign: 'left', transition: 'background .1s',
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--paper-2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            <span style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--teal)', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Icon name="plus" size={14} color="#fff" />
            </span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lab.main}</span>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>{lab.sub}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface ComposeSectionProps {
  base: BaseCV;
  section: string;
  sel: CvSelection;
  setSel: (sel: CvSelection) => void;
}

function ComposeSection({ base, section, sel, setSel }: ComposeSectionProps) {
  const [open, setOpen] = useState(false);
  const m = SECTION_META[section];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseAny = base as any;
  const ids = (sel[section] as string[]) || [];
  const included = ids
    .map((id) => (baseAny[section] as { id: string }[] || []).find((x: { id: string }) => x.id === id))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter(Boolean) as any[];

  const add = (id: string) => setSel({ ...sel, [section]: [...ids, id] } as CvSelection);
  const remove = (id: string) => setSel({ ...sel, [section]: ids.filter((x) => x !== id) } as CvSelection);

  return (
    <div style={{ marginBottom: 14, borderBottom: '1.5px solid var(--line)', paddingBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
        <Icon name={m.icon} size={15} color={`var(--${m.tone})`} />
        <span className="serif" style={{ fontSize: 15, fontWeight: 800 }}>{SECTION_TITLES[section]}</span>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>{included.length}</span>
        <div style={{ flex: 1 }} />
        <button className="iconbtn" style={{ width: 28, height: 28 }} title="Add from Base CV" onClick={() => setOpen((o) => !o)}>
          <Icon name={open ? 'minus' : 'plus'} size={15} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {included.map((it) => {
          const lab = itemLabel(section, it);
          return (
            <div key={it.id as string} className="row" style={{ gap: 8, padding: '6px 8px', borderRadius: 7, background: 'var(--paper)', border: '1.5px solid var(--line-strong)' }}>
              <Icon name="grip" size={14} color="var(--ink-faint)" />
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lab.main}</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)' }}>{lab.sub}</span>
              </span>
              <Icon name="x" size={13} style={{ cursor: 'pointer', opacity: .5 }} onClick={() => remove(it.id as string)} />
            </div>
          );
        })}
        {included.length === 0 && (
          <button onClick={() => setOpen(true)} className="mono" style={{
            fontSize: 11.5, color: 'var(--ink-faint)', border: '1.5px dashed var(--line-strong)',
            borderRadius: 7, padding: '8px', cursor: 'pointer', background: 'transparent', textAlign: 'center',
          }}>
            <Icon name="plus" size={12} /> nothing here yet — pull from your record
          </button>
        )}
      </div>
      {open && <AddPicker base={base} section={section} sel={sel} onAdd={add} onClose={() => setOpen(false)} />}
    </div>
  );
}

interface ComposeStepProps {
  base: BaseCV;
  draft: BuilderDraft;
  sel: CvSelection;
  setSel: (sel: CvSelection) => void;
}

function ComposeStep({ base, draft, sel, setSel }: ComposeStepProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '390px 1fr', height: '100%', minHeight: 0 }}>
      <div style={{ borderRight: '1.5px solid var(--line)', overflowY: 'auto', padding: '24px 22px 80px', background: 'var(--paper-2)' }}>
        <Kicker>Step 2 — compose</Kicker>
        <h2 className="serif" style={{ fontSize: 23, fontWeight: 800, marginTop: 8, letterSpacing: '-.01em' }}>
          Pull from your record
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, margin: '8px 0 18px' }}>
          Hit <Icon name="plus" size={12} style={{ verticalAlign: '-1px' }} /> on any section to add entries from your Base CV.
        </p>

        <div className="row" style={{ gap: 8, padding: '10px 12px', borderRadius: 8, background: 'var(--card)', border: '1.5px solid var(--line-strong)', marginBottom: 18 }}>
          <Icon name="user" size={15} color="var(--pink)" />
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>Professional summary</span>
          <button className="twk-toggle" data-on={sel.summary !== false ? '1' : '0'}
            style={{ cursor: 'pointer' }}
            onClick={() => setSel({ ...sel, summary: !sel.summary })}><i /></button>
        </div>

        {COMPOSE_ORDER.map((s) => (
          <ComposeSection key={s} base={base} section={s} sel={sel} setSel={setSel} />
        ))}
      </div>

      <div style={{ overflowY: 'auto', background: '#e8e0cf', padding: '32px 40px 80px' }}>
        <div className="row" style={{ justifyContent: 'center', gap: 10, marginBottom: 18 }}>
          <Chip tone="blue"><Icon name="eye" size={12} /> Live preview</Chip>
          <Chip>{(CV_STYLES.find((x) => x.id === draft.style) || {}).name}</Chip>
        </div>
        <FitPaper base={base} style={draft.style as CvStyleId} sel={sel} accent={draft.accent} />
      </div>
    </div>
  );
}

/* ---- STEP 3: Export ---- */
function buildATS(base: BaseCV, sel: CvSelection): string {
  const g = base.general;
  const out: string[] = [];
  out.push(g.name.toUpperCase());
  out.push(g.title);
  out.push([g.location, g.email, g.phone].filter(Boolean).join(' | '));
  out.push((g.links || []).map((l) => l.label).join(' | '));
  if (sel.summary !== false) { out.push('', 'SUMMARY', g.summary); }
  COMPOSE_ORDER.forEach((section) => {
    const items = pickItems(base, section as keyof BaseCV, sel) as Record<string, unknown>[];
    if (!items.length) return;
    out.push('', (SECTION_TITLES[section] || section).toUpperCase());
    items.forEach((it) => {
      const lab = itemLabel(section, it);
      if (section === 'work') {
        out.push(`${it.role} — ${it.org}, ${it.location} (${it.start}–${it.end})`);
        ((it.bullets as string[]) || []).forEach((b) => out.push('- ' + b));
      } else if (section === 'skills') {
        out.push(`${it.group}: ${(it.items as { name: string }[]).map((s) => s.name).join(', ')}`);
      } else {
        out.push(`${lab.main} — ${lab.sub}`);
        if (it.desc) out.push('  ' + it.desc);
        if (it.note) out.push('  ' + it.note);
      }
    });
  });
  return out.join('\n');
}

interface ExportStepProps {
  base: BaseCV;
  draft: BuilderDraft;
  sel: CvSelection;
  readyToSend: boolean;
  onReadyChange: (v: boolean) => void;
}

function ExportStep({ base, draft, sel, readyToSend, onReadyChange }: ExportStepProps) {
  const [showATS, setShowATS] = useState(false);
  const styleName = (CV_STYLES.find((x) => x.id === draft.style) || {}).name;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', height: '100%', minHeight: 0 }}>
      <div style={{ overflowY: 'auto', background: '#dcd3c0', padding: '40px 48px 90px' }}>
        <FitPaper base={base} style={draft.style as CvStyleId} sel={sel} accent={draft.accent} />
      </div>

      <div style={{ borderLeft: '1.5px solid var(--line)', overflowY: 'auto', padding: '28px 26px 80px', background: 'var(--card)' }}>
        <Kicker>Step 3 — export</Kicker>
        <h2 className="serif" style={{ fontSize: 23, fontWeight: 800, marginTop: 8, letterSpacing: '-.01em' }}>
          Ready to send
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '8px 0 6px' }}>
          <div className="row" style={{ gap: 10, fontSize: 13 }}>
            <span className="muted" style={{ width: 70 }}>Reading</span><Chip>{styleName}</Chip>
          </div>
          <div className="row" style={{ gap: 10, fontSize: 13 }}>
            <span className="muted" style={{ width: 70 }}>Format</span>
            <span style={{ fontWeight: 600 }}>A4 · PDF</span>
          </div>
        </div>

        <label style={{
          display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          margin: '16px 0 0', padding: '12px 14px',
          border: '1.5px solid var(--line-strong)', borderRadius: 'var(--r)', background: 'var(--paper)',
        }}>
          <input type="checkbox" checked={readyToSend} onChange={(e) => onReadyChange(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>Tag this CV as ready</div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)', marginTop: 2 }}>
              {readyToSend ? 'Will be saved as Ready' : 'Will be saved as Draft'}
            </div>
          </div>
        </label>

        <button className="btn btn--primary btn--lg" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }}>
          <Icon name="download" size={18} color="var(--paper)" /> Download PDF
        </button>
        <button className="btn btn--ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
          <Icon name="link" size={15} /> Copy shareable link
        </button>

        <div className="grain" style={{
          position: 'relative', overflow: 'hidden', marginTop: 26,
          background: 'var(--night)', color: 'var(--paper)', borderRadius: 'var(--r-lg)', padding: '18px 18px 16px',
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="row" style={{ gap: 9 }}>
              <Icon name="bot" size={18} color="var(--yellow)" />
              <span className="serif" style={{ fontWeight: 800, fontSize: 15, color: 'var(--paper)' }}>Hidden ATS layer</span>
              <span className="chip chip--teal" style={{ marginLeft: 'auto' }}>
                <Icon name="check" size={11} /> on
              </span>
            </div>
            <p style={{ fontSize: 12.5, lineHeight: 1.5, color: 'rgba(244,236,219,.72)', margin: '10px 0 12px' }}>
              We embed a clean, machine-readable copy behind the styled document. ATS bots parse this; humans see the design above.
            </p>
            <button className="btn btn--sm" style={{ background: 'transparent', color: 'var(--paper)', borderColor: 'rgba(244,236,219,.4)', boxShadow: 'none' }}
              onClick={() => setShowATS((s) => !s)}>
              <Icon name={showATS ? 'eye' : 'doc'} size={13} color="var(--paper)" />
              {showATS ? 'Hide' : 'Inspect'} machine copy
            </button>
          </div>
        </div>

        {showATS && (
          <pre className="mono sv-pop" style={{
            marginTop: 12, background: '#16120e', color: '#cfe8d8',
            fontSize: 10.5, lineHeight: 1.55, padding: 14, borderRadius: 8, overflow: 'auto', maxHeight: 320, whiteSpace: 'pre-wrap',
          }}>{buildATS(base, sel)}</pre>
        )}
      </div>
    </div>
  );
}

/* ---- Wizard shell ---- */
const BUILD_STEPS: [BuildStep, string][] = [['create', 'Style'], ['compose', 'Compose'], ['export', 'Export']];

interface TrimmedBuilderInit {
  povId: string;
  step: BuildStep;
  name?: string;
  style?: CvStyleId | '';
  cvId?: string;
}

interface TrimmedBuilderProps {
  base: BaseCV;
  povs: Pov[];
  init: TrimmedBuilderInit;
  onExit: () => void;
  onSave: (povId: string, cv: TrimmedCV) => void;
}

export function TrimmedBuilder({ base, povs, init, onExit, onSave }: TrimmedBuilderProps) {
  const startPov = povs.find((p) => p.id === init.povId) || povs[0];
  const [draft, setDraft] = useState<BuilderDraft>({
    povId: startPov.id,
    accent: startPov.accent,
    name: init.name || '',
    style: init.style || '',
  });
  const [step, setStep] = useState<BuildStep>(init.step || 'create');
  const [sel, setSel] = useState<CvSelection | null>(null);
  // Stable id for this session: reuse existing cv id or mint one once
  const [cvId] = useState(() => init.cvId || `cv-${Date.now()}`);
  const [readyToSend, setReadyToSend] = useState(true);

  useEffect(() => {
    const pov = povs.find((p) => p.id === draft.povId) || povs[0];
    if (pov.accent !== draft.accent) setDraft((d) => ({ ...d, accent: pov.accent }));
  }, [draft.povId]);

  useEffect(() => {
    if ((step === 'compose' || step === 'export') && !sel) {
      const pov = povs.find((p) => p.id === draft.povId) || povs[0];
      setSel(defaultSelForFocus(base, pov.focus));
    }
  }, [step]);

  const idx = BUILD_STEPS.findIndex(([k]) => k === step);
  const canNext = step === 'create' ? !!(draft.style && draft.name) : true;
  const canSave = !!(draft.style && draft.name);
  const goNext = () => setStep(BUILD_STEPS[Math.min(2, idx + 1)][0]);
  const goPrev = () => { if (idx === 0) onExit(); else setStep(BUILD_STEPS[idx - 1][0]); };

  const buildCv = (status: 'draft' | 'ready'): TrimmedCV => {
    const currentSel = sel || defaultSelForFocus(base, (povs.find((p) => p.id === draft.povId) || povs[0]).focus);
    const activeSections = COMPOSE_ORDER.filter((s) => ((currentSel[s] as string[]) || []).length > 0);
    return {
      id: cvId,
      name: draft.name,
      role: draft.name,
      style: draft.style as CvStyleId,
      updated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      status,
      pages: 1,
      sections: activeSections.length,
      selection: currentSel,
    };
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
      {/* Top bar with stepper */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 18, padding: '14px 26px',
        borderBottom: '1.5px solid var(--line)', background: 'var(--card)', flexShrink: 0,
      }}>
        <button className="iconbtn" onClick={onExit} title="Back to studio"><Icon name="x" size={18} /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {BUILD_STEPS.map(([k, label], i) => (
            <Fragment key={k}>
              {i > 0 && <span style={{ width: 22, height: 1.5, background: i <= idx ? 'var(--ink)' : 'var(--line-strong)' }} />}
              <button onClick={() => (i < idx || canNext ? setStep(k) : undefined)} style={{
                display: 'flex', alignItems: 'center', gap: 8, border: 0, background: 'transparent', cursor: 'pointer', padding: '4px 4px',
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 99, display: 'grid', placeItems: 'center',
                  fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
                  background: i === idx ? 'var(--ink)' : i < idx ? 'var(--teal)' : 'transparent',
                  color: i <= idx ? 'var(--paper)' : 'var(--ink-faint)',
                  border: i > idx ? '1.5px solid var(--line-strong)' : '0',
                }}>
                  {i < idx ? <Icon name="check" size={13} color="var(--paper)" /> : i + 1}
                </span>
                <span className="mono" style={{
                  fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase',
                  fontWeight: i === idx ? 700 : 500, color: i === idx ? 'var(--ink)' : 'var(--ink-faint)',
                }}>{label}</span>
              </button>
            </Fragment>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-faint)', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {draft.name || 'Untitled CV'}
        </span>
        {canSave && (
          <button className="btn btn--sm btn--ghost" onClick={() => onSave(draft.povId, buildCv('draft'))} title="Save as draft">
            <Icon name="doc" size={14} /> Save Draft
          </button>
        )}
        {step !== 'create' && (
          <button className="btn btn--sm btn--ghost" onClick={goPrev}>
            <Icon name="arrowL" size={14} /> Back
          </button>
        )}
        {step !== 'export'
          ? <button className="btn btn--sm btn--primary" disabled={!canNext} onClick={goNext}>
              Next <Icon name="arrowR" size={14} color="var(--paper)" /></button>
          : <button className="btn btn--sm btn--accent" onClick={() => { onSave(draft.povId, buildCv(readyToSend ? 'ready' : 'draft')); onExit(); }}>
              <Icon name="check" size={14} color="#fff" /> Save to studio</button>}
      </header>

      <div style={{ flex: 1, minHeight: 0, overflow: step === 'create' ? 'auto' : 'hidden' }}>
        {step === 'create' && (
          <CreationStep base={base} povs={povs} draft={draft} setDraft={setDraft} onContinue={goNext} />
        )}
        {step === 'compose' && sel && (
          <ComposeStep base={base} draft={draft} sel={sel} setSel={setSel} />
        )}
        {step === 'export' && sel && (
          <ExportStep base={base} draft={draft} sel={sel} readyToSend={readyToSend} onReadyChange={setReadyToSend} />
        )}
      </div>
    </div>
  );
}
