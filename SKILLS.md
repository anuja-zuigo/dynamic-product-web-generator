# SKILLS.md — ProductGen AI PIM: Agent & Engineering Skill Contracts

> Companion to `CLAUDE.md`. Read `CLAUDE.md` first for overall project
> context; this file defines *how each AI agent works in isolation* so any
> one agent can be built, tested, and swapped without needing the others.
> If you only have this file and no conversation history, you should still
> be able to implement any one agent correctly.

---

## Why contracts, not just descriptions

Each agent below is specified as: **Trigger → Input schema → Processing →
Output schema → Failure behavior**. Treat each agent as a pure function of
its input where possible (same input → same shape of output), even though
the LLM call inside it isn't literally deterministic. This makes each agent
independently unit-testable against fixture inputs.

All agents run inside `ai-engine/` and are orchestrated by a single
**Pipeline Orchestrator** that calls them in sequence and persists each
agent's output to the `ai_reports` table (see `CLAUDE.md` §8) before calling
the next agent.

---

## Agent 1 — Product Validation Agent

**Trigger:** First step after user clicks "Submit for AI." Runs before any
LLM call — this is deterministic/rule-based, not model-based, to keep it
fast and cheap.

**Input:**
```json
{
  "product_id": "uuid",
  "fields": {
    "title": "string|null",
    "sku": "string",
    "category": "string",
    "price": "number|null",
    "description": "string|null"
  },
  "owner_id": "uuid"
}
```

**Processing:**
- Required-field check (title, sku, category, price — configurable list).
- Duplicate SKU check — scoped **per owner**, not global (multi-tenant).
- Data type/range validation (price > 0, etc.).
- Category validation against the allowed category enum/table.

**Output:**
```json
{
  "passed": true,
  "errors": [{"field": "sku", "message": "Duplicate SKU for this account"}],
  "warnings": []
}
```

**Failure behavior:** If `passed=false`, the pipeline **stops here** — do
not call the Image Analysis Agent or spend LLM budget on an invalid
product. Return errors directly to the user's review screen.

---

## Agent 2 — Image Analysis Agent

**Trigger:** Runs only if Agent 1 passed.

**Input:**
```json
{
  "product_id": "uuid",
  "images": [
    {"imagekit_url": "string", "imagekit_file_id": "string"}
  ],
  "declared_category": "string"
}
```

**Processing (via `llava` locally through Ollama):**
- Minimum 3 images enforced (reject before calling the model if fewer).
- Blur detection (Laplacian-variance or model-based sharpness score).
- Duplicate-image detection (perceptual hashing, e.g. pHash, across the
  set — cheap and doesn't need the vision model).
- Wrong-image detection — does image content plausibly match
  `declared_category` (e.g. a shoe photo for a category="Electronics"
  product should warn).
- Resolution validation against a minimum pixel-dimension threshold.

**Output:**
```json
{
  "passed": true,
  "image_count": 4,
  "issues": [
    {"imagekit_file_id": "...", "type": "blur", "severity": "warning"},
    {"imagekit_file_id": "...", "type": "duplicate_of", "ref": "...", "severity": "error"}
  ]
}
```

**Failure behavior:** `severity: error` issues block progression (e.g. fewer
than 3 usable images after dropping duplicates). `severity: warning` issues
pass through to the AI Review Agent's output for the user to see, but don't
block the pipeline.

---

## Agent 3 — Product Enrichment Agent

**Trigger:** Runs only if Agents 1 and 2 passed.

**Input:**
```json
{
  "product_id": "uuid",
  "raw_fields": {"title": "...", "category": "...", "price": "...", "notes": "..."},
  "image_captions": ["auto-caption from Agent 2, if available"]
}
```

**Processing (Gemma 3 / Qwen 2.5 via Ollama):** Generate, from the raw
fields and image captions:
- Product title (polished)
- Short description
- Long description
- Features (bullet list)
- Specifications (key-value list)
- SEO title
- Meta description
- Keywords

**Output:**
```json
{
  "title": "string",
  "short_description": "string",
  "long_description": "string",
  "features": ["string"],
  "specifications": {"key": "value"},
  "seo_title": "string",
  "meta_description": "string",
  "keywords": ["string"]
}
```

**Failure behavior:** If the model call fails or returns malformed JSON,
retry once with a stricter "JSON only" system prompt; if it fails again,
mark the field set as `enrichment_failed=true` and surface the raw fields
unchanged to the user rather than blocking the whole pipeline — enrichment
is an enhancement, not a hard gate.

---

## Agent 4 — Standardization Agent

**Trigger:** Runs on Agent 3's output (not on raw fields).

**Input:** The full output object from Agent 3, plus a reference style
guide (tone, banned words, unit conventions — configurable per catalog).

**Processing:**
- Format normalization (units, currency symbols, casing conventions).
- Grammar correction.
- Attribute consistency (e.g. "Colour" vs "Color" standardized once per
  catalog/owner, not per product).
- Output formatting to match the platform's display conventions.

**Output:** Same shape as Agent 3's output, with a `changes` array showing
what was altered:
```json
{
  "title": "string",
  "...": "...",
  "changes": [{"field": "specifications.color", "before": "Colour: red", "after": "Color: Red"}]
}
```

**Failure behavior:** Non-blocking — if standardization fails, pass Agent
3's output through unchanged and log a warning.

---

## Agent 5 — AI Review Agent

**Trigger:** Final agent, always runs if the pipeline reached this point
(even if earlier agents produced warnings).

**Input:** All prior agents' outputs for this product.

**Processing:** Synthesize a human-readable report — this agent does not
change any product data, it only summarizes.

**Output:**
```json
{
  "summary": "string — 2-3 sentence plain-language summary",
  "changes_made": ["string", "..."],
  "missing_information": ["string", "..."],
  "warnings": ["string", "..."],
  "confidence_score": 0.0
}
```

`confidence_score` should be a simple weighted function of: validation
pass/fail, count of image issues, whether enrichment/standardization
succeeded — not a second free-form LLM guess. Keep it deterministic and
explainable so the user review screen can show *why* the score is what it
is.

**This is what the user sees on the Review Screen** (Accept / Edit /
Reject), so it must be complete enough that the user doesn't need to dig
into raw agent logs to decide.

---

## Pipeline Orchestrator — cross-cutting rules

- Sequential execution, no parallelism between agents 1→5 (each depends on
  the previous succeeding or explicitly passing through).
- Persist every agent's raw input/output to `ai_reports` (see `CLAUDE.md`
  §8) — this is required for the admin's "View AI Report" step and for
  debugging/audit, not optional.
- Idempotent re-runs: if a user edits a field and resubmits, re-run the full
  pipeline for that product rather than patching individual agent outputs —
  simpler to reason about and keeps `ai_reports` history clean (append new
  rows, don't overwrite).
- Cost control: only Agents 3 and 4 (and optionally the vision step in
  Agent 2) call an LLM. Agents 1 and 5 should be pure logic — do not
  "upgrade" them to LLM calls later without a specific reason; it adds
  latency and cost for no accuracy gain on rule-checkable data.

---

## Engineering Skills (non-AI, but equally part of the build)

### Skill: ImageKit Upload Handling
- Client uploads directly to ImageKit using a signed upload token issued by
  the backend (don't proxy raw image bytes through FastAPI — costs
  bandwidth and adds latency for no benefit).
- Backend stores `imagekit_url` + `imagekit_file_id` only.
- Enforce the 3-image minimum both client-side (UX) and server-side
  (Agent 2) — never trust client-side validation alone.

### Skill: Template Engine
- Each of the 6 templates (Electronics, Fashion, Medical, Corporate,
  Minimal, Luxury) is a layout + theme-token config (see `templates` table,
  `config` jsonb column in `CLAUDE.md` §8) rendered against a common
  product-data shape — do not hand-write 6 separate one-off page
  components with duplicated logic; share a single renderer and vary
  layout/theme via config.
- Template is bound to a product only at publish time (admin selects it),
  never earlier — a product's draft/review state is template-agnostic.

### Skill: Role-Based Access (JWT)
- Two roles: `user`, `admin`. Admin-only endpoints: publish, template
  selection, pending-queue review. Enforce at the API layer (dependency/
  middleware), not just hidden in the frontend UI.

### Skill: Soft Delete
- `is_deleted` boolean + `deleted_at` timestamp on `products`. All list/read
  queries must filter `is_deleted=false` by default. Never issue a hard
  `DELETE` on a product row from application code.
