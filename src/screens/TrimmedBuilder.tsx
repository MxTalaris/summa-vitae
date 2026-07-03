import { Fragment, useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Chip, Kicker, SECTION_META } from '../components/primitives';
import { FitPaper, defaultSelForFocus, pickItems, SECTION_TITLES, CVDocument } from '../cv/CVRenderer';
import { COMPOSE_ORDER, itemLabel } from '../cv/ats';
import { downloadCvPdf, ATS_FRIENDLY_STYLES } from '../lib/pdf';
import { CV_STYLES } from '../data/seed';
import { useStore } from '../store/useStore';
import type { BaseCV, Pov, CvSelection, BuilderDraft, BuildStep, CvStyleId, TrimmedCV } from '../types';

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
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {style.best.split('|').map((tag, i) => <Chip key={i}>{tag.trim()}</Chip>)}
        </div>
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

/* ---- Version Picker Modal (Feature 2) ---- */
function MF({ label, value, onChange, area }: {
  label: string; value: string; onChange: (v: string) => void; area?: boolean;
}) {
  return (
    <div className="field">
      <label style={{ fontSize: 11 }}>{label}</label>
      {area
        ? <textarea className="textarea" value={value} onChange={(e) => onChange(e.target.value)} rows={4} />
        : <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}

function asStr(v: unknown): string {
  if (Array.isArray(v)) return v.join(', ');
  return String(v ?? '');
}
function asList(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  if (typeof v === 'string') return v.split('\n').filter(Boolean);
  return [];
}

function VersionPreview({ section, data }: { section: string; data: Record<string, unknown> }) {
  const row = (label: string, value: unknown) => value ? (
    <div style={{ marginBottom: 5 }}>
      <span className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', marginRight: 6 }}>{label}</span>
      <span style={{ fontSize: 13 }}>{asStr(value)}</span>
    </div>
  ) : null;

  return (
    <div style={{ padding: '4px 2px' }}>
      {section === 'work' && <>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{asStr(data.role)}</div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', marginBottom: 10 }}>
          {asStr(data.org)} · {asStr(data.start)}–{asStr(data.end)}{data.location ? ` · ${data.location}` : ''}
        </div>
        {data.blurb && <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '0 0 8px' }}>{asStr(data.blurb)}</p>}
        {asList(data.bullets).length > 0 && (
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, lineHeight: 1.55 }}>
            {asList(data.bullets).slice(0, 5).map((b, i) => <li key={i}>{b}</li>)}
            {asList(data.bullets).length > 5 && <li style={{ opacity: .4 }}>+{asList(data.bullets).length - 5} more</li>}
          </ul>
        )}
      </>}
      {section === 'education' && <>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{asStr(data.degree)}</div>
        {row('at', data.org)}{row('period', `${data.start}–${data.end}`)}{row('note', data.note)}
      </>}
      {section === 'portfolio' && <>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{asStr(data.name)}</div>
        {row('role', data.role)}{row('year', data.year)}
        {data.desc && <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '6px 0 0' }}>{asStr(data.desc)}</p>}
      </>}
      {section === 'other' && <>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{asStr(data.title)}</div>
        {row('at', data.org)}{row('when', data.period)}
        {data.desc && <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '6px 0 0' }}>{asStr(data.desc)}</p>}
      </>}
      {section === 'certs' && <>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{asStr(data.name)}</div>
        {row('issuer', data.org)}{row('year', data.year)}
      </>}
      {section === 'languages' && <>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{asStr(data.name)}</div>
        {row('level', data.level)}
      </>}
    </div>
  );
}

function CustomEntryForm({ section, data, setField }: {
  section: string;
  data: Record<string, unknown>;
  setField: (k: string, v: unknown) => void;
}) {
  const str = (k: string) => (Array.isArray(data[k]) ? (data[k] as string[]).join(k === 'bullets' ? '\n' : ', ') : String(data[k] ?? ''));
  const set = (k: string) => (v: string) => setField(k, v);

  if (section === 'work') return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <MF label="Role" value={str('role')} onChange={set('role')} />
        <MF label="Organisation" value={str('org')} onChange={set('org')} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginTop: 10 }}>
        <MF label="From" value={str('start')} onChange={set('start')} />
        <MF label="To" value={str('end')} onChange={set('end')} />
        <MF label="Location" value={str('location')} onChange={set('location')} />
        <MF label="Tags" value={str('tags')} onChange={set('tags')} />
      </div>
      <div style={{ marginTop: 10 }}><MF label="One-line summary" value={str('blurb')} onChange={set('blurb')} /></div>
      <div style={{ marginTop: 10 }}><MF label="Highlights (one per line)" value={str('bullets')} onChange={set('bullets')} area /></div>
    </>
  );

  if (section === 'education') return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <MF label="Degree / programme" value={str('degree')} onChange={set('degree')} />
        <MF label="Institution" value={str('org')} onChange={set('org')} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 12, marginTop: 10 }}>
        <MF label="From" value={str('start')} onChange={set('start')} />
        <MF label="To" value={str('end')} onChange={set('end')} />
        <MF label="Note" value={str('note')} onChange={set('note')} />
      </div>
    </>
  );

  if (section === 'portfolio') return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
        <MF label="Project" value={str('name')} onChange={set('name')} />
        <MF label="Role" value={str('role')} onChange={set('role')} />
        <MF label="Year" value={str('year')} onChange={set('year')} />
      </div>
      <div style={{ marginTop: 10 }}><MF label="Description" value={str('desc')} onChange={set('desc')} area /></div>
    </>
  );

  if (section === 'other') return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <MF label="What" value={str('title')} onChange={set('title')} />
        <MF label="Where" value={str('org')} onChange={set('org')} />
        <MF label="When" value={str('period')} onChange={set('period')} />
      </div>
      <div style={{ marginTop: 10 }}><MF label="Description" value={str('desc')} onChange={set('desc')} area /></div>
    </>
  );

  if (section === 'certs') return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
      <MF label="Certification" value={str('name')} onChange={set('name')} />
      <MF label="Issuer" value={str('org')} onChange={set('org')} />
      <MF label="Year" value={str('year')} onChange={set('year')} />
    </div>
  );

  if (section === 'languages') return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <MF label="Language" value={str('name')} onChange={set('name')} />
      <MF label="Proficiency" value={str('level')} onChange={set('level')} />
    </div>
  );

  return null;
}

interface VersionPickerModalProps {
  entryId: string;
  section: string;
  base: BaseCV;
  sel: CvSelection;
  onApply: (newSel: CvSelection) => void;
  onSaveBase: (newBase: BaseCV) => void;
  onClose: () => void;
}

function VersionPickerModal({ entryId, section, base, sel, onApply, onSaveBase, onClose }: VersionPickerModalProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const all = ((base as any)[section] as { id: string; versions?: unknown[] }[]) || [];
  const entry = all.find((x) => x.id === entryId) as Record<string, unknown> & { id: string } | undefined;
  if (!entry) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawVersions = (entry as any).versions as Record<string, unknown>[] | undefined;
  const allVersions: Record<string, unknown>[] = rawVersions?.length
    ? rawVersions
    : [{ ...entry }];

  const isCurrentlyCustom = !!sel.customVersions?.[entryId];
  const currentVIdx = sel.versionOverrides?.[entryId] ?? 0;

  const [chosen, setChosen] = useState<number | 'custom'>(isCurrentlyCustom ? 'custom' : currentVIdx);
  const [customData, setCustomData] = useState<Record<string, unknown>>(
    (sel.customVersions?.[entryId] as Record<string, unknown>) ?? { ...allVersions[0] }
  );
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, unknown>>({});

  // Switching versions exits edit mode
  const selectVersion = (v: number | 'custom') => { setChosen(v); setEditing(false); };

  const setCustomField = (k: string, v: unknown) => setCustomData((d) => ({ ...d, [k]: v }));
  const setEditField   = (k: string, v: unknown) => setEditData((d) => ({ ...d, [k]: v }));

  const normalize = (data: Record<string, unknown>) => {
    const d = { ...data };
    const toArr = (v: unknown, sep: string) =>
      Array.isArray(v) ? v : typeof v === 'string' ? v.split(sep).map((s) => s.trim()).filter(Boolean) : [];
    if (section === 'work')      { d.bullets = toArr(d.bullets, '\n'); d.tags = toArr(d.tags, ','); }
    if (section === 'portfolio') { d.tags = toArr(d.tags, ','); }
    return d;
  };

  const handleApply = () => {
    if (chosen === 'custom') {
      const newCustom = { ...(sel.customVersions || {}), [entryId]: normalize(customData) };
      const newOverrides = { ...(sel.versionOverrides || {}) };
      delete newOverrides[entryId];
      onApply({ ...sel, customVersions: newCustom, versionOverrides: Object.keys(newOverrides).length ? newOverrides : undefined });
    } else {
      const newOverrides = { ...(sel.versionOverrides || {}), [entryId]: chosen };
      const newCustom = { ...(sel.customVersions || {}) };
      delete newCustom[entryId];
      onApply({ ...sel, versionOverrides: newOverrides, customVersions: Object.keys(newCustom).length ? newCustom : undefined });
    }
    onClose();
  };

  const handleStartEdit = () => {
    setEditData({ ...allVersions[chosen as number] });
    setEditing(true);
  };

  const handleSaveToBase = () => {
    const normalized = normalize(editData);
    // Deep-copy base and splice the updated version back in
    const newBase = JSON.parse(JSON.stringify(base)) as BaseCV;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries = newBase[section as keyof BaseCV] as unknown as Record<string, unknown>[];
    const entryIdx = entries.findIndex((e: any) => e.id === entryId);
    if (entryIdx === -1) return;
    const ent = entries[entryIdx] as any;
    const versions = Array.isArray(ent.versions) ? [...ent.versions] : [{ ...ent }];
    versions[chosen as number] = { ...normalized, id: entryId };
    entries[entryIdx] = { ...ent, versions };
    onSaveBase(newBase);
    setEditing(false);
  };

  const entryTitle = itemLabel(section, entry as Record<string, unknown>);

  const btnStyle = (active: boolean, isCustomBtn = false) => ({
    height: 28, padding: isCustomBtn ? '0 12px' : '0', width: isCustomBtn ? 'auto' : 28,
    borderRadius: 6, cursor: 'pointer',
    fontSize: isCustomBtn ? 11 : 12, fontWeight: 700, fontFamily: 'var(--mono)',
    border: active ? '1.5px solid var(--ink)' : '1.5px solid var(--line-strong)',
    background: active ? (isCustomBtn ? 'var(--ink)' : 'var(--accent)') : 'var(--card)',
    color: active ? '#fff' : 'var(--ink-soft)',
    boxShadow: active ? '1.5px 1.5px 0 var(--ink)' : 'none',
    transition: 'all .1s',
  });

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.48)', display: 'grid', placeItems: 'center', zIndex: 999 }}
      onClick={editing ? undefined : onClose}
    >
      <div
        style={{
          background: 'var(--card)', borderRadius: 'var(--r-lg)', border: '1.5px solid var(--ink)',
          boxShadow: 'var(--shadow)', width: 580, maxWidth: '92vw',
          maxHeight: '82vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1.5px solid var(--line)', flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {editing ? `Editing version ${(chosen as number) + 1} — ${entryTitle.main}` : (entryTitle.main || 'Entry')}
            </div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>{entryTitle.sub}</div>
          </div>
          <button className="iconbtn" onClick={editing ? () => setEditing(false) : onClose} style={{ flexShrink: 0 }}>
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Version bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 18px', borderBottom: '1.5px solid var(--line)', background: 'var(--paper-2)', flexShrink: 0 }}>
          <span className="mono" style={{ fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-faint)', marginRight: 4 }}>
            Version
          </span>
          {allVersions.map((_, i) => (
            <button key={i} onClick={() => selectVersion(i)} style={btnStyle(chosen === i)}>{i + 1}</button>
          ))}
          <button onClick={() => selectVersion('custom')} style={btnStyle(chosen === 'custom', true)}>Custom</button>
          {editing && (
            <span className="mono" style={{ fontSize: 10, color: '#ef4444', marginLeft: 6, fontWeight: 700 }}>editing base</span>
          )}
          {!editing && chosen === 'custom' && (
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', marginLeft: 4 }}>CV-specific</span>
          )}
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
          {editing ? (
            <>
              <CustomEntryForm section={section} data={editData} setField={setEditField} />
              <div style={{
                marginTop: 16, padding: '10px 13px', borderRadius: 8,
                background: '#fee2e2', border: '1.5px solid #ef4444',
                fontSize: 12, lineHeight: 1.5, color: '#991b1b',
              }}>
                <strong>Warning:</strong> By editing this version, all CVs that use it will also be updated.
              </div>
            </>
          ) : chosen === 'custom' ? (
            <>
              <CustomEntryForm section={section} data={customData} setField={setCustomField} />
              <div style={{
                marginTop: 16, padding: '10px 13px', borderRadius: 8,
                background: 'var(--yellow)', border: '1.5px solid var(--ink)',
                fontSize: 12, lineHeight: 1.5,
              }}>
                <strong>Note:</strong> By adding a custom version to this CV, this entry will not be automatically updated if you ever change its base entries.
              </div>
            </>
          ) : (
            <VersionPreview section={section} data={allVersions[chosen as number]} />
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '14px 18px', borderTop: '1.5px solid var(--line)', flexShrink: 0, background: 'var(--paper-2)' }}>
          {editing ? (
            <>
              <button className="btn btn--ghost btn--sm" onClick={() => setEditing(false)}>
                <Icon name="arrowL" size={13} /> Back
              </button>
              <div style={{ flex: 1 }} />
              <button
                className="btn btn--sm"
                onClick={handleSaveToBase}
                style={{ background: '#ef4444', color: '#fff', border: '1.5px solid #dc2626', boxShadow: '1.5px 1.5px 0 #991b1b' }}
              >
                <Icon name="check" size={14} color="#fff" /> Save to Base CV
              </button>
            </>
          ) : (
            <>
              <button className="btn btn--ghost btn--sm" onClick={onClose}>Cancel</button>
              <div style={{ flex: 1 }} />
              {chosen !== 'custom' && (
                <button className="btn btn--ghost btn--sm" onClick={handleStartEdit}>
                  <Icon name="pencil" size={13} /> Edit
                </button>
              )}
              <button className="btn btn--primary btn--sm" onClick={handleApply}>
                <Icon name="check" size={14} color="var(--paper)" /> Apply
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Summary version modal ---- */
function SummaryVersionModal({ base, sel, onApply, onClose }: {
  base: BaseCV;
  sel: CvSelection;
  onApply: (s: CvSelection) => void;
  onClose: () => void;
}) {
  const summaryVersions = base.general.summaryVersions?.length
    ? base.general.summaryVersions
    : [base.general.summary || ''];

  const isCustom = sel.customSummary !== undefined;
  const [chosen, setChosen] = useState<number | 'custom'>(isCustom ? 'custom' : (sel.summaryVersion ?? 0));
  const [customText, setCustomText] = useState<string>(isCustom ? (sel.customSummary ?? '') : (summaryVersions[0] ?? ''));

  const btnStyle = (active: boolean, wide = false) => ({
    height: 28, padding: wide ? '0 12px' : '0', width: wide ? 'auto' : 28,
    borderRadius: 6, cursor: 'pointer',
    fontSize: wide ? 11 : 12, fontWeight: 700, fontFamily: 'var(--mono)',
    border: active ? '1.5px solid var(--ink)' : '1.5px solid var(--line-strong)',
    background: active ? (wide ? 'var(--ink)' : 'var(--accent)') : 'var(--card)',
    color: active ? '#fff' : 'var(--ink-soft)',
    boxShadow: active ? '1.5px 1.5px 0 var(--ink)' : 'none', transition: 'all .1s',
  });

  const handleApply = () => {
    if (chosen === 'custom') {
      onApply({ ...sel, customSummary: customText, summaryVersion: undefined });
    } else {
      onApply({ ...sel, summaryVersion: chosen, customSummary: undefined });
    }
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.48)', display: 'grid', placeItems: 'center', zIndex: 999 }}
      onClick={onClose}>
      <div style={{
        background: 'var(--card)', borderRadius: 'var(--r-lg)', border: '1.5px solid var(--ink)',
        boxShadow: 'var(--shadow)', width: 560, maxWidth: '92vw',
        maxHeight: '82vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1.5px solid var(--line)', flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Professional summary</div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>General Info</div>
          </div>
          <button className="iconbtn" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 18px', borderBottom: '1.5px solid var(--line)', background: 'var(--paper-2)', flexShrink: 0 }}>
          <span className="mono" style={{ fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-faint)', marginRight: 4 }}>Version</span>
          {summaryVersions.map((_, i) => (
            <button key={i} onClick={() => setChosen(i)} style={btnStyle(chosen === i)}>{i + 1}</button>
          ))}
          <button onClick={() => setChosen('custom')} style={btnStyle(chosen === 'custom', true)}>Custom</button>
          {chosen === 'custom' && (
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', marginLeft: 4 }}>CV-specific</span>
          )}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
          {chosen === 'custom' ? (
            <>
              <textarea className="textarea" value={customText} rows={6}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Write a CV-specific summary…"
                style={{ width: '100%' }} />
              <div style={{
                marginTop: 12, padding: '10px 13px', borderRadius: 8,
                background: 'var(--yellow)', border: '1.5px solid var(--ink)',
                fontSize: 12, lineHeight: 1.5,
              }}>
                <strong>Note:</strong> This custom summary is saved only to this CV and won't update automatically from your base versions.
              </div>
            </>
          ) : (
            <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--ink-soft)', margin: 0 }}>
              {summaryVersions[chosen as number] || <em style={{ opacity: .5 }}>No text yet</em>}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '14px 18px', borderTop: '1.5px solid var(--line)', flexShrink: 0, background: 'var(--paper-2)' }}>
          <button className="btn btn--ghost btn--sm" onClick={onClose}>Cancel</button>
          <div style={{ flex: 1 }} />
          <button className="btn btn--primary btn--sm" onClick={handleApply}>
            <Icon name="check" size={14} color="var(--paper)" /> Apply
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Summary compose section ---- */
function SummaryComposeSection({ base, sel, setSel }: { base: BaseCV; sel: CvSelection; setSel: (s: CvSelection) => void }) {
  const [modal, setModal] = useState(false);
  const included = sel.summary !== false;
  const isCustom = sel.customSummary !== undefined;
  const vLabel = isCustom ? 'custom' : `v${(sel.summaryVersion ?? 0) + 1}`;

  const summaryVersions = base.general.summaryVersions?.length
    ? base.general.summaryVersions
    : [base.general.summary || ''];
  const activeV = isCustom ? 0 : (sel.summaryVersion ?? 0);
  const previewText = isCustom
    ? (sel.customSummary ?? '')
    : (summaryVersions[activeV] ?? '');

  return (
    <>
      <div style={{ marginBottom: 14, borderBottom: '1.5px solid var(--line)', paddingBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
          <Icon name="user" size={15} color="var(--pink)" />
          <span className="serif" style={{ fontSize: 15, fontWeight: 800 }}>Summary</span>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>{included ? 1 : 0}</span>
          <div style={{ flex: 1 }} />
          <button className="iconbtn" style={{ width: 28, height: 28 }} title={included ? 'Remove' : 'Add'}
            onClick={() => setSel({ ...sel, summary: !included })}>
            <Icon name={included ? 'minus' : 'plus'} size={15} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {included ? (
            <div className="row" style={{ gap: 8, padding: '6px 8px', borderRadius: 7, background: 'var(--paper)', border: '1.5px solid var(--line-strong)' }}>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600 }}>Professional summary</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)' }}>
                  {previewText ? previewText.slice(0, 72) + (previewText.length > 72 ? '…' : '') : 'No text yet'}
                </span>
              </span>
              <button onClick={() => setModal(true)} title="Pick version" className="mono"
                style={{
                  fontSize: 9.5, letterSpacing: '.06em', height: 22, padding: '0 7px',
                  borderRadius: 5, border: '1.5px solid var(--line-strong)',
                  background: isCustom ? 'var(--ink)' : 'var(--paper-2)',
                  color: isCustom ? '#fff' : 'var(--ink-faint)',
                  cursor: 'pointer', flexShrink: 0, fontWeight: isCustom ? 700 : 400,
                }}>{vLabel}</button>
              <Icon name="x" size={13} style={{ cursor: 'pointer', opacity: .5, flexShrink: 0 }}
                onClick={() => setSel({ ...sel, summary: false, customSummary: undefined, summaryVersion: undefined })} />
            </div>
          ) : (
            <button onClick={() => setSel({ ...sel, summary: true })} className="mono" style={{
              fontSize: 11.5, color: 'var(--ink-faint)', border: '1.5px dashed var(--line-strong)',
              borderRadius: 7, padding: '8px', cursor: 'pointer', background: 'transparent', textAlign: 'center', width: '100%',
            }}>
              <Icon name="plus" size={12} /> nothing here yet — pull from your record
            </button>
          )}
        </div>
      </div>
      {modal && <SummaryVersionModal base={base} sel={sel} onApply={setSel} onClose={() => setModal(false)} />}
    </>
  );
}

/* ---- Links compose section ---- */
function LinksComposeSection({ base, sel, setSel }: { base: BaseCV; sel: CvSelection; setSel: (s: CvSelection) => void }) {
  const [open, setOpen] = useState(false);
  const allLinks = base.general.links || [];
  const includedUrls: string[] = sel.links ?? allLinks.map((l) => l.url);
  const includedLinks = allLinks.filter((l) => includedUrls.includes(l.url));
  const availableLinks = allLinks.filter((l) => !includedUrls.includes(l.url));

  const add = (url: string) => { setSel({ ...sel, links: [...includedUrls, url] }); };
  const remove = (url: string) => { setSel({ ...sel, links: includedUrls.filter((u) => u !== url) }); };

  return (
    <div style={{ marginBottom: 14, borderBottom: '1.5px solid var(--line)', paddingBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
        <Icon name="link" size={15} color="var(--blue)" />
        <span className="serif" style={{ fontSize: 15, fontWeight: 800 }}>Links</span>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>{includedLinks.length}</span>
        <div style={{ flex: 1 }} />
        <button className="iconbtn" style={{ width: 28, height: 28 }} title="Add link"
          onClick={() => setOpen((o) => !o)}>
          <Icon name={open ? 'minus' : 'plus'} size={15} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {includedLinks.map((link) => (
          <div key={link.url} className="row" style={{ gap: 8, padding: '6px 8px', borderRadius: 7, background: 'var(--paper)', border: '1.5px solid var(--line-strong)' }}>
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{link.label || link.url}</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{link.url}</span>
            </span>
            <Icon name="x" size={13} style={{ cursor: 'pointer', opacity: .5, flexShrink: 0 }}
              onClick={() => remove(link.url)} />
          </div>
        ))}
        {includedLinks.length === 0 && (
          <button onClick={() => setOpen(true)} className="mono" style={{
            fontSize: 11.5, color: 'var(--ink-faint)', border: '1.5px dashed var(--line-strong)',
            borderRadius: 7, padding: '8px', cursor: 'pointer', background: 'transparent', textAlign: 'center', width: '100%',
          }}>
            <Icon name="plus" size={12} /> nothing here yet — pull from your record
          </button>
        )}
      </div>
      {open && (
        <div className="card sv-pop" style={{ marginTop: 8, padding: 10, borderColor: 'var(--ink)', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 6px 8px' }}>
            <span className="mono" style={{ fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
              From your Base CV · Links
            </span>
            <Icon name="x" size={14} style={{ cursor: 'pointer' }} onClick={() => setOpen(false)} />
          </div>
          {availableLinks.length === 0 ? (
            <div style={{ padding: '14px 8px', textAlign: 'center' }}>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-faint)' }}>All links are already included.</span>
            </div>
          ) : availableLinks.map((link) => (
            <button key={link.url} onClick={() => { add(link.url); setOpen(false); }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
              border: 0, borderRadius: 7, cursor: 'pointer', background: 'transparent', textAlign: 'left', transition: 'background .1s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--paper-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <span style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--teal)', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name="plus" size={14} color="#fff" />
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600 }}>{link.label || link.url}</span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>{link.url}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Compose section (with D&D, version badge, sort button) ---- */
function parseStartYear(start: string): number {
  const m = (start || '').match(/\d{4}/);
  return m ? parseInt(m[0], 10) : 0;
}

interface ComposeSectionProps {
  base: BaseCV;
  section: string;
  sel: CvSelection;
  setSel: (sel: CvSelection) => void;
  onVersionPick: (section: string, entryId: string) => void;
}

function ComposeSection({ base, section, sel, setSel, onVersionPick }: ComposeSectionProps) {
  const [open, setOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const m = SECTION_META[section];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseAny = base as any;
  const ids = (sel[section] as string[]) || [];
  // Use pickItems so labels reflect the active version/custom version, not always v1
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const included = pickItems(base, section as keyof BaseCV, sel) as any[];

  const add = (id: string) => setSel({ ...sel, [section]: [...ids, id] } as CvSelection);
  const remove = (id: string) => {
    const newOverrides = { ...(sel.versionOverrides || {}) };
    const newCustom = { ...(sel.customVersions || {}) };
    delete newOverrides[id];
    delete newCustom[id];
    setSel({
      ...sel,
      [section]: ids.filter((x) => x !== id),
      versionOverrides: Object.keys(newOverrides).length ? newOverrides : undefined,
      customVersions: Object.keys(newCustom).length ? newCustom : undefined,
    } as CvSelection);
  };

  const reorder = (fromId: string, toId: string) => {
    const arr = [...ids];
    const from = arr.indexOf(fromId);
    const to = arr.indexOf(toId);
    if (from === -1 || to === -1 || from === to) return;
    arr.splice(from, 1);
    arr.splice(to, 0, fromId);
    setSel({ ...sel, [section]: arr } as CvSelection);
  };

  const orderByRecent = () => {
    const sorted = [...ids].sort((a, b) => {
      const ea = included.find((x: any) => x.id === a);
      const eb = included.find((x: any) => x.id === b);
      return parseStartYear((eb as any)?.start || '') - parseStartYear((ea as any)?.start || '');
    });
    setSel({ ...sel, [section]: sorted } as CvSelection);
  };

  const getVersionLabel = (entryId: string): string | null => {
    if (sel.customVersions?.[entryId]) return 'custom';
    const vIdx = sel.versionOverrides?.[entryId];
    if (vIdx !== undefined) return `v${vIdx + 1}`;
    // Show v1 if the entry has multiple versions stored in base
    const entry = (baseAny[section] as { id: string; versions?: unknown[] }[] || []).find((x: { id: string }) => x.id === entryId);
    const hasMultipleVersions = ((entry as any)?.versions?.length ?? 0) > 1;
    if (hasMultipleVersions) return 'v1';
    return null;
  };

  return (
    <div style={{ marginBottom: 14, borderBottom: '1.5px solid var(--line)', paddingBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
        <Icon name={m.icon} size={15} color={`var(--${m.tone})`} />
        <span className="serif" style={{ fontSize: 15, fontWeight: 800 }}>{SECTION_TITLES[section]}</span>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>{included.length}</span>
        <div style={{ flex: 1 }} />
        {/* Auto-order by most recent — only for work/experience */}
        {section === 'work' && ids.length > 1 && (
          <button className="iconbtn" style={{ width: 28, height: 28 }} title="Order by most recent" onClick={orderByRecent}>
            <Icon name="sort" size={15} />
          </button>
        )}
        <button className="iconbtn" style={{ width: 28, height: 28 }} title="Add from Base CV" onClick={() => setOpen((o) => !o)}>
          <Icon name={open ? 'minus' : 'plus'} size={15} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {included.map((it) => {
          const lab = itemLabel(section, it);
          const isDragged = draggedId === it.id;
          const isTarget = dragOverId === it.id && draggedId !== it.id;
          const vLabel = getVersionLabel(it.id as string);
          const isCustomVersion = sel.customVersions?.[it.id as string];

          return (
            <div
              key={it.id as string}
              draggable
              onDragStart={() => setDraggedId(it.id as string)}
              onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}
              onDragOver={(e) => { e.preventDefault(); setDragOverId(it.id as string); }}
              onDragLeave={() => setDragOverId(null)}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedId) reorder(draggedId, it.id as string);
                setDraggedId(null);
                setDragOverId(null);
              }}
              className="row"
              style={{
                gap: 8, padding: '6px 8px', borderRadius: 7,
                background: 'var(--paper)',
                border: isTarget ? '1.5px solid var(--accent)' : '1.5px solid var(--line-strong)',
                opacity: isDragged ? 0.4 : 1,
                cursor: draggedId ? 'grabbing' : 'default',
                transition: 'border-color .1s, opacity .1s',
              }}
            >
              <Icon name="grip" size={14} color="var(--ink-faint)" style={{ cursor: 'grab', flexShrink: 0 }} />
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lab.main}</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)' }}>{lab.sub}</span>
              </span>
              {/* Version picker button */}
              <button
                onClick={() => onVersionPick(section, it.id as string)}
                title="Pick version"
                className="mono"
                style={{
                  fontSize: 9.5, letterSpacing: '.06em', height: 22, padding: '0 7px',
                  borderRadius: 5, border: '1.5px solid var(--line-strong)',
                  background: isCustomVersion ? 'var(--ink)' : 'var(--paper-2)',
                  color: isCustomVersion ? '#fff' : 'var(--ink-faint)',
                  cursor: 'pointer', flexShrink: 0,
                  fontWeight: isCustomVersion ? 700 : 400,
                }}
              >
                {vLabel ?? 'v1'}
              </button>
              <Icon name="x" size={13} style={{ cursor: 'pointer', opacity: .5, flexShrink: 0 }} onClick={() => remove(it.id as string)} />
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
  onSaveBase: (newBase: BaseCV) => void;
}

function ComposeStep({ base, draft, sel, setSel, onSaveBase }: ComposeStepProps) {
  const [versionModal, setVersionModal] = useState<{ section: string; entryId: string } | null>(null);

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

        <div className="field" style={{ marginBottom: 18 }}>
          <label>Headline</label>
          <input className="input" value={sel.headline || ''}
            placeholder="Custom role headline for this CV"
            onChange={(e) => setSel({ ...sel, headline: e.target.value })} />
        </div>

        <SummaryComposeSection base={base} sel={sel} setSel={setSel} />
        <LinksComposeSection base={base} sel={sel} setSel={setSel} />

        {COMPOSE_ORDER.map((s) => (
          <ComposeSection
            key={s} base={base} section={s} sel={sel} setSel={setSel}
            onVersionPick={(section, entryId) => setVersionModal({ section, entryId })}
          />
        ))}
      </div>

      <div style={{ overflowY: 'auto', background: '#e8e0cf', padding: '32px 40px 80px' }}>
        <div className="row" style={{ justifyContent: 'center', gap: 10, marginBottom: 18 }}>
          <Chip tone="blue"><Icon name="eye" size={12} /> Live preview</Chip>
          <Chip>{(CV_STYLES.find((x) => x.id === draft.style) || {}).name}</Chip>
        </div>
        <FitPaper base={base} style={draft.style as CvStyleId} sel={sel} accent={draft.accent} />
      </div>

      {versionModal && (
        <VersionPickerModal
          entryId={versionModal.entryId}
          section={versionModal.section}
          base={base}
          sel={sel}
          onApply={setSel}
          onSaveBase={onSaveBase}
          onClose={() => setVersionModal(null)}
        />
      )}
    </div>
  );
}

/* ---- STEP 3: Export ---- */
function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span style={{
        width: 15, height: 15, borderRadius: '50%', background: 'var(--line-strong)',
        color: 'var(--ink-soft)', display: 'inline-flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 9, fontWeight: 700,
        fontFamily: 'var(--mono)', cursor: 'help', flexShrink: 0,
      }}>?</span>
      {show && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
          transform: 'translateX(-50%)', width: 260,
          padding: '10px 12px', background: 'var(--night)',
          color: 'rgba(244,236,219,.85)', borderRadius: 8,
          fontSize: 11.5, lineHeight: 1.55,
          boxShadow: 'var(--shadow-lg)', zIndex: 99, pointerEvents: 'none',
        }}>
          {text}
        </div>
      )}
    </span>
  );
}

interface ExportStepProps {
  base: BaseCV;
  draft: BuilderDraft;
  sel: CvSelection;
  readyToSend: boolean;
  onReadyChange: (v: boolean) => void;
}

function ExportStep({ base, draft, sel, readyToSend, onReadyChange }: ExportStepProps) {
  const [atsOptimize, setAtsOptimize] = useState(false);
  const isAtsFriendly = ATS_FRIENDLY_STYLES.has(draft.style as CvStyleId);
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

        <label style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          cursor: isAtsFriendly ? 'default' : 'pointer',
          margin: '12px 0 0', padding: '12px 14px',
          border: '1.5px solid var(--line-strong)', borderRadius: 'var(--r)',
          background: 'var(--paper)', opacity: isAtsFriendly ? 0.65 : 1,
        }}>
          <input type="checkbox"
            checked={isAtsFriendly ? true : atsOptimize}
            onChange={(e) => { if (!isAtsFriendly) setAtsOptimize(e.target.checked); }}
            disabled={isAtsFriendly}
            style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: isAtsFriendly ? 'default' : 'pointer', flexShrink: 0, marginTop: 2 }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13.5, fontWeight: 600 }}>
              Optimize for ATS
              {!isAtsFriendly && (
                <InfoTooltip text="This design contains columns. By checking this box, we'll convert your PDF into a hidden layer of text, which will be read by AI easily, and convert your design to a flat image for humans to see. MOST NEW ATS READERS WON'T REQUIRE THIS FEATURE, so only check this box if you find it really necessary." />
              )}
            </div>
            {isAtsFriendly ? (
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--teal)', marginTop: 2 }}>
                ✔ This design is already ATS-friendly!
              </div>
            ) : (
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)', marginTop: 2 }}>
                {atsOptimize ? 'Design will be flattened to image' : 'Visual text is extractable by parsers'}
              </div>
            )}
          </div>
        </label>

        <button className="btn btn--primary btn--lg" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }}
          onClick={() => downloadCvPdf(base, draft.style as CvStyleId, sel, draft.accent, draft.name, atsOptimize)}>
          <Icon name="download" size={18} color="var(--paper)" /> Download PDF
        </button>
        {/* TODO: URL sharing — re-enable when Summa Sharing is wired up
        <button className="btn btn--ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
          <Icon name="link" size={15} /> Copy shareable link
        </button>
        */}
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
  const { setBaseCV } = useStore();
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
      // Restore saved selection (with versionOverrides & customVersions) when editing an existing CV
      const existingCv = pov.cvs.find((c) => c.id === cvId);
      setSel(existingCv?.selection || defaultSelForFocus(base, pov.focus));
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
          <ComposeStep base={base} draft={draft} sel={sel} setSel={setSel} onSaveBase={setBaseCV} />
        )}
        {step === 'export' && sel && (
          <ExportStep base={base} draft={draft} sel={sel} readyToSend={readyToSend} onReadyChange={setReadyToSend} />
        )}
      </div>
    </div>
  );
}
