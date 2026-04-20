import { use } from 'react'
import { setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { HotelSearchForm } from '@/components/hotel-search-form'
import { LocaleSwitcher } from '@/components/locale-switcher'

export default function SearchPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  setRequestLocale(locale)

  const t = useTranslations('Search')

  return (
    <main className="container mx-auto flex min-h-svh flex-col items-center gap-6 p-8">
      <div className="flex w-full max-w-4xl items-center justify-between">
        <h1 className="text-3xl font-bold">🐾 {t('title')}</h1>
        <LocaleSwitcher />
      </div>

      <HotelSearchForm />
    </main>
  )
}