import { parse } from 'date-fns'
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'
import { unstable_cache } from 'next/cache'
import type {
	PamRocksApiResponse,
	WindGraphPoint,
	WXCardData,
} from '@/app/lib/definitions'
import { withWeatherFallback } from './common'

const PAM_ROCKS_CACHE_TTL_SECONDS = 60 * 60
const PAM_ROCKS_URL =
	'https://weather.gc.ca/past_conditions/index_e.html?station=was'
const PACIFIC_TIMEZONE = 'America/Vancouver'

const stripHtml = (value: string) =>
	value
		.replace(/<br\s*\/?>/gi, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/\s+/g, ' ')
		.trim()

const windDirectionToDegrees = (direction: string) => {
	const directions = [
		'N',
		'NNE',
		'NE',
		'ENE',
		'E',
		'ESE',
		'SE',
		'SSE',
		'S',
		'SSW',
		'SW',
		'WSW',
		'W',
		'WNW',
		'NW',
		'NNW',
	]
	const index = directions.indexOf(direction)
	return index >= 0 ? index * 22.5 : 0
}

const parseWindCell = (windCell: string): WXCardData => {
	const normalized = stripHtml(windCell).toUpperCase()

	if (normalized === 'CALM') {
		return { windDirection: 0, windDirectionText: '', windSpeed: 0 }
	}

	const match = normalized.match(/^([A-Z]{1,3})\s+(\d+)(?:\s+GUSTS\s+(\d+))?$/)
	if (!match) return null

	const [, directionText, speedText, gustText] = match
	return {
		windDirection: windDirectionToDegrees(directionText),
		windDirectionText: directionText,
		windSpeed: Number.parseInt(speedText, 10),
		...(gustText ? { windGusts: Number.parseInt(gustText, 10) } : {}),
	}
}

const parsePamRocksObservation = (html: string): PamRocksApiResponse | null => {
	const tableBody = html.match(
		/<table[^>]*id="past24Table"[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/i,
	)?.[1]
	if (!tableBody) return null

	const rows = [...tableBody.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)]
	let currentDateLabel = ''
	const observations: Array<{
		data: NonNullable<WXCardData>
		point: WindGraphPoint
	}> = []

	for (const [, rowHtml] of rows) {
		const dateMatch = rowHtml.match(/table-date[^>]*>([\s\S]*?)<\/th>/i)
		if (dateMatch) {
			currentDateLabel = stripHtml(dateMatch[1])
			continue
		}

		const cells = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(
			([, cell]) => cell,
		)
		if (cells.length < 5 || !currentDateLabel) continue

		const data = parseWindCell(cells[4])
		if (!data) continue

		const observedAt = fromZonedTime(
			parse(
				`${currentDateLabel} ${stripHtml(cells[0])}`,
				'd MMMM yyyy HH:mm',
				new Date(),
			),
			PACIFIC_TIMEZONE,
		).getTime()

		observations.push({
			data: {
				...data,
				observedAt,
				updatedAtText: formatInTimeZone(observedAt, PACIFIC_TIMEZONE, 'h:mm a'),
			},
			point: {
				time: observedAt,
				avg: data.windSpeed,
				gust: data.windGusts ?? null,
				dir: data.windDirection ?? null,
			},
		})
	}

	const current = observations[0]
	if (!current) return null

	return {
		current: current.data,
		points: observations
			.map(({ point }) => point)
			.sort((left, right) => left.time - right.time),
	}
}

const fetchPamRocksData = async (): Promise<PamRocksApiResponse> => {
	const response = await fetch(PAM_ROCKS_URL, {
		cache: 'no-store',
		headers: {
			'user-agent':
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/146 Safari/537.36',
		},
	})
	if (!response.ok) {
		throw new Error(`Pam Rocks request failed with ${response.status}`)
	}

	const data = parsePamRocksObservation(await response.text())
	if (!data) throw new Error('Pam Rocks response could not be parsed')
	return data
}

const getCachedPamRocksData = unstable_cache(
	fetchPamRocksData,
	['pam-rocks-data-store-v3'],
	{
		tags: ['pam-rocks'],
		revalidate: PAM_ROCKS_CACHE_TTL_SECONDS,
	},
)

export const getPamRocksData = () =>
	withWeatherFallback<PamRocksApiResponse>('Pam Rocks', getCachedPamRocksData)
