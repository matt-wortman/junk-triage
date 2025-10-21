# Export to Excel Plan

## Objective
- Generate a configurable Excel workbook on demand (manual or scheduled) containing one worksheet per dynamic form submission stored in the production Postgres database.
- Support Azure Blob Storage delivery first, with SharePoint and email distribution as follow-on adapters.

## Scope
- Include only dynamic `FormSubmission` data (plus related `QuestionResponse`, `RepeatableGroupResponse`, `CalculatedScore`, `FormTemplate` metadata).
- Default inclusion: `DRAFT` and `SUBMITTED` statuses; allow CLI overrides.
- Workbook naming convention: `triage-forms-<YYYYMMDD-HHmmEST>.xlsx`.
- Workbook structure mirrors the form hierarchy (metadata header, section headings, question rows, repeatable group subtables, score block).

## Implementation Phases
1. **Scaffold CLI**  
   - New script entry point `scripts/export-forms.ts` invoked via `npm run export-forms`.  
   - Shared config module for destination choice, filters, timezone handling.
2. **Data Extraction Layer**  
   - Prisma queries for submissions + eager-loading of template metadata and related responses.  
   - Transformation into section/question-oriented DTOs.
3. **Workbook Builder**  
   - Add `exceljs` + `luxon` dependencies.  
   - Render sheets per submission with hierarchical layout and calculated score summary.
4. **Azure Blob Destination (Phase 1)**  
   - Implement upload adapter using `@azure/storage-blob`.  
   - Support connection string or SAS-based auth; emit blob URL on completion.
5. **Extensibility Hooks**  
   - Destination interface stubs for SharePoint (Graph) and Email (Graph SMTP).  
   - Configuration-driven selection so future adapters drop in without refactoring.
6. **Automation & Docs**  
   - CLI usage guide, environment variable reference, and Azure scheduling options (Container Apps job vs. GitHub Actions).  
   - Observability notes (structured logs, exit codes).

## Progress Log
| Date (EST) | Task | Status | Notes |
|------------|------|--------|-------|
| 2025-10-08 | Draft high-level implementation plan and workbook layout | ✅ Completed | Captured scope, phases, and naming conventions. |
| 2025-10-08 | Scaffolded export CLI, configuration parser, workbook builder, and blob/local destinations | ✅ Completed | Added dependencies, new `npm run export-forms`, Prisma data loader, Excel export logic, and Azure Blob upload pipeline. |
| 2025-10-08 | Resolved duplicate worksheet naming during export run | ✅ Completed | Added unique sheet name generator to handle submissions that sanitize to the same prefix. |

## CLI Usage (Current State)
- `npm run export-forms -- --destination blob --blob-container <container>`  
  - Requires either `AZURE_STORAGE_CONNECTION_STRING` or `AZURE_STORAGE_BLOB_SAS_URL` in the environment.  
  - Optional flags: `--status SUBMITTED,DRAFT`, `--start-date 2025-10-01`, `--end-date 2025-10-07`, `--template <id1,id2>`, `--timezone America/New_York`.
- Local testing: `npm run export-forms -- --destination local --output-dir ./tmp-exports` (writes workbook using the configured `DATABASE_URL`).

### One‑liner for production exports
- We added a convenience script that wraps `dotenv-cli` and uses your git‑ignored `.env.export`.
  - File: `tech-triage-platform/.env.export`
  - Script: `npm run export:prod`
- How to run:
  ```bash
  cd tech-triage-platform
  npm run export:prod
  ```
- What it does:
  - Loads `DATABASE_URL`, `EXPORT_BLOB_CONTAINER`, and `AZURE_STORAGE_CONNECTION_STRING` from `.env.export`.
  - Runs the same exporter and uploads the workbook to Azure Blob.
  - Example success log shows `export.completed` with the blob URL.

### What we configured
- Created `.env.export` (git‑ignored) with:
  - `DATABASE_URL=postgresql://triageadmin:…@techtriage-pgflex.postgres.database.azure.com:5432/triage_db?sslmode=require`
  - `EXPORT_BLOB_CONTAINER=triage-form-export`
  - `AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=…;EndpointSuffix=core.windows.net`
- Tested export end‑to‑end; recent run uploaded `triage-forms-YYYYMMDD-HHmm.xlsx` to the container.

## Azure Configuration Checklist
- **Postgres Access**: ensure the container (or scheduled job) can reach the production Postgres instance via connection string or managed identity. Store secrets in Azure App Configuration, Key Vault, or environment settings.
- **Storage Account**: provision an Azure Storage account with a blob container (e.g., `form-exports`). Grant access via connection string, SAS token, or managed identity with `Storage Blob Data Contributor`.
- **Container Image**: incorporate the export script into the existing Tech Triage Platform image so the same build contains the CLI and dependencies. Alternatively, create a lightweight worker image if isolation is preferred.
- **Scheduler (Optional)**: if automation is required, configure Azure Container Apps Jobs, Azure Functions Timer trigger, or Azure Logic App to invoke the script with the appropriate environment variables in EST-based cron schedules.
- **Observability**: set up Application Insights or container logs to capture script execution output, success/failure status, and exported blob URLs.

## Azure Blob Access Setup (Plain English)
1. **Open the storage account**  
   - Sign in to the Azure Portal  
   - Search for your storage account (e.g., `innovationventuresstorage`) and open it.  
   - Confirm the blob container named `triage-form-export` exists under “Data storage → Containers”.

2. **Choose an authentication method**  
   - **Simplest for now**: use the storage account connection string. Navigate to “Security + networking → Access keys” and copy the connection string for key1.  
   - **Alternative (more granular)**: generate a SAS token under “Shared access signature” with at least “Blob” service, “Container/Blob” resource types, and Read + Write + List permissions.  
   - **Managed identity (future)**: assign `Storage Blob Data Contributor` role to the container app/function identity so the script can authenticate without keys.

3. **Set environment variables**  
   - `EXPORT_BLOB_CONTAINER=triage-form-export` (matches the container you created).  
   - If you copied the connection string: `AZURE_STORAGE_CONNECTION_STRING=<paste connection string>`.  
   - If you generated a SAS URL instead: `AZURE_STORAGE_BLOB_SAS_URL=https://<account>.blob.core.windows.net/triage-form-export?<sasToken>`.  
   - Optional overrides: `EXPORT_DESTINATION=blob`, `EXPORT_TIMEZONE=America/New_York`.

4. **Store secrets safely**  
   - For local testing, place the variables in `.env.export` (keep it out of git).  
   - For Azure Container Apps or other deployed environments, use the “Secrets” panel to add these values, then reference them as environment variables in the job definition.  
   - Consider moving long-term secrets to Azure Key Vault and wiring the environment to pull them automatically.

5. **Verify connectivity once**  
   - Run `npm run export-forms -- --destination blob --blob-container triage-form-export` with `DATABASE_URL` pointing to a non-production database.  
   - Check Azure Portal → Container → `triage-form-export` for the uploaded `triage-forms-*.xlsx` file.  
   - Review console logs: they should show `export.completed` plus the blob URL.

6. **Promote to production**  
   - Duplicate the secrets into the production environment (Container App job, Function, etc.).  
   - If scheduling, configure the EST-based cron and ensure the identity has access to both Postgres and Storage.  
   - Enable logging/alerting so failures trigger notifications.

## Deployment Approach
- Recommended: bundle the export script into the existing application container. This allows both manual exec (`npm run export-forms`) and scheduled runs using the same image.  
- If operational separation is required (e.g., permissions, runtime size), create a dedicated worker image that shares the codebase but only installs runtime + export dependencies; deployment process remains similar but handled via a separate container job.

## Open Questions
- Preferred Azure identity mechanism (managed identity vs. stored keys) for blob uploads?
- Target blob container naming and retention policy?
- How should we authenticate future SharePoint/email adapters (Graph app registration, SMTP relay)?
