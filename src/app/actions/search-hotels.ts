'use server'

/**
 * Server Action: search hotels.
 * Called from Client Components — validates input, queries city from Supabase,
 * then calls the hotel service.
 */
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { searchHotels } from '@/lib/services/hotels/search'
import type { SearchHotelsResult } from '@/lib/services/hotels/search'

const SearchInputSchema = z.object({
  citySlug: z.enum(['tokyo', 'bangkok', 'paris', 'hat-yai']),
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.number().int().min(1).max(8),
  children: z.array(z.number().int().min(0).max(17)).optional(),
  currency: z.string().length(3).optional(),
  guestNationality: z.string().length(2).optional(),
})

export type SearchInput = z.input<typeof SearchInputSchema>

export type SearchHotelsActionResult =
  | { ok: true; data: SearchHotelsResult }
  | { ok: false; error: string }

/**
 * Search hotels in one of our 4 demo cities.
 */
export async function searchHotelsAction(
  input: SearchInput
): Promise<SearchHotelsActionResult> {
  // 1. Validate input
  const parsed = SearchInputSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Invalid search parameters: ' + parsed.error.message,
    }
  }

  // 2. Check dates (checkout > checkin, not in the past)
  const checkin = new Date(parsed.data.checkin)
  const checkout = new Date(parsed.data.checkout)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (checkin < today) {
    return { ok: false, error: 'Check-in date cannot be in the past' }
  }
  if (checkout <= checkin) {
    return { ok: false, error: 'Check-out must be after check-in' }
  }

  // 3. Lookup city details from Supabase
  const supabase = await createClient()
  const { data: city, error: cityError } = await supabase
    .from('cities')
    .select('slug, name_en, country_code')
    .eq('slug', parsed.data.citySlug)
    .single()

  if (cityError || !city) {
    return { ok: false, error: 'City not found' }
  }

  // 4. Call hotel service
  try {
    const result = await searchHotels({
      citySlug: city.slug,
      countryCode: city.country_code,
      cityName: city.name_en,
      checkin: parsed.data.checkin,
      checkout: parsed.data.checkout,
      adults: parsed.data.adults,
      children: parsed.data.children,
      currency: parsed.data.currency ?? 'USD',
      guestNationality: parsed.data.guestNationality ?? 'US',
      limit: 20,
    })

    return { ok: true, data: result }
  } catch (err) {
    console.error('[searchHotelsAction] error:', err)
    const message =
      err instanceof Error ? err.message : 'Unknown error during hotel search'
    return { ok: false, error: message }
  }
}