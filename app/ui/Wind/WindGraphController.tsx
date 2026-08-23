'use client'

import useSWR from 'swr'
import type {
	PamRocksApiResponse,
	SpitWindForecastData,
	WindGraphData,
	WXView,
} from '@/app/lib/definitions'
import WindGraph from '@/app/ui/WindGraph/WindGraph'
import { fetchWeather } from './fetchWeather'

const SPIT_INTERVAL = 30000 // 30 seconds
const GONDOLA_GRAPH_INTERVAL = 60000 // 1 minute

const getLatestObservationTime = (data: WindGraphData) =>
	data?.[data.length - 1]?.time

const WindGraphController = ({
	activeView,
	initialGraphData,
	initialPamRocksData,
	initialForecastData,
}: {
	activeView: WXView
	initialGraphData: WindGraphData
	initialPamRocksData?: PamRocksApiResponse | null
	initialForecastData?: SpitWindForecastData
}) => {
	const { data: spitData } = useSWR<WindGraphData>(
		activeView === 'spit' ? '/api/spit' : null,
		fetchWeather,
		{
			fallbackData: activeView === 'spit' ? initialGraphData : undefined,
			refreshInterval: SPIT_INTERVAL,
		},
	)

	const { data: spitForecastData } = useSWR<SpitWindForecastData>(
		activeView === 'spit' ? '/api/spit/forecast' : null,
		fetchWeather,
		{
			fallbackData: initialForecastData,
			revalidateIfStale: false,
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		},
	)

	const { data: gondolaGraphData } = useSWR<WindGraphData>(
		activeView === 'gondola' ? '/api/gondola/history' : null,
		fetchWeather,
		{
			fallbackData: activeView === 'gondola' ? initialGraphData : undefined,
			refreshInterval: GONDOLA_GRAPH_INTERVAL,
		},
	)

	const { data: pamRocksData } = useSWR<PamRocksApiResponse | null>(
		activeView === 'pam-rocks' ? '/api/pam-rocks' : null,
		fetchWeather,
		{
			fallbackData: initialPamRocksData,
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
			refreshInterval: 0,
		},
	)

	const activeGraphData =
		activeView === 'gondola'
			? gondolaGraphData
			: activeView === 'pam-rocks'
				? pamRocksData?.points
				: spitData
	const activeForecastData =
		activeView === 'spit' ? spitForecastData : undefined

	return (
		<WindGraph
			data={activeGraphData}
			forecastData={activeForecastData}
			view={activeView}
			observedAt={getLatestObservationTime(activeGraphData)}
		/>
	)
}

export default WindGraphController
