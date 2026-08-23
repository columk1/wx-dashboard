import { addDays, format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { connection } from 'next/server'
import sites from '@/app/lib/data/raspSites.json'
import RaspClient, { type RaspPeriod } from './RaspClient'

const getPacificTimestamp = () => toZonedTime(Date.now(), 'America/Los_Angeles')

const getPeriods = (nowPT: Date): RaspPeriod[] => [
	['Today', `oneDay/${format(nowPT, 'yyyy-MM-dd')}`],
	['Tomorrow', `oneDay/${format(addDays(nowPT, 1), 'yyyy-MM-dd')}`],
	['Two Day', 'twoDay'],
]

const getImageUrl = (period: string, site: string) =>
	`https://canadarasp.com/windgrams-data/${period}/hrdpswindgram${site}.png`

const Rasp = async () => {
	// Keep the date request-scoped so it can never be captured during a build.
	await connection()

	const periods = getPeriods(getPacificTimestamp())
	const initialSrc = getImageUrl(periods[0][1], sites[0][1])

	return <RaspClient initialPeriods={periods} initialSrc={initialSrc} />
}

export default Rasp
