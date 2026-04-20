import type { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { routing } from '@/i18n/routing'

// next-intl still exports under `/middleware`; the factory itself is
// framework-agnostic and works fine from a Next.js 16 proxy file.
const intlMiddleware = createIntlMiddleware(routing)

export async function proxy(request: NextRequest) {
  // Run i18n proxy first
  const response = intlMiddleware(request)

  // Refresh Supabase session (important for SSR).
  // The cookie bridge mutates both the incoming request cookies
  // (so the downstream handler sees the fresh session) and the outgoing
  // response cookies (so the browser persists the refreshed tokens).
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This call refreshes the session cookie if needed
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
