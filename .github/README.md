# GitHub Workflows — spooliq-web

This directory contains the CI/CD workflows for **spooliq-web**. The release model
mirrors the API repo: **production deploys only happen from `release/*` or `hotfix/*`
PRs merged into `main`** — never directly from a push or a raw tag.

## Release flow (at a glance)

```
prepare-release (or hotfix)   →   PR to main   →   review & merge   →   post-merge-release   →   release
   sync main → bump version        manual gate       (human)             verifies tag,            validate → build →
   + CHANGELOG, push tag vX.Y.Z                                          ancestry & version,       GH release → k3s → argocd → backport
```

## ⚠️ One-time: sync `develop` with `main`

`prepare-release` now **merges `main` into the source branch before tagging** and takes
`main`'s version of `.github/**`, `package.json`, `package-lock.json` and `CHANGELOG.md`.
This guarantees the tagged commit carries the current (dispatch-only) workflows even when
`develop` is stale.

However, the stale workflows still live on `develop` itself until `develop` is reconciled
with `main`. **After this change is merged to `main`, open a `main → develop` sync PR** so
that `develop`'s own `.github/` no longer carries the old `release.yaml`
(`push: tags`/`workflow_run`), `bot-code-reviewer.yaml` or `release-staging.yaml`. Until that
sync lands, the self-healing merge in `prepare-release` is what keeps releases safe.

## Workflows

### `prepare-release.yaml` (manual)
- Trigger: `workflow_dispatch` (choose `from_branch` — `develop`|`main`, `increment_type` or explicit `version`).
- Validates `from_branch` (allowlist) and `version` (`X.Y.Z`).
- **Merges `main` into `from_branch` first**, resolving `.github/**` and the version/changelog
  files to `main`. Any other conflict fails the run with a clear message (no release off an
  unresolved merge).
- Creates `release/vX.Y.Z` from the synced branch.
- Bumps `package.json` **and** `package-lock.json`, updates `CHANGELOG.md`.
- Creates and pushes an **annotated tag** `vX.Y.Z` (carrying the new workflows).
- Opens a PR to `main` (label `release`) using `--body-file`. The PR is **not** auto-merged.

### `hotfix.yaml` (manual)
- Trigger: `workflow_dispatch` (requires a `description`; `version` auto-increments the patch).
- Validates `version` (`X.Y.Z`); runs from `main`, so no stale-branch merge is needed.
- Creates `hotfix/vX.Y.Z` from `main`, bumps version, creates and pushes the tag.
- Opens a critical PR to `main` using `--body-file`. Backport is handled later by `release.yaml`.

### `post-merge-release.yaml` (automatic)
- Trigger: a `release/*` or `hotfix/*` PR **merged** into `main`.
- Extracts the version from the branch, then verifies: the tag exists, the tag commit is an
  **ancestor of the merged `main` commit**, and `package.json` at the tag equals the version.
- Dispatches `release.yaml` via `gh workflow run release.yaml --ref <tag> -f tag -f version`.

### `release.yaml` (manual / dispatched)
- Trigger: `workflow_dispatch` only, with required `tag` and `version` inputs.
- `concurrency: release-production` serializes production deploys.
- `validate` job: checks out the tag, enforces the `vX.Y.Z` tag format and that
  `package.json` version equals the input version.
- `release` job: records a start timestamp, builds & pushes the Docker image
  (`:latest` + `:<version>`), creates the GitHub Release (`gh release create`), updates the
  k3s manifest and syncs ArgoCD. Build duration is measured from the recorded start time.
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

## Security notes

- User-controlled inputs (`version`, `from_branch`, `description`) are passed to shell
  scripts via `env:` and referenced as quoted shell variables — never interpolated into
  `run:` bodies, `git tag -m`, or PR titles/bodies as `${{ ... }}`.
- PR bodies are written with `printf`/`cat` to a file and created with `gh pr create
  --body-file`, so changelog/description content containing backticks or `$` is never
  evaluated by the shell.

## Creating a release

1. Actions → **Prepare Release** → run from `develop` (or `main`), pick the increment.
2. Review and **merge** the release PR into `main`.
3. `post-merge-release` validates the tag and dispatches `release.yaml`, which deploys to
   production and opens the backport PR to `develop`.

## Creating a hotfix

1. Actions → **Hotfix** → describe the issue.
2. Review and merge the hotfix PR into `main`; deployment and backport follow automatically.

## Secrets used

`GH_TOKEN`, `VERDACCIO_TOKEN`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`,
`SPOOLIQ_CLIENT_ID`, `SPOOLIQ_CLIENT_SECRET`, `ARGOCD_SERVER`, `ARGOCD_TOKEN`,
`N8N_WEBHOOK_URL`, `N8N_API_TOKEN`, `CHAT_ID`, `THREAD_ID`.
