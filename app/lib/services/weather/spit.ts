import { unstable_cache } from 'next/cache'
import testData from '@/app/lib/data/testData.json'
import type {
	SpitWindApiResponse,
	WindDataPoint,
	WindDataSeries,
	WindDataSeriesRaw,
	WindGraphData,
	WindGraphPoint,
} from '@/app/lib/definitions'
import { fetchJson, withWeatherFallback } from './common'

const SPIT_CACHE_TTL_SECONDS = 5 * 60

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
	const windAverage = normalizeSeries(json.wind_avg_data)
	const windGust = normalizeSeries(json.wind_gust_data)
	const windLull = normalizeSeries(json.wind_lull_data)
	const windDirection = normalizeSeries(json.wind_dir_data)

	return windAverage.map(([time, average], index) => ({
		time,
		avg: Math.round(average),
		gust: Math.round(windGust[index]?.[1] ?? average),
		lull: Math.round(windLull[index]?.[1] ?? average),
		dir: windDirection[index]?.[1] ?? null,
	}))
}

const fetchSpitData = async (): Promise<WindGraphData> => {
	const source =
		process.env.NODE_ENV === 'development'
			? (testData.wind as SpitWindApiResponse)
			: await fetchJson<SpitWindApiResponse>(
					`${process.env.SPIT_WINDMETER_API}&_=${Date.now()}`,
				)

	return buildSpitSeries(source)
}

const getCachedSpitData = unstable_cache(
	fetchSpitData,
	['spit-data-store-v2'],
	{
		tags: ['spit'],
		revalidate: SPIT_CACHE_TTL_SECONDS,
	},
)

export const getSpitData = () =>
	withWeatherFallback<WindGraphData>('Spit', getCachedSpitData)
