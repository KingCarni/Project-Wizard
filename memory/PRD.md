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

### Iteration 3 (Current) — feedback fixes + polish
- **Dashboard card enrichment** — each project card now shows a builder chip (Emergent / Lovable) with sparkle icon, a "time ago" label with its own testid, and a "Generate" quick action when outputs haven't been generated yet.
- **Empty state polish** — decorative Interview → Project DNA → Builder-ready chip flow, warm-white gradient with a subtle purple radial spotlight, serif italic accent on the headline, footnote calling out '5 templates ready · localStorage-only · no signup required'. Reduced top whitespace.
- **Stronger deterministic generators** — every generated output (Emergent, Lovable, Markdown spec, QA) now includes:
  - Authoritative prelude: "Project DNA is the source of truth. Do not invent business facts."
  - Anti-generic `## Visual Identity` mandate: "Do not make this look like a generic AI-generated landing page."
  - `## Project Context — authoritative background` section that treats uploaded files as authoritative, lists each by name with excerpt.
  - Explicit `- [ ]` acceptance criteria including brand-fidelity items.
- **Stronger LLM system prompt** — same five non-negotiables baked into the Claude system prompt.
- **AI service local-dev clarity** — friendly error messages when `REACT_APP_BACKEND_URL` is missing/misconfigured, backend unreachable, or a 404 is returned.
- **Three-state Outputs badge**: purple "AI-generated", neutral "Template", amber "Template (fallback)" plus a new **"AI + template (partial)"** state — the partial-result contract lets us keep 3-of-4 AI outputs and fill the failing one with the template so the user is never fully blocked.
- **Partial-result contract** — `/api/generate` now returns `{ outputs, partial, failures }`. The client fills any missing kinds with deterministic template output. If ALL four fail, the yellow fallback banner fires.

## User personas

- Small business owners, solo founders, freelancers, creators
- Job seekers building portfolios
- Non-technical users trying to use AI builders

## Testing

- Iteration 1: 100% pass (frontend, single browser flow).
- Iteration 3: 100% pass (13/13 backend pytest, all frontend acceptance items). Report: `/app/test_reports/iteration_3.json`.

## Prioritized backlog / next tasks

### P0
- **Streaming AI generation** (SSE) — stream outputs as Claude writes them (removes the 45–60s spinner).

### P1
- **Auth + cloud sync** (JWT or Emergent Google Auth) so projects survive across devices.
- **Deploy helpers** on Launch checklist — Vercel deploy button, GitHub push flow, DNS verify.
- **AI rewrite for richer field types** — multiselect suggestions, keyword expansion.

### P2
- **Billing** (Stripe test key already available) — free tier w/ 3 projects + 5 AI generations, paid tier for unlimited.
- **Team collaboration**, comments, mentions.
- **Version history & diff** between generations.
- **Admin template editor** — build templates via UI (not code).

## Known limitations

- K8s ingress may have a ~60s read timeout in some environments — long Claude generations can occasionally surface as a 502 to the client even when the backend succeeds. Frontend catches this with a friendly yellow banner + template fallback, so users are never stuck.
- Uploaded PDFs/DOCX are stored as metadata only (content not extracted). Text formats (.md/.txt/.json/.csv) are read inline.
- Emergent Universal Key has a per-key budget cap — when exhausted, the backend returns a 402 with a friendly detail and the UI shows the yellow banner + template output.
