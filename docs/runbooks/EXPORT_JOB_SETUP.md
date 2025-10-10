# Runbook: Schedule Excel Export as Azure Container Apps Job

## Overview
- Runs the existing container image on a cron schedule.
- Uploads the generated workbook to Azure Blob Storage.
- Consumption plan: costs accrue only while a run is active (scale to zero between runs).

## One-Time Setup
1. Ensure the image exists in ACR:
   ```bash
   az acr build --registry innovationventures --image tech-triage-platform:prod .
   ```
2. Create or reuse a Container Apps environment and job (script provided):
   ```bash
   bash scripts/infra/create-export-job.sh
   ```
   - Schedule default: every 2 days at 08:00 UTC (`0 8 */2 * *`).
   - Resources: 0.25 vCPU / 0.5GiB RAM.
   - Secrets: the storage connection string is stored as a secret and used via env.

## Ad-hoc Run & Verification
```bash
az containerapp job start -g rg-eastus-hydroxyureadosing -n techtriage-export-job
```
- Monitor recent runs in the portal or via:
  ```bash
  az containerapp job execution list -g rg-eastus-hydroxyureadosing -n techtriage-export-job --output table
  ```
- Blob should appear in the configured container with name `triage-forms-YYYYMMDD-HHmm.xlsx`.

## Tips
- Cron is UTC. 08:00 UTC ≈ 03:00 ET (Standard Time). Adjust if you need a different local time.
- Keep logs concise to minimize Log Analytics ingestion.
- Reuse a single Container Apps Environment for multiple jobs to avoid extra control-plane cost.
- If ACR requires auth, add `--registry-username`/`--registry-password` flags or grant ACR Pull to the job’s managed identity.

## Clean Up
```bash
az containerapp job delete -g rg-eastus-hydroxyureadosing -n techtriage-export-job --yes
```

