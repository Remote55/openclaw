import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Next.js 16 renamed `middleware` → `proxy`. The next-intl helper still works
// unchanged — only the file convention is different.
export default createMiddleware(routing)

export const config = {
  // Match every path except API, static files, and internal Next.js routes.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
