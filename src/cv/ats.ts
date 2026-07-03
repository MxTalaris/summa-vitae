import { pickItems, SECTION_TITLES } from './CVRenderer';
import type { BaseCV, CvSelection } from '../types';

export const COMPOSE_ORDER = ['work', 'education', 'portfolio', 'other', 'certs', 'skills', 'languages'];

export function itemLabel(section: string, it: Record<string, unknown>): { main: string; sub: string } {
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

export function buildATS(base: BaseCV, sel: CvSelection): string {
  const g = base.general;
  const out: string[] = [];
  out.push(g.name.toUpperCase());
  out.push(sel.headline ?? g.title);
  out.push([g.location, g.email, g.phone].filter(Boolean).join(' | '));
  const atsLinks = sel.links !== undefined
    ? (g.links || []).filter((l) => sel.links!.includes(l.url))
    : (g.links || []);
  out.push(atsLinks.map((l) => l.label).join(' | '));
  if (sel.summary !== false) {
    const vIdx = sel.summaryVersion;
    const summaryText = (vIdx !== undefined && g.summaryVersions?.[vIdx])
      ? g.summaryVersions[vIdx]
      : (g.summaryVersions?.[0] ?? g.summary);
    if (summaryText) out.push('', 'SUMMARY', summaryText);
  }
  COMPOSE_ORDER.forEach((section) => {
    const items = pickItems(base, section as keyof BaseCV, sel) as Record<string, unknown>[];
    if (!items.length) return;
    out.push('', (SECTION_TITLES[section] || section).toUpperCase());
    items.forEach((it) => {
      const lab = itemLabel(section, it);
      if (section === 'work') {
        out.push(`${it.role as string} — ${it.org as string}, ${it.location as string} (${it.start as string}–${it.end as string})`);
        ((it.bullets as string[]) || []).forEach((b) => out.push('- ' + b));
      } else if (section === 'skills') {
        out.push(`${it.group as string}: ${(it.items as { name: string }[]).map((s) => s.name).join(', ')}`);
      } else {
        out.push(`${lab.main} — ${lab.sub}`);
        if (it.desc) out.push('  ' + (it.desc as string));
        if (it.note) out.push('  ' + (it.note as string));
      }
    });
  });
  return out.join('\n');
}
