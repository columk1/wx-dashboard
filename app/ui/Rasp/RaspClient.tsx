'use client'

import { useEffect, useState } from 'react'
import sites from '@/app/lib/data/raspSites.json'
import styles from './Rasp.module.css'

export type RaspPeriod = [label: string, path: string]

type RaspClientProps = {
	initialPeriods: RaspPeriod[]
	initialSrc: string
}

const getNextItem = <T,>(array: T[], currentIndex: number) =>
	array[(currentIndex + 1) % array.length]

const periodLabels = ['Today', 'Tomorrow', 'Two Day']

// const getTimeSuffix = (date: Date) =>
//   date.getDay() + date.getHours() > 6 && date.getHours() < 19 ? 'am' : 'pm'

const preloadImages = (srcs: string[]) => {
	srcs.forEach((src) => {
		const img = new Image()
		img.src = src
	})
}

const getImageUrl = (period: string, site: string) =>
	`https://canadarasp.com/windgrams-data/${period}/hrdpswindgram${site}.png`

const RaspClient = ({ initialPeriods, initialSrc }: RaspClientProps) => {
	const [siteIndex, setSiteIndex] = useState(0)
	const [periodIndex, setPeriodIndex] = useState(0)
	const [imageError, setImageError] = useState(false)

	const periods = initialPeriods
	const period = periods[periodIndex]?.[1]
	const site = sites[siteIndex][1]

	const src =
		periodIndex === 0 && siteIndex === 0
			? initialSrc
			: getImageUrl(period, site)

	const cyclePeriod = () =>
		updateImage((periodIndex + 1) % periods.length, siteIndex)

	const handlePeriodSelection = (index: number) => {
		if (periods.length === 0) return

		updateImage(index, siteIndex)
	}

	const handleSiteSelection = (index: number) => {
		if (periods.length === 0) return

		updateImage(periodIndex, index)
	}

	const updateImage = (newPeriodIndex: number, newSiteIndex: number) => {
		if (periods.length === 0) return

		const newPeriod = periods[newPeriodIndex][1]
		const newSite = sites[newSiteIndex][1]
		const newSrc = getImageUrl(newPeriod, newSite)
		const img = new Image()
		img.src = newSrc
		// img.onload = () => {
		//   setPeriodIndex(newPeriodIndex)
		//   setSiteIndex(newSiteIndex)
		// }
		setPeriodIndex(newPeriodIndex)
		setSiteIndex(newSiteIndex)
	}

	// Set the time on the server so the initial URL is present in the initial HTML.
	// The server passes the same period values through hydration to avoid server/client date drift.

	// Preload next site and next period of to pre-empt RASP navigation
	useEffect(() => {
		const preloadImageSrcs = [
			getImageUrl(getNextItem(periods, periodIndex)[1], site),
			getImageUrl(period, getNextItem(sites, siteIndex)[1]),
		]
		preloadImages(preloadImageSrcs)
	}, [period, periods, site, siteIndex, periodIndex])

	return (
		// biome-ignore lint/a11y/useSemanticElements: can't nest buttons
		<div
			className={styles.raspWrapper}
			onClick={() => setImageError(false)}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					setImageError(false)
				}
			}}
			tabIndex={0}
			role="button"
		>
			<div className={styles.periodBtns}>
				{periodLabels.map((label, i) => (
					<button
						type="button"
						key={label}
						onClick={() => handlePeriodSelection(i)}
						className={`${styles.periodBtn} ${periodIndex === i ? styles.active : ''}`}
					>
						{label}
					</button>
				))}
			</div>
			<button type="button" onClick={cyclePeriod} className={styles.imgShared}>
				{imageError ? (
					<div className={styles.error}>Keep Parawaiting</div>
				) : (
					// biome-ignore lint/performance/noImgElement: upstream cache
					<img
						src={src}
						alt={'Rasp Windgram'}
						className={styles.raspImg}
						width={450}
						height={450}
						onError={() => setImageError(true)}
					/>
				)}
			</button>
			<div className={styles.btnContainer}>
				<div className={styles.raspBtns}>
					{sites.map((e, i) => (
						<button
							type="button"
							key={e[0]}
							onClick={() => handleSiteSelection(i)}
							className={`${styles.raspBtn} ${siteIndex === i ? styles.active : ''}`}
						>
							<p>{e[0]}</p>
						</button>
					))}
				</div>
			</div>
		</div>
	)
}

export default RaspClient
