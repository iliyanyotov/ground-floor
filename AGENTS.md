# AGENTS.md

## What this repo is

`ground-floor` is a **baseline of dotfiles and configs for any TypeScript project**, not an application. The configuration *is* the product. Everything under `src/` is deliberately disposable demo code (a money-ledger domain) that exists only to give the toolchain something real to act on — formatter input, types for `tsc`, behavior for `bun test`. When adopting the baseline, that code gets deleted.

Practical consequence: most meaningful work here is editing config files (`biome.json`, `bunfig.toml`, `tsconfig.json`, `.husky/*`, `.github/workflows/ci.yml`), and the bar for those changes is *justify the choice* — this repo pairs with the [house-rules](https://github.com/iliyanyotov/house-rules) conventions repo, so decisions should be opinionated and explained, usually in a comment.

## Commands

Bun is the runtime, package manager, and test runner — there is no Node/npm/pnpm path.

```bash
bun run check                   # lint + format check (no writes) — what CI runs
bun run lint:fix                # autofix lint + format
bun run type-check              # tsc --noEmit; emits nothing, type-only
bun test src/ledger/money       # run a single dir/file's tests (omit path for all)
bun run dev                     # run the demo entrypoint (src/index.ts)
bun run release                 # commit-and-tag-version: changelog + semver bump
```

CI (`.github/workflows/ci.yml`) runs exactly `check` → `type-check` → `bun test` on PRs and pushes to `main`. The `pre-push` hook runs the same three locally, so a push that's green here is green in CI. Reproduce CI by hand with those three.

## Conventions enforced by tooling

- **Commits must follow Conventional Commits** — `commit-msg` hook runs commitlint; non-conforming messages are rejected. Commit *types* drive the changelog and version bump (see `.versionrc.json` for which types are user-visible).
- **`pre-commit` runs `lint-staged` then `type-check`** — staged JS/TS/JSON/CSS get `biome check --fix`, and the whole project is type-checked. A commit can fail on a type error in an unstaged file.
- **`pre-push` runs the full CI gate** (`check` → `type-check` → `bun test`) — `pre-commit` only lints *staged* files, so this is what catches whole-repo lint and untested behavior before they reach CI.
- **`post-checkout` / `post-merge` auto-run `bun install`** when a branch switch, merge, or pull changes `package.json` or `bun.lock`.
- **Dependencies pin to exact versions** (`bunfig.toml` `exact = true`) — never introduce `^`/`~` ranges.
- **New releases are blocked for 14 days** (`minimumReleaseAge`) as a supply-chain defense. Adding a just-published package will fail to install; to exempt one, add it to `minimumReleaseAgeExcludes` in `bunfig.toml`.
- **The Bun cache is local to the repo** (`.bun-cache`, gitignored) so CI caching is trivial — don't repoint it at the global cache.
- **Minimum Bun version is whatever `.bun-version` pins** — the single source of truth, read by `setup-bun` in CI. The demo needs a floor recent enough for standard decorators, `using`/`Symbol.dispose`, and `Bun.randomUUIDv7()`. There is deliberately **no `engines` field**: Bun doesn't enforce it, so a second copy of the floor would only drift.

TypeScript is maximally strict (`tsconfig.json`): `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `verbatimModuleSyntax`, etc. `verbatimModuleSyntax` means type-only imports **must** use `import type`. Path alias `@/*` → `src/*`.

## Demo domain architecture (`src/ledger`)

The ledger is a worked example of several patterns intentionally on display — recognize them as teaching examples, and preserve the patterns if you edit here:

- **Branded types** (`brand.ts`) make `string`-shaped IDs nominal. `AccountId` is `Brand<string, 'AccountId'>` minted via `AccountId.mint()` — a raw string won't satisfy it.
- **Money as integer minor units** (`money/money.ts`) — never floats. `Money.of(3000, 'USD')` is $30.00; arithmetic stays in integer cents and asserts same-currency. Construction rejects negatives and non-safe-integers.
- **TC39 decorators** for cross-cutting concerns — `@audit` (`account/audit.ts`) wraps `deposit`/`withdraw` to log after each mutation, depending on a structural `Auditable` interface (not `Account`) to avoid a cycle. It's a forensic log: it also fires for the compensating mutations a rollback replays, so a failed transfer leaves a withdraw + reversing deposit in the trail — by design.
- **`using` + `Symbol.dispose` for transactional rollback** (`transfer/transfer.ts`) — `transfer` stages each leg with an undo; on any thrown exception the `Disposable` replays undos in reverse unless `commit()` ran. This is how a failed second leg makes the payer whole.

Layering: `money` depends on nothing; `account` depends on `money`; `transfer` orchestrates `account`. Each unit has a colocated `*.test.ts`.

Tests run via `bun:test`; `src/test/preload.ts` runs once before any test module (set in `bunfig.toml`) — the one place for global setup.
