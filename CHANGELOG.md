# Changelog

All notable changes to Spooliq Web will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
