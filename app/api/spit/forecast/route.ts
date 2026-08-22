import { NextResponse } from 'next/server'
import {
	getConfiguredForecastModel,
	getSpitForecastData,
	isForecastModel,
} from '@/app/lib/services/weather/forecast'

const getRequestForecastModel = (request: Request) => {
	const configuredModel = getConfiguredForecastModel()

	// In development, allow overriding the forecast model via URL params.
	// In production, always use the configured model.
	if (process.env.NODE_ENV !== 'development') return configuredModel

	const requestedModel = new URL(request.url).searchParams.get('model')
	if (!requestedModel) return configuredModel
	if (!isForecastModel(requestedModel)) {
		throw new Error(`Unknown forecast model: ${requestedModel}`)
	}

	return requestedModel
}

export async function GET(request: Request) {
	try {
		const data = await getSpitForecastData(getRequestForecastModel(request))

		if (!data) {
			return NextResponse.json(
				{ error: 'Failed to fetch Spit forecast data' },
				{ status: 503 },
			)
		}

		return NextResponse.json(data)
	} catch (error) {
		console.error('Spit forecast route failed', error)
		return NextResponse.json(
			{ error: 'Failed to fetch Spit forecast data' },
			{ status: 400 },
		)
	}
}
