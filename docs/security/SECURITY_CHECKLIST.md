# Security Configuration Checklist

Last updated: 2025-10-28  
Owner: DevOps + Security

Use this checklist to track security hardening tasks across CI/CD Phase 1. Items marked ✅ are complete. Manual actions that must be performed outside the repository are listed for coordination.

---

## 1. Dependency & Vulnerability Scanning
- ✅ Dependabot weekly updates for npm (`tech-triage-platform/`) and GitHub Actions (`/.github`) configured (`.github/dependabot.yml`).
- ✅ Security scan workflow (`.github/workflows/security-scan.yml`) runs Trivy (fs/image), `npm audit`, SBOM export, and CodeQL on pushes to `main` + weekly cron.
- ⚠️ Code scanning alerts require GitHub Advanced Security. Current repo is outside an organization, so SARIF results must be reviewed via Actions logs until licensing changes.
- ✅ Dependabot auto-merge policy decided: keep manual merges (patches reviewed, no auto-merge) to ensure regression suites run before dependency bumps land.

## 2. GitHub Security Settings
- ✅ Enable Dependency graph (Settings → Security → Advanced Security).
- ✅ Enable Dependabot alerts (Security tab shows status as Enabled).
- ✅ Enable Dependabot security updates (Settings → Security → Advanced Security).
- ⚠️ Secret scanning & Private vulnerability reporting need GitHub Advanced Security (not available for this repo); revisit if repository moves under a licensed org.
- ✅ Enable required status checks on `master` and `phase3-database-driven-form` for `CI - Build & Test` (branch protection enabled via GitHub CLI).

## 3. Secrets & Identity (Deferred until Azure work resumes)
- ☐ Execute Azure ↔︎ GitHub OIDC setup (`docs/runbooks/AZURE_GITHUB_OIDC_SETUP.md`) — deferred.
- ☐ Remove legacy Azure client secrets from GitHub after OIDC verification (manual; no automated rotation) — deferred.
- ☐ Document manual secret rotation cadence in operations calendar — deferred.

## 4. Observability & Incident Response (Deferred)
- ☐ Author `docs/runbooks/INCIDENT_RESPONSE.md` — deferred.
- ☐ Instrument alert routing (Azure Monitor, App Service diagnostics) — deferred.

---

## Usage
- Update this checklist whenever a task transitions.
- Reference in Sprint planning to ensure Week 2 deliverables reach completion.
- Linked from `docs/README.md` and security runbooks for quick access.
