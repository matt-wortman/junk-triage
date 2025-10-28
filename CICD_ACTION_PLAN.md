# CI/CD Improvement Action Plan
## Tech Triage Platform – Executive Summary & Implementation Guide

**Prepared:** October 22, 2025
**Target Completion:** 12 weeks
**Estimated Effort:** 120-160 engineer-hours
**Estimated Cost Impact:** +$440/month for production-ready infrastructure

---

## One-Page Executive Summary

### Current State
- **Deployment:** Manual (bash script)
- **Testing:** Optional (not enforced)
- **Monitoring:** Minimal (no observability)
- **Reliability:** No auto-recovery, single point of failure
- **Security:** No scanning, long-lived secrets

### Target State (Week 12)
- **Deployment:** Fully automated with approval gates
- **Testing:** Required for all merges
- **Monitoring:** Real-time alerts and dashboards
- **Reliability:** Auto-recovery, multi-instance, data protection
- **Security:** Continuous scanning, secret rotation, encryption

### Impact
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Deployment time | 30 minutes | 5 minutes | 6x faster |
| MTTR (incident response) | 2-4 hours | 15 minutes | 8-16x faster |
| Human error risk | High (manual steps) | Low (automated) | 90% reduction |
| Unplanned downtime/year | ~12 hours | <2 hours | 85% reduction |

---

## Week-by-Week Implementation Schedule

### Week 1: GitHub Actions Foundation

**Objective:** Enforce code quality before merges

**Tasks:**
1. Create `.github/workflows/ci.yml` (build, test, lint, type-check)
2. Enable branch protection on `main`:
   - Require CI checks to pass
   - Require 1 review
3. Test locally: `git push -u origin feature/ci-setup`
4. Merge to main via PR

**Files to Create:**
- `.github/workflows/ci.yml` (65 lines)
- Update `.gitignore` with `.env*`

**Verification:**
```bash
# In GitHub: Main branch → Settings → Branch protection
# Verify: "Require status checks to pass"
```

**Owner:** Lead Engineer
**Effort:** 8 hours
**Acceptance:** PR requires passing CI before merge possible

---

### Week 2: Secrets Management & Security Scanning

**Objective:** Prevent credential leaks and detect vulnerabilities

**Tasks:**
1. Rotate all production secrets in Azure Key Vault
2. Configure GitHub OIDC with Azure (remove stored credentials)
3. Enable Dependabot for dependency updates
4. Add Trivy container scanning to CI

**Files to Create:**
- `.github/dependabot.yml` (12 lines)
- `.github/workflows/security-scan.yml` (40 lines)

**Verification:**
```bash
# Check OIDC setup
az identity show --name github-oidc

# Verify Dependabot running
# GitHub → Settings → Code security → Dependabot alerts
```

**Owner:** DevOps + Security
**Effort:** 12 hours
**Acceptance:** No stored secrets in GitHub; vulnerability scan results show

---

### Week 3: Build & Deploy Automation

**Objective:** Automate container builds and staging deployments

**Tasks:**
1. Create `.github/workflows/deploy.yml`
   - Triggers on: push to main, manual workflow_dispatch
   - Builds Docker image
   - Pushes to ACR
   - Deploys to staging automatically
   - Requires manual approval for production
2. Configure GitHub Environments (staging, production)
3. Test: Push to main, watch workflow run, verify staging deployment
4. Document deployment process in `docs/DEPLOYMENT.md`

**Files to Create:**
- `.github/workflows/deploy.yml` (90 lines)
- `docs/DEPLOYMENT.md` (reference guide)

**Verification:**
```bash
# Check GitHub Environments
# Repo → Settings → Environments

# Verify staging deployed
curl https://staging-triage.azurewebsites.net/api/health
```

**Owner:** DevOps
**Effort:** 16 hours
**Acceptance:** Staging auto-deploys; production requires approval

---

### Week 4: Database Migration Strategy

**Objective:** Test migrations before production deployment

**Tasks:**
1. Create `scripts/test-migrations.sh`
   - Runs migrations against test database
   - Seeds test data
   - Validates schema
2. Add to CI pipeline: Run before production deployment
3. Create `docs/DATABASE_MIGRATIONS.md` (runbook)
4. Test: Create dummy migration, run test script

**Files to Create:**
- `scripts/test-migrations.sh` (40 lines)
- `docs/DATABASE_MIGRATIONS.md` (troubleshooting guide)

**Verification:**
```bash
bash scripts/test-migrations.sh
# Output: ✓ Schema valid, ✓ Test data seeded
```

**Owner:** Database + Backend
**Effort:** 10 hours
**Acceptance:** All migrations tested before production

---

### Week 5: Structured Logging

**Objective:** Enable debugging through structured logs

**Tasks:**
1. Add `pino` logging library
2. Create `src/lib/logger.ts` wrapper
3. Update critical paths:
   - Form submission handlers
   - Database operations
   - Error paths
4. Configure Azure Monitor Log Analytics

**Files to Create:**
- `src/lib/logger.ts` (30 lines)
- Update `src/app/dynamic-form/actions.ts` (add logging)
- Update `src/app/api/**` routes (add logging)

**Verification:**
```bash
# Local test
npm run dev
# Console should show structured logs

# Production test
# Azure Portal → Log Analytics → Query logs
```

**Owner:** Backend Engineer
**Effort:** 12 hours
**Acceptance:** All critical operations logged; viewable in Azure

---

### Week 6: Monitoring & Alerting

**Objective:** Detect issues before users report them

**Tasks:**
1. Enable Application Insights in App Service
2. Create Azure Monitor alerts:
   - Error rate > 1%
   - Response time > 2 seconds
   - Database CPU > 80%
   - App restart
3. Configure alerts → Slack/Email notifications
4. Create dashboard in Azure

**Files to Create:**
- `infrastructure/alerts.tf` or ARM template
- `docs/MONITORING.md` (dashboard guide)

**Verification:**
```bash
# Check Application Insights
# Azure Portal → Application Insights → Performance

# Test alert: Trigger error, verify Slack notification
```

**Owner:** DevOps
**Effort:** 10 hours
**Acceptance:** Dashboard created, alerts firing, notifications working

---

### Week 7: Health Checks & Auto-Recovery

**Objective:** Auto-restart failed containers, graceful degradation

**Tasks:**
1. Enhance `/api/health` endpoint
   - Check database connectivity
   - Check disk space
   - Return detailed status
2. Configure App Service health check
3. Test: Kill database, verify app returns 503
4. Set up auto-restart policy

**Files to Create:**
- Update `src/app/api/health/route.ts` (50 lines)

**Verification:**
```bash
# Test health endpoint
curl http://localhost:3000/api/health
# Output: { status: "ok", checks: { database: "ok" } }

# Test failure
# Kill postgres, health returns 503
```

**Owner:** Backend + DevOps
**Effort:** 10 hours
**Acceptance:** Health endpoint comprehensive; auto-restart working

---

### Week 8: Blue-Green Deployments

**Objective:** Zero-downtime deployments with instant rollback

**Tasks:**
1. Configure Azure App Service deployment slots (staging, production)
2. Update deploy workflow:
   - Deploy to staging slot
   - Run smoke tests
   - Swap slots (instant cutover)
   - Monitor for errors
   - Auto-swap back if errors
3. Document rollback process

**Files to Create:**
- Update `.github/workflows/deploy.yml` (blue-green logic)
- `scripts/swap-slots.sh` (20 lines)
- `docs/ROLLBACK.md` (procedure)

**Verification:**
```bash
# Check slots
az webapp deployment slot list \
  --resource-group rg-tech-triage \
  --name tech-triage-app

# Test deployment
git push → Auto-swap to staging slot
```

**Owner:** DevOps
**Effort:** 12 hours
**Acceptance:** Zero-downtime deployment proven

---

### Week 9: Infrastructure as Code

**Objective:** Reproducible, versioned infrastructure

**Tasks:**
1. Create Terraform files:
   - `infrastructure/main.tf` (resource groups)
   - `infrastructure/database.tf` (PostgreSQL)
   - `infrastructure/app-service.tf` (App Service)
   - `infrastructure/monitoring.tf` (alerts)
2. Commit to `infrastructure/` branch
3. Document: `docs/INFRASTRUCTURE.md`
4. Test: `terraform plan` matches current infrastructure

**Files to Create:**
- `infrastructure/main.tf` (50 lines)
- `infrastructure/database.tf` (80 lines)
- `infrastructure/app-service.tf` (100 lines)
- `infrastructure/variables.tf` (40 lines)
- `infrastructure/environments/*.tfvars` (dev, staging, prod)

**Verification:**
```bash
cd infrastructure/
terraform init
terraform plan
# Output should match current Azure resources
```

**Owner:** DevOps + Infra
**Effort:** 20 hours
**Acceptance:** Terraform reflects current state; PR required for changes

---

### Week 10: GitOps & Deployment Approval

**Objective:** Formalized release process with audit trail

**Tasks:**
1. Configure GitHub Environments:
   - Staging: Auto-deploy (main branch)
   - Production: Manual approval required
2. Create CODEOWNERS file
3. Document approval process in `docs/RELEASE_PROCESS.md`
4. Test: Create PR, merge, verify approval flow

**Files to Create:**
- `.github/CODEOWNERS` (specify reviewers)
- `docs/RELEASE_PROCESS.md` (procedure)
- Update `.github/workflows/deploy.yml` (approval logic)

**Verification:**
```bash
# Check GitHub Environments
# Repo → Settings → Environments

# Test: Merge PR, manual approval needed for production
```

**Owner:** Product/DevOps
**Effort:** 8 hours
**Acceptance:** Release process formalized; audit trail present

---

### Week 11: Incident Response & Disaster Recovery

**Objective:** Fast incident resolution, business continuity

**Tasks:**
1. Create runbooks:
   - `docs/INCIDENT_RESPONSE.md` (escalation, resolution)
   - `docs/DISASTER_RECOVERY.md` (backup, restore)
   - `docs/TROUBLESHOOTING.md` (common issues)
2. Test restore from backup
3. Document rollback procedures
4. Set up Slack #incidents channel
5. Train team on procedures

**Files to Create:**
- `docs/INCIDENT_RESPONSE.md` (60 lines)
- `docs/DISASTER_RECOVERY.md` (40 lines)
- `docs/TROUBLESHOOTING.md` (80 lines)

**Verification:**
```bash
# Test restore
# Trigger database restore from backup
# Verify data consistency

# Test rollback
# Simulate failed deployment
# Execute rollback, verify success
```

**Owner:** DevOps + Team
**Effort:** 14 hours
**Acceptance:** All runbooks complete; team trained

---

### Week 12: Security Hardening & Production Launch

**Objective:** Production-ready security posture

**Tasks:**
1. Implement NextAuth integration (SSO with Azure AD)
2. Enable private endpoints for PostgreSQL
3. Enable encryption at rest (customer-managed keys)
4. Security audit of API endpoints
5. Penetration testing checklist
6. Final production readiness review
7. Production launch

**Files to Create:**
- `src/lib/auth.ts` (NextAuth configuration)
- `infrastructure/private-endpoints.tf` (PostgreSQL private link)
- `docs/SECURITY.md` (guidelines)

**Verification:**
```bash
# Test NextAuth
# Login via Azure AD, verify roles work

# Test encryption
# Verify TDE enabled on database

# Security scan
npm run security-audit
```

**Owner:** Security + Full Team
**Effort:** 20 hours
**Acceptance:** Security audit complete; CTO sign-off obtained

---

## Detailed Task Breakdown

### Phase 1: Weeks 1-2 (Foundation)

#### Week 1 Deliverables
- [x] GitHub Actions CI workflow created and tested
- [x] Branch protection rules enforced
- [x] All PRs require passing CI
- [x] .gitignore updated with secrets

**Definition of Done:**
- Main branch has build status badge
- No way to merge failing CI
- CI runs < 5 minutes

#### Week 2 Deliverables
- [x] OIDC configured with Azure
- [x] No stored secrets in GitHub
- [x] Dependabot enabled
- [x] Security scan in CI

**Definition of Done:**
- GitHub Secrets empty (except OIDC creds)
- Vulnerability reports in GitHub
- Trivy scan completes in < 3 minutes

---

### Phase 2: Weeks 3-4 (Automation)

#### Week 3 Deliverables
- [x] Deploy workflow automated
- [x] Staging auto-deploys on main branch
- [x] Production requires manual approval
- [x] GitHub Environments configured

**Definition of Done:**
- Merge to main → staging deployment automatic
- Production deploy via manual approval
- Deployment < 10 minutes end-to-end

#### Week 4 Deliverables
- [x] Migration testing automated
- [x] Pre-production migration validation
- [x] Rollback script created
- [x] Migration documentation complete

**Definition of Done:**
- All migrations tested before production
- Rollback procedure documented
- Team trained on migration process

---

### Phase 3: Weeks 5-6 (Observability)

#### Week 5 Deliverables
- [x] Structured logging implemented
- [x] Logs queryable in Azure
- [x] Debug information available
- [x] Error tracking enabled

**Definition of Done:**
- `logger.info/error` calls throughout codebase
- Logs visible in Azure Log Analytics
- Request IDs correlated across logs

#### Week 6 Deliverables
- [x] Application Insights enabled
- [x] Alerts configured and tested
- [x] Dashboard created
- [x] Slack/Email notifications working

**Definition of Done:**
- Production metrics visible in real-time
- Alerts fire within 1 minute of issue
- Team receives notifications immediately

---

### Phase 4: Weeks 7-8 (Resilience)

#### Week 7 Deliverables
- [x] Enhanced health check endpoint
- [x] Auto-restart policy configured
- [x] Graceful degradation tested
- [x] Database health verified on startup

**Definition of Done:**
- `/api/health` returns detailed status
- Failed container restarts automatically
- Cascade failures caught early

#### Week 8 Deliverables
- [x] Deployment slots configured
- [x] Blue-green deployment tested
- [x] Zero-downtime verified
- [x] Rollback procedure proven

**Definition of Done:**
- Zero-downtime deployments demonstrated
- Instant rollback if errors detected
- No user impact during deployment

---

### Phase 5: Weeks 9-10 (Infrastructure)

#### Week 9 Deliverables
- [x] Terraform infrastructure defined
- [x] All resources in version control
- [x] Multi-environment support
- [x] Validated against current state

**Definition of Done:**
- `terraform plan` matches production
- Infrastructure can be recreated from code
- No manual infrastructure changes

#### Week 10 Deliverables
- [x] GitHub Environments fully configured
- [x] CODEOWNERS set up
- [x] Release process documented
- [x] Approval workflow tested

**Definition of Done:**
- Every production change approved
- Audit trail of all deployments
- Release process auditable

---

### Phase 6: Weeks 11-12 (Hardening)

#### Week 11 Deliverables
- [x] All runbooks created
- [x] Team trained on procedures
- [x] Disaster recovery tested
- [x] Incident response drilled

**Definition of Done:**
- MTTR < 15 minutes
- Recovery procedure proven
- Team confidence in procedures

#### Week 12 Deliverables
- [x] NextAuth implemented
- [x] Encryption enabled
- [x] Private endpoints configured
- [x] Production launch approved

**Definition of Done:**
- Security audit complete
- CTO sign-off obtained
- Ready for production launch

---

## Resource Requirements

### Team Composition
- **DevOps Engineer:** 40-50 hours (lead infrastructure/CI-CD)
- **Backend Engineer:** 30-40 hours (logging, health checks, auth)
- **Frontend Engineer:** 10-15 hours (UI for incident alerts, auth)
- **Security Engineer:** 15-20 hours (scanning, encryption, audit)
- **Product Manager:** 10-15 hours (process definition, approval)
- **QA Engineer:** 10-15 hours (testing, validation, runbooks)

**Total:** 115-155 hours over 12 weeks = ~30 hours/week

### Tools & Services Required
- GitHub (already have)
- Azure Key Vault (already have)
- Azure Monitor (enable; minimal cost)
- Terraform Cloud (optional; can use local state)
- New dependencies:
  - `pino` (logging): Adds ~500KB to bundle
  - `trivy` (scanning): Container tool, no bundle impact
  - `next-auth` (auth): Adds ~100KB to bundle

### Infrastructure Cost Increase
- Current: $360/month (single App Service, single Postgres)
- Target: $800/month (auto-scaling, HA database, monitoring)
- **Delta: +$440/month**

**Cost Justification:**
- Prevents 1 incident every 6 months worth $5,000-50,000
- Reduces manual deployment time by 20 hours/month
- Enables faster feature releases

---

## Success Metrics (KPIs)

### By End of Week 4
- [ ] 100% of deployments automated
- [ ] 0 manual deployment failures
- [ ] 100% of PRs have passing CI

### By End of Week 8
- [ ] MTTR (Mean Time To Recover) < 30 minutes
- [ ] Zero downtime during deployments
- [ ] Rollback procedure proven

### By End of Week 12
- [ ] 100% of infrastructure in Terraform
- [ ] 4+ successful zero-downtime deployments
- [ ] Team trained on all procedures
- [ ] No critical security findings

### Post-Launch (Month 2+)
- [ ] MTTR < 15 minutes
- [ ] <2 hours unplanned downtime/year
- [ ] 100% of deployments via CI/CD
- [ ] 3x faster deployment cycle

---

## Risk Mitigation

### Risk 1: CI/CD Workflow Too Slow (>10 min)
**Mitigation:**
- Cache npm dependencies aggressively
- Parallelize tests
- Use Docker layer caching
- Monitor workflow time weekly

### Risk 2: False Positives in Scanning
**Mitigation:**
- Review security reports daily
- Whitelist non-critical vulnerabilities
- Update dependencies proactively
- Require security team review before deployment

### Risk 3: Complex Secrets Rotation Breaks Deployments
**Mitigation:**
- Test rotation in staging first
- Maintain backward-compatible credentials
- Have manual override procedure
- Brief team before rotation

### Risk 4: Blue-Green Swap Causes Issues
**Mitigation:**
- Test on staging frequently
- Keep previous slot stable (no cleanup)
- Auto-swap back if errors detected
- Monitor both slots during swap

### Risk 5: Terraform State Gets Corrupted
**Mitigation:**
- Use remote state in Azure Storage
- Enable state locking
- Regular backups of .tfstate
- Require code review for sensitive changes

---

## Rollout Strategy

### Internal (Week 1-2)
- Build in separate branch
- Test thoroughly locally
- Get team feedback
- Merge to main when stable

### Staging (Week 3-4)
- Deploy to staging first
- Run 1 week of staging deployments
- Verify all workflows work
- Document any issues

### Production (Week 12)
- Formal approval meeting
- CTO sign-off
- Communication plan executed
- Initial monitoring 24/7

### Gradual Rollout
- Do NOT do big bang
- Deploy incrementally:
  - Week 1-2: CI only (no enforcement)
  - Week 3: CI required for new PRs
  - Week 4: CI required for all PRs
  - Week 5-8: Gradual deployment automation
  - Week 9-12: Full automation + hardening

---

## Communication Plan

### Weekly Status Updates
- **Distribution:** Team + Leadership
- **Content:** Completed tasks, blockers, next week plan
- **Format:** 5-minute standup or email

### Monthly Steering Review
- **Attendees:** Product, Engineering, DevOps, Security
- **Agenda:** Progress, risks, resource adjustments
- **Frequency:** Monthly

### Launch Announcement
- **Timing:** 2 weeks before go-live
- **Content:** What's changing, how to deploy, new procedures
- **Channels:** Team meeting + email + wiki

### Post-Launch Support
- **First week:** 24/7 on-call
- **Escalation:** DevOps lead → Infra team → Azure support
- **Documentation:** Issues logged, runbooks updated

---

## Appendix: Quick Reference Checklists

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Type checking clean
- [ ] No linting errors
- [ ] Docker build succeeds
- [ ] Migrations tested
- [ ] Staging deployment successful
- [ ] No high-severity vulnerabilities
- [ ] Team notified

### Post-Deployment Checklist
- [ ] Health check passes
- [ ] Monitor error rate 30 min
- [ ] Verify key features work
- [ ] Database queries performant
- [ ] Logs show no warnings
- [ ] Rollback procedure tested
- [ ] Incident response team briefed

### Weekly DevOps Checklist
- [ ] Review deployment metrics
- [ ] Check vulnerability reports
- [ ] Verify backup success
- [ ] Review logs for errors
- [ ] Test rollback procedure
- [ ] Validate health checks
- [ ] Update runbooks as needed

---

**For detailed technical specifications and implementation examples, see `DEPLOYMENT_CICD_ASSESSMENT.md`**

*Document prepared by: Platform Engineering*
*Questions? Contact: DevOps Lead*
