import { NextRequest, NextResponse } from 'next/server'
import { setImage, getImage } from '@/app/lib/image-cache'

// This is the update time we will check against: 6 AM and 6 PM Pacific Time
const nextUpdateTime = () => {
  const now = new Date()
  const nextUpdate = new Date(now)
  const hours = now.getHours()

  // If it's before 02:00 UTC (6am PT), schedule update at 02:00 UTC today.
  if (hours < 2) {
    nextUpdate.setHours(2, 0, 0, 0)
  }
  // If it's between 02:00 and 13:00 UTC (6pm PT), schedule update at 13:00 UTC today.
  else if (hours < 13) {
    nextUpdate.setHours(13, 0, 0, 0)
  }
  // Otherwise, schedule update at 02:00 UTC on the next day.
  else {
    nextUpdate.setDate(nextUpdate.getDate() + 1)
    nextUpdate.setHours(2, 0, 0, 0)
  }

  return nextUpdate.getTime()
}

export async function GET(req: NextRequest): Promise<Response> {
  const searchParams = new URLSearchParams(req.url.split('?')[1])
  const period = searchParams.get('period')
  const site = searchParams.get('site')
  if (!period || !site) {
    return new Response(JSON.stringify({ error: 'Missing period or site query parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const cacheKey = `${period}-${site}`

  try {
    // Check if the image is already cached
    const cachedImage = getImage(cacheKey)

    const currentUpdateTime = nextUpdateTime()

    // Check if the cache is still valid or needs to be updated
    if (cachedImage && Date.now() < currentUpdateTime) {
      // Cache is still valid, serve it
      return new Response(cachedImage, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': `public, max-age=${
            currentUpdateTime - Date.now()
          }, stale-while-revalidate=600`,
        },
      })
    }

    // Fetch a new image if cache is expired or we need to check for a new one
    const imageUrl = `https://canadarasp.com/windgrams-data/${period}/hrdpswindgram${site}.png`
    const freshImage = await fetchNewImage(imageUrl)

    if (freshImage) {
      // If a new image is available, update the cache and set the new stale time
      setImage(cacheKey, freshImage)
      return new Response(freshImage, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': `public, max-age=${
            currentUpdateTime - Date.now()
          }, stale-while-revalidate=600`,
        },
      })
    }

    // If no new image is found, serve the cached one (still within valid time)
    return new Response(cachedImage, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': `public, max-age=${
          currentUpdateTime - Date.now()
        }, stale-while-revalidate=600`,
      },
    })
  } catch (error) {
    console.error('Error fetching image:', error)
    return new Response(JSON.stringify({ error: 'Failed to serve image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// Function to fetch new image from the server
async function fetchNewImage(imageUrl: string): Promise<ArrayBuffer | null> {
  const response = await fetch(imageUrl)

  if (response.ok) {
    const imageBuffer = await response.arrayBuffer()
    return imageBuffer
  }

  return null // No new image found
}
