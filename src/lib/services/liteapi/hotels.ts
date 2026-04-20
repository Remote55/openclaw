/**
 * Hotel-related LiteAPI operations.
 * Each function returns validated, typed data.
 */
import { liteapiRequest } from './client'
import {
  GetHotelsResponseSchema,
  GetHotelDetailsResponseSchema,
  SearchRatesParamsSchema,
  SearchRatesResponseSchema,
  type SearchRatesParams,
} from './schemas'

/**
 * Fetch the list of static hotels in a city.
 * Uses GET /data/hotels.
 *
 * Note: This returns STATIC content (names, descriptions, photos).
 * Availability/prices come from searchRates().
 */
export async function listHotelsByCity(params: {
  countryCode: string
  cityName: string
  limit?: number
  offset?: number
}) {
  return liteapiRequest({
    path: '/data/hotels',
    method: 'GET',
    query: {
      countryCode: params.countryCode,
      cityName: params.cityName,
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
    },
    responseSchema: GetHotelsResponseSchema,
  })
}

/**
 * Fetch detailed static content for a single hotel.
 * Uses GET /data/hotel.
 */
export async function getHotelDetails(hotelId: string) {
  return liteapiRequest({
    path: '/data/hotel',
    method: 'GET',
    query: { hotelId },
    responseSchema: GetHotelDetailsResponseSchema,
  })
}

/**
 * Search for live rates across hotels.
 * Uses POST /hotels/rates.
 *
 * This returns REAL-TIME prices and availability — never cache the rate amounts.
 */
export async function searchRates(params: SearchRatesParams) {
  // Validate input
  const validated = SearchRatesParamsSchema.parse(params)

  // Sanity check: at least one location method
  const hasLocation =
    (validated.hotelIds && validated.hotelIds.length > 0) ||
    (validated.countryCode && validated.cityName) ||
    (validated.latitude !== undefined && validated.longitude !== undefined) ||
    validated.aiSearch

  if (!hasLocation) {
    throw new Error(
      'searchRates requires at least one of: hotelIds, countryCode+cityName, latitude+longitude, or aiSearch'
    )
  }

  return liteapiRequest({
    path: '/hotels/rates',
    method: 'POST',
    body: validated,
    responseSchema: SearchRatesResponseSchema,
    timeoutMs: (validated.timeout ?? 10) * 1000 + 3_000, // add buffer
  })
}