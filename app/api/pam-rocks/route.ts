import { parse } from 'date-fns'
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'
import { revalidateTag, unstable_cache } from 'next/cache'
import { NextResponse } from 'next/server'
import type { WXCardData } from '@/app/lib/definitions'

const PAM_ROCKS_URL =
	'https://weather.gc.ca/past_conditions/index_e.html?station=was'
const PAM_ROCKS_TAG = 'pam-rocks'
const PACIFIC_TIMEZONE = 'America/Vancouver'
const HOUR_IN_MS = 60 * 60 * 1000

type PamRocksObservation = {
	observedAt: number
	data: WXCardData
}

const withoutGusts = (data: WXCardData): WXCardData => {
	if (!data) return data

	const { windGusts: _windGusts, ...rest } = data
	return rest
}

const withUpdatedAtText = (
	data: WXCardData,
	observedAt: number,
): WXCardData => {
	if (!data) return data

	return {
		...data,
		updatedAtText: formatInTimeZone(observedAt, PACIFIC_TIMEZONE, 'h:mm a'),
	}
}

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
	const normalizedWindCell = stripHtml(windCell).toUpperCase()

	if (normalizedWindCell === 'CALM') {
		return {
			windDirection: 0,
			windDirectionText: '',
			windSpeed: 0,
		}
	}

	const match = normalizedWindCell.match(/^([A-Z]{1,3})\s+(\d+)$/)

	if (!match) return null

	const [, directionText, speedText] = match
	const speed = Number.parseInt(speedText, 10)

	return {
		windDirection: windDirectionToDegrees(directionText),
		windDirectionText: directionText,
		windSpeed: speed,
	}
}

const parsePamRocksObservation = (html: string): PamRocksObservation | null => {
	const tableMatch = html.match(
		/<table[^>]*id="past24Table"[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/i,
	)
	const tableBody = tableMatch?.[1]

	if (!tableBody) return null

	const rowMatches = [...tableBody.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)]

	let currentDateLabel = ''

	for (const [, rowHtml] of rowMatches) {
		const dateMatch = rowHtml.match(/table-date[^>]*>([\s\S]*?)<\/th>/i)

		if (dateMatch) {
			currentDateLabel = stripHtml(dateMatch[1])
			continue
		}

		const cells = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(
			([, cell]) => cell,
		)

		if (cells.length < 5 || !currentDateLabel) continue

		const timeLabel = stripHtml(cells[0])
		const windCell = cells[4]
		const data = parseWindCell(windCell)

		if (!data) continue

		const observedAt = fromZonedTime(
			parse(
				`${currentDateLabel} ${timeLabel}`,
				'd MMMM yyyy HH:mm',
				new Date(),
			),
			PACIFIC_TIMEZONE,
		).getTime()

		return {
			observedAt,
			data,
		}
	}

	return null
}

const fetchPamRocksData = async () => {
	const response = await fetch(PAM_ROCKS_URL, {
		cache: 'no-store',
		headers: {
			'user-agent':
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
		},
	})

	if (!response.ok) {
		throw new Error(`Pam Rocks request failed with ${response.status}`)
	}

	const html = await response.text()
	return parsePamRocksObservation(html)
}

const getCachedPamRocksData = unstable_cache(
	fetchPamRocksData,
	['pam-rocks-data-store-v2'],
	{
		tags: [PAM_ROCKS_TAG],
	},
)

export async function GET() {
	try {
		let observation = await getCachedPamRocksData()

		if (!observation?.data) {
			revalidateTag(PAM_ROCKS_TAG, { expire: 0 })
			observation = await fetchPamRocksData()
		}

		if (!observation?.data) {
			return NextResponse.json(
				{ error: 'Failed to fetch Pam Rocks data' },
				{ status: 500 },
			)
		}

		if (Date.now() >= observation.observedAt + HOUR_IN_MS) {
			revalidateTag(PAM_ROCKS_TAG, { expire: 0 })
		}

		return NextResponse.json(
			withUpdatedAtText(withoutGusts(observation.data), observation.observedAt),
		)
	} catch (error) {
		console.error('Pam Rocks route failed', error)
		return NextResponse.json(
			{ error: 'Failed to fetch Pam Rocks data' },
			{ status: 500 },
		)
	}
}
