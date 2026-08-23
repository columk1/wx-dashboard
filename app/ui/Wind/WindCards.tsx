'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import type {
	PamRocksApiResponse,
	WindCardSnapshot,
	WindGraphData,
	WXCardData,
	WXView,
} from '@/app/lib/definitions'
import { getSpitCardData, withObservationTime } from '@/app/lib/utils/wind'
import WXCard from '@/app/ui/WXCard/WXCard'
import { fetchWeather } from './fetchWeather'
import styles from './Wind.module.css'

const SPIT_INTERVAL = 30000 // 30 seconds
const GONDOLA_INTERVAL = 10000 // 10 seconds

const useInitialCard = (data: WXCardData, initialData: WXCardData) =>
	data === undefined ? initialData : withObservationTime(data)

const WindCards = ({
	activeView,
	initialCards,
}: {
	activeView: WXView
	initialCards: WindCardSnapshot
}) => {
	// const lastSpitUpdate = spitData?.[spitData.length - 1]?.time

	// Spit wind data
	const { data: spitData } = useSWR<WindGraphData>('/api/spit', fetchWeather, {
		refreshInterval: SPIT_INTERVAL,
	})

	// Gondola data
	const { data: gondolaData } = useSWR<WXCardData>(
		'/api/gondola',
		fetchWeather,
		{
			refreshInterval: GONDOLA_INTERVAL,
		},
	)

	const { data: pamRocksData } = useSWR<PamRocksApiResponse | null>(
		'/api/pam-rocks',
		fetchWeather,
		{
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
			refreshInterval: 0,
		},
	)

	const spitCardData =
		spitData === undefined
			? initialCards.spit
			: withObservationTime(getSpitCardData(spitData))
	const gondolaCardData = useInitialCard(gondolaData, initialCards.gondola)
	const pamRocksCardData = useInitialCard(
		pamRocksData === undefined ? undefined : pamRocksData?.current,
		initialCards['pam-rocks'],
	)
	const activeCardData =
		activeView === 'gondola'
			? gondolaCardData
			: activeView === 'pam-rocks'
				? pamRocksCardData
				: spitCardData

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
		<div className={styles.wxCards}>
			<WXCard
				title="Spit"
				href="/?view=spit"
				data={spitCardData}
				isActive={activeView === 'spit'}
			/>
			<WXCard
				title="Gondola"
				href="/?view=gondola"
				data={gondolaCardData}
				isActive={activeView === 'gondola'}
			/>
			<WXCard
				title="Pam Rocks"
				href="/?view=pam-rocks"
				data={pamRocksCardData}
				isActive={activeView === 'pam-rocks'}
			/>
		</div>
	)
}

export default WindCards
