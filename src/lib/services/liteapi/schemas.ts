/**
 * Zod schemas for LiteAPI requests and responses.
 * Every external response MUST be validated to prevent runtime surprises.
 */
import { z } from 'zod'

// ============================================================================
// COMMON
// ============================================================================

export const CurrencyCodeSchema = z.string().length(3).toUpperCase()
export const CountryCodeSchema = z.string().length(2).toUpperCase()
export const DateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Date must be in YYYY-MM-DD format',
})

// ============================================================================
// STATIC HOTEL LIST (GET /data/hotels)
// ============================================================================

export const HotelListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  hotelDescription: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  stars: z.number().optional().nullable(),
  main_photo: z.string().url().optional().nullable(),
  thumbnail: z.string().url().optional().nullable(),
  currency: z.string().optional().nullable(),
  chain: z.string().optional().nullable(),
  chainId: z.union([z.string(), z.number()]).optional().nullable(),
  zip: z.string().optional().nullable(),
})

export const GetHotelsResponseSchema = z.object({
  data: z.array(HotelListItemSchema),
  total: z.number().optional(),
})

export type HotelListItem = z.infer<typeof HotelListItemSchema>

// ============================================================================
// HOTEL DETAILS (GET /data/hotel)
// ============================================================================

export const HotelImageSchema = z.object({
  url: z.string().url().optional().nullable(),
  urlHd: z.string().url().optional().nullable(),
  caption: z.string().optional().nullable(),
  order: z.number().optional().nullable(),
  defaultImage: z.boolean().optional().nullable(),
})

export const HotelAmenitySchema = z.object({
  name: z.string(),
})

export const HotelDetailsSchema = z.object({
  id: z.string(),
  name: z.string(),
  hotelDescription: z.string().optional().nullable(),
  starRating: z.number().optional().nullable(),
  country: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  zip: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  main_photo: z.string().url().optional().nullable(),
  thumbnail: z.string().url().optional().nullable(),
  hotelImages: z.array(HotelImageSchema).optional().nullable(),
  hotelFacilities: z.array(z.string()).optional().nullable(),
  amenities: z.array(HotelAmenitySchema).optional().nullable(),
  checkinCheckoutTimes: z
    .object({
      checkin: z.string().optional().nullable(),
      checkout: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
})

export const GetHotelDetailsResponseSchema = z.object({
  data: HotelDetailsSchema,
})

export type HotelDetails = z.infer<typeof HotelDetailsSchema>

// ============================================================================
// SEARCH RATES (POST /hotels/rates)
// ============================================================================

export const OccupancySchema = z.object({
  adults: z.number().int().min(1).max(10),
  children: z.array(z.number().int().min(0).max(17)).optional().default([]),
})

export const SearchRatesParamsSchema = z.object({
  checkin: DateStringSchema,
  checkout: DateStringSchema,
  currency: CurrencyCodeSchema.default('USD'),
  guestNationality: CountryCodeSchema,
  occupancies: z.array(OccupancySchema).min(1),

  // ONE of these location methods (validated at runtime below)
  hotelIds: z.array(z.string()).optional(),
  countryCode: CountryCodeSchema.optional(),
  cityName: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().int().positive().optional(),
  aiSearch: z.string().optional(),

  // Filters (optional)
  starRating: z.array(z.number().min(1).max(5)).optional(),
  maxRatesPerHotel: z.number().int().min(1).max(50).optional().default(1),
  refundableRatesOnly: z.boolean().optional(),
  minRating: z.number().min(0).max(5).optional(),
  limit: z.number().int().min(1).max(5000).optional().default(200),
  includeHotelData: z.boolean().optional().default(true),
  timeout: z.number().int().min(1).max(30).optional().default(10),
})

export type SearchRatesParams = z.input<typeof SearchRatesParamsSchema>

// Rate / offer schema (response from /hotels/rates)
export const RateSchema = z.object({
  rateId: z.string().optional(),
  name: z.string().optional().nullable(),
  maxOccupancy: z.number().optional().nullable(),
  adultCount: z.number().optional().nullable(),
  childCount: z.number().optional().nullable(),
  boardType: z.string().optional().nullable(),
  boardName: z.string().optional().nullable(),
  refundableTag: z.enum(['RFN', 'NRFN']).optional().nullable(),
  retailRate: z
    .object({
      total: z
        .array(
          z.object({
            amount: z.number(),
            currency: z.string(),
          })
        )
        .optional(),
      suggestedSellingPrice: z
        .array(
          z.object({
            amount: z.number(),
            currency: z.string(),
          })
        )
        .optional(),
    })
    .optional(),
  cancellationPolicies: z
    .object({
      cancelPolicyInfos: z
        .array(
          z.object({
            cancelTime: z.string().optional(),
            amount: z.number().optional(),
            currency: z.string().optional(),
            type: z.string().optional(),
          })
        )
        .optional()
        .nullable(),
      hotelRemarks: z.array(z.string()).optional().nullable(),
      refundableTag: z.enum(['RFN', 'NRFN']).optional().nullable(),
    })
    .optional()
    .nullable(),
})

export const OfferSchema = z.object({
  offerId: z.string(),
  supplier: z.string().optional().nullable(),
  supplierId: z.union([z.string(), z.number()]).optional().nullable(),
  rateType: z.string().optional().nullable(),
  priceType: z.string().optional().nullable(),
  rates: z.array(RateSchema).optional().default([]),
})

export const HotelRatesSchema = z.object({
  hotelId: z.string(),
  roomTypes: z.array(OfferSchema).optional().default([]),

  // Included when includeHotelData=true
  name: z.string().optional().nullable(),
  starRating: z.number().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  main_photo: z.string().url().optional().nullable(),
  thumbnail: z.string().url().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  rating: z.number().optional().nullable(),
  reviewCount: z.number().optional().nullable(),
})

export type HotelRates = z.infer<typeof HotelRatesSchema>

export const SearchRatesResponseSchema = z.object({
  data: z.array(HotelRatesSchema),
})