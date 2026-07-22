# MASTER_PROMPT.md — Prompt for Gravity

> Paste everything in the fenced block below as the first message to Gravity
> when starting or resuming this project. It is self-contained: it tells
> Gravity what to build, what order to build it in, and — critically — how
> to pick the work back up if the session runs out of context or you switch
> to a different tool mid-project.

---

```
You are building "ProductGen AI PIM" — an AI-powered Product Information
Management & Dynamic Publishing Platform. Two files in this repo's /docs
folder are your source of truth and take priority over anything else,
including earlier messages in this conversation if they conflict:

  1. /docs/CLAUDE.md   — full project context: tech stack, architecture,
                          all flows, database schema, folder structure,
                          the phase-by-phase checklist, and a Build Log.
  2. /docs/SKILLS.md    — exact input/output contracts for each of the 5
                          AI agents in the enrichment pipeline, plus
                          reusable engineering skills (ImageKit handling,
                          template engine, RBAC, soft delete).

BEFORE WRITING ANY CODE:
1. Read /docs/CLAUDE.md in full, especially Section 0 (Scope Note) and
   Section 12 (Build Log). The Build Log tells you what has already been
   done — do not redo it, and do not assume a blank repo if the Build Log
   says otherwise.
2. Read /docs/SKILLS.md in full before implementing any AI agent.
3. If Section 0's scope question (standalone module vs. replacing an
   existing Node.js/MongoDB ProductGen backend) has not been explicitly
   answered by the user, ASK before scaffolding anything — this decision
   changes the entire folder/integration strategy and is not yours to
   assume silently.

HOW TO WORK:
- Follow the phase order in CLAUDE.md Section 11 (Phase 1 → Phase 9).
  Do not skip ahead to later phases before earlier ones are functionally
  complete, except where a phase is explicitly parallelizable (e.g.
  Database schema in Phase 4 should actually be stood up early since
  Phases 2/3 depend on it — use judgment, but note any reordering you do
  in the Build Log).
- Generate each missing doc file listed in CLAUDE.md Section 10 as you
  complete the corresponding phase (e.g. finish Phase 4 → write
  DATABASE_SCHEMA.md; finish Phase 5 → write AI_AGENT_DESIGN.md). Keep
  these docs in sync with what you actually built, not just the plan.
- Respect every constraint in CLAUDE.md Section 13 without exception.
  In particular: AI pipeline fires only on explicit "Submit for AI" (never
  on autosave/keystroke), soft-delete only, admin-only publish.

CONTEXT-LIMIT / TOOL-SWITCH PROTOCOL (read this even if context feels fine):
- Before your session ends, or if you sense you are running low on context,
  STOP and do the following instead of continuing to code:
  1. Append a new entry to the TOP of CLAUDE.md Section 12 (Build Log):
     date, exactly what you built/changed (files touched), any decisions
     you made that aren't already reflected elsewhere in CLAUDE.md, and a
     precise "Next:" line for whoever picks this up next.
  2. If you changed the tech stack, schema, folder structure, or any flow
     described in CLAUDE.md Sections 1-9, EDIT those sections directly so
     the file reflects reality, not just the original plan.
  3. If you changed or extended an AI agent's input/output contract, update
     the corresponding section of SKILLS.md.
  4. Only after 1-3 are done, tell the user the session is wrapping up.
- A future session (possibly a different tool entirely) will read only
  CLAUDE.md and SKILLS.md to resume — assume it has no memory of this
  conversation. Write the Build Log entry as if explaining the project to
  someone who has never seen it before.

OUTPUT DISCIPLINE:
- Keep frontend/, backend/, ai-engine/, templates/, database/, docs/,
  tests/, scripts/ as the top-level structure (CLAUDE.md Section 9) —
  don't invent a different layout.
- Every AI agent must be independently callable/testable per its contract
  in SKILLS.md, not entangled with the others.
- Never hard-delete a product row. Never call an LLM from Agents 1 or 5
  (see SKILLS.md "Pipeline Orchestrator" section) — those are rule-based.

Start now: read CLAUDE.md Section 0 and Section 12, confirm the scope
question with the user if unresolved, then begin at the current Build Log
"Next:" step.
```

---

## Notes for Anuja (not part of the pasted prompt)

- This prompt is intentionally **self-referential to the docs, not to this
  conversation** — that's what gives you tool-portability. Whether you're
  in Gravity, Claude Code, or anything else next week, the first message is
  always "read CLAUDE.md and SKILLS.md," and those two files carry the full
  state.
- The single highest-leverage habit for making this actually work across
  sessions: **insist that every session ends with a Build Log entry**
  before you close it, even a short one. If a session gets cut off
  mid-work without one, the next session will be reconstructing state from
  a code diff instead of a clear note — much slower.
- Once Gravity resolves the Section 0 scope question, come back and update
  `CLAUDE.md` Section 0 yourself with the actual answer so it stops being a
  question and becomes a stated fact.
