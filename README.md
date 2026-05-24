# ground-floor

Baseline dotfiles and configs for any TypeScript project.

Pairs with [house-rules](https://github.com/iliyanyotov/house-rules). Conventions live there. The baseline lives here.

## Why

Agentic tools scaffold projects in seconds. They don't pick the small, opinionated decisions that make a codebase feel consistent. This repo is that missing layer.

## Inside

- `biome.json` — formatter and linter
- `bunfig.toml` — exact versions, 14-day release-age gate, in-repo cache
- `.husky/` — `pre-commit`, `commit-msg`, `post-merge`, `post-checkout`
- `.lintstagedrc.json`, `commitlint.config.js`, `.versionrc.json` — staged-file checks and Conventional Commits + standard-version
- `.editorconfig`, `.gitattributes`, `.gitignore`, `.env.example`
- `.vscode/` — Biome as default formatter
- `.github/workflows/ci.yml` — `bun run check` + `type-check` on PRs and pushes to `main`
- `package.json` — pinned dev tools and standard scripts

## Workflow

- **New project** — scaffold, copy these files in, add `"prepare": "husky"` to `package.json`, run `bun install`.
- **Existing project** — `diff` against the file here, replay what applies.
- **Evolving the baseline** — change it here first, then roll out repo-by-repo.
