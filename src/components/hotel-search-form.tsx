'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { searchHotelsAction } from '@/app/actions/search-hotels'
import type { SearchHotelsResult } from '@/lib/services/hotels/search'
import { HotelList } from './hotel-list'

type CitySlug = 'tokyo' | 'bangkok' | 'paris' | 'hat-yai'

// Default dates: check-in 2 weeks from today, check-out 3 weeks
function computeDefaultDates() {
  const today = new Date()
  const checkin = new Date(today)
  checkin.setDate(today.getDate() + 14)
  const checkout = new Date(today)
  checkout.setDate(today.getDate() + 17)
  return {
    checkin: checkin.toISOString().slice(0, 10),
    checkout: checkout.toISOString().slice(0, 10),
  }
}

export function HotelSearchForm() {
  const t = useTranslations('Search')

  const [citySlug, setCitySlug] = useState<CitySlug>('bangkok')
  // Lazy initializers: `new Date()` is non-deterministic, so it must only run
  // on the client (after mount) to avoid a server/client hydration mismatch.
  const [checkin, setCheckin] = useState(() => computeDefaultDates().checkin)
  const [checkout, setCheckout] = useState(() => computeDefaultDates().checkout)
  const [adults, setAdults] = useState(2)

  const [result, setResult] = useState<SearchHotelsResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)

    startTransition(async () => {
      const res = await searchHotelsAction({
        citySlug,
        checkin,
        checkout,
        adults,
        currency: 'USD',
        guestNationality: 'US',
      })

      if (!res.ok) {
        setError(res.error)
      } else {
        setResult(res.data)
      }
    })
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      <form
        onSubmit={onSubmit}
        className="bg-card grid grid-cols-1 gap-4 rounded-lg border p-6 md:grid-cols-5"
      >
        {/* City */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="city">{t('selectCity')}</Label>
          <Select
            value={citySlug}
            onValueChange={(v) => setCitySlug(v as CitySlug)}
          >
            <SelectTrigger id="city">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tokyo">🗼 Tokyo</SelectItem>
              <SelectItem value="bangkok">🏯 Bangkok</SelectItem>
              <SelectItem value="paris">🗼 Paris</SelectItem>
              <SelectItem value="hat-yai">🏖️ Hat Yai</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Check-in */}
        <div className="space-y-2">
          <Label htmlFor="checkin">{t('checkin')}</Label>
          <Input
            id="checkin"
            type="date"
            value={checkin}
            onChange={(e) => setCheckin(e.target.value)}
            required
          />
        </div>

        {/* Check-out */}
        <div className="space-y-2">
          <Label htmlFor="checkout">{t('checkout')}</Label>
          <Input
            id="checkout"
            type="date"
            value={checkout}
            onChange={(e) => setCheckout(e.target.value)}
            required
          />
        </div>

        {/* Adults */}
        <div className="space-y-2">
          <Label htmlFor="adults">{t('adults')}</Label>
          <Input
            id="adults"
            type="number"
            min={1}
            max={8}
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            required
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isPending}
          className="md:col-span-5"
          size="lg"
        >
          {isPending ? t('searching') : t('searchButton')}
        </Button>
      </form>

      {/* Results */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <strong>{t('error')}:</strong> {error}
        </div>
      )}

      {isPending && <HotelListSkeleton />}

      {result && !isPending && (
        <HotelList result={result} />
      )}
    </div>
  )
}

function HotelListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-card h-32 animate-pulse rounded-lg border" />
      ))}
    </div>
  )
}