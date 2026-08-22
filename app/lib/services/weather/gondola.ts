import { unstable_cache } from 'next/cache'
import testData from '@/app/lib/data/testData.json'
import type {
	GondolaApiResponse,
	GondolaHistoryApiResponse,
	GondolaObservation,
	WindGraphData,
	WindGraphPoint,
	WXCardData,
} from '@/app/lib/definitions'
import { getWindDirectionText } from '@/app/lib/utils/wind'
import { fetchJson, withWeatherFallback } from './common'

const GONDOLA_CACHE_TTL_SECONDS = 10
const GONDOLA_HISTORY_CACHE_TTL_SECONDS = 60

const buildGondolaCardData = (observation: GondolaObservation): WXCardData => {
	const windDirection = Math.round(observation.winddir)

	return {
		windDirection,
		windDirectionText: getWindDirectionText(windDirection),
		windSpeed: Math.round(observation.metric.windSpeed),
		windGusts: Math.round(observation.metric.windGust),
		observedAt: observation.epoch ? observation.epoch * 1000 : Date.now(),
	}
}

const fetchGondolaData = async (): Promise<WXCardData> => {
	const source =
		process.env.NODE_ENV === 'development'
			? (testData.gondola as GondolaApiResponse)
			: await fetchJson<GondolaApiResponse>(process.env.GONDOLA_WINDMETER_API)
	const observation = source.observations?.[0]

	if (!observation) throw new Error('Gondola response has no observations')

	return buildGondolaCardData(observation)
}

const getCachedGondolaData = unstable_cache(
	fetchGondolaData,
	['gondola-data-store'],
	{
		tags: ['gondola'],
		revalidate: GONDOLA_CACHE_TTL_SECONDS,
	},
)

export const getGondolaData = () =>
	withWeatherFallback<WXCardData>('Gondola', getCachedGondolaData)

const buildHistoryEndpoint = (currentEndpoint?: string) => {
	if (!currentEndpoint) return null

	const currentUrl = new URL(currentEndpoint)
	const historyUrl = new URL('/v2/pws/observations/all/1day', currentUrl.origin)

	for (const [key, value] of currentUrl.searchParams.entries()) {
		historyUrl.searchParams.set(key, value)
	}

	return historyUrl.toString()
}

const buildGondolaSeries = (
	json: GondolaHistoryApiResponse,
): WindGraphPoint[] =>
	json.observations.map((point) => ({
		time: point.epoch * 1000,
		avg: Math.round(point.metric.windspeedAvg ?? 0),
		gust: Math.round(point.metric.windgustHigh ?? 0),
		dir: point.winddirAvg ?? null,
	}))

const fetchGondolaHistory = async (): Promise<WindGraphData> => {
	const endpoint = buildHistoryEndpoint(process.env.GONDOLA_WINDMETER_API)
	const source = await fetchJson<GondolaHistoryApiResponse>(
		endpoint ?? undefined,
	)

	if (!source.observations?.length) {
		throw new Error('Gondola history response has no observations')
	}

	return buildGondolaSeries(source)
}

const getCachedGondolaHistory = unstable_cache(
	fetchGondolaHistory,
	['gondola-history-data-store'],
	{
		tags: ['gondola-history'],
		revalidate: GONDOLA_HISTORY_CACHE_TTL_SECONDS,
	},
)

export const getGondolaHistory = () =>
	withWeatherFallback<WindGraphData>('Gondola history', getCachedGondolaHistory)
