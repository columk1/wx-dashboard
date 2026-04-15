'use client'

import { useEffect, useState } from 'react'
import styles from './GondolaWebcam.module.css'

const REFRESH_MS = 5 * 60 * 1000

const buildSrc = () => `/api/gondola-webcam?t=${Date.now()}`

const GondolaWebcam = () => {
	const [src, setSrc] = useState(buildSrc)

	useEffect(() => {
		const interval = window.setInterval(() => {
			setSrc(buildSrc())
		}, REFRESH_MS)

		return () => window.clearInterval(interval)
	}, [])

	return (
		<section className={styles.wrapper}>
			<div className={styles.heading}>
				<h2>Sea to Sky Gondola Webcam</h2>
				<p>Temporary test embed, refreshed every 5 minutes.</p>
			</div>
			{/** biome-ignore lint/performance/noImgElement: external image */}
			<img
				src={src}
				alt="Sea to Sky Gondola summit webcam"
				className={styles.image}
			/>
		</section>
	)
}

export default GondolaWebcam
