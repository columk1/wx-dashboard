import { connection } from 'next/server'
import sites from '@/app/lib/data/raspSites.json'
import RaspClient from './RaspClient'
import { getRaspImageUrl, getRaspPeriods } from './rasp-data'

const Rasp = async () => {
	// Keep the date request-scoped so it can never be captured during a build.
	await connection()

	const periods = getRaspPeriods()
	const initialSrc = getRaspImageUrl(periods[0][1], sites[0][1])

	return <RaspClient initialPeriods={periods} initialSrc={initialSrc} />
}

export default Rasp
