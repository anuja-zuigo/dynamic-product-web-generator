# CLAUDE.md — ProductGen AI PIM: Master Project Context

We are rebuilding the "ProductGen AI PIM" as a completely new, parallel application suite.

> **CRITICAL REPOSITORY STRUCTURE NOTE:**
> This repository contains **two separate applications side by side**:
> 1. **Legacy/Live App (`server/` and `client/`)**: This is the existing Node.js/MongoDB application. **DO NOT touch, rename, or delete these folders.** They must remain untouched and live.
> 2. **New PIM Build (`backend/` and `frontend/`)**: This is the new Python/PostgreSQL/React application we are actively building. All new work should happen exclusively in these directories.

## 1. Project Phase Context

> **Read this file first, every time, before touching code.**
> This file is the single source of truth for the project. It is written so that
> if you are a *new* AI session (different tool, different day, zero prior
> memory) you can read this one file and understand exactly what the project
> is, what has been decided, what is built, and what to do next — without
> needing any other conversation history.
>
> If you make a decision that changes anything in this file, **update this
> file in the same session**, under "Decision Log" and the relevant section.
> An out-of-date CLAUDE.md is worse than no CLAUDE.md.

---

## 0. Scope Note — read before starting (important)

This spec was originally handed off with the name **"ProductGen AI PIM"** in
the title but the implementation checklist inside it was headed **"LeadFlow
AI PIM"** — a copy-paste artifact from a different project template. This
document standardizes the name to **ProductGen AI PIM** throughout.

More importantly: Anuja has an **existing, live ProductGen platform**
(Node.js/Express backend, MongoDB, a Gemini/Ollama-powered AI Copilot widget,
and an in-progress Google-Sheets-based cloud sync feature — see
`productgen-copilot` and `productgen-sheet-sync` in prior project notes).
**This new spec proposes a different stack** (FastAPI/Python, PostgreSQL,
AG Grid, a 5-agent enrichment pipeline, multi-template publishing).

Treat this PIM build as follows unless corrected:
- It is a **new, standalone module/repo**, not a rewrite of the existing
  Node/Mongo ProductGen backend.
- The **non-negotiable constraint carried over from all prior ProductGen
  work still applies**: the existing live site (landing, dashboard, import
  flow, product listing, product detail, AI Copilot widget) must never break.
- If the intent is actually to *replace* the existing backend with this
  FastAPI/Postgres one, that is a much larger migration and should be scoped
  as its own phased project (data migration, Copilot re-platforming, sheet
  sync re-platforming) — flag this explicitly to Gravity before starting
  Phase 1 so it doesn't silently start deleting working code.

---

## 1. Project Identity

| Field | Value |
|---|---|
| Project name | **ProductGen AI PIM** (AI-powered Product Information Management & Dynamic Publishing Platform) |
| Owner | Anuja — AI Engineering Intern, Zuigo |
| Build agent | "Gravity" (AI coding tool) |
| Target deadline | 23 July 2026 (⚠️ see Risk Note below) |
| Status | Planning complete → Phase 1 not yet started |

**Objective (one paragraph):** Build a production-ready SaaS platform where
businesses manage products in a spreadsheet-like interface (AG Grid), upload
images via ImageKit, let a 5-stage AI agent pipeline validate/enrich/
standardize/review the product data, let the user accept or edit AI
suggestions, route approved products to an admin for review, and publish
dynamic product webpages using one of several selectable templates.

**⚠️ Risk note on the deadline:** The full scope below (9 phases, 5 AI
agents, 5 webpage templates, full test suite, Docker deployment) is a
multi-week SaaS build, not a 2-day build. Recommend treating 23 July as the
deadline for a **working vertical slice** (Phases 1–3 + one template) and
scoping the rest as a fast-follow, rather than silently cutting corners on
all phases at once. Flag this to whoever is driving Gravity so the scope
gets explicitly triaged, not silently dropped.

---

## 2. Final Tech Stack (locked — do not substitute without updating this file)

### Core Stack
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, React Router, React Hook Form
- **Backend API**: Python (FastAPI), SQLAlchemy (ORM), Alembic (Migrations)
- **Database**: PostgreSQL (Hosted on Neon, with `sslmode=require`)
- **Containerization**: *Deprecated (Docker-compose Postgres replaced by hosted Neon)*
- **Image storage**: ImageKit
- **AI runtime**: Ollama, running Gemma 3 / Qwen 2.5 for text; BLIP or Florence-2 for image analysis
- **Auth**: JWT, role-based (`user`, `admin`)
- **Deployment**: Docker + Nginx

**Rationale notes carried from planning:** ImageKit was chosen in the
sibling ProductGen sheet-sync project over Cloudinary (quota fit) and AWS S3
(post-2025 S3 free tier is a $200/6-month credit, not indefinite free
storage) — the same reasoning applies here; reuse the same ImageKit account/
bucket strategy if this and the sheet-sync feature end up in the same repo.

---

## 3. System Architecture — Agentic Flow

```
USER → Login/Register → Product Dashboard → AG Grid Product Sheet
   → Add/Edit Product → Upload 3+ Images (ImageKit) → Save Product (Draft)
   → Submit Product to AI
   → [AI AGENT PIPELINE, sequential, runs only on explicit submit]
        1. Product Validation Agent
        2. Image Analysis Agent
        3. Product Enrichment Agent
        4. Standardization Agent
        5. AI Review Agent
   → User Review Screen (Accept / Edit / Reject)
   → Submit to Admin
   → Admin Dashboard (Review AI Report → Preview Product → Select Template → Publish)
   → Dynamic Webpage Generator → Published Website
```

**Hard rule carried from spec:** AI processing is **never** triggered by
typing/autosave. It fires exactly once, on explicit "Submit for AI" action.
This is a cost-control and UX-predictability requirement — do not add
debounced or on-change AI calls.

### 3.1 The five AI agents (contract-level detail lives in `SKILLS.md`)

1. **Product Validation Agent** — required fields, duplicate SKU, data type
   validation, category validation.
2. **Image Analysis Agent** — minimum 3 images enforced, blur detection,
   duplicate-image detection, wrong-image detection (e.g. image doesn't
   match declared category), resolution validation.
3. **Product Enrichment Agent** — generates product title, short
   description, long description, features, specifications, SEO title,
   meta description, keywords.
4. **Standardization Agent** — format normalization, grammar correction,
   attribute consistency across the catalog, output formatting.
5. **AI Review Agent** — produces a summary, list of changes made, missing
   information, warnings, and a confidence score for the user to review.

Full input/output schemas for each agent are defined in `SKILLS.md` — read
that file before implementing any agent, so agents stay swappable and
testable in isolation.

---

## 4. Product Status Flow (state machine)

```
Draft → Submitted → AI Processing → User Review → Admin Review → Published
```

Additional independent flag — **Availability** (user-controlled, separate
from the publish state machine above):

```
Active ↔ Offline → Delete (soft delete only — never hard-delete a product row)
```

A product can be `Published` and `Offline` at the same time (visible in
admin/owner views, hidden from the public site). Model these as two
separate columns, not one combined enum.

---

## 5. User Flow

```
Login → Dashboard → Products → + Add Product → Fill Product Information
→ Upload Images → Save Draft → Submit for AI → AI Processing
→ Review AI Suggestions → Accept/Edit → Submit to Admin
→ Wait for Approval → Admin Publishes → Product Live
```

## 6. Admin Flow

```
Login → Admin Dashboard → Pending Products → View Product → View AI Report
→ Preview Webpage → Choose Template → Publish → Live Website
```

## 7. Dynamic Template Flow

```
Published Product → Choose Template →
  {Electronics | Fashion | Medical | Corporate | Minimal | Luxury}
→ Generate → Publish
```

Note: the original spec's "Dynamic Template Flow" diagram lists 5 categories
in prose but 6 in the checklist/template flow (Electronics, Fashion,
Medical, Corporate, Minimal, Luxury — "Minimal" is missing from the Phase 6
checklist). Build all 6; add a `MinimalTemplate` task to Phase 6 that the
original checklist omitted.

---

## 8. Recommended Database Schema (not in original spec — added for buildability)

The original spec names tables (`Users`, `Products`, `Images`, `AI Reports`,
`Templates`, `Audit Logs`) but doesn't define columns. Recommended starting
schema — refine during Phase 4, but keep this file updated if it changes:

**users**: id (uuid, pk), email (unique), password_hash, role (enum: user,
admin), company_name, created_at, updated_at

**products**: id (uuid, pk), owner_id (fk → users), sku (unique per owner),
title, short_description, long_description, category, price, status (enum:
draft, submitted, ai_processing, user_review, admin_review, published),
availability (enum: active, offline), is_deleted (bool, default false),
selected_template_id (fk → templates, nullable), created_at, updated_at

**product_images**: id (uuid, pk), product_id (fk), imagekit_url,
imagekit_file_id, is_primary (bool), position (int), created_at

**ai_reports**: id (uuid, pk), product_id (fk), agent_name (enum: validation,
image_analysis, enrichment, standardization, review), input_snapshot (jsonb),
output (jsonb), confidence_score (float, nullable), warnings (jsonb),
created_at

**templates**: id (uuid, pk), name (enum: electronics, fashion, medical,
corporate, minimal, luxury), slug, config (jsonb — theme tokens, layout
options), is_active (bool)

**audit_logs**: id (uuid, pk), actor_id (fk → users), action, entity_type,
entity_id, before (jsonb, nullable), after (jsonb, nullable), created_at

Index at minimum: `products(owner_id, status)`, `products(sku, owner_id)`
unique, `ai_reports(product_id, agent_name)`.

---

## 9. Project Folder Structure

```
frontend/       # React + TS + Vite + Tailwind + AG Grid
backend/        # FastAPI + Python
ai-engine/      # Ollama orchestration, the 5 agents, prompt templates
templates/      # 6 webpage templates (Electronics, Fashion, Medical,
                #   Corporate, Minimal, Luxury)
database/       # PostgreSQL migrations/schema
docs/           # This file + all docs listed below
tests/          # Unit, integration, UI, AI-validation, publishing tests
scripts/        # Dev/deploy helper scripts
```

## 10. Documentation Files (`/docs`)

```
docs/
├── CLAUDE.md                 ← this file — always read first
├── SKILLS.md                 ← AI agent + engineering skill contracts
├── PRD.md
├── MASTER_PROMPT.md          ← the exact prompt to give Gravity
├── WORKFLOW.md
├── USER_FLOW.md
├── ADMIN_FLOW.md
├── AGENTIC_FLOW.md
├── SYSTEM_ARCHITECTURE.md
├── DATABASE_SCHEMA.md
├── API_SPECIFICATION.md
├── UI_UX_GUIDELINES.md
├── TEMPLATE_ENGINE.md
├── AI_AGENT_DESIGN.md
├── TEST_CASES.md
├── CONSTRAINTS.md
├── DEPLOYMENT.md
└── IMPLEMENTATION_CHECKLIST.md
```

Only `CLAUDE.md`, `SKILLS.md`, and `MASTER_PROMPT.md` exist as of this
writing (delivered together with this file). The rest are Phase-1 outputs —
Gravity should generate each one as it completes the corresponding phase,
and must append a one-line pointer to it in Section 12 (Build Log) below
so future sessions know it exists.

---

## 11. Implementation Checklist (corrected, source of truth over the original doc)

### Phase 1 — Project Setup / Refactoring
- [x] Confirm scope per Section 0 (standalone module vs. replace existing backend)
- [x] Scaffold `frontend/`, `backend/`, `ai-engine/`, `templates/`, `database/`, `docs/`, `tests/`, `scripts/`
- [x] If reusing any existing auth/layout code, port it in explicitly (don't assume — this is a different stack)

### Phase 2 — Frontend
- [x] Dashboard shell + sidebar
- [x] Authentication screens (login/register)
- [x] Product Dashboard
- [x] AG Grid integration (product sheet)
- [x] Product CRUD (add/edit/save draft)
- [x] Image Upload Modal (ImageKit, min 3 images enforced client-side too)
- [x] AI Review Screen (Accept/Edit/Reject per field)
- [x] Admin Dashboard
- [x] Template Selection Screen
- [x] Preview Page

### Phase 3 — Backend
- [x] Product APIs (CRUD, status transitions)
- [x] Image APIs (ImageKit upload proxy/signing)
- [x] AI APIs (trigger pipeline, poll/report status)
- [x] Admin APIs (pending queue, approve/reject, publish)
- [x] Publishing APIs (template render + go-live)

### Phase 4 — Database
- [x] Users table
- [x] Products table
- [x] Product images table
- [x] AI reports table
- [x] Templates table
- [x] Audit logs table
- [x] Migrations set up (Alembic recommended for FastAPI/Postgres)

### Phase 5 — AI Engine
- [ ] Validation Agent
- [ ] Image Analysis Agent
- [ ] Enrichment Agent
- [ ] Standardization Agent
- [ ] Review Agent
- [ ] Pipeline orchestrator (sequential, fails closed — see CONSTRAINTS.md)

### Phase 6 — Dynamic Templates
- [ ] Electronics template
- [ ] Fashion template
- [ ] Corporate template
- [ ] Medical template
- [ ] Minimal template *(added — missing from original checklist)*
- [ ] Luxury template

### Phase 7 — Publishing
- [ ] User review step wired to pipeline output
- [ ] Admin approval step
- [ ] Dynamic page generator (template + product data → static/SSR page)
- [ ] Publish workflow (status transition + go-live)

### Phase 8 — Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] UI tests
- [ ] AI validation tests (does each agent's output match its schema + sane confidence bounds)
- [ ] Publishing tests (template render correctness per category)

### Phase 9 — Production
- [ ] Dockerfiles (frontend, backend, ai-engine)
- [ ] docker-compose for local/staging
- [ ] Environment variables documented in `DEPLOYMENT.md`
- [ ] Build optimization (Vite build, FastAPI worker tuning)
- [ ] Final deployment (Nginx reverse proxy + TLS)

---

## 12. Build Log / Decision Log (append-only — newest entry on top)

> Every session, before ending, add one entry here: date, what was built or
> decided, what file(s) changed, what's next. This is what lets a fresh
> session with zero memory pick up exactly where you left off.

- **2026-07-22** — Integrated Neon Postgres.
  - Added `backend/.env` containing the `DATABASE_URL` pointing to the Neon connection string, and updated `alembic/env.py` + `database.py` to use `python-dotenv` so Alembic can find the env vars locally.
  - Confirmed `models.py` uses an absolute import (`from database import Base`), preventing Alembic autogenerate relative import errors.
  - Ran Alembic migrations against the hosted Neon database and confirmed tables were successfully generated.
  - Deprecated the `docker-compose.yml` local Postgres service in favor of the Neon instance, updating `DEPLOYMENT.md` and this `CLAUDE.md` accordingly.
- **2026-07-22** — Phase 3 (Backend FastAPI endpoints) Scaffolding Completed.
  - Implemented `auth.py` and `schemas.py` for JWT validation, bcrypt hashing, and Pydantic models.
  - `routers/auth.py`: Added `/login` and `/register` endpoints. Seeded `admin@productgen.ai` and `user@productgen.ai`.
  - `routers/products.py`: Added CRUD endpoints and status transitions. Hard-enforced 3-image minimum before `submitted`. Soft delete (`is_deleted=false`) uniformly enforced.
  - `routers/images.py`: Added ImageKit signature endpoint and image association endpoint.
  - `routers/ai.py`: Added `/trigger-ai` which currently mocks the 5-agent pipeline synchronously, deterministically writing dummy `ai_reports` to the DB that perfectly match the `SKILLS.md` schemas.
  - `routers/admin.py`: Added pending queue endpoint and approve/reject/publish endpoints. Enforces `admin` role explicitly.
  - Wrote `/docs/API.md` documenting the new API layer.
  - **Verification**: Fully verified end-to-end against the Neon database: login returns correct JWT + role, product create/read persists correctly, admin-only routes correctly return 403 for non-admin tokens, and registration safely defaults new users to role `user`.
  - **Auth & Routing**: Confirmed working. Role-based routing successfully directs `admin@productgen.ai` to Admin Dashboard and `user@productgen.ai` to Product Dashboard.
  - **Tailwind CSS**: Fixed styling regression (Tailwind v4 `@import` syntax updated in `index.css`).
  - **AG Grid**: Honestly confirming that `ProductDashboard.tsx` *is* actually using the real `AgGridReact` component (from `ag-grid-react` and `ag-grid-community`) with sorting and filtering enabled, backed by mock data matching the `Product` schema.
  - **Theme Note**: The color theme shifted to indigo/purple during the auth work (accidental drift from the original green landing page theme). This should be unified in the future for brand consistency.
  - **Next**: Formulate and execute a plan to connect the full Phase 2 UI mock flow end-to-end (Image Upload -> AI Review -> Admin Approval -> Publish) without touching Phase 3 actual backend APIs yet.
- **2026-07-22** — Implemented Phase 2 Authentication screens (Login/Register) and Role-Based Routing. **Note:** Auth is currently mocked with hardcoded frontend credentials (not secure, visible in the JS bundle), to be replaced when Phase 3's real auth API lands. This ensures a future session doesn't mistake it for production-ready auth. Route guards redirect non-admins from admin routes, and logged-in users away from the login/register screens.
- **2026-07-21** — Proceeding with Phase 2 (Frontend) AG Grid integration using a **mock API layer** (`src/lib/api.ts`). The mock data shapes exactly match the real Phase 3 API contract (based on Section 8 schema) so swapping to `fetch` later is a 1-line change. **Note to future sessions:** The frontend is currently running against mocks, not a live backend; do not mistake it for a fully wired app until Phase 3 integration is done.
- **2026-07-21** — Phase 4 Database Schema implemented in SQLAlchemy (`models.py`) and Alembic configured. Note: `alembic revision --autogenerate` has not been run yet because no live PostgreSQL instance was available during this session. A `docker-compose.yml` was provided, but the host must start it and run the migrations. Phase 2 Frontend Dashboard Shell built with React Router, `DashboardLayout.tsx`, and `Sidebar.tsx`. `DATABASE_SCHEMA.md` and `DEPLOYMENT.md` generated. **Next: Start Database container, run `alembic revision --autogenerate -m "Init"`, and then proceed to build out Phase 2 Product Dashboard with AG Grid.**
- **2026-07-21** — Confirmed scope with user: this is a **Standalone module (new repo/module)**. Scaffolded top-level directories (`frontend/`, `backend/`, `ai-engine/`, `templates/`, `database/`, `tests/`, `scripts/`). Initialized React+Vite+Tailwind in `frontend/` and FastAPI environment in `backend/`. **Next: Stand up PostgreSQL database schema (Phase 4 reordered early) and begin Phase 2 (Frontend) dashboard shell.**
- **2026-07-21** — Plan refined and standardized (name, missing Minimal
  template, missing DB schema, deadline risk flagged, scope-conflict with
  existing ProductGen Node/Mongo stack flagged). `CLAUDE.md`, `SKILLS.md`,
  `MASTER_PROMPT.md` created. No code written yet. **Next: resolve Section 0
  scope question, then start Phase 1.**

---

## 13. Non-Negotiable Constraints (full list also in `CONSTRAINTS.md` once generated)

1. AI pipeline only runs on explicit "Submit for AI" — never on keystroke/autosave.
2. Minimum 3 images required before a product can be submitted for AI.
3. Products are never hard-deleted — availability=Delete is a soft delete (set `is_deleted=true`, keep the row).
4. Admin is the only role that can publish — user role can submit but not publish.
5. Every AI agent output must be reviewable/editable by the user before it reaches admin — no silent auto-accept.
6. If this build shares infrastructure with the existing ProductGen platform (Copilot, sheet-sync), the existing live site must never break — verify before merging anything.
7. Template selection happens at Admin Review, not earlier — a product isn't bound to a template until publish time.
