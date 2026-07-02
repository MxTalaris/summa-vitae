import type { BaseCV, Pov, CvStyle } from '../types';

export const SEED_BASE_CV: BaseCV = {
  general: {
    name: "Divi Augusti",
    title: "Technical Product Manager & Front-End Engineer",
    location: "Lisbon, Portugal · Remote (CET)",
    email: "divi.augusti@summa.cv",
    phone: "+351 910 000 142",
    links: [
      { kind: "github",   label: "github.com/diviaugusti",       url: "https://github.com/diviaugusti" },
      { kind: "link",     label: "diviaugusti.dev",              url: "https://diviaugusti.dev" },
      { kind: "linkedin", label: "linkedin.com/in/diviaugusti",  url: "https://linkedin.com/in/diviaugusti" },
    ],
    summary:
      "Technical PM who still writes the prototype. Ten years turning ambiguous problems into shipped product — bridging design, engineering and the business with equal fluency. I lead from the artefact: specs that compile, roadmaps that survive contact with reality, interfaces that feel inevitable.",
  },

  work: [
    {
      id: "w1", role: "Senior Technical Product Manager", org: "Meridian Systems",
      location: "Remote", start: "2022", end: "Present", tags: ["pm", "fe"],
      blurb: "Own the developer-platform surface end to end — from API ergonomics to the docs portal UI.",
      bullets: [
        "Led the 0→1 of a self-serve API console used by 38k developers; cut time-to-first-call from 40 min to under 4.",
        "Wrote the front-end of the interactive playground myself (React + WebSockets) to de-risk the spec before staffing it.",
        "Ran a 9-person squad across PM, design and eng; shipped 6 quarters on or ahead of roadmap.",
        "Defined the platform's North-Star (activated developers / week) and the metric tree beneath it.",
      ],
    },
    {
      id: "w2", role: "Product Manager, Growth", org: "Halyard",
      location: "Berlin", start: "2019", end: "2022", tags: ["pm"],
      blurb: "Owned activation & onboarding for a 1.2M-user B2B SaaS.",
      bullets: [
        "Rebuilt onboarding as a guided 'first value' flow; lifted week-1 activation 22% → 34%.",
        "Stood up the experimentation practice — 80+ A/Bs/yr, a shared metrics layer, and a kill-criteria culture.",
        "Partnered with sales to translate enterprise friction into a self-serve trial that became 28% of new ARR.",
      ],
    },
    {
      id: "w3", role: "Front-End Engineer", org: "Halyard",
      location: "Berlin", start: "2017", end: "2019", tags: ["fe"],
      blurb: "Core web app team — design systems and performance.",
      bullets: [
        "Built and maintained the component library (40+ components) adopted by 5 product teams.",
        "Drove a performance program that took median TTI from 6.1s to 2.3s.",
        "Introduced visual-regression testing; reduced UI defects reaching prod by ~60%.",
      ],
    },
    {
      id: "w4", role: "Front-End Developer", org: "Studio Cosmica",
      location: "Lisbon", start: "2015", end: "2017", tags: ["fe"],
      blurb: "Agency — interactive marketing sites & product MVPs.",
      bullets: [
        "Shipped 20+ client front-ends; specialised in motion and WebGL microsites.",
        "Two projects recognised at Awwwards (Honourable Mention).",
      ],
    },
  ],

  education: [
    { id: "e1", degree: "M.Sc. Human-Computer Interaction", org: "University of Lisbon",
      start: "2013", end: "2015", note: "Thesis: trust signals in self-serve developer tooling." },
    { id: "e2", degree: "B.Sc. Computer Science", org: "University of Coimbra",
      start: "2009", end: "2013", note: "Minor in Cognitive Science." },
  ],

  portfolio: [
    { id: "p1", kind: "project", name: "Console", role: "PM + FE lead", year: "2023", tags: ["pm", "fe"],
      desc: "Self-serve API console & interactive playground. React, WebSockets, OpenAPI-driven UI.",
      url: "diviaugusti.dev/console", images: ["Console — overview", "Playground UI", "Metrics view"] },
    { id: "p2", kind: "project", name: "Metric Tree", role: "Creator", year: "2021", tags: ["pm"],
      desc: "Open-source toolkit for modelling North-Star metric trees. 2.1k GitHub stars.",
      url: "github.com/diviaugusti/metric-tree", images: ["Tree editor"] },
    { id: "p3", kind: "project", name: "Reagent", role: "Author", year: "2020", tags: ["fe"],
      desc: "A tiny (1.4kb) reactive state primitive for the DOM. Used in 30+ production sites.",
      url: "github.com/diviaugusti/reagent", images: [] },
    { id: "p5", kind: "external", name: "Behance — Selected motion work", platform: "Behance", role: "Curated gallery",
      year: "2024", tags: ["fe"], desc: "Full portfolio of motion & WebGL microsites, hosted externally.",
      url: "behance.net/diviaugusti" },
    { id: "p4", kind: "project", name: "Orbit", role: "Designer + dev", year: "2016", tags: ["fe"],
      desc: "WebGL data-viz microsite for a space-weather agency. Awwwards HM.",
      url: "diviaugusti.dev/orbit", images: ["Hero scene", "Data layer"] },
  ],

  other: [
    { id: "o1", title: "Mentor", org: "ADPList & Techstars", period: "2020–Present",
      desc: "120+ sessions mentoring PMs transitioning from engineering." },
    { id: "o2", title: "Speaker", org: "Web Summit, Prstep Conf", period: "2019–Present",
      desc: "Talks on 'PMs who prototype' and developer-experience metrics." },
    { id: "o3", title: "Maintainer", org: "Open source", period: "2018–Present",
      desc: "Two libraries with combined 4k+ stars; ~30 community PRs merged/yr." },
  ],

  certs: [
    { id: "c1", name: "Pragmatic Institute — PMC-VI", org: "Pragmatic", year: "2021" },
    { id: "c2", name: "Reforge — Product Strategy", org: "Reforge", year: "2022" },
    { id: "c3", name: "AWS Certified Cloud Practitioner", org: "Amazon", year: "2020" },
  ],

  skills: [
    { id: "s-pm", group: "Product", tags: ["pm"], items: [
      { name: "Roadmapping", stars: 3 }, { name: "Discovery & research", stars: 3 },
      { name: "Metric trees", stars: 3 }, { name: "Stakeholder alignment", stars: 3 },
      { name: "Experimentation (A/B)", stars: 2 }, { name: "Go-to-market", stars: 2 },
      { name: "Pricing & packaging", stars: 1 },
    ]},
    { id: "s-fe", group: "Engineering", tags: ["fe"], items: [
      { name: "TypeScript", stars: 3 }, { name: "React", stars: 3 }, { name: "Design systems", stars: 3 },
      { name: "Next.js", stars: 2 }, { name: "WebSockets", stars: 2 }, { name: "Performance", stars: 2 },
      { name: "Node", stars: 2 }, { name: "WebGL / Canvas", stars: 1 },
    ]},
    { id: "s-tool", group: "Tooling", tags: ["pm", "fe"], items: [
      { name: "Figma", stars: 3 }, { name: "Linear", stars: 3 }, { name: "Amplitude", stars: 2 },
      { name: "OpenAPI", stars: 2 }, { name: "Storybook", stars: 2 }, { name: "Playwright", stars: 1 },
    ]},
  ],

  languages: [
    { id: "l1", name: "Portuguese", level: "Native" },
    { id: "l2", name: "English",    level: "Fluent (C2)" },
    { id: "l3", name: "German",     level: "Professional (B2)" },
    { id: "l4", name: "Spanish",    level: "Conversational (B1)" },
  ],
};

export const SEED_POVS: Pov[] = [
  {
    id: "pov-pm", name: "Technical Product Management", accent: "pink", focus: "pm",
    desc: "Platform & developer-product PM roles.",
    cvs: [
      { id: "cv-pm-1", name: "Senior PM — Developer Platforms", style: "ledger",
        role: "Senior PM", updated: "3 days ago", status: "ready", pages: 1, sections: 6 },
      { id: "cv-pm-2", name: "Group PM — Fintech", style: "broadsheet",
        role: "Group PM", updated: "2 weeks ago", status: "draft", pages: 2, sections: 7 },
    ],
  },
  {
    id: "pov-fe", name: "Front-End Development", accent: "blue", focus: "fe",
    desc: "Senior IC engineering & design-systems roles.",
    cvs: [
      { id: "cv-fe-1", name: "Senior Front-End Engineer", style: "monolith",
        role: "Senior FE", updated: "Yesterday", status: "ready", pages: 1, sections: 6 },
    ],
  },
  {
    id: "pov-dx", name: "Developer Experience / DevRel", accent: "teal", focus: null,
    desc: "Hybrid advocacy + product roles.",
    cvs: [],
  },
];

export const CV_STYLES: CvStyle[] = [
  { id: "ledger",     name: "Ledger",     blurb: "Single-column, mono labels, hairline rules. Quiet and exacting.", best: "ATS-safe · technical roles" },
  { id: "broadsheet", name: "Broadsheet", blurb: "Editorial two-column with a serif masthead. Reads like a profile.", best: "Senior / leadership" },
  { id: "monolith",   name: "Monolith",   blurb: "Bold sidebar, heavy type, one ink accent. Confident and modern.", best: "Design-adjacent · product" },
  { id: "manuscript", name: "Manuscript", blurb: "Centred classical serif, generous margins. Understated authority.", best: "Academic · research" },
];
