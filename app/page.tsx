import links from '@/app/lib/data/links.json'
import type { WindInitialData, WXView } from '@/app/lib/definitions'
import { getSpitForecastData } from '@/app/lib/services/weather/forecast'
import {
	getGondolaData,
	getGondolaHistory,
} from '@/app/lib/services/weather/gondola'
import { getPamRocksData } from '@/app/lib/services/weather/pam-rocks'
import { getSpitData } from '@/app/lib/services/weather/spit'
import CameraPanel from '@/app/ui/CameraPanel/CameraPanel'
import Wind from '@/app/ui/Wind/Wind'
import styles from './page.module.css'
import Rasp from './ui/Rasp/Rasp'

const getActiveView = (view?: string): WXView =>
	view === 'gondola' || view === 'pam-rocks' ? view : 'spit'

export default async function Home({
	searchParams,
}: {
	searchParams: Promise<{ view?: string }>
}) {
	const { view } = await searchParams
	const activeView = getActiveView(view)
	const spitForecastPromise =
		activeView === 'spit' ? getSpitForecastData() : Promise.resolve(undefined)
	const gondolaGraphPromise =
		activeView === 'gondola' ? getGondolaHistory() : Promise.resolve(undefined)
	const [
		spitData,
		gondolaData,
		pamRocksData,
		spitForecastData,
		gondolaGraphData,
	] = await Promise.all([
		getSpitData(),
		getGondolaData(),
		getPamRocksData(),
		spitForecastPromise,
		gondolaGraphPromise,
	])
	const initialWindData: WindInitialData = {
		spitData,
		gondolaData,
		pamRocksData,
		spitForecastData,
		gondolaGraphData,
	}

	return (
		<main className={styles.main}>
			<header className={styles.header}>
				<h1>Chief Lap Copilot&nbsp;</h1>
			</header>

			{/* Chief Cam / Gondola Webcam */}
			<section className={styles.cameraFrame}>
				<CameraPanel activeView={activeView} />
			</section>

			{/* Wind cards and wind graph */}
			<Wind activeView={activeView} initialData={initialWindData} />

			{/* Canada Rasp Windgram selector */}
			<Rasp />

			{/* External Links */}
			<section className={styles.section}>
				<ul className={styles.grid}>
					{links.map((link) => (
						<li key={link.url} className={styles.card}>
							<a href={link.url} target="_blank" rel="noopener noreferrer">
								<h4>
									{link.name} <span>{link.emoji}</span>
								</h4>
								<p>{link.description}</p>
							</a>
						</li>
					))}
				</ul>
			</section>
		</main>
	)
}
