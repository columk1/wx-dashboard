import { unstable_cache } from 'next/cache'
import testData from '@/app/lib/data/testData.json'
import type { SpitWindApiResponse, WindGraphData } from '@/app/lib/definitions'
import { fetchJson, withWeatherFallback } from './common'
import { buildSpitSeries } from './spit-data'

const SPIT_CACHE_TTL_SECONDS = 5 * 60

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
