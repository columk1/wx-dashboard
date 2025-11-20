import { NextResponse } from 'next/server'
import type {
  SpitWindApiResponse,
  WindDataSeries,
  WindDataSeriesRaw,
  WindGraphData,
  WindGraphPoint,
  WindDataPoint,
} from '@/app/lib/definitions'
import testData from '@/app/lib/data/testData.json'
import { fetchData } from '@/app/lib/services/apiClient'
import { revalidateTag, unstable_cache } from 'next/cache'

const trimLast = <T>(data: T[]): T[] => data.slice(0, -1)

const normalizeSeries = (series: WindDataSeriesRaw): WindDataSeries => {
  let lastValue = 0
  let lastTimestamp = 0

  return trimLast(series).map(([timestamp, value]): WindDataPoint => {
    const nextTimestamp = (timestamp as number | null) ?? lastTimestamp
    const nextValue = (value as number | null) ?? lastValue
    lastTimestamp = nextTimestamp
    lastValue = nextValue
    return [nextTimestamp, nextValue]
  })
}

const buildSpitSeries = (json: SpitWindApiResponse): WindGraphPoint[] => {
  const wind_avg = normalizeSeries(json.wind_avg_data)
  const wind_gust = normalizeSeries(json.wind_gust_data)
  const wind_lull = normalizeSeries(json.wind_lull_data)
  const wind_dir = normalizeSeries(json.wind_dir_data)

  return wind_avg.map(([time, avg], index) => ({
    time,
    avg: Math.round(avg),
    gust: Math.round(wind_gust[index][1]),
    lull: Math.round(wind_lull[index][1]),
    dir: wind_dir[index][1],
  }))
}

const fetchSpitData = async () => {
  if (process.env.NODE_ENV === 'development') {
    return testData.wind
  }
  console.log('>>> CACHE MISS: Fetching fresh data from external spit API <<<')
  return fetchData<SpitWindApiResponse>(`${process.env.SPIT_WINDMETER_API}&_=${Date.now()}`)
}

const getCachedSpitData = unstable_cache(fetchSpitData, ['spit-data-store'], {
  tags: ['spit'],
})

export async function GET() {
  const now = Date.now()
  const currentData = await getCachedSpitData()

  const lastObTimeString = currentData?.last_ob_time_local
  const tzOffset = currentData?.tz_offset

  const lastTimestamp =
    lastObTimeString && tzOffset
      ? new Date(`${lastObTimeString?.replace(' ', 'T')}-0${Math.abs(tzOffset)}:00`).getTime()
      : 0

  console.log(
    `[DEBUG] Last Observation Time (UTC): ${new Date(lastTimestamp).toISOString()}`,
    `[DEBUG] Server Current Time (UTC):  ${new Date(now).toISOString()}`
  )

  if (now > lastTimestamp + 300000) {
    revalidateTag('spit', { expire: 0 })
    console.log('[DEBUG] Cache is stale. Revalidating...')
  } else {
    console.log('[DEBUG] CACHE HIT: Using cached data')
  }

  const json: SpitWindApiResponse | null = currentData

  if (!json) {
    return NextResponse.json({ error: 'Failed to fetch Spit data' }, { status: 500 })
  }

  const data: WindGraphData = buildSpitSeries(json)

  return NextResponse.json(data)
}
