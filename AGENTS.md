# AGENTS.md — Universal AI Coding Agent Instructions

These instructions apply to any AI coding assistant working in this repository:
Claude Code, Cursor, GitHub Copilot, Cline, Aider, and others.

Project-specific rules and stack details live in `CLAUDE.md`. Read that first.

## 🎯 Prime Directive

**Ship working, well-typed, tested code that matches existing patterns.**

When in doubt, copy patterns from adjacent files rather than inventing new ones.

## 📖 Before Writing Code

1. Read the relevant section of `CLAUDE.md`.
2. Find the nearest existing pattern — e.g., before creating a new API route,
   read an existing one under `src/app/api/`.
3. For Next.js 16 specifics, consult `node_modules/next/dist/docs/` when available.
   Training data is often outdated; bundled docs are the source of truth.
4. If adding a dependency, verify it's compatible with Next.js 16 + React 19.2.

## 🧪 Before Finishing

- [ ] `pnpm typecheck` passes with zero errors
- [ ] `pnpm lint` passes with zero errors  
- [ ] `pnpm build` succeeds (for non-trivial changes)
- [ ] New translation keys added to BOTH `messages/th.json` AND `messages/en.json`
- [ ] No secrets, API keys, or PII in code or git diff
- [ ] No `console.log` left in production code (use proper logger)

## 🚫 Absolute Boundaries

Do not:
- Commit files matching `.env*` (except `.env.example`)
- Push directly to `main` — use feature branches and PRs
- Run `rm -rf`, `git push --force`, or migrations without explicit human confirmation
- Install packages without updating `pnpm-lock.yaml` in the same commit
- Change the Node.js version or package manager
- Disable TypeScript strict mode or ESLint rules to "make it compile"

## 🌍 Language

- UI copy: Thai (default) + English — must be in `messages/*.json`
- Code comments: English
- Commit messages: English
- PR descriptions: English
- Issue discussions: Thai or English (user's choice)

## 🤝 Collaboration Style

- Prefer small, focused changes over sweeping refactors.
- When refactoring, do it in a separate commit from feature changes.
- When adding a feature that needs a type, define the type first.
- When unsure between two approaches, propose both with tradeoffs.

## 🆘 When Stuck

If you can't make progress after two reasonable attempts:
1. Stop.
2. Summarize what you tried and what failed.
3. Ask the human for guidance.

Do not fabricate solutions or invent APIs that don't exist.