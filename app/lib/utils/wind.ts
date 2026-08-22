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
