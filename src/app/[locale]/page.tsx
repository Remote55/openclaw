import { setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // Test: fetch cities from Supabase
  const supabase = await createClient()
  const { data: cities, error } = await supabase
    .from('cities')
    .select('slug, name_en, name_th, country_code')
    .order('name_en')

  return (
    <HomePageContent
      locale={locale}
      cities={cities ?? []}
      error={error?.message}
    />
  )
}

function HomePageContent({
  locale,
  cities,
  error,
}: {
  locale: string
  cities: Array<{ slug: string; name_en: string; name_th: string; country_code: string }>
  error?: string
}) {
  const t = useTranslations('HomePage')

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-8">
      <div className="absolute top-4 right-4">
        <LocaleSwitcher />
      </div>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">🐾 {t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              render={
                <Link href={`/${locale}/search`}>{t('cta.getStarted')}</Link>
              }
            />
            <Button variant="outline">{t('cta.learnMore')}</Button>
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-2 text-sm font-medium">{t('cities.title')}</h3>
            {error ? (
              <p className="text-sm text-red-500">Error: {error}</p>
            ) : cities.length === 0 ? (
              <p className="text-muted-foreground text-sm">No cities found.</p>
            ) : (
              <ul className="text-muted-foreground space-y-1 text-sm">
                {cities.map((city) => (
                  <li key={city.slug}>
                    📍 {locale === 'th' ? city.name_th : city.name_en}{' '}
                    ({city.country_code})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}