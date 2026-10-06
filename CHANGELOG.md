# Changelog

All notable changes to Spooliq Web will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.2.0] - 2026-10-06

- chore: bump version to 1.2.0 (a67a5fa)
- feat(web): transition-tolerant lists, server-side search/pagination, standardized errors, healthz (#29) (94f032f)
- ci: deploy only via release/hotfix PRs (API release model) and remove OpenAI (#28) (11b5664)


## [v1.1.0] - 2026-02-20

- chore: bump version to 1.1.0 (6214ba2)
- fix(ci): create release labels before PR creation in prepare-release (c8bdb2a)
- fix(security): upgrade axios/jspdf and scope audit to production deps (29dc611)
- fix(ci): replace sed with temp-file approach in prepare-release changelog (0568dfd)
- fix(ci): regenerate lock file for npm ci and remove committed .npmrc (0927a2c)
- fix(security): upgrade vulnerable dependencies (9b37564)
- feat: integrate dashboard with real API and improve components (21120c1)
- fix: use nextStage conversion rate in funnel step-to-step label (879dddc)
- chore: sync package.json version with latest tag (v1.0.5) (b8a2832)
- chore: bump version to 1.0.2 (77afd14)
- fix(security): update next.js to fix DoS vulnerability (20588b4)
- fix(pdf): handle binary PDF response for budget download (fc5581a)


## [Unreleased]

### Added
- Complete GitHub Actions CI/CD pipeline
  - Continuous Integration (lint, test, build, security)
  - Staging deployment automation
  - Production release workflow
  - Auto-merge for dependencies and backports
  - Hotfix workflow for emergency fixes
  - Release preparation workflow
- Docker multi-stage build configuration
- Next.js standalone output for optimized containerization
- Changelog tracking system

### Changed
- Updated deployment strategy to use ArgoCD + K3s
- Enhanced notification system with n8n + Telegram integration

### Infrastructure
- AWS ECR for Docker image registry
- Multi-platform Docker builds (AMD64 + ARM64)
- ArgoCD GitOps deployment
- Kubernetes manifest management in separate repository
