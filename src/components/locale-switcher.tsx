'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { usePathname, useRouter } from '@/i18n/routing'
import { routing } from '@/i18n/routing'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export function LocaleSwitcher() {
  const t = useTranslations('Common')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function onSelectLocale(nextLocale: (typeof routing.locales)[number]) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale })
    })
  }

  const label = locale === 'th' ? t('thai') : t('english')

  return (
      <DropdownMenu>
        {/* @ts-expect-error - React 19 type conflict with Radix UI */}
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPending}>
            🌐 {label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onSelectLocale('th')}
          disabled={locale === 'th'}
        >
          🇹🇭 {t('thai')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSelectLocale('en')}
          disabled={locale === 'en'}
        >
          🇺🇸 {t('english')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}