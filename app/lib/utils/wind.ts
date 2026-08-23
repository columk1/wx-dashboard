import type { WindGraphData, WXCardData } from '@/app/lib/definitions'

export const getWindDirectionText = (windDirection: number) => {
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
	return directions[Math.round(windDirection / 22.5)]
}

export const formatWindObservationTime = (observedAt: number) =>
	new Intl.DateTimeFormat('en-US', {
		timeZone: 'America/Vancouver',
		hour: 'numeric',
		minute: '2-digit',
	}).format(observedAt)

export const withObservationTime = (data: WXCardData): WXCardData => {
	if (!data?.observedAt) return data

	return {
		...data,
		updatedAtText: formatWindObservationTime(data.observedAt),
	}
}

export const getSpitCardData = (spitData: WindGraphData): WXCardData => {
	if (!spitData || spitData.length === 0) return null

	const lastPoint = spitData[spitData.length - 1]
	const direction = lastPoint.dir ?? 0

	return {
		windSpeed: lastPoint.avg,
		windDirection: direction,
		windLull: lastPoint.lull ?? undefined,
		windGusts: lastPoint.gust ?? undefined,
		windDirectionText: getWindDirectionText(direction),
		observedAt: lastPoint.time,
	}
}
