'use client'

import { useTranslations, useLocale } from 'next-intl'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { SearchHotelsResult } from '@/lib/services/hotels/search'

interface HotelListProps {
  result: SearchHotelsResult
}

export function HotelList({ result }: HotelListProps) {
  const t = useTranslations('Search')
  const locale = useLocale()

  if (result.hotels.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">{t('noResults')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {result.cached && (
        <div className="flex justify-end">
          <Badge variant="secondary">⚡ {t('cachedBadge')}</Badge>
        </div>
      )}

      {result.hotels.map(({ hotel, cheapestOffer }) => (
        <Card key={hotel.id} className="overflow-hidden">
          <CardContent className="flex flex-col gap-4 p-0 md:flex-row">
            {/* Image */}
            <div className="bg-muted relative h-48 w-full shrink-0 md:h-auto md:w-64">
              {hotel.imageUrl ? (
                <Image
                  src={hotel.imageUrl}
                  alt={hotel.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 256px"
                  className="object-cover"
                  unoptimized // 3rd-party images, skip Next optimizer
                />
              ) : (
                <div className="text-muted-foreground flex h-full items-center justify-center text-4xl">
                  🏨
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg leading-tight font-semibold">
                    {hotel.name}
                  </h3>
                  {hotel.starRating && (
                    <div className="text-sm text-amber-500">
                      {'★'.repeat(Math.floor(hotel.starRating))}
                    </div>
                  )}
                </div>
                {cheapestOffer && (
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US', {
                        style: 'currency',
                        currency: cheapestOffer.currency,
                      }).format(cheapestOffer.totalAmount)}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {t('perNight')}
                    </div>
                  </div>
                )}
              </div>

              {hotel.address && (
                <p className="text-muted-foreground text-sm">
                  📍 {hotel.address}
                </p>
              )}

              <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                {cheapestOffer?.refundable && (
                  <Badge variant="outline" className="text-green-700">
                    ✓ {t('refundable')}
                  </Badge>
                )}
                {cheapestOffer?.boardName && (
                  <Badge variant="outline">{cheapestOffer.boardName}</Badge>
                )}
              </div>

              <Button size="sm" variant="outline" className="mt-2 self-start">
                {t('viewDetails')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}