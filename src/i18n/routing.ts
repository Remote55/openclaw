import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  // Languages ที่รองรับ
  locales: ['th', 'en'],

  // Default locale — ใช้ไทยเป็นหลัก
  defaultLocale: 'th',

  // ใส่ prefix ภาษาใน URL เสมอ (/th/..., /en/...)
  // ทำให้ SEO ชัดเจน + แชร์ link ได้ตรง
  localePrefix: 'always',
})

export type Locale = (typeof routing.locales)[number]

// Type-safe navigation helpers
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)