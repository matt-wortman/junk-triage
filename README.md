# CCHMC Technology Triage Platform - Documentation Repository

This repository contains documentation, planning materials, and source requirements for the Cincinnati Children's Hospital Medical Center (CCHMC) Technology Triage Platform.

## 📦 Production Code

The **production application code** is located in the `tech-triage-platform/` submodule.

**To access the production code:**
- **On GitHub:** Click the `tech-triage-platform` folder (links to the production branch)
- **Locally:** Navigate to `tech-triage-platform/` directory
- **Full README:** See [tech-triage-platform/README.md](tech-triage-platform/README.md) for complete setup and deployment instructions

**Quick Start:**
```bash
cd tech-triage-platform
npm install
npm run dev              # Web server (port 3000)
npx prisma dev          # Database server
```

## 📚 Repository Contents

### Documentation
- **[CLAUDE.md](CLAUDE.md)** - AI assistant instructions and project context
- **[docs/](docs/)** - Structured documentation
  - `docs/adrs/` - Architecture Decision Records
  - `docs/technical/` - Technical architecture
  - `docs/process/` - Development processes

### Source Materials
- **[source_material/](source_material/)** - Original requirements and designs
  - `Triage.pdf` - Original CCHMC form specification
  - Design mockups and system diagrams

## 🚀 Getting Started

### For Developers
1. Clone this repository (includes documentation)
2. Navigate to `tech-triage-platform/` for production code
3. Follow setup instructions in [tech-triage-platform/README.md](tech-triage-platform/README.md)

### For Reviewers
- Read [CLAUDE.md](CLAUDE.md) for project overview and context
- Review original requirements in [source_material/](source_material/)
- Check technical docs in [docs/technical/](docs/technical/)

## 🔗 Links

- **Production Code:** [tech-triage-platform/](tech-triage-platform/)
- **GitHub Repository:** https://github.com/matt-wortman/junk-triage
- **Production Branch:** [phase3-database-driven-form](https://github.com/matt-wortman/junk-triage/tree/phase3-database-driven-form)

## 📝 About This Project

The Technology Triage Platform is a web application that digitalizes the CCHMC technology evaluation process. It features a modern, database-driven architecture built with Next.js, TypeScript, and PostgreSQL.

For complete project details, architecture, and deployment instructions, see the [production README](tech-triage-platform/README.md).
