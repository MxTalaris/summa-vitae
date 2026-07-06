# Summa Vitae

> *The sum of your professional life — and the engine to share exactly the right version of it.*

---

## Philosophy

Every job application asks you to shrink yourself.

HR processes, recruiters, and application portals all require you to butcher parts of your professional history to fit a word count, a template, or someone's preconceived notion of a role. And every time you deliberately leave something out, it just feels wrong. 

That experience happened. That skill was earned. That project mattered.

Summa Vitae starts from a different premise: **you deserve a source of truth**.

Not a trimmed-down LinkedIn profile. Not the version you sent to that one company in 2019 that you can't find anymore. A complete, honest, living record of everything you've done and everything you are.

Kept in one place, owned by you.

From that source of truth, Summa Vitae lets you generate any number of tailored CVs in seconds. Change the point of view, trim the parts that the employer might deem irrelevant for that job, pick a style, export to PDF. The source stays whole; only the presentation changes.

**This is not just a tool. It's a statement**: that your complete story has value, that you shouldn't have to apologize for a career that doesn't fit a box, and that the hiring process should work harder to understand you, not the other way around.

Summa Vitae was ideated and built by [Kevin Talarico](https://github.com/MxTalaris), with Claude AI as a coding collaborator.

It is intended to be free, open-source, and available. Always. Let's make the internet a better place for everyone.

---

## Features

- **Base CV** — your complete, unfiltered professional history
- **Trimmed CV builder** — a 3-step wizard to select entries, choose a point of view, and pick a visual style
- **4 CV styles** — Ledger, Broadsheet, Monolith, Manuscript
- **Cloud sync** — auto-saves to Google Drive; conflict resolution on multi-device edits
- **Mobile-friendly** — works on phone and tablet, with PDF export
- **No backend, no subscription** — 100% static, deployed on GitHub Pages

---

## Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| UI framework | React 18 + TypeScript (Vite) |
| State management | Zustand with `persist` middleware |
| Styling | CSS custom properties design system (no Tailwind, no CSS-in-JS) |
| Auth — Google | PKCE OAuth (scaffolded, in progress) |
| Storage — Google | Google Drive (in progress) |
| Deployment | GitHub Pages via GitHub Actions |


### Data Model

All data lives in a single JSON document (`cv-data.json`) stored either in `localStorage` or synced to the user's Google Drive. The document contains:

- **Entries** — the atomic units of your career (jobs, projects, education, skills, etc.)
- **POVs (Points of View)** — named entry selections that frame your story for a specific role or audience
- **Trimmed CVs** — saved configurations combining a POV, a style, and layout options
- **Metadata** — `lastSaved` ISO timestamp used to detect sync conflicts across devices

### Sync Flow

```
Login with Google
  → PKCE OAuth → Google token
  → readRemoteData() from Google Drive
      → No remote data  →  push local
      → lastSaved match  →  already in sync
      → Mismatch         →  ConflictModal (side-by-side comparison)
```

Tokens are intentionally **not persisted** to `localStorage` for security. The username is persisted so the UI stays personalized; re-authentication happens silently at the start of each session.

### Key Source Files

| File | Purpose |
|---|---|
| [src/types/index.ts](src/types/index.ts) | All TypeScript types |
| [src/store/useStore.ts](src/store/useStore.ts) | Zustand store (auth, data, sync state) |
| [src/lib/github.ts](src/lib/github.ts) | GitHub API: Device Flow, repo CRUD, Gist sharing |
| [src/lib/google.ts](src/lib/google.ts) | Google OAuth scaffolding |
| [src/App.tsx](src/App.tsx) | Root: auth orchestration, modals, auto-save |
| [src/cv/CVRenderer.tsx](src/cv/CVRenderer.tsx) | CV rendering, FitPaper, CV thumbnails |
| [src/cv/cv.css](src/cv/cv.css) | The 4 CV style themes |
| [src/styles/globals.css](src/styles/globals.css) | Design system CSS variables |
| [src/data/seed.ts](src/data/seed.ts) | Seed data for new users |

---

## Running Locally

**Prerequisites:** Node.js 18+ and npm.

```bash
# 1. Clone the repository
git clone https://github.com/MxTalaris/SummaVitae.git
cd SummaVitae

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

To build for production:

```bash
npm run build
```

The output goes to `dist/`. The app is configured to deploy to GitHub Pages at the `/SummaVitae/` base path via the workflow at [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

---

## Roadmap

Contributions and forks are welcome. Here's what I'd love to see built and will be working on next:

- **Design & UI polish** — especially on mobile; the experience should feel native, not adapted
- **Onboarding & tips** — a more guided first-run experience and in-app hints for getting the most out of your Base CV
- **Multi-language support** — interface localization, and ideally the ability to maintain parallel language versions of your CV entries
- **New CV Designs & Customization** — I'm not 100% happy with the existing designs. There could be options to customize them as well
- **Summa Sharing** — a public multi-view page where visitors can switch between different POVs of your CV, all from a single link (perhaps also allow embedding code tob e shared)
- **CV import** — I initially think of simply accepting a structured JSON, so you send you CV for your pet AI, use a prompt provided by Summa Vitae, then get a reply to copy and paste in the import section. BUT, could also parse an existing PDF or LinkedIn export to pre-populate your Base CV and lower the barrier to getting started

If any of these resonate with you, open an issue or submit a PR.

---

## License

MIT — free to use, fork, and build upon.
