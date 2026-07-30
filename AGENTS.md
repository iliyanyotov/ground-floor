# AGENTS.md

## What this repo is

`ground-floor` is a **baseline of dotfiles and configs for any TypeScript project**, not an application. The configuration *is* the product. Everything under `src/` is deliberately disposable demo code (a money-ledger domain) that exists only to give the toolchain something real to act on: formatter input, types for `tsc`, behavior for `bun test`. When adopting the baseline, that code gets deleted.

So most meaningful work here is editing config files (`biome.json`, `bunfig.toml`, `tsconfig.json`, `.husky/*`, `.github/workflows/ci.yml`), and the bar for those changes is *justify the choice*. This repo pairs with the [house-rules](https://github.com/iliyanyotov/house-rules) conventions repo, so decisions should be opinionated and explained, usually in a comment.

## Commands

Bun is the runtime, package manager, and test runner. There is no Node/npm/pnpm path.

```bash
bun run lint                    # lint + format check (no writes)
bun run lint:ci                 # same, with CI reporters - what CI runs
bun run lint:fix                # autofix lint + format
bun run format                  # biome format --write; formatting only, no lint
bun run type-check              # tsc --noEmit; emits nothing, type-only
bun test src/ledger/money       # run a single dir/file's tests (omit path for all)
bun run test:coverage           # run tests and print coverage
bun run dev                     # run the demo entrypoint (src/index.ts)
bun run release                 # commit-and-tag-version: changelog + semver bump
```

CI (`.github/workflows/ci.yml`) runs `lint:ci`, then `type-check`, then `bun test` on PRs and pushes to `main`. The `pre-push` hook runs the same code checks locally.

## Conventions enforced by tooling

- **Commits must follow Conventional Commits**: `commit-msg` hook runs commitlint; non-conforming messages are rejected. Commit *types* drive the changelog and version bump (see `.versionrc.json` for which types are user-visible).
- **Biome lint domains are limited to the framework-agnostic ones** (`biome.json` `linter.domains`): `types` (type-inference rules like `noFloatingPromises`) and `test` are on because they apply to any TS project, back-end or front-end. Framework domains (`react`, `next`, `solid`, `vue`) are deliberately left unset - Biome auto-enables them downstream when an app installs the framework, so pinning one here would only mislint the other kind of app. Enable type-aware rules through the `types` domain, not by pinning the `nursery` rule name (nursery names disappear when a rule graduates).
- **`pre-commit` runs `lint-staged` then `type-check`**: staged JS/TS/JSON get `biome check --fix`, and the whole project is type-checked (so a commit can fail on a type error in an unstaged file). Both must succeed.
- **`pre-push` runs the full code gate**: because `pre-commit` only lints *staged* files, this is what catches whole-repo lint and untested behavior before they reach CI.
- **`post-checkout` / `post-merge` auto-run `bun install`** when a branch switch, merge, or pull changes `package.json` or `bun.lock`.
- **The toolchain runs on Bun, never Node** (`bunfig.toml` `[run] bun = true`): dependency binaries ship `#!/usr/bin/env node` shebangs (commitlint, lint-staged, commit-and-tag-version); this ignores them so the hooks need no Node install. Removing it reintroduces a Node dependency silently.
- **Dependencies pin to exact versions** (`bunfig.toml` `exact = true`): never introduce `^`/`~` ranges.
- **New releases are blocked for 14 days** (`minimumReleaseAge`) as a supply-chain defense, so a just-published package fails to install. Exempt one via `minimumReleaseAgeExcludes` in `bunfig.toml`.
- **The Bun cache is local to the repo** (`.bun-cache`, gitignored) so CI caching is trivial. Don't repoint it at the global cache.
- **Minimum Bun version is whatever `.bun-version` pins**: the single source of truth, read by `setup-bun` in CI. The demo needs a floor recent enough for standard decorators, `using`/`Symbol.dispose`, and `Bun.randomUUIDv7()`. There is deliberately **no `engines` field**: Bun doesn't enforce it, so a second copy would only drift.

TypeScript is maximally strict (`tsconfig.json`): `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `verbatimModuleSyntax`, etc. `verbatimModuleSyntax` means type-only imports **must** use `import type`. Path alias `@/*` maps to `src/*`.

## Demo domain architecture (`src/ledger`)

The ledger is a worked example of several patterns intentionally on display. Recognize them as teaching examples, and preserve the patterns if you edit here:

- **Branded types** (`ledger/brand.ts`) make `string`-shaped IDs nominal. `AccountId` is `Brand<string, 'AccountId'>` minted via `AccountId.mint()`. A raw string won't satisfy it.
- **Money as integer minor units** (`money/money.ts`): never floats. `Money.of(3000, 'USD')` is $30.00; arithmetic stays in integer cents and asserts same-currency. Construction rejects negatives and non-safe-integers.
- **TC39 decorators** for cross-cutting concerns: `@audit` (`account/audit.ts`) wraps `debit`/`credit` to log after each mutation, depending on a structural `Auditable` interface (not `Account`) to avoid a cycle. It's a forensic log - it fires for the compensating mutations a rollback replays too, so a failed transfer leaves a debit + reversing credit in the trail, by design.
- **`using` + `Symbol.dispose` for transactional rollback** (`transfer/transfer.ts`): `transfer` stages each leg with an undo; on any thrown exception the `Disposable` replays undos in reverse unless `commit()` ran. This is how a failed second leg makes the payer whole.

Layering: `money` depends on nothing; `account` depends on `money`; `transfer` orchestrates `account`. Each unit has a colocated `*.test.ts`.

Tests run via `bun:test`; `src/test/preload.ts` runs once before any test module (set in `bunfig.toml`), the one place for global setup.
