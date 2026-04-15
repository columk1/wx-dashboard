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
		/* biome-ignore lint/performance/noImgElement: external image */
		<img
			src={src}
			alt="Sea to Sky Gondola summit webcam"
			className={styles.image}
		/>
	)
}

export default GondolaWebcam
