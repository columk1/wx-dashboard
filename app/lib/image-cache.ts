export const imageCache = new Map<string, { data: Buffer; timestamp: number }>()

const CACHE_TTL = 12 * 60 * 60 * 1000 // 12 hours TTL in ms

const isCacheExpired = (timestamp: number): boolean => {
  return Date.now() - timestamp > CACHE_TTL
}

export const setImage = (key: string, imageData: Buffer): void => {
  imageCache.set(key, {
    data: imageData,
    timestamp: Date.now(),
  })
}

export const getImage = (key: string): Buffer | null => {
  const cached = imageCache.get(key)
  if (cached && !isCacheExpired(cached.timestamp)) {
    return cached.data
  }
  return null // Cache is expired or not found
}
