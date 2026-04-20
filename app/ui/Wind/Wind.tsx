'use client'
import { useEffect } from 'react'
import useSWR from 'swr'
import type {
	PamRocksApiResponse,
	SpitWindForecastData,
	WindGraphData,
	WXCardData,
	WXView,
} from '@/app/lib/definitions'
import { getWindDirectionText } from '@/app/lib/utils/wind'
import WindGraph from '@/app/ui/WindGraph/WindGraph'
import WXCard from '@/app/ui/WXCard/WXCard'
import styles from './Wind.module.css'

const SPIT_INTERVAL = 30000 // 30 seconds
const GONDOLA_INTERVAL = 10000 // 10 seconds
const GONDOLA_GRAPH_INTERVAL = 60000 // 1 minute

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
	}
}

const fetcher = async <T,>(url: string): Promise<T | null> => {
	const res = await fetch(url)

	if (!res.ok) {
		return null
	}

	return res.json()
}

const Wind = ({ activeView }: { activeView: WXView }) => {
	// const lastSpitUpdate = spitData?.[spitData.length - 1]?.time

	// Spit wind data
	const { data: spitData } = useSWR<WindGraphData>('/api/spit', fetcher, {
		refreshInterval: SPIT_INTERVAL,
	})

	const { data: spitForecastData } = useSWR<SpitWindForecastData>(
		'/api/spit/forecast',
		fetcher,
		{
			revalidateIfStale: false,
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		},
	)

	// Gondola data
	const { data: gondolaData } = useSWR<WXCardData>('/api/gondola', fetcher, {
		refreshInterval: GONDOLA_INTERVAL,
	})

	const { data: gondolaGraphData } = useSWR<WindGraphData>(
		'/api/gondola/history',
		fetcher,
		{
			refreshInterval: activeView === 'gondola' ? GONDOLA_GRAPH_INTERVAL : 0,
		},
	)

	const { data: pamRocksData } = useSWR<PamRocksApiResponse | null>(
		'/api/pam-rocks',
		fetcher,
		{
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
			? gondolaData
			: activeView === 'pam-rocks'
				? pamRocksData?.current
				: getSpitCardData(spitData)

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
					data={getSpitCardData(spitData)}
					isActive={activeView === 'spit'}
				/>
				<WXCard
					title="Gondola"
					href="/?view=gondola"
					data={gondolaData}
					isActive={activeView === 'gondola'}
				/>
				<WXCard
					title="Pam Rocks"
					href="/?view=pam-rocks"
					data={pamRocksData?.current}
					isActive={activeView === 'pam-rocks'}
				/>
			</div>
			<WindGraph
				data={activeGraphData}
				forecastData={activeForecastData}
				view={activeView}
			/>
		</>
	)
}

export default Wind
