import { use } from 'react'
import { setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LocaleSwitcher } from '@/components/locale-switcher'

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  setRequestLocale(locale)

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
            <Button>{t('cta.getStarted')}</Button>
            <Button variant="outline">{t('cta.learnMore')}</Button>
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-2 text-sm font-medium">{t('cities.title')}</h3>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>🗼 {t('cities.tokyo')}</li>
              <li>🏯 {t('cities.bangkok')}</li>
              <li>🗼 {t('cities.paris')}</li>
              <li>🏖️ {t('cities.hatyai')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}