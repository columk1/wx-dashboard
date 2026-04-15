import { NextResponse } from 'next/server'
import type {
	GondolaHistoryApiResponse,
	WindGraphData,
	WindGraphPoint,
} from '@/app/lib/definitions'
import { fetchData } from '@/app/lib/services/apiClient'

const buildHistoryEndpoint = (currentEndpoint?: string) => {
	if (!currentEndpoint) {
		return null
	}

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

const fetchGondolaHistory = async () => {
	const endpoint = buildHistoryEndpoint(process.env.GONDOLA_WINDMETER_API)
	return fetchData<GondolaHistoryApiResponse>(endpoint ?? undefined)
}

export async function GET() {
	const json = await fetchGondolaHistory()

	if (!json?.observations?.length) {
		return NextResponse.json(
			{ error: 'Failed to fetch Gondola history data' },
			{ status: 500 },
		)
	}

	const data: WindGraphData = buildGondolaSeries(json)

	return NextResponse.json(data)
}
