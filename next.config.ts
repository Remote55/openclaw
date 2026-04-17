import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // เพิ่ม config อื่นๆ ที่นี่ได้
}

export default withNextIntl(nextConfig)