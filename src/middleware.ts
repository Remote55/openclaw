import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match ทุก path ยกเว้น API, static files, internal Next.js
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}