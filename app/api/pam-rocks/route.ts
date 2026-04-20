import { parse } from 'date-fns'
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'
import { revalidateTag, unstable_cache } from 'next/cache'
import { NextResponse } from 'next/server'
import type {
	PamRocksApiResponse,
	WindGraphPoint,
	WXCardData,
} from '@/app/lib/definitions'

const PAM_ROCKS_URL =
	'https://weather.gc.ca/past_conditions/index_e.html?station=was'
const PAM_ROCKS_TAG = 'pam-rocks'
const PACIFIC_TIMEZONE = 'America/Vancouver'
const HOUR_IN_MS = 60 * 60 * 1000

type PamRocksObservation = {
	observedAt: number
	data: WXCardData
}

type PamRocksParsedObservation = PamRocksObservation & {
	point: WindGraphPoint
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

	const match = normalizedWindCell.match(
		/^([A-Z]{1,3})\s+(\d+)(?:\s+GUSTS\s+(\d+))?$/,
	)

	if (!match) return null

	const [, directionText, speedText, gustText] = match
	const speed = Number.parseInt(speedText, 10)
	const gust = gustText ? Number.parseInt(gustText, 10) : undefined

	return {
		windDirection: windDirectionToDegrees(directionText),
		windDirectionText: directionText,
		windSpeed: speed,
		...(gust !== undefined ? { windGusts: gust } : {}),
	}
}

const toGraphPoint = (
	observedAt: number,
	data: WXCardData,
): WindGraphPoint => ({
	time: observedAt,
	avg: data?.windSpeed ?? 0,
	gust: data?.windGusts ?? null,
	dir: data?.windDirection ?? null,
})

const parsePamRocksObservation = (html: string): PamRocksApiResponse | null => {
	const tableMatch = html.match(
		/<table[^>]*id="past24Table"[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/i,
	)
	const tableBody = tableMatch?.[1]

	if (!tableBody) return null

	const rowMatches = [...tableBody.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)]

	let currentDateLabel = ''
	const observations: PamRocksParsedObservation[] = []

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

		observations.push({
			observedAt,
			data,
			point: toGraphPoint(observedAt, data),
		})
	}

	const currentObservation = observations[0]

	if (!currentObservation?.data) return null

	return {
		current: withUpdatedAtText(
			currentObservation.data,
			currentObservation.observedAt,
		),
		points: observations
			.map((observation) => observation.point)
			.sort((left, right) => left.time - right.time),
	}
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
		let pamRocksData = await getCachedPamRocksData()

		if (!pamRocksData?.current || pamRocksData.points.length === 0) {
			revalidateTag(PAM_ROCKS_TAG, { expire: 0 })
			pamRocksData = await fetchPamRocksData()
		}

		if (!pamRocksData?.current || pamRocksData.points.length === 0) {
			return NextResponse.json(
				{ error: 'Failed to fetch Pam Rocks data' },
				{ status: 500 },
			)
		}

		const lastObservedAt =
			pamRocksData.points[pamRocksData.points.length - 1].time

		if (Date.now() >= lastObservedAt + HOUR_IN_MS) {
			revalidateTag(PAM_ROCKS_TAG, { expire: 0 })
		}

		return NextResponse.json(pamRocksData)
	} catch (error) {
		console.error('Pam Rocks route failed', error)
		return NextResponse.json(
			{ error: 'Failed to fetch Pam Rocks data' },
			{ status: 500 },
		)
	}
}
