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
	forecast.model_data.slice(0, 3).map((point) => ({
		time: new Date(normalizeForecastTime(point.model_time_utc)).getTime(),
		predicted: Math.round(point.wind_speed),
		dir: point.wind_dir,
	}))

const fetchForecast = async (): Promise<SpitWindForecastApiResponse> => {
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
			`Spit forecast request failed with ${response.status} ${response.statusText}`,
		)
	}

	const responseText = await response.text()
	return parseJsonp<SpitWindForecastApiResponse>(responseText)
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
	try {
		const forecast = await getCachedForecast()
		return NextResponse.json(buildForecastSeries(forecast))
	} catch (error) {
		console.log('Spit forecast route failed', error)
		return NextResponse.json(
			{ error: 'Failed to fetch Spit forecast data' },
			{ status: 500 },
		)
	}
}
