import { Redis } from '@upstash/redis'
import 'dotenv/config'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

const keys = await redis.keys('hotel-search:v1:*')
console.log(`Found ${keys.length} cached search keys`)
if (keys.length > 0) {
  await redis.del(...keys)
  console.log('Cleared all hotel-search cache')
}