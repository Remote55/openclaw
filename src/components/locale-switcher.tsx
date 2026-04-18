'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { routing, usePathname, useRouter } from '@/i18n/routing'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

type Locale = (typeof routing.locales)[number]

export function LocaleSwitcher() {
  const t = useTranslations('Common')
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function onSelectLocale(nextLocale: Locale) {
    if (nextLocale === locale) return
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale })
    })
  }

  const label = locale === 'th' ? t('thai') : t('english')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        render={
          <Button variant="outline" size="sm" aria-label={t('language')}>
            🌐 {label}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onSelectLocale('th')} disabled={locale === 'th'}>
          🇹🇭 {t('thai')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelectLocale('en')} disabled={locale === 'en'}>
          🇺🇸 {t('english')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
