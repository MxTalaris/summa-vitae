import React, { useRef, useState } from 'react';
import { Icon } from '../components/Icon';
import { Stars, SECTION_META } from '../components/primitives';
import type { BaseCV, SkillGroup, SkillItem } from '../types';

const BASE_SECTIONS: [string, string][] = [
  ['general',   'General Info'],
  ['work',      'Work Experience'],
  ['education', 'Education'],
  ['portfolio', 'Portfolio'],
  ['other',     'Other Experiences'],
  ['certs',     'Certifications'],
  ['skills',    'Skills'],
  ['languages', 'Languages'],
];

function mkId() { return 'n' + Math.random().toString(36).slice(2, 8); }
function asText(v: string | string[], sep = ', ') { return Array.isArray(v) ? v.join(sep) : (v || ''); }

/* Field row layout */
function FRow({ children, cols = '1fr 1fr' }: { children: React.ReactNode; cols?: string }) {
  return <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 14 }}>{children}</div>;
}
function Gap({ h = 12 }: { h?: number }) { return <div style={{ height: h }} />; }

/* Controlled field */
function CF({ label, value, onChange, ph, area, full, rows = 3 }: {
  label: string; value?: string; onChange: (v: string) => void;
  ph?: string; area?: boolean; full?: boolean; rows?: number;
}) {
  return (
    <div className="field" style={{ gridColumn: full ? '1 / -1' : undefined }}>
      <label>{label}</label>
      {area
        ? <textarea className="textarea" value={value || ''} placeholder={ph} rows={rows}
            onChange={(e) => onChange(e.target.value)} />
        : <input className="input" value={value || ''} placeholder={ph}
            onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}

/* Segmented control */
function SegToggle({ value, options, onChange }: {
  value: string;
  options: { id: string; icon: string; label: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <div style={{
      display: 'inline-flex', border: '1.5px solid var(--line-strong)', borderRadius: 9,
      padding: 3, background: 'var(--paper-2)', marginBottom: 16,
    }}>
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button key={o.id} onClick={() => onChange(o.id)} className="mono" style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '7px 13px', border: 0, cursor: 'pointer', borderRadius: 6,
            fontSize: 11.5, fontWeight: on ? 700 : 500, letterSpacing: '.04em',
            background: on ? 'var(--card)' : 'transparent', color: on ? 'var(--ink)' : 'var(--ink-faint)',
            boxShadow: on ? '1.5px 1.5px 0 var(--ink)' : 'none', transition: 'all .12s',
          }}>
            <Icon name={o.icon} size={14} color={on ? 'var(--accent)' : 'var(--ink-faint)'} /> {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* Version bar */
function VersionBar({ count, active, onSelect, onAdd, max = 4 }: {
  count: number; active: number; onSelect: (i: number) => void; onAdd: () => void; max?: number;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span className="mono" style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
        Versions
      </span>
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: count }).map((_, i) => {
          const on = i === active;
          return (
            <button key={i} onClick={() => onSelect(i)} className="mono" title={`Show version ${i + 1}`} style={{
              width: 25, height: 25, borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700,
              border: on ? '1.5px solid var(--ink)' : '1.5px solid var(--line-strong)',
              background: on ? 'var(--accent)' : 'var(--card)', color: on ? '#fff' : 'var(--ink-soft)',
              boxShadow: on ? '1.5px 1.5px 0 var(--ink)' : 'none', transition: 'all .1s',
            }}>{i + 1}</button>
          );
        })}
        {count < max && (
          <button onClick={onAdd} title="Add a version" className="iconbtn"
            style={{ width: 25, height: 25, borderRadius: 6, borderStyle: 'dashed' }}>
            <Icon name="plus" size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

/* Entry shell */
function Entry({ children, onRemove, n, top }: {
  children: React.ReactNode; onRemove: () => void; n: number; top: React.ReactNode;
}) {
  return (
    <div className="sv-pop" style={{
      border: '1.5px solid var(--line-strong)', borderRadius: 'var(--r)',
      background: 'var(--paper)', marginBottom: 14, overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px 9px 14px',
        borderBottom: '1.5px solid var(--line)', background: 'var(--paper-2)',
      }}>
        {top}
        <div style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)' }}>#{n}</span>
        <button className="iconbtn" style={{ width: 28, height: 28 }} onClick={onRemove} title="Remove entry">
          <Icon name="trash" size={14} />
        </button>
      </div>
      <div style={{ padding: '16px 16px 6px' }}>{children}</div>
    </div>
  );
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="btn btn--ghost" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed' }} onClick={onClick}>
      <Icon name="plus" size={15} /> {label}
    </button>
  );
}

function SectionShell({ id, meta, children, count, refCb }: {
  id: string; meta: { icon: string; tone: string; label: string };
  children: React.ReactNode; count?: number; refCb?: (el: HTMLElement | null) => void;
}) {
  return (
    <section id={'sec-' + id} ref={refCb as React.Ref<HTMLElement>} style={{ marginBottom: 44, scrollMarginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <span style={{
          width: 40, height: 40, borderRadius: 10, display: 'grid', placeItems: 'center',
          background: `var(--${meta.tone})`, color: '#fff', boxShadow: '2px 2px 0 var(--ink)',
        }}>
          <Icon name={meta.icon} size={20} color="#fff" />
        </span>
        <div>
          <h2 className="serif" style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-.01em' }}>{meta.label}</h2>
          {count != null && <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{count} entries</span>}
        </div>
      </div>
      {children}
    </section>
  );
}

/* Generic versioned section (uses any internally to avoid index-signature constraints) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function VersionedSection({ id, meta, initial, makeBlank, renderFields, addLabel, addRow, refCb, onChange }: {
  id: string;
  meta: { icon: string; tone: string; label: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initial: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  makeBlank: () => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderFields: (data: any, setField: (key: string, val: unknown) => void) => React.ReactNode;
  addLabel?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addRow?: (addItem: (extra?: any) => void) => React.ReactNode;
  refCb?: (el: HTMLElement | null) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (items: any[]) => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<{ key: string; active: number; versions: any[] }[]>(() =>
    initial.map((seed) => ({ key: seed.id || mkId(), active: 0, versions: [{ ...seed }] })));

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange?.(items.map((it: any) => it.versions[it.active]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update = (idx: number, fn: (it: any) => any) =>
    setItems((its) => its.map((it, i) => (i === idx ? fn(it) : it)));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addItem = (extra: any = {}) =>
    setItems((its) => [...its, { key: mkId(), active: 0, versions: [{ ...makeBlank(), ...extra }] }]);

  const removeItem = (idx: number) => setItems((its) => its.filter((_, i) => i !== idx));

  return (
    <SectionShell id={id} meta={meta} count={items.length} refCb={refCb}>
      {items.map((it, idx) => {
        const data = it.versions[it.active];
        const setField = (key: string, val: unknown) =>
          update(idx, (x) => ({
            ...x,
            versions: x.versions.map((v: Record<string, unknown>, vi: number) => (vi === x.active ? { ...v, [key]: val } : v)),
          }));
        const selectV = (vi: number) => update(idx, (x) => ({ ...x, active: vi }));
        const addV = () => update(idx, (x) =>
          x.versions.length >= 4 ? x : { ...x, versions: [...x.versions, { ...x.versions[x.active] }], active: x.versions.length });
        return (
          <Entry key={it.key} n={idx + 1} onRemove={() => removeItem(idx)}
            top={<VersionBar count={it.versions.length} active={it.active} onSelect={selectV} onAdd={addV} />}>
            {renderFields(data, setField)}
          </Entry>
        );
      })}
      {addRow ? addRow(addItem) : <AddBtn label={addLabel!} onClick={() => addItem()} />}
    </SectionShell>
  );
}

/* Portfolio image manager */
function PortfolioImages({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const imgs = images || [];
  const tile = { width: 104, height: 78, borderRadius: 7, flexShrink: 0 };
  return (
    <div className="field" style={{ gridColumn: '1 / -1' }}>
      <label>Images</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {imgs.map((cap, i) => (
          <div key={i} style={{ width: 104 }}>
            <div style={{
              ...tile, position: 'relative', background: 'var(--paper-2)',
              border: '1.5px solid var(--line-strong)', display: 'grid', placeItems: 'center',
              backgroundImage: 'radial-gradient(var(--line-strong) 1px, transparent 1.4px)',
              backgroundSize: '8px 8px',
            }}>
              <Icon name="image" size={24} color="var(--line-strong)" />
              <button onClick={() => onChange(imgs.filter((_, j) => j !== i))} title="Remove image" style={{
                position: 'absolute', top: -7, right: -7, width: 20, height: 20, borderRadius: 99,
                border: '1.5px solid var(--ink)', background: 'var(--card)', cursor: 'pointer',
                display: 'grid', placeItems: 'center', padding: 0,
              }}>
                <Icon name="x" size={11} />
              </button>
            </div>
            <input value={cap} onChange={(e) => onChange(imgs.map((c, j) => (j === i ? e.target.value : c)))}
              placeholder="caption" className="mono" style={{
                width: 104, marginTop: 5, border: 0, background: 'transparent', fontSize: 10,
                color: 'var(--ink-faint)', outline: 'none', textAlign: 'center',
              }} />
          </div>
        ))}
        <button onClick={() => onChange([...imgs, 'New image'])} title="Add image" style={{
          ...tile, border: '1.5px dashed var(--line-strong)', background: 'transparent',
          cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 4, color: 'var(--ink-faint)',
        }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line-strong)')}>
          <Icon name="plus" size={18} />
          <span className="mono" style={{ fontSize: 9.5, letterSpacing: '.06em' }}>ADD</span>
        </button>
      </div>
    </div>
  );
}

/* Skills editor with star subgroups */
const STAR_LEVELS = [
  { stars: 3, label: 'Absolute expert', hint: 'deep — can set direction & lead others' },
  { stars: 2, label: 'Knows a lot',     hint: 'strong, fully independent' },
  { stars: 1, label: 'Knows something', hint: 'working familiarity' },
];

function SkillChip({ name, onName, onRemove }: { name: string; onName: (v: string) => void; onRemove: () => void }) {
  return (
    <span className="chip" style={{ paddingRight: 6, gap: 6 }}>
      <input value={name} onChange={(e) => onName(e.target.value)} placeholder="skill" style={{
        border: 0, background: 'transparent', font: 'inherit', color: 'inherit',
        width: `${Math.max((name || '').length, 4) + 1}ch`, outline: 'none', padding: 0,
      }} />
      <Icon name="x" size={11} style={{ cursor: 'pointer', opacity: .5 }} onClick={onRemove} />
    </span>
  );
}

interface SkillsEditorProps {
  groups: SkillGroup[];
  onChange?: (groups: SkillGroup[]) => void;
}

function SkillsEditor({ groups, onChange }: SkillsEditorProps) {
  const [data, setData] = useState(() =>
    groups.map((g) => ({
      key: g.id, group: g.group, tags: g.tags || [],
      items: g.items.map((it): SkillItem & { iid: string } => ({ iid: mkId(), name: it.name, stars: it.stars || 1 })),
    })));

  React.useEffect(() => {
    onChange?.(data.map((g) => ({
      id: g.key, group: g.group, tags: g.tags,
      items: g.items.map((it) => ({ name: it.name, stars: it.stars })),
    })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const upGroup = (gi: number, fn: (g: typeof data[0]) => typeof data[0]) =>
    setData((d) => d.map((g, i) => (i === gi ? fn(g) : g)));

  const addSkill = (gi: number, stars: number) =>
    upGroup(gi, (g) => ({ ...g, items: [...g.items, { iid: mkId(), name: '', stars }] }));
  const removeSkill = (gi: number, iid: string) =>
    upGroup(gi, (g) => ({ ...g, items: g.items.filter((it) => it.iid !== iid) }));
  const nameSkill = (gi: number, iid: string, name: string) =>
    upGroup(gi, (g) => ({ ...g, items: g.items.map((it) => (it.iid === iid ? { ...it, name } : it)) }));
  const renameGroup = (gi: number, group: string) => upGroup(gi, (g) => ({ ...g, group }));
  const removeGroup = (gi: number) => setData((d) => d.filter((_, i) => i !== gi));
  const addGroup = () => setData((d) => [...d, { key: mkId(), group: '', tags: [], items: [] }]);

  return (
    <>
      {data.map((g, gi) => (
        <div key={g.key} className="sv-pop" style={{
          border: '1.5px solid var(--line-strong)', borderRadius: 'var(--r)',
          background: 'var(--paper)', marginBottom: 14, overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderBottom: '1.5px solid var(--line)', background: 'var(--paper-2)',
          }}>
            <Icon name="folder" size={15} color="var(--teal)" />
            <input value={g.group} onChange={(e) => renameGroup(gi, e.target.value)} placeholder="Group name"
              className="serif" style={{ flex: 1, border: 0, background: 'transparent', fontWeight: 800, fontSize: 15, color: 'var(--ink)', outline: 'none' }} />
            <button className="iconbtn" style={{ width: 28, height: 28 }} onClick={() => removeGroup(gi)} title="Remove group">
              <Icon name="trash" size={14} />
            </button>
          </div>
          <div style={{ padding: '6px 14px 14px' }}>
            {STAR_LEVELS.map((lv) => {
              const bucket = g.items.filter((it) => it.stars === lv.stars);
              return (
                <div key={lv.stars} style={{ padding: '12px 0', borderBottom: lv.stars > 1 ? '1px solid var(--line)' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 9 }}>
                    <Stars n={lv.stars} />
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{lv.label}</span>
                    <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>— {lv.hint}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {bucket.map((it) => (
                      <SkillChip key={it.iid} name={it.name}
                        onName={(v) => nameSkill(gi, it.iid, v)}
                        onRemove={() => removeSkill(gi, it.iid)} />
                    ))}
                    <button onClick={() => addSkill(gi, lv.stars)} className="chip"
                      style={{ borderStyle: 'dashed', cursor: 'pointer', color: 'var(--ink-faint)' }}>
                      <Icon name="plus" size={11} /> add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <AddBtn label="Add skill group" onClick={addGroup} />
    </>
  );
}

/* ============================================================
   BaseCV screen
   ============================================================ */
interface BaseCVProps {
  base: BaseCV;
  onBack: () => void;
  onDone: (cv: BaseCV) => void;
}

// Normalize array fields that CF stores as joined strings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toArr(v: unknown, sep = ','): string[] {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') return v.split(sep).map((s) => s.trim()).filter(Boolean);
  return [];
}

export function BaseCVScreen({ base, onBack, onDone }: BaseCVProps) {
  const [draft, setDraft] = useState<BaseCV>(() => JSON.parse(JSON.stringify(base)));
  const g = draft.general;

  const setGen = (field: keyof typeof g, val: string) =>
    setDraft((d) => ({ ...d, general: { ...d.general, [field]: val } }));

  const setLink = (kind: 'github' | 'link', url: string) =>
    setDraft((d) => {
      const others = d.general.links.filter((l) => l.kind !== kind);
      return {
        ...d,
        general: {
          ...d.general,
          links: url ? [...others, { kind, label: kind === 'github' ? 'GitHub' : 'Website', url }] : others,
        },
      };
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setWork = (items: any[]) =>
    setDraft((d) => ({
      ...d,
      work: items.map((it) => ({
        ...it,
        bullets: toArr(it.bullets, '\n'),
        tags: toArr(it.tags),
      })),
    }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setPortfolio = (items: any[]) =>
    setDraft((d) => ({
      ...d,
      portfolio: items.map((it) => ({ ...it, tags: toArr(it.tags), images: it.images || [] })),
    }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setSection = (key: keyof BaseCV) => (items: any[]) =>
    setDraft((d) => ({ ...d, [key]: items }));

  const [active, setActive] = useState('general');
  const scrollRef = useRef<HTMLDivElement>(null);
  const secRefs = useRef<Record<string, HTMLElement>>({});

  const go = (id: string) => {
    setActive(id);
    const el = secRefs.current[id];
    const cont = scrollRef.current;
    if (el && cont) cont.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' });
  };

  const onScroll = () => {
    const cont = scrollRef.current;
    if (!cont) return;
    const top = cont.scrollTop + 80;
    let cur = 'general';
    for (const [id] of BASE_SECTIONS) {
      const el = secRefs.current[id];
      if (el && el.offsetTop <= top) cur = id;
    }
    setActive(cur);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
      {/* Top bar */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '16px 28px',
        borderBottom: '1.5px solid var(--line)', background: 'var(--card)', flexShrink: 0,
      }}>
        <button className="iconbtn" onClick={onBack} title="Back to studio"><Icon name="arrowL" size={18} /></button>
        <div>
          <div className="serif" style={{ fontWeight: 800, fontSize: 17, lineHeight: 1 }}>Base CV</div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--ink-faint)', marginTop: 3 }}>
            Source of Record · autosaved
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn btn--primary" onClick={() => onDone(draft)}>
          <Icon name="check" size={16} color="var(--paper)" /> Save &amp; Done
        </button>
      </header>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '232px 1fr', minHeight: 0 }}>
        {/* Section rail */}
        <nav style={{ borderRight: '1.5px solid var(--line)', padding: '22px 14px', overflowY: 'auto', background: 'var(--paper-2)' }}>
          <div className="kicker" style={{ padding: '0 10px 12px' }}>Sections</div>
          {BASE_SECTIONS.map(([id]) => {
            const m = SECTION_META[id];
            const on = active === id;
            return (
              <button key={id} onClick={() => go(id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', marginBottom: 2,
                border: 0, cursor: 'pointer', borderRadius: 8,
                background: on ? 'var(--card)' : 'transparent', color: on ? 'var(--ink)' : 'var(--ink-soft)',
                boxShadow: on ? `inset 2.5px 0 0 var(--${m.tone})` : 'none',
                textAlign: 'left', fontFamily: 'var(--sans)', fontSize: 13.5, fontWeight: on ? 700 : 500, transition: 'all .12s',
              }}>
                <Icon name={m.icon} size={16} color={on ? `var(--${m.tone})` : 'var(--ink-faint)'} />
                {m.label}
              </button>
            );
          })}
          <div className="card" style={{ marginTop: 16, padding: '12px 13px' }}>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: '.14em', color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: 6 }}>
              Tip · Versions
            </div>
            <p style={{ fontSize: 11.5, lineHeight: 1.5, color: 'var(--ink-soft)', margin: 0 }}>
              Use the <b>1 2 3</b> buttons atop any entry to keep alternate wordings — pull the right one per CV later.
            </p>
          </div>
        </nav>

        {/* Form */}
        <div ref={scrollRef} onScroll={onScroll} style={{ overflowY: 'auto', padding: '32px 48px 200px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <p className="serif" style={{
              fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.5,
              marginBottom: 32, paddingBottom: 20, borderBottom: '1.5px solid var(--line)',
            }}>
              Be exhaustive here — this is the whole of your career, unedited. You'll trim it into tailored readings later.
              Nothing here is shown to anyone until you draw a CV from it.
            </p>

            {/* GENERAL */}
            <SectionShell id="general" meta={SECTION_META.general} refCb={(el) => el && (secRefs.current.general = el)}>
              <FRow>
                <CF label="Full name" value={g.name} onChange={(v) => setGen('name', v)} />
                <CF label="Headline / title" value={g.title} onChange={(v) => setGen('title', v)} />
              </FRow>
              <Gap h={14} />
              <FRow>
                <CF label="Location" value={g.location} onChange={(v) => setGen('location', v)} />
                <CF label="Email" value={g.email} onChange={(v) => setGen('email', v)} />
              </FRow>
              <Gap h={14} />
              <FRow cols="1fr 1fr 1fr">
                <CF label="Phone" value={g.phone} onChange={(v) => setGen('phone', v)} />
                <CF label="GitHub" value={g.links.find((l) => l.kind === 'github')?.url || ''} onChange={(v) => setLink('github', v)} />
                <CF label="Website" value={g.links.find((l) => l.kind === 'link')?.url || ''} onChange={(v) => setLink('link', v)} />
              </FRow>
              <Gap h={14} />
              <CF label="Professional summary" value={g.summary} onChange={(v) => setGen('summary', v)} area full />
            </SectionShell>

            {/* WORK */}
            <VersionedSection
              id="work" meta={SECTION_META.work} initial={base.work} onChange={setWork}
              refCb={(el) => el && (secRefs.current.work = el)}
              makeBlank={() => ({ id: mkId(), role: '', org: '', start: '', end: '', location: '', tags: [], blurb: '', bullets: [] })}
              addLabel="Add work experience"
              renderFields={(d, set) => (
                <>
                  <FRow>
                    <CF label="Role" value={d.role} onChange={(v) => set('role', v)} />
                    <CF label="Organisation" value={d.org} onChange={(v) => set('org', v)} />
                  </FRow>
                  <Gap />
                  <FRow cols="1fr 1fr 1fr 1fr">
                    <CF label="From" value={d.start} onChange={(v) => set('start', v)} />
                    <CF label="To" value={d.end} onChange={(v) => set('end', v)} />
                    <CF label="Location" value={d.location} onChange={(v) => set('location', v)} />
                    <CF label="Tags" value={asText(d.tags)} onChange={(v) => set('tags', v)} />
                  </FRow>
                  <Gap />
                  <CF label="One-line summary" value={d.blurb} onChange={(v) => set('blurb', v)} full />
                  <Gap />
                  <CF label="Highlights (one per line)" value={asText(d.bullets, '\n')} onChange={(v) => set('bullets', v)} area full />
                </>
              )} />

            {/* EDUCATION */}
            <VersionedSection
              id="education" meta={SECTION_META.education} initial={base.education} onChange={setSection('education')}
              refCb={(el) => el && (secRefs.current.education = el)}
              makeBlank={() => ({ id: mkId(), degree: '', org: '', start: '', end: '', note: '' })}
              addLabel="Add education"
              renderFields={(d, set) => (
                <>
                  <FRow>
                    <CF label="Degree / programme" value={d.degree} onChange={(v) => set('degree', v)} />
                    <CF label="Institution" value={d.org} onChange={(v) => set('org', v)} />
                  </FRow>
                  <Gap />
                  <FRow cols="1fr 1fr 2fr">
                    <CF label="From" value={d.start} onChange={(v) => set('start', v)} />
                    <CF label="To" value={d.end} onChange={(v) => set('end', v)} />
                    <CF label="Note" value={d.note} onChange={(v) => set('note', v)} />
                  </FRow>
                </>
              )} />

            {/* PORTFOLIO */}
            <VersionedSection
              id="portfolio" meta={SECTION_META.portfolio} initial={base.portfolio} onChange={setPortfolio}
              refCb={(el) => el && (secRefs.current.portfolio = el)}
              makeBlank={() => ({ id: mkId(), kind: 'project', name: '', role: '', year: '', url: '', desc: '', images: [], platform: '', tags: [] })}
              addRow={(addItem) => (
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}><AddBtn label="Add project" onClick={() => addItem({ kind: 'project' })} /></div>
                  <div style={{ flex: 1 }}><AddBtn label="Add entire portfolio" onClick={() => addItem({ kind: 'external' })} /></div>
                </div>
              )}
              renderFields={(d, set) => {
                const kind = d.kind || 'project';
                return (
                  <>
                    <SegToggle value={kind} onChange={(k) => set('kind', k)} options={[
                      { id: 'project',  icon: 'layers',   label: 'Project' },
                      { id: 'external', icon: 'external', label: 'Entire portfolio' },
                    ]} />
                    {kind === 'project' ? (
                      <>
                        <FRow cols="2fr 1fr 1fr">
                          <CF label="Project" value={d.name} onChange={(v) => set('name', v)} />
                          <CF label="Role" value={d.role} onChange={(v) => set('role', v)} />
                          <CF label="Year" value={d.year} onChange={(v) => set('year', v)} />
                        </FRow>
                        <Gap />
                        <CF label="Link" value={d.url} onChange={(v) => set('url', v)} full />
                        <Gap />
                        <CF label="Description" value={d.desc} onChange={(v) => set('desc', v)} area full />
                        <Gap />
                        <PortfolioImages images={d.images || []} onChange={(imgs) => set('images', imgs)} />
                      </>
                    ) : (
                      <>
                        <FRow cols="2fr 1fr 1fr">
                          <CF label="Collection name" value={d.name} onChange={(v) => set('name', v)} />
                          <CF label="Platform" value={d.platform} onChange={(v) => set('platform', v)} />
                          <CF label="Year" value={d.year} onChange={(v) => set('year', v)} />
                        </FRow>
                        <Gap />
                        <CF label="External URL" value={d.url} onChange={(v) => set('url', v)} ph="behance.net/yourname" full />
                        <Gap />
                        <CF label="Description" value={d.desc} onChange={(v) => set('desc', v)} area full />
                        <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10.5, color: 'var(--ink-faint)', marginTop: 10 }}>
                          <Icon name="external" size={13} color="var(--blue)" />
                          Links recruiters straight out to your hosted gallery — no files attached.
                        </div>
                      </>
                    )}
                  </>
                );
              }} />

            {/* OTHER */}
            <VersionedSection
              id="other" meta={SECTION_META.other} initial={base.other} onChange={setSection('other')}
              refCb={(el) => el && (secRefs.current.other = el)}
              makeBlank={() => ({ id: mkId(), title: '', org: '', period: '', desc: '' })}
              addLabel="Add other experience"
              renderFields={(d, set) => (
                <>
                  <FRow cols="1fr 1fr 1fr">
                    <CF label="What" value={d.title} onChange={(v) => set('title', v)} />
                    <CF label="Where" value={d.org} onChange={(v) => set('org', v)} />
                    <CF label="When" value={d.period} onChange={(v) => set('period', v)} />
                  </FRow>
                  <Gap />
                  <CF label="Description" value={d.desc} onChange={(v) => set('desc', v)} area full />
                </>
              )} />

            {/* CERTS */}
            <VersionedSection
              id="certs" meta={SECTION_META.certs} initial={base.certs} onChange={setSection('certs')}
              refCb={(el) => el && (secRefs.current.certs = el)}
              makeBlank={() => ({ id: mkId(), name: '', org: '', year: '' })}
              addLabel="Add certification"
              renderFields={(d, set) => (
                <FRow cols="2fr 1fr 1fr">
                  <CF label="Certification" value={d.name} onChange={(v) => set('name', v)} />
                  <CF label="Issuer" value={d.org} onChange={(v) => set('org', v)} />
                  <CF label="Year" value={d.year} onChange={(v) => set('year', v)} />
                </FRow>
              )} />

            {/* SKILLS */}
            <SectionShell id="skills" meta={SECTION_META.skills} count={draft.skills.length}
              refCb={(el) => el && (secRefs.current.skills = el)}>
              <p className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', margin: '-6px 0 16px', lineHeight: 1.5 }}>
                Group by domain, then rate each skill. The stars are private — they only help you decide what to surface per role.
              </p>
              <SkillsEditor groups={base.skills} onChange={setSection('skills')} />
            </SectionShell>

            {/* LANGUAGES */}
            <VersionedSection
              id="languages" meta={SECTION_META.languages} initial={base.languages} onChange={setSection('languages')}
              refCb={(el) => el && (secRefs.current.languages = el)}
              makeBlank={() => ({ id: mkId(), name: '', level: '' })}
              addLabel="Add language"
              renderFields={(d, set) => (
                <FRow>
                  <CF label="Language" value={d.name} onChange={(v) => set('name', v)} />
                  <CF label="Proficiency" value={d.level} onChange={(v) => set('level', v)} />
                </FRow>
              )} />
          </div>
        </div>
      </div>
    </div>
  );
}
