import { unstable_cache } from 'next/cache'
import { NextResponse } from 'next/server'
import testData from '@/app/lib/data/testData.json'
import type {
	SpitWindForecastApiResponse,
	SpitWindForecastData,
} from '@/app/lib/definitions'

const FORECAST_CACHE_TTL_SECONDS = 60 * 60

const normalizeForecastTime = (value: string) =>
	value.replace(' ', 'T').replace(/([+-]\d{2})(\d{2})$/, '$1:$2')

const parseJsonp = <T>(responseText: string): T | null => {
	const match = responseText.match(/^[^(]+\(([\s\S]*)\)\s*$/)

	if (!match) return null

	try {
		return JSON.parse(match[1]) as T
	} catch (error) {
		console.log(error)
		return null
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
	forecast.model_data.slice(0, 3).map((point) => ({
		time: new Date(normalizeForecastTime(point.model_time_utc)).getTime(),
		predicted: Math.round(point.wind_speed),
		dir: point.wind_dir,
	}))

const fetchForecast = async (): Promise<SpitWindForecastApiResponse | null> => {
	if (process.env.NODE_ENV === 'development') {
		return testData.spit_wind_forecast as SpitWindForecastApiResponse
	}

	const endpoint = process.env.SPIT_WIND_FORECAST_API

	if (!endpoint) {
		console.log('Missing SPIT_WIND_FORECAST_API')
		return null
	}

	try {
		const response = await fetch(buildForecastRequestUrl(endpoint), {
			cache: 'no-store',
			headers: {
				accept: '*/*',
			},
		})

		if (!response.ok) {
			console.log(response.statusText)
			return null
		}

		const responseText = await response.text()
		return parseJsonp<SpitWindForecastApiResponse>(responseText)
	} catch (error) {
		console.log(error)
		return null
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

export async function GET() {
	const forecast = await getCachedForecast()

	if (!forecast) {
		return NextResponse.json(
			{ error: 'Failed to fetch Spit forecast data' },
			{ status: 500 },
		)
	}

	return NextResponse.json(buildForecastSeries(forecast))
}
