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

const fetchSpitData = async () =>
  fetchData<SpitWindApiResponse>(`${process.env.SPIT_WINDMETER_API}&_=${Date.now()}`)

export async function GET() {
  const json: SpitWindApiResponse | null =
    process.env.NODE_ENV === 'development'
      ? (testData.wind as SpitWindApiResponse)
      : await fetchSpitData()

  if (!json) {
    return NextResponse.json({ error: 'Failed to fetch Spit data' }, { status: 500 })
  }

  const data: WindGraphData = buildSpitSeries(json)

  return NextResponse.json(data)
}
