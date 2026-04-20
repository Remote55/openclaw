import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    // Note: <Image unoptimized> is used for 3rd-party hotel photos, so these
    // patterns are only consulted when the optimizer is actually engaged.
    // Keep the list explicit — do NOT add a catch-all `hostname: '*'`, since
    // that lets any attacker-controlled URL be proxied through the optimizer.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.liteapi.travel',
      },
      {
        protocol: 'https',
        hostname: '**.cdn-hotels.com',
      },
      {
        protocol: 'https',
        hostname: '**.exp-cdn.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
}

export default withNextIntl(nextConfig)