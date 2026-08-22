'use client'
import { useEffect } from 'react'
import useSWR from 'swr'
import type {
	PamRocksApiResponse,
	SpitWindForecastData,
	WindGraphData,
	WindInitialData,
	WXCardData,
	WXView,
} from '@/app/lib/definitions'
import {
	formatWindObservationTime,
	getWindDirectionText,
} from '@/app/lib/utils/wind'
import WindGraph from '@/app/ui/WindGraph/WindGraph'
import WXCard from '@/app/ui/WXCard/WXCard'
import styles from './Wind.module.css'

const SPIT_INTERVAL = 30000 // 30 seconds
const GONDOLA_INTERVAL = 10000 // 10 seconds
const GONDOLA_GRAPH_INTERVAL = 60000 // 1 minute

const withObservationTime = (data: WXCardData): WXCardData => {
	if (!data?.observedAt) return data

	return {
		...data,
		updatedAtText: formatWindObservationTime(data.observedAt),
	}
}

const getLatestObservationTime = (data: WindGraphData) =>
	data?.[data.length - 1]?.time

const getSpitCardData = (spitData: WindGraphData): WXCardData => {
	if (!spitData || spitData.length === 0) return null

	const lastPoint = spitData[spitData.length - 1]
	const direction = lastPoint.dir ?? 0

	return {
		windSpeed: lastPoint.avg,
		windDirection: direction,
		windLull: lastPoint.lull ?? undefined,
		windGusts: lastPoint.gust ?? undefined,
		windDirectionText: getWindDirectionText(direction),
		observedAt: lastPoint.time,
	}
}

const fetcher = async <T,>(url: string): Promise<T> => {
	const res = await fetch(url)

	if (!res.ok) {
		throw new Error(`Weather request failed with ${res.status}`)
	}

	return res.json()
}

const Wind = ({
	activeView,
	initialData,
}: {
	activeView: WXView
	initialData: WindInitialData
}) => {
	// const lastSpitUpdate = spitData?.[spitData.length - 1]?.time

	// Spit wind data
	const { data: spitData } = useSWR<WindGraphData>('/api/spit', fetcher, {
		fallbackData: initialData.spitData,
		refreshInterval: SPIT_INTERVAL,
	})

	const { data: spitForecastData } = useSWR<SpitWindForecastData>(
		activeView === 'spit' ? '/api/spit/forecast' : null,
		fetcher,
		{
			fallbackData: initialData.spitForecastData,
			revalidateIfStale: false,
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		},
	)

	// Gondola data
	const { data: gondolaData } = useSWR<WXCardData>('/api/gondola', fetcher, {
		fallbackData: initialData.gondolaData,
		refreshInterval: GONDOLA_INTERVAL,
	})

	const { data: gondolaGraphData } = useSWR<WindGraphData>(
		activeView === 'gondola' ? '/api/gondola/history' : null,
		fetcher,
		{
			fallbackData: initialData.gondolaGraphData,
			refreshInterval: GONDOLA_GRAPH_INTERVAL,
		},
	)

	const { data: pamRocksData } = useSWR<PamRocksApiResponse | null>(
		'/api/pam-rocks',
		fetcher,
		{
			fallbackData: initialData.pamRocksData,
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
	const activeCardData =
		activeView === 'gondola'
			? withObservationTime(gondolaData)
			: activeView === 'pam-rocks'
				? withObservationTime(pamRocksData?.current)
				: withObservationTime(getSpitCardData(spitData))
	const activeObservedAt = getLatestObservationTime(activeGraphData)

	useEffect(() => {
		const windSpeed = activeCardData?.windSpeed

		if (windSpeed == null) {
			document.title = 'Chief Lap Copilot'
			return
		}

		const viewLabel =
			activeView === 'gondola'
				? 'Gondola'
				: activeView === 'pam-rocks'
					? 'Pam Rocks'
					: 'Spit'
		document.title = `${windSpeed} km/h | ${viewLabel} | Chief Lap Copilot`
	}, [activeCardData, activeView])

	return (
		<>
			<div className={styles.wxCards}>
				<WXCard
					title="Spit"
					href="/?view=spit"
					data={withObservationTime(getSpitCardData(spitData))}
					isActive={activeView === 'spit'}
				/>
				<WXCard
					title="Gondola"
					href="/?view=gondola"
					data={withObservationTime(gondolaData)}
					isActive={activeView === 'gondola'}
				/>
				<WXCard
					title="Pam Rocks"
					href="/?view=pam-rocks"
					data={withObservationTime(pamRocksData?.current)}
					isActive={activeView === 'pam-rocks'}
				/>
			</div>
			<WindGraph
				data={activeGraphData}
				forecastData={activeForecastData}
				view={activeView}
				observedAt={activeObservedAt}
			/>
		</>
	)
}

export default Wind
