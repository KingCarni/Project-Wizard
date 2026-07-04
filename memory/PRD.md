# Project Wizard — PRD

## Original Problem Statement

Build **Project Wizard** — a SaaS web app that helps users plan, organize, and launch AI-generated projects. Instead of asking users to type one large prompt into an AI builder, Project Wizard interviews them like a Product Manager + UX Designer + Software Architect + QA Lead, and at the end exports:

- Builder-ready prompts (Emergent, Lovable)
- Complete project specifications (Markdown)
- QA checklists
- Launch checklists

The **Project DNA** is the source of truth. Every generated output is an export from that DNA.

**MVP is localStorage-only** — no auth, no backend, no DB, no LLM calls. Two templates fully supported (Business Website, Portfolio Website); ~10 others visible as Coming Soon.

Authoritative source-of-truth documents (uploaded by user):
- `PROJECT_WIZARD_SOURCE_OF_TRUTH.md`
- `Project Wizard Plansheet.xlsx`

## Architecture

- **Frontend**: React 18 + Tailwind 3 + shadcn-inspired custom components + lucide-react icons + framer-motion + sonner (toasts) + react-router v6.
- **Backend**: Minimal FastAPI (`/api/health` only) — the platform's supervisor expects a backend to run. All product data lives in the browser.
- **Persistence**: `localStorage` key `projectWizard.v1.projects` (array of projects). Autosaved on every mutation.
- **Data-driven templates**: `/app/frontend/src/templates/index.js` — adding a new template = adding a new object. The wizard renders whatever the template defines.
- **DNA & health**: `/app/frontend/src/lib/dna.js` — pure functions that turn a project into a structured DNA object + health/missing analysis.
- **Deterministic generators**: `/app/frontend/src/lib/generators.js` — 4 functions produce Emergent prompt, Lovable prompt, Markdown spec, QA checklist. Architected so an AI backend can later replace/augment them.

## Design system

- **Palette**: Warm white (`#fdfcfa`) base, graphite (`#1a1c23`) foreground, royal purple (`#5f22cf`) accent (never dominant). Light mode default; CSS variables ready for dark.
- **Type**: Instrument Sans (UI), Instrument Serif italic (accent for wow-moment headlines), JetBrains Mono (code blocks).
- **Motion**: Fade-up staggered lists, subtle hover translations, focus rings via `--ring`.
- **No AI-slop**: No purple gradients on white, no glassmorphism, no giant glowing buttons — Linear/Notion/Stripe restraint.

## What has been implemented

- ✅ Dashboard with empty state + project cards (health %, template icon, status chip, time-ago, delete)
- ✅ New Project flow — template picker with 2 available + 10 Coming Soon (locked)
- ✅ Three-panel Wizard (`/project/:id`)
  - Left: sections with per-section progress + step indicators + Outputs/Launch links
  - Center: card-grouped questions with 8 input types (text, textarea, select, multiselect, toggle, color, chips-add, files)
  - Right: **live Project DNA** with per-block updates, Project Health donut, Missing input list, Builder recommendation with override
- ✅ Project Context section (file upload — .md/.txt/.json read inline; PDFs/DOCX stored as metadata)
- ✅ Builder recommendation logic (auto switches to Emergent for Booking/Live-chat features)
- ✅ Autosave every change to localStorage with a visible "Saved" indicator
- ✅ Outputs page — 4 tabs (Emergent Prompt / Lovable Prompt / Markdown Spec / QA Checklist), Copy (with execCommand fallback), Download (.md), Regenerate
- ✅ Launch checklist page — per-task toggles, progress bar, "Mark as launched" CTA
- ✅ Semantic DNA blocks (Portfolio shows "Profile", Business shows "Business")
- ✅ Full localStorage persistence across refreshes

## User personas

- Small business owners, solo founders, freelancers, creators
- Job seekers building portfolios
- Non-technical users trying to use AI builders

## Core requirements (static)

- Data-driven templates (no wizard rewrite when adding types)
- Project DNA is the single source of truth
- All outputs are exports from DNA
- No auth, no database, no external APIs
- Autosave to localStorage

## Prioritized backlog / next tasks

### P0 (post-MVP)
- **LLM-powered generators**: Replace deterministic generators with LLM (Emergent LLM key) that consumes uploaded context files. Architecture already supports it.
- **Additional templates**: SaaS Landing Page, Restaurant Website, Mobile App, Booking App.

### P1
- **Authentication + cloud sync**: JWT or Emergent Google Auth; move projects to a real backend.
- **AI rewrite suggestions** on individual fields (e.g. "improve my hero headline").
- **Domain/deployment helpers**: Vercel deploy button, GitHub push flow.

### P2
- **Team collaboration**: shared projects, comments.
- **Version history & diff**: compare two generations.
- **Admin template editor**: build templates through the UI.
- **Payments**: Stripe checkout, credit system, premium templates.
- **Analytics on generated projects**: track builds and downloads.

## Testing

- Frontend end-to-end tested via testing_agent_v3 iteration 1 → 100% pass rate.
- All flows verified: empty state → new project → wizard → DNA updates → outputs → launch → back to dashboard → persistence.
- Report: `/app/test_reports/iteration_1.json`.

## Known limitations

- Preview/summary of uploaded PDF/DOCX files is not extracted (only metadata stored). Text files (.md/.txt/.json/.csv) are read inline.
- Deterministic generators — quality depends on how much the user answers. LLM enhancement is the natural next step.
- No dark mode toggle in UI (CSS is ready — one toggle away).
