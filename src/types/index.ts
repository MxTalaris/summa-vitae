export interface Link {
  kind: 'github' | 'link' | 'linkedin';
  label: string;
  url: string;
}

export interface General {
  name: string;
  title: string;
  pronouns?: string;
  location: string;
  email: string;
  phone: string;
  links: Link[];
  summary: string;
  summaryVersions?: string[];
}

export interface WorkEntry {
  id: string;
  role: string;
  org: string;
  location: string;
  start: string;
  end: string;
  tags: string[];
  blurb: string;
  bullets: string[];
  versions?: WorkEntry[];
}

export interface EducationEntry {
  id: string;
  degree: string;
  org: string;
  start: string;
  end: string;
  note: string;
  versions?: EducationEntry[];
}

export interface PortfolioEntry {
  id: string;
  kind: 'project' | 'external';
  name: string;
  role: string;
  year: string;
  tags: string[];
  desc: string;
  url: string;
  images?: string[];
  platform?: string;
  versions?: PortfolioEntry[];
}

export interface OtherEntry {
  id: string;
  title: string;
  org: string;
  period: string;
  desc: string;
  versions?: OtherEntry[];
}

export interface CertEntry {
  id: string;
  name: string;
  org: string;
  year: string;
  versions?: CertEntry[];
}

export interface SkillItem {
  name: string;
  stars: number;
}

export interface SkillGroup {
  id: string;
  group: string;
  tags: string[];
  items: SkillItem[];
}

export interface LanguageEntry {
  id: string;
  name: string;
  level: string;
  versions?: LanguageEntry[];
}

export interface BaseCV {
  general: General;
  work: WorkEntry[];
  education: EducationEntry[];
  portfolio: PortfolioEntry[];
  other: OtherEntry[];
  certs: CertEntry[];
  skills: SkillGroup[];
  languages: LanguageEntry[];
}

export type CvStyleId = 'ledger' | 'broadsheet' | 'monolith' | 'manuscript';
export type AccentColor = 'pink' | 'blue' | 'teal' | 'yellow' | 'orange';

export interface CvStyle {
  id: CvStyleId;
  name: string;
  blurb: string;
  best: string;
}

export interface TrimmedCV {
  id: string;
  name: string;
  role: string;
  style: CvStyleId;
  updated: string;
  status: 'ready' | 'draft' | 'sent';
  pages: number;
  sections: number;
  selection?: CvSelection;
}

export interface Pov {
  id: string;
  name: string;
  accent: AccentColor;
  focus: string | null;
  desc: string;
  cvs: TrimmedCV[];
}

export interface CvSelection {
  headline?: string;
  summary: boolean;
  summaryVersion?: number;
  customSummary?: string;
  links?: string[];
  work: string[];
  education: string[];
  portfolio: string[];
  other: string[];
  certs: string[];
  skills: string[];
  languages: string[];
  versionOverrides?: Record<string, number>;
  customVersions?: Record<string, Record<string, unknown>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface BuilderDraft {
  povId: string;
  accent: AccentColor;
  name: string;
  style: CvStyleId | '';
}

export type BuildStep = 'create' | 'compose' | 'export';

export type AuthProvider = 'none' | 'github' | 'google';
