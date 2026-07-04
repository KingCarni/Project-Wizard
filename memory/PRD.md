# Project Wizard — PRD

## Original Problem Statement

Build **Project Wizard** — a SaaS web app that helps users plan, organize, and launch AI-generated projects. Instead of asking users to type one large prompt into an AI builder, Project Wizard interviews them like a Product Manager + UX Designer + Software Architect + QA Lead, and at the end exports:

- Builder-ready prompts (Emergent, Lovable)
- Complete project specifications (Markdown)
- QA checklists
- Launch checklists

The **Project DNA** is the source of truth. Every generated output is an export from that DNA.

Authoritative source-of-truth documents:
- `PROJECT_WIZARD_SOURCE_OF_TRUTH.md`
- `Project Wizard Plansheet.xlsx`

## Architecture

- **Frontend**: React 18 + Tailwind 3 + custom shadcn-inspired components + lucide-react + framer-motion + sonner + react-router v6.
- **Backend**: FastAPI (`/api/*`). Two LLM endpoints (`/api/generate`, `/api/rewrite`) power the AI layer; everything else is localStorage.
- **LLM layer**: Emergent Universal Key (`EMERGENT_LLM_KEY`) via `emergentintegrations`.
  - **Claude Sonnet 4.5** for major outputs (Emergent, Lovable, Markdown, QA). All 4 fan-out in parallel.
  - **Gemini 3 Flash** for inline field rewrites (fast, ~2-6s).
- **Persistence**: `localStorage` key `projectWizard.v1.projects` (array of projects). Autosaved on every mutation.
- **Data-driven templates**: `/app/frontend/src/templates/index.js` — adding a new template = adding a new object.
- **DNA & health**: `/app/frontend/src/lib/dna.js` — pure functions.
- **Deterministic generators**: `/app/frontend/src/lib/generators.js` — automatic fallback when the LLM call fails.

## Design system

- **Palette**: Warm white base, graphite fg, royal purple accent (never dominant).
- **Type**: Instrument Sans, Instrument Serif italic accent, JetBrains Mono for code.
- **Motion**: Fade-up staggered lists, subtle hover translations, animated project-health donut.

## What has been implemented

### Iteration 1 (MVP)
- Dashboard with empty state + project cards (health %, template icon, status chip)
- New Project template picker with Coming Soon lockouts
- Three-panel Wizard (left sections+progress / center card questions / right live DNA + health donut + builder recommendation)
- 8 question types (text, textarea, select, multiselect, toggle, color, chips-add, files)
- Project Context section (drop/upload files, text files inlined for later prompt use)
- Autosave to localStorage with visible "Saved" indicator
- Deterministic generators for all 4 outputs
- Launch checklist page with per-task toggles and "Mark as launched"

### Iteration 2 (Current)
- **LLM-powered generators** — Claude Sonnet 4.5 generates all 4 outputs from Project DNA (parallel fan-out). Uploaded Project Context files are included in the LLM prompt (capped at 4KB per file, top 5 files). Deterministic fallback runs automatically on any error.
- **3 new full templates**: SaaS Landing Page (lovable), Restaurant Website (lovable), Booking App (emergent).
- **Inline AI rewrite** on every text/textarea field via Gemini 3 Flash. Three guidance modes: Improve, Shorten, Punchier. Suggestions render in a purple card BELOW the field — user must click "Use this" to apply (never auto-overwrites).
- **AI status tracking**: `generatedBy` ("ai" | "deterministic"), `generatedModel`, `generatedAt` are persisted per project. Shown as a badge + model chip.
- **Graceful degradation**: Yellow error banner on any AI failure (budget exhausted, timeout, rate limit) with a clear message + automatic template fallback.

## User personas

- Small business owners, solo founders, freelancers, creators
- Job seekers building portfolios
- Non-technical users trying to use AI builders

## Testing

- Iteration 1: 100% pass (frontend, single browser flow).
- Iteration 2: 100% pass (9/9 backend pytest, all 18 frontend acceptance items). Report: `/app/test_reports/iteration_2.json`.

## Prioritized backlog / next tasks

### P0
- **Streaming AI generation** — stream each output as it's written (SSE), so users see progress in real time instead of a 45–60s spinner.
- **Partial-result contract** — if 3-of-4 kinds succeed, return the 3 AI outputs + note that 1 fell back to template.

### P1
- **Auth + cloud sync** (JWT or Emergent Google Auth) so projects survive across devices.
- **AI rewrite on richer field types** — multiselect suggestions ("here are 3 more features you might want"), keyword expansion.
- **Deploy helpers** on Launch checklist — Vercel deploy button, GitHub push.

### P2
- **Team collaboration**, comments, mentions.
- **Version history & diff** between generations.
- **Admin template editor** — build templates via UI (not code).
- **Stripe billing** — free tier with 3 projects + 5 AI generations, paid tier for unlimited.

## Known limitations

- K8s ingress may have a ~60s read timeout in some environments — long Claude generations can occasionally surface as a 502 to the client even when the backend succeeds. Frontend catches this with a friendly yellow banner + template fallback, so users are never stuck.
- Uploaded PDFs/DOCX are stored as metadata only (content not extracted). Text formats (.md/.txt/.json/.csv) are read inline.
- Emergent Universal Key has a per-key budget cap — when exhausted, the backend returns a 402 with a friendly detail and the UI shows the yellow banner + template output.
