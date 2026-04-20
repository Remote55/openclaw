/**
 * Upstash Redis client (server-side only).
 * Used for caching LiteAPI search results and rate limiting.
 */
import { Redis } from '@upstash/redis'

let redisInstance: Redis | null = null

/**
 * Get a singleton Redis client.
 * Returns null if Redis is not configured (graceful degradation).
 */
export function getRedis(): Redis | null {
  if (redisInstance) return redisInstance

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Redis] Not configured — cache disabled')
    }
    return null
  }

  redisInstance = new Redis({ url, token })
  return redisInstance
}

/**
 * Get a cached value by key. Returns null if not found, errored, or Redis disabled.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis()
  if (!redis) return null

  try {
    const value = await redis.get<T>(key)
    return value
  } catch (err) {
    console.error(`[Redis] GET error for key "${key}":`, err)
    return null
  }
}

/**
 * Set a cached value with TTL (in seconds).
 * Silent-fails if Redis is down to not break the app.
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  try {
    await redis.set(key, value, { ex: ttlSeconds })
  } catch (err) {
    console.error(`[Redis] SET error for key "${key}":`, err)
  }
}

/**
 * Delete a cached key.
 */
export async function cacheDel(key: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  try {
    await redis.del(key)
  } catch (err) {
    console.error(`[Redis] DEL error for key "${key}":`, err)
  }
}

/**
 * Build a stable cache key from params.
 * Sorts object keys to ensure same params → same key.
 */
export function buildCacheKey(namespace: string, params: Record<string, unknown>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${JSON.stringify(params[k])}`)
    .join('&')
  return `${namespace}:${sorted}`
}