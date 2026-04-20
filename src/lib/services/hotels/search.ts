/**
 * Hotel search service.
 * Orchestrates: LiteAPI live rates + Redis cache + Supabase static content.
 */
import { searchRates, type HotelRates } from '@/lib/services/liteapi'
import { buildCacheKey, cacheGet, cacheSet } from '@/lib/cache/redis'
import type { HotelWithOffer, NormalizedHotel, NormalizedOffer } from '@/lib/services/liteapi'

/** Search results cache TTL: 5 minutes (rates change frequently) */
const SEARCH_CACHE_TTL_SECONDS = 5 * 60

export interface SearchHotelsInput {
  /** City slug from our cities table: 'tokyo' | 'bangkok' | 'paris' | 'hat-yai' */
  citySlug: string
  countryCode: string
  cityName: string
  checkin: string // YYYY-MM-DD
  checkout: string // YYYY-MM-DD
  adults: number
  children?: number[]
  guestNationality?: string
  currency?: string
  /** Max number of hotels to return */
  limit?: number
}

export interface SearchHotelsResult {
  /** Hotels with their cheapest offer */
  hotels: HotelWithOffer[]
  /** Total hotels found before limit */
  total: number
  /** Was this result served from cache? */
  cached: boolean
}

/**
 * Search hotels with real-time rates.
 * Results are cached in Redis for 5 minutes to reduce LiteAPI load.
 */
export async function searchHotels(
  input: SearchHotelsInput
): Promise<SearchHotelsResult> {
  const {
    citySlug,
    countryCode,
    cityName,
    checkin,
    checkout,
    adults,
    children = [],
    guestNationality = 'US',
    currency = 'USD',
    limit = 20,
  } = input

  // Build cache key
  const cacheKey = buildCacheKey('hotel-search:v1', {
    citySlug,
    checkin,
    checkout,
    adults,
    children,
    currency,
    guestNationality,
    limit,
  })

  // Try cache first
  const cached = await cacheGet<SearchHotelsResult>(cacheKey)
  if (cached) {
    return { ...cached, cached: true }
  }

  // Call LiteAPI
  const response = await searchRates({
    checkin,
    checkout,
    currency,
    guestNationality,
    occupancies: [{ adults, children }],
    countryCode,
    cityName,
    limit,
    maxRatesPerHotel: 1, // cheapest only for list view
    includeHotelData: true,
    timeout: 10,
  })

  // Normalize each hotel + its cheapest offer
  const hotelsWithOffers: HotelWithOffer[] = response.data
    .map((h) => normalizeHotelWithCheapestOffer(h))
    .filter((h): h is HotelWithOffer => h !== null)

  const result: SearchHotelsResult = {
    hotels: hotelsWithOffers,
    total: response.data.length,
    cached: false,
  }

  // Cache for next time (fire-and-forget)
  void cacheSet(cacheKey, result, SEARCH_CACHE_TTL_SECONDS)

  return result
}

/**
 * Convert a LiteAPI hotel+offer response into our normalized shape.
 * Returns null if no bookable offer is available.
 */
function normalizeHotelWithCheapestOffer(h: HotelRates): HotelWithOffer | null {
  // Find cheapest rate across all offers
  let cheapestRate: {
    offerId: string
    rateId: string | null
    amount: number
    currency: string
    boardType: string | null
    boardName: string | null
    refundable: boolean
    roomName: string | null
    policyText: string | null
  } | null = null

  for (const offer of h.roomTypes ?? []) {
    for (const rate of offer.rates ?? []) {
      const totals = rate.retailRate?.total ?? []
      if (totals.length === 0) continue

      const total = totals[0]
      if (!total?.amount || !total?.currency) continue

      const amount = total.amount
      if (!cheapestRate || amount < cheapestRate.amount) {
        const policies = rate.cancellationPolicies?.cancelPolicyInfos ?? []
        const policyText = policies.length
          ? policies
              .map((p) => `${p.type ?? 'charge'} ${p.amount ?? ''} ${p.currency ?? ''}`)
              .join(' / ')
          : null

        cheapestRate = {
          offerId: offer.offerId,
          rateId: rate.rateId ?? null,
          amount,
          currency: total.currency,
          boardType: rate.boardType ?? null,
          boardName: rate.boardName ?? null,
          refundable: rate.refundableTag === 'RFN',
          roomName: rate.name ?? null,
          policyText,
        }
      }
    }
  }

  // Skip hotels without bookable offers
  if (!cheapestRate) return null

  const hotel: NormalizedHotel = {
    id: h.hotelId,
    liteapiHotelId: h.hotelId,
    name: h.name ?? 'Unknown hotel',
    description: null,
    address: h.address ?? null,
    city: h.city ?? null,
    country: h.country ?? null,
    starRating: h.starRating ?? null,
    thumbnailUrl: h.thumbnail ?? h.main_photo ?? null,
    imageUrl: h.main_photo ?? h.thumbnail ?? null,
    latitude: h.latitude ?? null,
    longitude: h.longitude ?? null,
  }

  const offer: NormalizedOffer = {
    offerId: cheapestRate.offerId,
    rateId: cheapestRate.rateId,
    roomName: cheapestRate.roomName,
    boardType: cheapestRate.boardType,
    boardName: cheapestRate.boardName,
    refundable: cheapestRate.refundable,
    totalAmount: cheapestRate.amount,
    currency: cheapestRate.currency,
    cancellationPolicyText: cheapestRate.policyText,
  }

  return { hotel, cheapestOffer: offer }
}