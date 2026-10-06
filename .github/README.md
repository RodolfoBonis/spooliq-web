# GitHub Workflows — spooliq-web

This directory contains the CI/CD workflows for **spooliq-web**. The release model
mirrors the API repo: **production deploys only happen from `release/*` or `hotfix/*`
PRs merged into `main`** — never directly from a push or a raw tag.

## Release flow (at a glance)

```
prepare-release (or hotfix)   →   PR to main   →   review & merge   →   post-merge-release   →   release
   bump version + CHANGELOG        manual gate       (human)             verifies tag,            validate → build →
   create & push tag vX.Y.Z                                             dispatches release.yaml   GH release → k3s → argocd → backport
```

## Workflows

### `prepare-release.yaml` (manual)
- Trigger: `workflow_dispatch` (choose `from_branch`, `increment_type` or explicit `version`).
- Creates `release/vX.Y.Z` from the chosen branch.
- Bumps `package.json` **and** `package-lock.json`, updates `CHANGELOG.md`.
- Creates and pushes an **annotated tag** `vX.Y.Z`.
- Opens a PR to `main` (label `release`). The PR is **not** auto-merged.

### `hotfix.yaml` (manual)
- Trigger: `workflow_dispatch` (requires a `description`; `version` auto-increments the patch).
- Creates `hotfix/vX.Y.Z` from `main`, bumps version, creates and pushes the tag.
- Opens a critical PR to `main`. Backport is handled later by `release.yaml`.

### `post-merge-release.yaml` (automatic)
- Trigger: a `release/*` or `hotfix/*` PR **merged** into `main`.
- Extracts the version from the branch, verifies the tag exists, then dispatches
  `release.yaml` via `gh workflow run release.yaml --ref <tag> -f tag -f version`.

### `release.yaml` (manual / dispatched)
- Trigger: `workflow_dispatch` only, with required `tag` and `version` inputs.
- `concurrency: release-production` serializes production deploys.
- `validate` job: checks out the tag, enforces the `vX.Y.Z` tag format and that
  `package.json` version equals the input version.
- `release` job: builds & pushes the Docker image (`:latest` + `:<version>`),
  creates the GitHub Release (`gh release create`), updates the k3s manifest and
  syncs ArgoCD.
- `backport` job: merges `main` into `backport/<tag>-to-develop` and opens an
  auto-merge PR (or files an issue on conflict).

### `ci.yaml` (automatic)
- Trigger: push to `main`/`develop` and PRs targeting them.
- Runs ESLint, `tsc --noEmit`, tests, build and `npm audit`.
- `paths-ignore: package.json` skips the redundant push-triggered run caused by the
  release/hotfix version bump — the originating PR already ran full CI.

### `auto-merge.yaml` (automatic)
- Auto-merges Dependabot (minor/patch) and clean backport PRs.
- **Release PRs are merged manually** — there is no release auto-merge.
- Cleans up merged non-protected branches.

## Creating a release

1. Actions → **Prepare Release** → run from `develop` (or `main`), pick the increment.
2. Review and **merge** the release PR into `main`.
3. `post-merge-release` dispatches `release.yaml`, which deploys to production and
   opens the backport PR to `develop`.

## Creating a hotfix

1. Actions → **Hotfix** → describe the issue.
2. Review and merge the hotfix PR into `main`; deployment and backport follow automatically.

## Secrets used

`GH_TOKEN`, `VERDACCIO_TOKEN`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`,
`SPOOLIQ_CLIENT_ID`, `SPOOLIQ_CLIENT_SECRET`, `ARGOCD_SERVER`, `ARGOCD_TOKEN`,
`N8N_WEBHOOK_URL`, `N8N_API_TOKEN`, `CHAT_ID`, `THREAD_ID`.
