import React, { useRef, useLayoutEffect, useState } from 'react';
import './cv.css';
import type { BaseCV, CvStyleId, CvSelection, SkillGroup } from '../types';

const CV_LAYOUTS: Record<string, {
  kind: 'single' | 'two' | 'sidebar';
  summaryInHead: boolean;
  order?: string[];
  main?: string[];
  side?: string[];
}> = {
  ledger:     { kind: 'single',  summaryInHead: true,  order: ['work','portfolio','education','skills','certs','languages','other'] },
  manuscript: { kind: 'single',  summaryInHead: true,  order: ['work','education','portfolio','other','certs','skills','languages'] },
  broadsheet: { kind: 'two',     summaryInHead: true,  main: ['work','portfolio','other'], side: ['education','skills','certs','languages'] },
  monolith:   { kind: 'sidebar', summaryInHead: false, side: ['skills','languages','education','certs'], main: ['work','portfolio','other'] },
};

export const SECTION_TITLES: Record<string, string> = {
  work: 'Experience', education: 'Education', portfolio: 'Selected Work',
  other: 'Beyond Work', certs: 'Certifications', skills: 'Skills', languages: 'Languages',
};

export function pickItems(base: BaseCV, section: keyof BaseCV, sel: CvSelection): { id: string }[] {
  const ids = sel[section as string];
  if (!Array.isArray(ids)) return [];
  const all = (base[section] as { id: string }[]) || [];
  return all.filter((it) => ids.includes(it.id));
}

export function defaultSelForFocus(base: BaseCV, focus: string | null): CvSelection {
  const byTag = <T extends { id: string; tags?: string[] }>(arr: T[]) =>
    arr.filter((it) => !focus || !it.tags || it.tags.includes(focus)).map((it) => it.id);
  return {
    summary: true,
    work: byTag(base.work),
    education: base.education.map((e) => e.id),
    portfolio: byTag(base.portfolio),
    other: base.other.slice(0, 2).map((o) => o.id),
    certs: base.certs.map((c) => c.id),
    skills: byTag(base.skills),
    languages: base.languages.map((l) => l.id),
  };
}

/* per-section item renderer */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CvItem({ section, item }: { section: string; item: any }) {
  if (section === 'work') return (
    <div className="cv-item">
      <div className="cv-item-head">
        <span className="cv-role">{item.role as string}</span>
        <span className="cv-meta">{item.start as string}–{item.end as string}</span>
      </div>
      <div className="cv-sub">{item.org as string}{item.location ? ' · ' + item.location : ''}</div>
      {(item.bullets as string[] || []).length > 0 && (
        <ul className="cv-bullets">
          {(item.bullets as string[]).map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      )}
    </div>
  );

  if (section === 'education') return (
    <div className="cv-item">
      <div className="cv-item-head">
        <span className="cv-role">{item.degree as string}</span>
        <span className="cv-meta">{item.start as string}–{item.end as string}</span>
      </div>
      <div className="cv-sub">{item.org as string}</div>
      {item.note && <ul className="cv-bullets"><li>{item.note as string}</li></ul>}
    </div>
  );

  if (section === 'portfolio') return (
    <div className="cv-item">
      <div className="cv-item-head">
        <span className="cv-role">{item.name as string}</span>
        <span className="cv-meta">{item.year as string}</span>
      </div>
      <div className="cv-sub">{item.role as string} · {item.url as string}</div>
      <ul className="cv-bullets"><li>{item.desc as string}</li></ul>
    </div>
  );

  if (section === 'other') return (
    <div className="cv-item">
      <div className="cv-item-head">
        <span className="cv-role">{item.title as string}</span>
        <span className="cv-meta">{item.period as string}</span>
      </div>
      <div className="cv-sub">{item.org as string}</div>
      <ul className="cv-bullets"><li>{item.desc as string}</li></ul>
    </div>
  );

  if (section === 'certs') return (
    <div className="cv-item">
      <div className="cv-item-head">
        <span className="cv-role">{item.name as string}</span>
        <span className="cv-meta">{item.year as string}</span>
      </div>
      <div className="cv-sub">{item.org as string}</div>
    </div>
  );

  if (section === 'skills') {
    const group = item as SkillGroup;
    const names = (group.items || [])
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .map((s) => s.name);
    return (
      <div className="cv-item">
        <div className="cv-sub" style={{ fontWeight: 700 }}>{group.group}</div>
        <div className="cv-tags">
          {names.map((s, i) => <span key={i} className="cv-tag">{s}</span>)}
        </div>
      </div>
    );
  }

  if (section === 'languages') return (
    <div className="cv-item" style={{ marginTop: 6 }}>
      <div className="cv-item-head">
        <span className="cv-role" style={{ fontWeight: 600 }}>{item.name as string}</span>
        <span className="cv-meta">{item.level as string}</span>
      </div>
    </div>
  );

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CvSection({ section, items }: { section: string; items: any[] }) {
  if (!items.length) return null;
  return (
    <section className="cv-sec">
      <h2 className="cv-sec-title">{SECTION_TITLES[section]}</h2>
      {items.map((it) => <CvItem key={it.id as string} section={section} item={it} />)}
    </section>
  );
}

function CvContact({ g }: { g: BaseCV['general'] }) {
  return (
    <div className="cv-contact">
      {g.location && <span>{g.location}</span>}
      {g.email && <span>{g.email}</span>}
      {g.phone && <span>{g.phone}</span>}
      {(g.links || []).map((l, i) => <span key={i}>{l.label}</span>)}
    </div>
  );
}

function renderSecList(base: BaseCV, sections: string[], sel: CvSelection) {
  return sections.map((s) => (
    <CvSection key={s} section={s} items={pickItems(base, s as keyof BaseCV, sel)} />
  ));
}

interface CVDocumentProps {
  base: BaseCV;
  style: CvStyleId;
  sel: CvSelection;
}

export function CVDocument({ base, style, sel }: CVDocumentProps) {
  const L = CV_LAYOUTS[style] || CV_LAYOUTS.ledger;
  const g = base.general;
  const showSummary = sel.summary !== false && !!g.summary;

  const head = (
    <header className="cv-head">
      <h1 className="cv-name">{g.name}</h1>
      <div className="cv-title">{g.title}</div>
      <CvContact g={g} />
      {L.summaryInHead && showSummary && <p className="cv-summary">{g.summary}</p>}
    </header>
  );

  let body: React.ReactNode;

  if (L.kind === 'single') {
    body = <>{head}{renderSecList(base, L.order!, sel)}</>;
  } else if (L.kind === 'two') {
    body = (
      <>
        {head}
        <div className="cv-twocol">
          <div className="cv-col-main">{renderSecList(base, L.main!, sel)}</div>
          <div className="cv-col-side">{renderSecList(base, L.side!, sel)}</div>
        </div>
      </>
    );
  } else {
    body = (
      <>
        <aside className="cv-aside">
          <h1 className="cv-name">{g.name}</h1>
          <div className="cv-title">{g.title}</div>
          <CvContact g={g} />
          {renderSecList(base, L.side!, sel)}
        </aside>
        <main className="cv-main">
          {showSummary && <p className="cv-summary">{g.summary}</p>}
          {renderSecList(base, L.main!, sel)}
        </main>
      </>
    );
  }

  return <div className={'cvdoc cvdoc--' + style}>{body}</div>;
}

interface CVPaperProps {
  base: BaseCV;
  style: CvStyleId;
  sel: CvSelection;
  monoAccent?: string;
}

export function CVPaper({ base, style, sel, monoAccent }: CVPaperProps) {
  return (
    <div className="cvpaper" style={{ ['--mono-accent' as string]: monoAccent || 'var(--pink)' }}>
      <CVDocument base={base} style={style} sel={sel} />
    </div>
  );
}

/* Scales an A4 paper to fit its container width */
interface FitPaperProps {
  base: BaseCV;
  style: CvStyleId;
  sel: CvSelection;
  accent?: string;
  pad?: number;
}

export function FitPaper({ base, style, sel, accent, pad = 0 }: FitPaperProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.72);
  const [h, setH] = useState(800);

  useLayoutEffect(() => {
    const measure = () => {
      if (!wrapRef.current || !paperRef.current) return;
      const avail = wrapRef.current.clientWidth - pad * 2;
      const s = Math.min(1, avail / 794);
      setScale(s);
      setH(paperRef.current.offsetHeight * s);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    if (paperRef.current) ro.observe(paperRef.current);
    return () => ro.disconnect();
  });

  const monoAccent = accent ? `var(--${accent})` : 'var(--pink)';

  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <div style={{ width: 794 * scale, height: h, margin: '0 auto', overflow: 'visible' }}>
        <div ref={paperRef} style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 794 }}>
          <CVPaper base={base} style={style} sel={sel} monoAccent={monoAccent} />
        </div>
      </div>
    </div>
  );
}

/* Small thumbnail for CV cards (home screen) */
interface CVThumbProps {
  base: BaseCV;
  style: CvStyleId;
  sel: CvSelection;
  w?: number;
  accent?: string;
}

export function CVThumb({ base, style, sel, w = 150, accent }: CVThumbProps) {
  const scale = w / 794;
  const monoAccent = accent ? `var(--${accent})` : undefined;
  return (
    <div style={{
      width: w, height: w * 1.414, overflow: 'hidden', background: '#fff',
      border: '1.5px solid var(--line-strong)', borderRadius: 6, position: 'relative', flexShrink: 0,
    }}>
      <div style={{
        transform: `scale(${scale})`, transformOrigin: 'top left',
        width: 794, height: 1123, ['--mono-accent' as string]: monoAccent,
      }}>
        <CVDocument base={base} style={style} sel={sel} />
      </div>
    </div>
  );
}
