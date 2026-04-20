/**
 * Re-exported types inferred from Zod schemas.
 * Use these throughout the app for type safety.
 */
export type {
  HotelListItem,
  HotelDetails,
  HotelRates,
  SearchRatesParams,
} from './schemas'

/** Our normalized hotel type (what the UI consumes) */
export interface NormalizedHotel {
  id: string
  liteapiHotelId: string
  name: string
  description: string | null
  address: string | null
  city: string | null
  country: string | null
  starRating: number | null
  thumbnailUrl: string | null
  imageUrl: string | null
  latitude: number | null
  longitude: number | null
}

/** Our normalized offer type */
export interface NormalizedOffer {
  offerId: string
  rateId: string | null
  roomName: string | null
  boardType: string | null
  boardName: string | null
  refundable: boolean
  totalAmount: number
  currency: string
  cancellationPolicyText: string | null
}

/** Combined hotel + cheapest offer for list view */
export interface HotelWithOffer {
  hotel: NormalizedHotel
  cheapestOffer: NormalizedOffer | null
}