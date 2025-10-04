# Tech Triage Platform Overview

## What This Is (One Minute)
- **Elevator pitch:** Tech Triage Platform digitizes Cincinnati Children's Innovation Ventures triage review, replacing the static PDF/Excel workflow with a guided, database-backed web application that captures ratings, narratives, and scoring in one place.
- **Who it’s for:** CCHMC Innovation Ventures reviewers, analysts, and leadership who assess new medical technology proposals. *(Add other stakeholder groups here.)*
- **Problem we solve:** Streamlines collection and scoring of technology submissions, eliminates manual spreadsheet handling, and preserves an auditable history of evaluations.
- **What success looks like:** Review teams can prepare and submit full evaluations without touching spreadsheets, drafts are never lost, and decision makers can rely on consistent scoring data. *(Add quantitative KPIs once agreed.)*

## Current State Snapshot
- **Platform status:** Database-driven form engine scaffolded with sectioned templates, conditional logic, and scoring hooks; Docker-based deployment pipeline validated; Azure container image published (`innovationventures.azurecr.io/tech-triage-platform:prod`).
- **What works today:**
  - Dynamic form renderer loads active template and renders field adapters for text, selects, scoring, and repeatable groups (baseline implementation).
  - Local development: `npm run dev` + `npx prisma dev`.
  - Local Docker environment: `docker compose up --build` brings up app + Postgres with health checks.
  - Seed tooling generates structured form templates and optional demo submissions.
- **Still in flight:**
  - Enhanced question set (60+ granular questions) and refined conditional logic.
  - Persisted drafts/submissions via API endpoints and auto-save.
  - Fully wired repeatable group tables and admin workflows.
  - Comprehensive validation experience (Zod schemas + UI).
- **Known gaps / risks:** Secrets rotation for production, Azure database hosting decision, monitoring/observability setup, test suite stabilization (5 failing tests noted), missing authentication/authorization. *(Add business/operational risks as needed.)*

## How It Works (High Level)
1. **Inputs:** Reviewers complete the dynamic triage form (text narratives, scores, yes/no responses, competitor tables).
2. **Processing:** The Next.js application renders sections from the database template, applies conditional logic, runs client/server validation, and will trigger scoring calculations and persistence via Prisma.
3. **Outputs:** Structured submissions stored in PostgreSQL with calculated scores and recommendations, ready for downstream dashboards or exports. *(Add reporting/export details when finalized.)*
4. **Data handling:** All responses—including PHI/PII—remain in PostgreSQL; secrets and transit security hardening are pending (targeting Azure-managed Postgres + TLS). *(Document final retention and privacy policies here.)*

## Why This Approach
- Template-driven architecture lets the triage team evolve questions without redeploying code.
- Next.js + Prisma stack keeps frontend, API, and persistence unified in a type-safe codebase.
- Containerized deployment (Docker) ensures consistent environments from dev through Azure.
- Evidence-based development workflow (type checks, tests, operational runbooks) reduces regressions as features ship.

## Roadmap Highlights
- **Now (0–4 weeks):** Expand template seed to full questionnaire, deliver repeatable group UI, implement draft persistence APIs, wire validation feedback, address failing tests.
- **Next (1–2 months):** Authentication/authorization (NextAuth + role model), PDF/export workflow, admin builder UI, monitoring dashboards, production secrets management.
- **Later (3+ months):** Multi-tenant readiness, analytics dashboards, advanced collaboration features, HIPAA compliance audit, form marketplace ideas. *(Revise as priorities firm up.)*
- **Decision checkpoints:** Database hosting choice for Azure, adoption of auth strategy, go/no-go for export tooling vendor. *(Add dates/owners.)*

## Trying It Out
- **Prerequisites:** Node.js 18+, Docker (optional), PostgreSQL (optional if using Prisma dev service).
- **Local steps:**
  1. Clone repo and install dependencies: `npm install`.
  2. Copy environment template: `cp .env.example .env.local` and update DB URLs.
  3. Start services: `npm run dev` (app) + `npx prisma dev` (managed Postgres with seed) or `docker compose up --build`.
  4. Visit http://localhost:3000/dynamic-form.
- **Feedback channel:** *(Specify Slack/Teams/email/GitHub issues once agreed.)*

## Glossary *(expand as new terms arise)*
- **Dynamic form engine:** Next.js + Prisma system rendering form templates from the database at runtime.
- **Repeatable group:** Table-style section allowing reviewers to add multiple entries (e.g., competitor list).
- **Submission status:** Draft vs. submitted vs. reviewed lifecycle for a triage evaluation.
- **Evidence-based verification:** Project rule requiring contextual, type, and execution proof before merges.

## Next Updates Needed
- Fill in stakeholder list, KPI targets, final data-handling copy, and feedback contact.
- Reflect roadmap adjustments after each planning cycle.
