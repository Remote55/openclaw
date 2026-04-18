# OpenClaw — Project Constitution for Claude Code

> AI-powered hotel booking platform with real-time local events integration.
> Demo scope: 4 cities (Tokyo, Bangkok, Paris, Hat Yai). Bilingual (Thai + English).
> Real bookings via LiteAPI sandbox, Stripe test mode.

## 📐 Core Stack (DO NOT change without team approval)

- **Framework**: Next.js 16.2+ (App Router, Turbopack, React 19.2)
- **Language**: TypeScript 5.x strict mode — no `any`, use `unknown` + Zod parse
- **Styling**: Tailwind CSS v4 + shadcn/ui (New York style, Slate base)
- **i18n**: next-intl 4.x — locales `th` (default) + `en`, `localePrefix: 'always'`
- **Package manager**: pnpm only (never npm/yarn in this repo)

## 🧭 Architecture Rules

Prefer this structure:

- Business logic → `src/lib/services/*`
- API route handlers → `src/app/api/*` (thin — delegate to services)
- UI components → `src/components/*` (shadcn primitives in `ui/` subfolder)
- AI logic → `src/lib/ai/*` (orchestrator, tools, prompts)
- Database queries → `src/lib/db/*` (typed Supabase client only)
- i18n helpers → `src/i18n/*` (routing.ts, request.ts)

Prefer Server Components over Client Components. Add `'use client'` only when needed
for interactivity (useState, onClick, browser APIs).

Prefer Server Actions over REST for internal mutations. Use REST (`/api/*`) only for
webhooks and public endpoints.

## 🌏 i18n Conventions (non-negotiable)

- All user-facing strings MUST come from `messages/{th,en}.json` via `useTranslations()`
  or `getTranslations()`. Never hardcode text in components.
- Every page/layout under `[locale]/` MUST call `setRequestLocale(locale)` before
  any next-intl hook, to enable static rendering.
- Translation keys use nested namespaces: `HomePage.title`, `Booking.form.submit`.
- When adding a translation key, add to BOTH `th.json` AND `en.json` — never leave
  one locale missing.
- Use Thai as the default locale. User redirects hitting `/` should land on `/th`.

## 🛡️ Security Boundaries (HARD rules)

- NEVER commit files matching `.env*` (except `.env.example`).
- NEVER log user PII (email, phone, booking IDs, full names) to Sentry/console.
- NEVER store credit cards — use Stripe Elements iframe only (keeps us in PCI SAQ-A).
- NEVER use `dangerouslySetInnerHTML` with LLM-generated content.
- NEVER `fetch()` in client components for booking/payment operations — use Server Actions.
- NEVER skip Zod validation on LLM tool responses before rendering.
- NEVER skip the HITL (human-in-the-loop) confirmation step before `createBooking()`.

## 🎨 Naming Conventions

- Files: `kebab-case.tsx` (e.g., `hotel-card.tsx`, not `HotelCard.tsx`)
- React components: `PascalCase` exports
- Hooks: `use-*` prefix (e.g., `use-booking-state.ts`)
- API route folders: plural nouns (`/api/hotels`, `/api/bookings`)
- Env vars: `SCREAMING_SNAKE_CASE` with service prefix (e.g., `LITEAPI_SANDBOX_KEY`)
- Server Actions: verb-first (`createBooking`, `searchHotels`)

## ✅ Critical Commands

- `pnpm dev` — local dev server (Turbopack)
- `pnpm build` — production build (MUST pass before any PR)
- `pnpm typecheck` — TypeScript check (MUST pass before commit)
- `pnpm lint:fix` — ESLint with autofix
- `pnpm format` — Prettier write
- `pnpm test` — Vitest (when tests exist)

## 🔄 Workflow Preferences

- ASK 1-2 clarifying questions BEFORE implementing complex features.
- PREFER reading existing code patterns before writing new ones.
- PREFER small focused PRs over large ones (< 400 lines diff when possible).
- ALWAYS run `pnpm typecheck` + `pnpm lint` after editing TypeScript.
- ALWAYS explain architectural decisions in PR description.
- NEVER commit directly to `main` — use feature branches + PR.
- Commit format: `<type>(<scope>): <description>` — types: feat, fix, chore, docs, test, ci.

## 🎯 Task Boundaries

Scope is hotels + local events only (MVP). Do NOT propose:
- Flight booking
- Car rental
- Activity/tour booking
- User-generated content (reviews, photos)

Save these for Phase 2+ unless explicitly requested.

## 📚 Reference Files

@AGENTS.md
@docs/CONTRIBUTING.md

## 🔍 When Uncertain

If I (the user) ask you to do something that contradicts any rule above:
1. Point out the conflict explicitly.
2. Ask whether to update the rule or skip the change.
3. Never silently override a rule.