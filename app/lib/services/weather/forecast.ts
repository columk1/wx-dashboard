import { unstable_cache } from 'next/cache'
import testData from '@/app/lib/data/testData.json'
import type {
	ParaglidingWxForecastApiResponse,
	SpitWindForecastApiResponse,
	SpitWindForecastData,
} from '@/app/lib/definitions'
import { fetchJson, withWeatherFallback } from './common'

const FORECAST_CACHE_TTL_SECONDS = 60 * 60
const DEFAULT_FORECAST_MODEL = 'paraglidingwx'
const PARAGLIDING_WX_FORECAST_API =
	'https://paraglidingwx.com/api/spit-forecast'
const FORECAST_MODELS = ['hrrr', 'paraglidingwx'] as const

export type ForecastModel = (typeof FORECAST_MODELS)[number]

export const isForecastModel = (model: string): model is ForecastModel =>
	FORECAST_MODELS.includes(model as ForecastModel)

export const getConfiguredForecastModel = (): ForecastModel => {
	const model = process.env.SPIT_FORECAST_MODEL

	if (!model) return DEFAULT_FORECAST_MODEL
	if (!isForecastModel(model)) {
		throw new Error(`Invalid SPIT_FORECAST_MODEL: ${model}`)
	}

	return model
}

const normalizeForecastTime = (value: string) =>
	value.replace(' ', 'T').replace(/([+-]\d{2})(\d{2})$/, '$1:$2')

const parseJsonp = <T>(responseText: string): T => {
	const match = responseText.match(/^[^(]+\(([\s\S]*)\)\s*$/)

	if (!match) throw new Error('Invalid JSONP response from Spit forecast API')

	return JSON.parse(match[1]) as T
}

const buildForecastRequestUrl = (endpoint: string) => {
	const now = Date.now()
	const url = new URL(endpoint)
	url.searchParams.set('callback', `forecastCallback_${now}`)
	url.searchParams.set('_', String(now))
	return url.toString()
}

const buildForecastSeries = (
	forecast: SpitWindForecastApiResponse,
): SpitWindForecastData =>
	forecast.model_data.slice(0, 5).map((point) => ({
		time: new Date(normalizeForecastTime(point.model_time_utc)).getTime(),
		predicted: Math.round(point.wind_speed),
		dir: point.wind_dir,
	}))

const buildParaglidingWxForecastSeries = (
	forecast: ParaglidingWxForecastApiResponse,
): SpitWindForecastData =>
	forecast.forecast_hours.slice(0, 4).map((point) => ({
		time: new Date(point.local_iso).getTime(),
		predicted: Math.round(point.avg_p50),
		dir: Math.round(point.wind_dir_deg),
	}))

const fetchHrrrForecast = async (): Promise<SpitWindForecastApiResponse> => {
	if (process.env.NODE_ENV === 'development') {
		return testData.spit_wind_forecast as SpitWindForecastApiResponse
	}

	const endpoint = process.env.SPIT_WIND_FORECAST_API
	if (!endpoint) throw new Error('Missing SPIT_WIND_FORECAST_API')

	const response = await fetch(buildForecastRequestUrl(endpoint), {
		cache: 'no-store',
		headers: { accept: '*/*' },
	})
	if (!response.ok) {
		throw new Error(`HRRR forecast request failed with ${response.status}`)
	}

	return parseJsonp<SpitWindForecastApiResponse>(await response.text())
}

const fetchParaglidingWxForecast = async () => {
	if (process.env.NODE_ENV === 'development') {
		return testData.paraglidingwx_spit_forecast as ParaglidingWxForecastApiResponse
	}

	return fetchJson<ParaglidingWxForecastApiResponse>(
		PARAGLIDING_WX_FORECAST_API,
	)
}

const fetchForecast = async (
	model: ForecastModel,
): Promise<SpitWindForecastData> => {
	if (model === 'hrrr') return buildForecastSeries(await fetchHrrrForecast())
	return buildParaglidingWxForecastSeries(await fetchParaglidingWxForecast())
}

const getCachedForecast = unstable_cache(
	fetchForecast,
	['spit-forecast-data-store-v2'],
	{
		tags: ['spit-forecast'],
		revalidate: FORECAST_CACHE_TTL_SECONDS,
	},
)

export const getSpitForecastData = (model = getConfiguredForecastModel()) =>
	withWeatherFallback<SpitWindForecastData>('Spit forecast', () =>
		getCachedForecast(model),
	)
