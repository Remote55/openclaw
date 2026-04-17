# Contributing to OpenClaw

## 🌿 Branch Naming

Format: `<type>/<short-description>`

Types:
- `feat/` — new feature
- `fix/` — bug fix
- `chore/` — tooling, deps, refactor (no behavior change)
- `docs/` — documentation only
- `test/` — test-only
- `ci/` — CI/CD changes

Examples:
- ✅ `feat/hotel-search-ui`
- ✅ `fix/liteapi-rate-limit-retry`
- ✅ `chore/upgrade-nextjs-16`
- ❌ `new-feature` (no type prefix)
- ❌ `FixBug` (not kebab-case)

## 📝 Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

Format: `<type>(<scope>): <description>`

Examples:
- `feat(search): add semantic filter for hotel amenities`
- `fix(auth): resolve session expiry race condition`
- `docs(readme): update tech stack table`
- `chore(deps): bump next to 16.0.3`

## 🔄 Workflow

1. Create branch from `main`: `git checkout -b feat/my-feature`
2. Make changes + commits
3. Push: `git push`
4. Open PR on GitHub → fill template
5. Wait for at least 1 approval from CODEOWNERS
6. Merge via **"Squash and merge"** (keep main history clean)
7. Delete branch after merge

## 🚫 Never

- Never push directly to `main`
- Never commit `.env*` files
- Never commit API keys, tokens, or passwords
- Never `git push --force` to `main`