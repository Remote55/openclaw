# i18n Conventions for OpenClaw

Load this when adding/editing translated strings.

## Locales

- Supported: `th` (default), `en`
- Source of truth: `src/i18n/routing.ts`
- URL pattern: `/th/...` and `/en/...` (localePrefix: 'always')

## File Structure

- `messages/th.json` — Thai translations
- `messages/en.json` — English translations
- Both files MUST have the same key structure.

## Namespacing

Top-level keys group by page or domain:

\`\`\`json
{
  "HomePage": { ... },
  "HotelSearch": { ... },
  "BookingForm": { ... },
  "Common": { ... }
}
\`\`\`

Prefer domain namespaces over component-tree-based ones.

## Usage in Code

### Server Component
\`\`\`tsx
import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

export default function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  setRequestLocale(locale)
  const t = useTranslations('HomePage')
  return <h1>{t('title')}</h1>
}
\`\`\`

### Async Server Component
\`\`\`tsx
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations('HomePage')
  return <h1>{t('title')}</h1>
}
\`\`\`

### Client Component
\`\`\`tsx
'use client'
import { useTranslations } from 'next-intl'

export function MyButton() {
  const t = useTranslations('Common')
  return <button>{t('save')}</button>
}
\`\`\`

## When Adding a Key

1. Add to `messages/th.json` first.
2. Add the same key to `messages/en.json`.
3. Run `/i18n-check` to verify parity.
4. TypeScript autocompletion comes from `src/global.d.ts`.

## When in Doubt

Thai copy should be natural Thai, not English translated word-for-word.
If unsure, ask the user for the Thai phrasing they prefer.