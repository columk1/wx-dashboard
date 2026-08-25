import { addDays, format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

export type RaspPeriod = [label: string, path: string]

const PACIFIC_TIME_ZONE = 'America/Los_Angeles'

export const getRaspPeriods = (
	timestamp: number | Date = Date.now(),
): RaspPeriod[] => {
	const nowPT = toZonedTime(timestamp, PACIFIC_TIME_ZONE)

	return [
		['Today', `oneDay/${format(nowPT, 'yyyy-MM-dd')}`],
		['Tomorrow', `oneDay/${format(addDays(nowPT, 1), 'yyyy-MM-dd')}`],
		['Two Day', 'twoDay'],
	]
}

export const getRaspImageUrl = (period: string, site: string) =>
	`https://canadarasp.com/windgrams-data/${period}/hrdpswindgram${site}.png`
