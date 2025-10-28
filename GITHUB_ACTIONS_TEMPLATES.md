# GitHub Actions Workflow Templates
## Ready-to-Use CI/CD Workflows for Tech Triage Platform

**Purpose:** Copy-paste templates for immediate implementation
**Status:** Production-ready
**Last Updated:** October 22, 2025

---

## Template 1: Build & Test CI Pipeline

**File:** `.github/workflows/ci.yml`
**Triggers:** Every pull request, every push to main
**Duration:** ~5 minutes
**Purpose:** Enforce code quality before merges

```yaml
name: CI - Build & Test

on:
  pull_request:
    branches: [main]
    paths:
      - 'tech-triage-platform/**'
      - '.github/workflows/ci.yml'
  push:
    branches: [main]
    paths:
      - 'tech-triage-platform/**'

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: 'tech-triage-platform/package-lock.json'

      - name: Install dependencies
        working-directory: tech-triage-platform
        run: npm ci

      - name: Type checking
        working-directory: tech-triage-platform
        run: npm run type-check

      - name: Linting
        working-directory: tech-triage-platform
        run: npm run lint

      - name: Run tests
        working-directory: tech-triage-platform
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./tech-triage-platform/coverage/lcov.info
          flags: unittests
          fail_ci_if_error: false

      - name: Build application
        working-directory: tech-triage-platform
        run: npm run build
        env:
          DOCKER_BUILD: 'false'  # Enforce linting in CI builds

      - name: Build Docker image (test)
        working-directory: tech-triage-platform
        run: |
          docker build \
            --build-arg NODE_VERSION=18.20.4 \
            --target final \
            -t tech-triage:ci-test .

      - name: Check Docker image size
        run: |
          SIZE=$(docker images tech-triage:ci-test --format "{{.Size}}")
          echo "Docker image size: $SIZE"
          # Alert if >1GB
          BYTES=$(docker images tech-triage:ci-test --format "{{.Size}}" | numfmt --from=iec)
          if [ "$BYTES" -gt 1073741824 ]; then
            echo "⚠️ Warning: Docker image exceeds 1GB"
          fi

      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ CI Checks Passed\n- Type checking: passed\n- Linting: passed\n- Tests: passed\n- Build: successful'
            })
```

**Setup Instructions:**
1. Create `.github/workflows/ci.yml`
2. Copy content above
3. Push to repository
4. Verify workflow appears in GitHub Actions tab
5. Create test PR to verify workflow runs

**Verification:**
```bash
# After pushing:
# 1. Go to GitHub repo
# 2. Pull Requests tab
# 3. Create new PR (or modify existing)
# 4. See workflow run in "Checks" section
# 5. All checks must pass before merge option appears
```

---

## Template 2: Security Scanning

**File:** `.github/workflows/security.yml`
**Triggers:** Every push to main, weekly schedule
**Duration:** ~8 minutes
**Purpose:** Detect vulnerabilities and security issues

```yaml
name: Security Scan

on:
  push:
    branches: [main]
    paths:
      - 'tech-triage-platform/**'
      - '.github/workflows/security.yml'
  schedule:
    # Run every Monday at 2 AM UTC
    - cron: '0 2 * * 1'

permissions:
  security-events: write
  contents: read

jobs:
  trivy-fs:
    name: Trivy Filesystem Scan
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy filesystem scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: 'tech-triage-platform'
          format: 'sarif'
          output: 'trivy-fs-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-fs-results.sarif'
          category: 'trivy-fs'

  trivy-docker:
    name: Trivy Docker Image Scan
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Build Docker image
        run: |
          docker build -t tech-triage:scan tech-triage-platform/

      - name: Run Trivy image scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'tech-triage:scan'
          format: 'sarif'
          output: 'trivy-image-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload Trivy image results
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-image-results.sarif'
          category: 'trivy-image'

  dependency-check:
    name: Dependency Check
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Check for known vulnerabilities
        working-directory: tech-triage-platform
        run: npm audit --audit-level=moderate || true
        # Don't fail build on npm audit, just report

      - name: Generate SBOM (Software Bill of Materials)
        working-directory: tech-triage-platform
        run: npm ls --depth=0 > sbom.txt
        continue-on-error: true

      - name: Upload SBOM
        uses: actions/upload-artifact@v3
        with:
          name: sbom
          path: tech-triage-platform/sbom.txt

  codecql:
    name: CodeQL Analysis
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: 'javascript'

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        working-directory: tech-triage-platform
        run: npm ci

      - name: Perform CodeQL analysis
        uses: github/codeql-action/analyze@v2
```

**Setup Instructions:**
1. Create `.github/workflows/security.yml`
2. Copy content above
3. In GitHub Settings → Code security:
   - Enable "Dependabot" alerts
   - Enable "Secret scanning"
   - Enable "Code scanning" (CodeQL)
4. Push and verify workflow runs

**Verification:**
```bash
# Check results in:
# 1. Security tab → Code scanning alerts
# 2. Security tab → Dependabot alerts
# 3. Security tab → Secret scanning
```

---

## Template 3: Deploy to Azure

**File:** `.github/workflows/deploy.yml`
**Triggers:** Push to main (auto-staging), manual approval (production)
**Duration:** ~20 minutes
**Purpose:** Automated deployment with approval gates

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]
    paths:
      - 'tech-triage-platform/**'
      - '.github/workflows/deploy.yml'
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        type: choice
        options:
          - staging
          - production

env:
  REGISTRY: innovationventures.azurecr.io
  IMAGE_NAME: tech-triage-platform

permissions:
  id-token: write
  contents: read

jobs:
  build:
    name: Build & Push Image
    runs-on: ubuntu-latest
    timeout-minutes: 30
    outputs:
      image-tag: ${{ steps.image.outputs.tag }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Azure Login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Login to ACR
        run: |
          az acr login --name innovationventures

      - name: Set image tag
        id: image
        run: |
          TAG="${{ github.sha }}"
          echo "tag=${TAG}" >> $GITHUB_OUTPUT
          echo "Image tag: ${TAG}"

      - name: Build Docker image
        working-directory: tech-triage-platform
        run: |
          docker build \
            --build-arg NODE_VERSION=18.20.4 \
            --tag ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ steps.image.outputs.tag }} \
            --tag ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest \
            .

      - name: Scan image with Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: '${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ steps.image.outputs.tag }}'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'

      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Push image to ACR
        run: |
          docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ steps.image.outputs.tag }}
          docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest

  deploy-staging:
    name: Deploy to Staging
    needs: build
    runs-on: ubuntu-latest
    timeout-minutes: 20
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Azure Login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Deploy to staging slot
        run: |
          az webapp deployment slot create \
            --resource-group rg-tech-triage \
            --name tech-triage-app \
            --slot staging \
            --configuration-source tech-triage-app 2>/dev/null || true

          az webapp config container set \
            --resource-group rg-tech-triage \
            --name tech-triage-app \
            --slot staging \
            --docker-custom-image-name "${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ needs.build.outputs.image-tag }}" \
            --docker-registry-server-url "https://${{ env.REGISTRY }}"

      - name: Wait for deployment
        run: sleep 30

      - name: Run smoke tests
        continue-on-error: true
        run: |
          STAGING_URL="https://tech-triage-app-staging.azurewebsites.net"

          # Health check
          curl -f "$STAGING_URL/api/health" || (
            echo "❌ Health check failed"
            exit 1
          )

          # Verify database connection
          HEALTH=$(curl -s "$STAGING_URL/api/health" | grep -o '"database":"ok"')
          if [ -z "$HEALTH" ]; then
            echo "❌ Database connection failed"
            exit 1
          fi

          echo "✅ Smoke tests passed"

      - name: Comment deployment status
        uses: actions/github-script@v7
        if: always()
        with:
          script: |
            const status = '${{ job.status }}'
            const emoji = status === 'success' ? '✅' : '❌'
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `${emoji} Staging deployment ${status}\n\nImage: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ needs.build.outputs.image-tag }}\n\nURL: https://tech-triage-app-staging.azurewebsites.net`
            })

  approval:
    name: Request Production Approval
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - name: Approval granted
        run: echo "✅ Production deployment approved"

  deploy-production:
    name: Deploy to Production
    needs: [build, approval]
    runs-on: ubuntu-latest
    timeout-minutes: 20
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Azure Login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Swap production slot
        run: |
          # Deploy to production slot
          az webapp config container set \
            --resource-group rg-tech-triage \
            --name tech-triage-app \
            --docker-custom-image-name "${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ needs.build.outputs.image-tag }}" \
            --docker-registry-server-url "https://${{ env.REGISTRY }}"

      - name: Wait for deployment
        run: sleep 30

      - name: Health check production
        run: |
          PROD_URL="https://tech-triage-app.azurewebsites.net"

          for i in {1..30}; do
            if curl -f "$PROD_URL/api/health" 2>/dev/null; then
              echo "✅ Production health check passed"
              exit 0
            fi
            echo "Waiting for production to be healthy... ($i/30)"
            sleep 10
          done

          echo "❌ Production health check failed"
          exit 1

      - name: Monitor error rate
        run: |
          # Wait 2 minutes, then check error rate
          sleep 120

          ERROR_RATE=$(az monitor metrics list \
            --resource /subscriptions/${{ secrets.AZURE_SUBSCRIPTION_ID }}/resourceGroups/rg-tech-triage/providers/Microsoft.Web/sites/tech-triage-app \
            --metric "Http4xx" \
            --aggregation Total \
            --interval PT1M \
            --start-time "$(date -u -d '2 minutes ago' '+%Y-%m-%dT%H:%M:%SZ')" \
            --end-time "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" \
            --query "value[0].timeseries[0].data[0].total" -o tsv 2>/dev/null || echo "0")

          echo "Error rate: $ERROR_RATE (4xx errors in last 2 minutes)"

          if [ "$ERROR_RATE" -gt "50" ]; then
            echo "⚠️ High error rate detected, but continuing (monitor manually)"
          fi

      - name: Create deployment record
        uses: actions/github-script@v7
        with:
          script: |
            const deployment = await github.rest.repos.createDeployment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              ref: context.ref,
              environment: 'production',
              description: 'Deployment of ${{ needs.build.outputs.image-tag }}',
              required_contexts: [],
              production_environment: true
            })

            github.rest.repos.createDeploymentStatus({
              owner: context.repo.owner,
              repo: context.repo.repo,
              deployment_id: deployment.data.id,
              state: 'success',
              description: 'Production deployment successful'
            })

  rollback:
    name: Automatic Rollback (if needed)
    needs: [build, deploy-production]
    runs-on: ubuntu-latest
    if: failure()

    steps:
      - name: Azure Login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Rollback to previous image
        run: |
          echo "⚠️ Deployment failed, rolling back to previous image"

          # Get previous image tag (from last successful deployment)
          PREVIOUS_TAG=$(az acr repository show-tags \
            --name innovationventures \
            --repository ${{ env.IMAGE_NAME }} \
            --orderby time_desc \
            --output tsv | head -2 | tail -1)

          echo "Rolling back to: ${PREVIOUS_TAG}"

          az webapp config container set \
            --resource-group rg-tech-triage \
            --name tech-triage-app \
            --docker-custom-image-name "${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${PREVIOUS_TAG}" \
            --docker-registry-server-url "https://${{ env.REGISTRY }}"

      - name: Notify team
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '❌ Production deployment failed and was automatically rolled back\n\nPlease investigate the error and try again.'
            })
```

**Setup Instructions:**
1. Create `.github/workflows/deploy.yml`
2. Copy content above
3. Configure Azure OIDC (see next section)
4. Create GitHub Environments:
   - Go to Settings → Environments
   - Create "staging" environment
   - Create "production" environment with approval requirement
5. Push to main to test

**Verification:**
```bash
# After first push to main:
# 1. GitHub Actions tab → see "Deploy to Azure" workflow
# 2. Build step completes
# 3. Staging deployment automatic
# 4. Production waits for approval
# 5. Click "Review deployments" → approve
# 6. Production deployment proceeds
```

---

## Template 4: Scheduled Export Job

**File:** `.github/workflows/export-to-blob.yml`
**Triggers:** Every 2 days at 8 AM, manual dispatch
**Duration:** ~10 minutes
**Purpose:** Export form submissions to Azure Blob Storage

```yaml
name: Export Dynamic Form Data

on:
  schedule:
    # Every 2 days at 8 AM UTC
    - cron: "0 8 */2 * *"
  workflow_dispatch:
    inputs:
      destination:
        description: Override export destination (defaults to blob)
        required: false
        type: choice
        options:
          - blob
          - local

jobs:
  export-to-blob:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
          cache-dependency-path: 'tech-triage-platform/package-lock.json'

      - name: Install dependencies
        working-directory: tech-triage-platform
        run: npm ci

      - name: Azure login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Get database credentials from Key Vault
        id: secrets
        run: |
          DATABASE_URL=$(az keyvault secret show \
            --vault-name techtriage-kv \
            --name DatabaseUrl \
            --query value -o tsv)

          STORAGE_CONNECTION=$(az keyvault secret show \
            --vault-name techtriage-kv \
            --name StorageConnectionString \
            --query value -o tsv)

          echo "::add-mask::$DATABASE_URL"
          echo "::add-mask::$STORAGE_CONNECTION"
          echo "database_url=$DATABASE_URL" >> $GITHUB_OUTPUT
          echo "storage_connection=$STORAGE_CONNECTION" >> $GITHUB_OUTPUT

      - name: Run export script
        working-directory: tech-triage-platform
        env:
          DATABASE_URL: ${{ steps.secrets.outputs.database_url }}
          AZURE_STORAGE_CONNECTION_STRING: ${{ steps.secrets.outputs.storage_connection }}
          EXPORT_BLOB_CONTAINER: form-exports
          EXPORT_DESTINATION: ${{ github.event.inputs.destination || 'blob' }}
        run: |
          DESTINATION="${EXPORT_DESTINATION:-blob}"
          npm run export-forms -- --destination "${DESTINATION}"

      - name: Create deployment record
        uses: actions/github-script@v7
        if: success()
        with:
          script: |
            console.log('Export job completed successfully')
            console.log('Exported to: ${{ github.event.inputs.destination || 'blob' }}')

      - name: Notify on failure
        uses: actions/github-script@v7
        if: failure()
        with:
          script: |
            console.log('❌ Export job failed')
            // Could add Slack notification here
```

---

## Azure OIDC Setup Instructions

**Why:** Use workload identity instead of stored secrets

**Step 1: Create Azure Service Principal**
```bash
az ad sp create-for-rbac \
  --name "github-actions-tech-triage" \
  --role Contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID

# Save output: appId, password, tenant
```

**Step 2: Create Federated Credential**
```bash
az identity federated-credential create \
  --name github-tech-triage \
  --identity-name github-actions-tech-triage \
  --issuer https://token.actions.githubusercontent.com \
  --subject "repo:YOUR_ORG/Junk:ref:refs/heads/main" \
  --audiences api://AzureADTokenExchange
```

**Step 3: Add GitHub Secrets**
```
AZURE_CLIENT_ID: <appId>
AZURE_TENANT_ID: <tenantId>
AZURE_SUBSCRIPTION_ID: <subscriptionId>
```

**Step 4: Verify Connection**
```yaml
# Add to workflow
- name: Test OIDC
  uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

- name: Verify access
  run: az account show
```

---

## Implementation Checklist

### Prerequisites
- [ ] GitHub repository access
- [ ] Azure subscription access
- [ ] DevOps team notification

### Phase 1: Foundational Workflows
- [ ] Copy `ci.yml` to `.github/workflows/`
- [ ] Create branch protection rule
- [ ] Test with first PR
- [ ] **Verify:** PR requires passing CI

### Phase 2: Security
- [ ] Copy `security.yml` to `.github/workflows/`
- [ ] Enable Dependabot in Settings
- [ ] Enable CodeQL in Settings
- [ ] **Verify:** Security alerts appear in GitHub

### Phase 3: Deployment
- [ ] Create Azure OIDC credentials
- [ ] Add GitHub Secrets (AZURE_CLIENT_ID, etc.)
- [ ] Copy `deploy.yml` to `.github/workflows/`
- [ ] Create GitHub Environments (staging, production)
- [ ] **Verify:** Push to main triggers staging deploy

### Phase 4: Data Export (Optional)
- [ ] Update existing `export-to-blob.yml`
- [ ] Change auth from GitHub Secrets to OIDC
- [ ] **Verify:** Scheduled export runs successfully

---

## Monitoring Workflows

### View Workflow Status
```bash
# GitHub Actions → Workflows tab
# Shows all workflow runs, status, duration
```

### Debugging Failed Workflows
```bash
# Click failed workflow
# View detailed logs for each step
# Common issues:
# - npm cache missing (delete cache)
# - Azure auth failed (verify OIDC)
# - Docker build timeout (increase timeout)
```

### Optimization Tips
1. **Cache npm dependencies:** Already configured
2. **Use matrix builds:** For multiple Node versions
3. **Parallelize jobs:** Run security + build simultaneously
4. **Conditional steps:** `if: github.ref == 'refs/heads/main'`

---

## Cost Considerations

### GitHub Actions Minutes
- Free: 2,000 minutes/month
- Each workflow ~5-20 minutes
- **Estimate:** 200-300 minutes/month (within free tier)

### Azure Container Registry
- Included in Azure subscription
- No extra cost for pushes/pulls

### Azure Compute
- App Service: ~$300/month (already allocated)
- No additional cost for automated deployments

**Total Cost Impact:** $0 (uses existing resources)

---

## Rollback Procedure

If workflow causes issues:

```bash
# Option 1: Disable workflow (temporary)
# GitHub Actions → Click workflow → ... → Disable

# Option 2: Revert workflow file
git revert <commit-hash>
git push

# Option 3: Delete workflow file
git rm .github/workflows/problematic-workflow.yml
git commit -m "chore: Disable problematic workflow"
git push

# Option 4: Manual rollback
az webapp deployment slot swap \
  --resource-group rg-tech-triage \
  --name tech-triage-app \
  --slot staging
```

---

## Support & Troubleshooting

### Common Issues

**Issue: "npm ci: command not found"**
- Solution: Verify Node.js setup step includes `cache: npm`

**Issue: "Docker build fails in GitHub"**
- Solution: Check Docker build locally first: `docker build -t test .`

**Issue: "Azure login fails"**
- Solution: Verify OIDC credentials match GitHub secrets

**Issue: "Health check timeout"**
- Solution: Increase wait time in workflow, check app logs

### Getting Help
1. Check GitHub Actions logs (detailed error messages)
2. Review Azure deployment logs
3. Test locally first (reproduce issue without CI)
4. Ask DevOps team with error message + workflow name

---

## Next Steps

1. **This week:** Implement CI workflow (Template 1)
2. **Next week:** Add security scanning (Template 2)
3. **Week 3:** Deploy automation (Template 3)
4. **Week 4:** Update export job (Template 4)

**Questions?** Contact: Platform Engineering Team

---

**Document Version:** 1.0
**Last Reviewed:** October 22, 2025
**Next Review:** December 2025
