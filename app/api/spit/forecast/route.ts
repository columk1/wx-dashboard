import { unstable_cache } from 'next/cache'
import { NextResponse } from 'next/server'
import testData from '@/app/lib/data/testData.json'
import type {
	ParaglidingWxForecastApiResponse,
	SpitWindForecastApiResponse,
	SpitWindForecastData,
} from '@/app/lib/definitions'

const FORECAST_CACHE_TTL_SECONDS = 60 * 60
const DEFAULT_FORECAST_MODEL = 'paraglidingwx'
const PARAGLIDING_WX_FORECAST_API =
	'https://paraglidingwx.com/api/spit-forecast'
const FORECAST_MODELS = ['hrrr', 'paraglidingwx'] as const

type ForecastModel = (typeof FORECAST_MODELS)[number]

const isForecastModel = (model: string): model is ForecastModel =>
	FORECAST_MODELS.includes(model as ForecastModel)

const getConfiguredForecastModel = (): ForecastModel => {
	const model = process.env.SPIT_FORECAST_MODEL

	if (!model) {
		return DEFAULT_FORECAST_MODEL
	}

	if (!isForecastModel(model)) {
		throw new Error(`Invalid SPIT_FORECAST_MODEL: ${model}`)
	}

	return model
}

// In development, allow overriding the forecast model via URL params
// In production, use the configured model from environment variables
const getRequestForecastModel = (request: Request): ForecastModel => {
	const configuredModel = getConfiguredForecastModel()

	if (process.env.NODE_ENV !== 'development') {
		return configuredModel
	}

	const { searchParams } = new URL(request.url)
	const model = searchParams.get('model')

	if (!model) {
		return configuredModel
	}

	if (!isForecastModel(model)) {
		throw new Error(`Unknown forecast model: ${model}`)
	}

	return model
}

const normalizeForecastTime = (value: string) =>
	value.replace(' ', 'T').replace(/([+-]\d{2})(\d{2})$/, '$1:$2')

const parseJsonp = <T>(responseText: string): T => {
	const match = responseText.match(/^[^(]+\(([\s\S]*)\)\s*$/)

	if (!match) {
		throw new Error('Invalid JSONP response from Spit forecast API')
	}

	try {
		return JSON.parse(match[1]) as T
	} catch (error) {
		throw new Error('Failed to parse Spit forecast JSONP response', {
			cause: error,
		})
	}
}

const buildForecastRequestUrl = (endpoint: string) => {
	const now = Date.now()
	const callback = `forecastCallback_${now}`
	const url = new URL(endpoint)

	url.searchParams.set('callback', callback)
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

	if (!endpoint) {
		throw new Error('Missing SPIT_WIND_FORECAST_API')
	}

	const response = await fetch(buildForecastRequestUrl(endpoint), {
		cache: 'no-store',
		headers: {
			accept: '*/*',
		},
	})

	if (!response.ok) {
		throw new Error(
			`HRRR forecast request failed with ${response.status} ${response.statusText}`,
		)
	}

	const responseText = await response.text()
	return parseJsonp<SpitWindForecastApiResponse>(responseText)
}

const fetchParaglidingWxForecast =
	async (): Promise<ParaglidingWxForecastApiResponse> => {
		if (process.env.NODE_ENV === 'development') {
			return testData.paraglidingwx_spit_forecast as ParaglidingWxForecastApiResponse
		}

		const response = await fetch(PARAGLIDING_WX_FORECAST_API, {
			cache: 'no-store',
			headers: {
				accept: 'application/json',
			},
		})

		if (!response.ok) {
			throw new Error(
				`ParaglidingWX forecast request failed with ${response.status} ${response.statusText}`,
			)
		}

		return response.json()
	}

const fetchForecast = async (
	model: ForecastModel,
): Promise<SpitWindForecastData> => {
	switch (model) {
		case 'hrrr':
			return buildForecastSeries(await fetchHrrrForecast())
		case 'paraglidingwx':
			return buildParaglidingWxForecastSeries(
				await fetchParaglidingWxForecast(),
			)
	}
}

const getCachedForecast = unstable_cache(
	fetchForecast,
	['spit-forecast-data-store'],
	{
		tags: ['spit-forecast'],
		revalidate: FORECAST_CACHE_TTL_SECONDS,
	},
)

export async function GET(request: Request) {
	try {
		const model = getRequestForecastModel(request)
		const forecast = await getCachedForecast(model)
		return NextResponse.json(forecast)
	} catch (error) {
		console.log('Spit forecast route failed', error)
		return NextResponse.json(
			{ error: 'Failed to fetch Spit forecast data' },
			{ status: 500 },
		)
	}
}
