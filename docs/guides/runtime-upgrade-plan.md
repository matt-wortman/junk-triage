# Runtime & Dependency Upgrade Plan

## Objective
Safely migrate the Technology Triage Platform to the latest supported Node.js runtime and dependency set while maintaining production stability.

## Workflow
1. **Fresh Working Copy**
   - Clone `phase3-database-driven-form` into a new sibling directory (for example `tech-triage-upgrade/`).
   - Checkout a persistent upgrade branch (`upgrade/node20`) from the GitHub remote.
2. **Environment Baseline**
   - Pin Node 24 LTS via `.nvmrc`/Volta/CI configs in the branch.
   - Update Dockerfile and any CI jobs to the same Node 24 image.
3. **Dependency Audit**
   - Run `npm outdated` (expect Node 24-compatible versions) and capture direct dependencies requiring action.
   - Group upgrade targets: framework (Next.js/React), backend tooling (Prisma, Azure SDK), testing, utilities.
4. **Incremental Upgrades**
   - Upgrade one group at a time with focused commits (targeting latest stable releases).
   - After each upgrade run `npm run lint`, `npm run type-check`, and `npm test`.
   - Address breaking changes (e.g., Next.js route handlers, Prisma client APIs) immediately in the same commit.
5. **Documentation & Tests**
   - Log migration notes in `docs/guides/dependency-upgrade-YYYYMMDD.md`.
   - Add or update tests for any newly affected areas (dynamic builder, PDF export, API routes).
   - Execute targeted regression checks:
     - Form builder CRUD (create, publish, delete, clone).
     - Dynamic form submission across all field types and conditional logic.
     - PDF export generation and Excel export flows.
     - Prisma client generation and migration workflows.
     - Azure Blob storage operations and any third-party integrations.
6. **Continuous Validation**
   - Push the branch regularly and keep it rebased with production.
   - Monitor GitHub Actions (or local CI) for regression signals; resolve lingering warnings (deprecated packages, EBADENGINE).
7. **Pre-Production Verification**
   - Build the container (`az acr build …`) from the upgrade branch to confirm clean logs with Node 24.
   - Deploy to a staging Web App or Azure slot and complete exploratory QA, focusing on form builder flows and PDF exports.
   - Validate all deployment modes (Prisma dev server, docker-compose Postgres, Azure staging).
   - Capture database backups, verify `SEED_ALLOW_PURGE` safeguards, and document rollback procedures.
8. **Cutover**
   - When stable, merge `upgrade/node20` into `phase3-database-driven-form`.
   - Tag the release, run the incremental deployment, and verify `/api/health` plus key UI flows post-deploy.
9. **Cleanup**
   - Remove the temporary working directory once production is stable.
   - Update internal docs to reflect the new runtime baseline.

## Notes
- Keep commits small to simplify rollback.
- If a dependency lacks a viable upgrade path, record the blockage and revisit after upstream releases.
- Consider running `npm dedupe` before finalizing the lockfile to minimize duplicate packages.
