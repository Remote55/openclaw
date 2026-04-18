# Next.js 16 Patterns for OpenClaw

Load this when working on routing, layouts, or data fetching.

## Server vs Client Components

Default to Server Components. Use Client Components only for:
- State (`useState`, `useReducer`)
- Effects (`useEffect`, `useLayoutEffect`)
- Browser APIs (`window`, `localStorage`, `document`)
- Event handlers (`onClick`, `onChange`)
- Class components, Framer Motion, React Hook Form

Pattern: keep the interactive part small, wrap in Client Component, lift data
fetching up to a Server Component parent.

## Params in Next.js 16

`params` is a Promise. Always await or use `React.use()`:

\`\`\`tsx
// Server Component
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  // ...
}

// Client Component
'use client'
import { use } from 'react'
export default function Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  // ...
}
\`\`\`

## Locale Pages

Every page/layout inside `src/app/[locale]/` MUST:

1. Accept `params: Promise<{ locale: string }>`
2. Call `setRequestLocale(locale)` before using `useTranslations`/`getTranslations`
3. For dynamic routes, export `generateStaticParams` returning all locales

## Server Actions

- File starts with `'use server'` directive
- Export async functions only
- Validate input with Zod at the top of the function
- Return a serializable object (no class instances, no functions)
- Throw typed errors; catch at the UI layer

## Fetching Data

Prefer this order:
1. Server Component direct `await fetch()` with explicit caching opts
2. Server Action for mutations triggered from a Client Component
3. Route Handler (`src/app/api/*`) only for webhooks or public API