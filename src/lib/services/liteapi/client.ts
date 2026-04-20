/**
 * LiteAPI HTTP client.
 * Wraps native fetch() with:
 * - Automatic auth header injection
 * - Typed responses via Zod
 * - Structured error handling
 * - Timeout protection
 * - Request logging (in dev)
 */
import { z } from 'zod'
import {
  LiteAPIError,
  LiteAPIAuthError,
  LiteAPIRateLimitError,
  LiteAPIValidationError,
  LiteAPINotFoundError,
} from './errors'

/** Read API configuration from environment variables */
function getConfig() {
  const mode = process.env.LITEAPI_MODE ?? 'sandbox'
  const baseUrl = process.env.LITEAPI_BASE_URL ?? 'https://api.liteapi.travel/v3.0'

  const apiKey =
    mode === 'production'
      ? process.env.LITEAPI_PRODUCTION_KEY
      : process.env.LITEAPI_SANDBOX_KEY

  if (!apiKey) {
    throw new LiteAPIError(
      `LiteAPI ${mode} key is not configured. Check your .env.local file.`,
      500,
      'CONFIG_MISSING'
    )
  }

  return { apiKey, baseUrl, mode }
}

interface RequestOptions<TResponse> {
  /** URL path starting with / (e.g., "/data/hotels") */
  path: string
  method?: 'GET' | 'POST'
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
  /** Zod schema to validate the response */
  responseSchema: z.ZodType<TResponse>
  /** Request timeout in milliseconds (default: 12s) */
  timeoutMs?: number
}

/**
 * Make a type-safe request to LiteAPI.
 * Returns validated data or throws a typed error.
 */
export async function liteapiRequest<TResponse>({
  path,
  method = 'GET',
  query,
  body,
  responseSchema,
  timeoutMs = 12_000,
}: RequestOptions<TResponse>): Promise<TResponse> {
  const { apiKey, baseUrl } = getConfig()

  // Build URL with query params
  const url = new URL(path.startsWith('/') ? path.slice(1) : path, `${baseUrl}/`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    }
  }

  // Setup abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  let response: Response
  try {
    response = await fetch(url.toString(), {
      method,
      headers: {
        accept: 'application/json',
        'X-API-Key': apiKey,
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      // Next.js data cache — we handle caching ourselves via Redis
      cache: 'no-store',
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new LiteAPIError(
        `LiteAPI request timed out after ${timeoutMs}ms`,
        408,
        'TIMEOUT'
      )
    }
    throw new LiteAPIError(
      `LiteAPI network error: ${err instanceof Error ? err.message : 'unknown'}`,
      0,
      'NETWORK'
    )
  } finally {
    clearTimeout(timeoutId)
  }

  // Handle HTTP errors
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    if (response.status === 401 || response.status === 403) {
      throw new LiteAPIAuthError(
        `LiteAPI auth failed (${response.status}): ${text.slice(0, 200)}`
      )
    }
    if (response.status === 429) {
      throw new LiteAPIRateLimitError()
    }
    if (response.status === 404) {
      throw new LiteAPINotFoundError(`Not found: ${path}`)
    }
    throw new LiteAPIError(
      `LiteAPI request failed: ${response.status} ${response.statusText}`,
      response.status,
      'HTTP_ERROR',
      text
    )
  }

  // Handle empty responses
  if (response.status === 204) {
    return responseSchema.parse(undefined)
  }

  // Parse JSON
  let json: unknown
  try {
    json = await response.json()
  } catch {
    throw new LiteAPIError('LiteAPI returned invalid JSON', 500, 'INVALID_JSON')
  }

  // Validate with Zod
  const parsed = responseSchema.safeParse(json)
  if (!parsed.success) {
    // In dev, log the actual shape so we can fix schemas
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[LiteAPI] Response validation failed:',
        parsed.error.format()
      )
      console.warn('[LiteAPI] Raw response:', JSON.stringify(json).slice(0, 500))
    }
    throw new LiteAPIValidationError(
      'LiteAPI response did not match expected schema',
      parsed.error
    )
  }

  return parsed.data
}