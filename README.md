# ground-floor

Baseline dotfiles and configs for any TypeScript project.

Pairs with [house-rules](https://github.com/iliyanyotov/house-rules). Conventions live there. The baseline lives here.

## Why

Agentic tools scaffold projects in seconds. They don't pick the small, opinionated decisions that make a codebase feel consistent. This repo is that missing layer.

## Use it

This isn't a framework to adopt wholesale — it's a snapshot of choices that work well together right now. Tooling moves fast, so take what makes sense for your project and leave the rest.

Lift a single config, copy the lot into a new repo, or just read it for the reasoning. When something here stops being the best option, change it — and if the change is worth keeping, fold it back in.

## Stack

- [Bun](https://bun.sh) — runtime, package manager, and test runner
- [TypeScript](https://www.typescriptlang.org) — strict config, type-only `tsc --noEmit` checks
- [Biome](https://biomejs.dev) — formatter and linter (replaces ESLint + Prettier)
- [Husky](https://typicode.github.io/husky) + [lint-staged](https://github.com/lint-staged/lint-staged) — git hooks and staged-file checks
- [commitlint](https://commitlint.js.org) + [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) — Conventional Commits and changelog/versioning

## Inside

- **Strict, consistent formatting and linting** — one tool formats and lints, wired in as the editor default so it runs the same way locally and in CI.
- **Reproducible, safe installs** — dependencies pin to exact versions, refuse releases younger than 14 days as supply-chain defense, and cache inside the repo so CI caching is trivial.
- **Guardrails on every commit** — git hooks check staged files, enforce Conventional Commits, and keep the working tree in sync after merges and checkouts.
- **Conventional Commits to automated releases** — commit messages drive changelog generation and semantic versioning.
- **CI that mirrors local checks** — pull requests and pushes to `main` run the same format/lint, type-check, and tests you run locally.
- **Example code** — everything under `src/` is throwaway demo code. The little money-ledger domain exists only to give the tooling something real to chew on: code to format and lint, types for `tsc` to verify, behavior for `bun test` to cover. Delete it when you adopt the baseline.
