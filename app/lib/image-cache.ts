export const imageCache = new Map<string, { data: ArrayBuffer; timestamp: number }>()

const CACHE_TTL = 12 * 60 * 60 * 1000 // 48 hours TTL in ms

const isCacheExpired = (timestamp: number): boolean => {
  return Date.now() - timestamp > CACHE_TTL
}

export const setImage = (key: string, imageData: ArrayBuffer): void => {
  imageCache.set(key, {
    data: imageData,
    timestamp: Date.now(),
  })
}

// Cleanup function to iterate over cache entries and remove expired ones.
export const cleanupCache = (): void => {
  const now = Date.now()
  for (const [key, { timestamp }] of imageCache.entries()) {
    if (now - timestamp > CACHE_TTL) {
      imageCache.delete(key)
    }
  }
}

const randomCleanup = () => {}
if (Math.random() < 0.05) {
  cleanupCache()
}

export const getImage = (key: string): ArrayBuffer | null => {
  const cached = imageCache.get(key)
  if (cached && !isCacheExpired(cached.timestamp)) {
    randomCleanup() // Randomly trigger a cache cleanup instead of running a cron
    return cached.data
  }
  if (cached) {
    imageCache.delete(key)
  }
  return null // Cache is expired or not found
}
