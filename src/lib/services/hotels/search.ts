/**
 * Hotel search service.
 * Orchestrates: LiteAPI live rates + LiteAPI static data + Redis cache.
 *
 * Why 2-phase fetch?
 *   LiteAPI's `POST /hotels/rates` endpoint returns rates keyed by `hotelId`
 *   but the static hotel info (name, photos, stars, address) it returns
 *   alongside is inconsistent — the `includeHotelData` flag does not reliably
 *   populate top-level fields like `name` on every environment. We therefore
 *   fetch `/data/hotels` (static) in parallel and JOIN on `hotelId`, so the
 *   name/photo/stars always come from a schema-enforced source.
 */
import {
  searchRates,
  listHotelsByCity,
  type HotelRates,
  type HotelListItem,
} from '@/lib/services/liteapi'
import { buildCacheKey, cacheGet, cacheSet } from '@/lib/cache/redis'
import type {
  HotelWithOffer,
  NormalizedHotel,
  NormalizedOffer,
} from '@/lib/services/liteapi'

/** Search results cache TTL: 5 minutes (rates change frequently) */
const SEARCH_CACHE_TTL_SECONDS = 5 * 60

/** Bump this when the cached shape changes so old entries are invalidated. */
const SEARCH_CACHE_NAMESPACE = 'hotel-search:v2'

/** Upper bound on static-data fetch — should be >= rates `limit` so every
 *  rate has a static counterpart to JOIN against. */
const STATIC_HOTEL_LIMIT = 500

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
  const cacheKey = buildCacheKey(SEARCH_CACHE_NAMESPACE, {
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

  // Parallel fetch: rates (must succeed) + static hotels (best-effort).
  // Static fetch failure is non-fatal — we still return rates without names
  // rather than failing the whole search.
  const [ratesResponse, staticResponse] = await Promise.all([
    searchRates({
      checkin,
      checkout,
      currency,
      guestNationality,
      occupancies: [{ adults, children }],
      countryCode,
      cityName,
      limit,
      maxRatesPerHotel: 1, // cheapest only for list view
      // Still request embedded hotel data so we have a fallback if the static
      // fetch fails. The JOIN below prefers the static source when present.
      includeHotelData: true,
      timeout: 10,
    }),
    listHotelsByCity({
      countryCode,
      cityName,
      limit: STATIC_HOTEL_LIMIT,
    }).catch((err) => {
      console.warn(
        '[searchHotels] listHotelsByCity failed (non-fatal); falling back to embedded rate data:',
        err
      )
      return { data: [] as HotelListItem[] }
    }),
  ])

  // Build lookup map: hotelId -> static info
  const staticByHotelId = new Map<string, HotelListItem>()
  for (const h of staticResponse.data) {
    staticByHotelId.set(h.id, h)
  }

  // Normalize each hotel + its cheapest offer, using static info when available
  const hotelsWithOffers: HotelWithOffer[] = ratesResponse.data
    .map((h) =>
      normalizeHotelWithCheapestOffer(h, staticByHotelId.get(h.hotelId))
    )
    .filter((h): h is HotelWithOffer => h !== null)

  const result: SearchHotelsResult = {
    hotels: hotelsWithOffers,
    total: ratesResponse.data.length,
    cached: false,
  }

  // Cache for next time (fire-and-forget)
  void cacheSet(cacheKey, result, SEARCH_CACHE_TTL_SECONDS)

  return result
}

/**
 * Return a usable string or null. Filters out empty strings and whitespace.
 * LiteAPI sometimes returns `""` for missing fields instead of null.
 */
function nonEmpty(s: string | null | undefined): string | null {
  if (s == null) return null
  const trimmed = s.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Return a usable URL or null. Filters out empty strings and obviously-broken
 * values. We intentionally do NOT throw on malformed URLs — just drop them so
 * the UI can render its placeholder instead.
 */
function nonEmptyUrl(s: string | null | undefined): string | null {
  const v = nonEmpty(s)
  if (!v) return null
  if (!/^https?:\/\//i.test(v)) return null
  return v
}

/**
 * Convert a LiteAPI hotel+offer response into our normalized shape.
 * Returns null if no bookable offer is available.
 *
 * @param r          rate-endpoint row (always present)
 * @param staticInfo static-endpoint row joined on hotelId (may be missing)
 */
function normalizeHotelWithCheapestOffer(
  r: HotelRates,
  staticInfo: HotelListItem | undefined
): HotelWithOffer | null {
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

  for (const offer of r.roomTypes ?? []) {
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
              .map(
                (p) =>
                  `${p.type ?? 'charge'} ${p.amount ?? ''} ${p.currency ?? ''}`
              )
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

  // Merge precedence: static (schema-enforced) > rate-embedded > safe fallback
  const name =
    nonEmpty(staticInfo?.name) ??
    nonEmpty(r.name) ??
    `Hotel ${r.hotelId}`

  const hotel: NormalizedHotel = {
    id: r.hotelId,
    liteapiHotelId: r.hotelId,
    name,
    description: nonEmpty(staticInfo?.hotelDescription),
    address: nonEmpty(staticInfo?.address) ?? nonEmpty(r.address),
    city: nonEmpty(staticInfo?.city) ?? nonEmpty(r.city),
    country: nonEmpty(staticInfo?.country) ?? nonEmpty(r.country),
    // Note: static uses `stars`, rate uses `starRating`
    starRating: staticInfo?.stars ?? r.starRating ?? null,
    thumbnailUrl:
      nonEmptyUrl(staticInfo?.thumbnail) ??
      nonEmptyUrl(staticInfo?.main_photo) ??
      nonEmptyUrl(r.thumbnail) ??
      nonEmptyUrl(r.main_photo),
    imageUrl:
      nonEmptyUrl(staticInfo?.main_photo) ??
      nonEmptyUrl(staticInfo?.thumbnail) ??
      nonEmptyUrl(r.main_photo) ??
      nonEmptyUrl(r.thumbnail),
    latitude: staticInfo?.latitude ?? r.latitude ?? null,
    longitude: staticInfo?.longitude ?? r.longitude ?? null,
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
