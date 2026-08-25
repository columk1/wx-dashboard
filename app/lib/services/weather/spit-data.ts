import type {
	SpitWindApiResponse,
	WindDataPoint,
	WindDataSeries,
	WindDataSeriesRaw,
	WindGraphPoint,
} from '@/app/lib/definitions'

const trimLast = <T>(data: T[]): T[] => data.slice(0, -1)

const normalizeSeries = (series: WindDataSeriesRaw): WindDataSeries => {
	let lastValue = 0
	let lastTimestamp = 0

	return trimLast(series).map(([timestamp, value]): WindDataPoint => {
		const nextTimestamp = (timestamp as number | null) ?? lastTimestamp
		const nextValue = (value as number | null) ?? lastValue
		lastTimestamp = nextTimestamp
		lastValue = nextValue
		return [nextTimestamp, nextValue]
	})
}

export const buildSpitSeries = (
	json: SpitWindApiResponse,
): WindGraphPoint[] => {
	const windAverage = normalizeSeries(json.wind_avg_data)
	const windGust = normalizeSeries(json.wind_gust_data)
	const windLull = normalizeSeries(json.wind_lull_data)
	const windDirection = normalizeSeries(json.wind_dir_data)

	return windAverage.map(([time, average], index) => ({
		time,
		avg: Math.round(average),
		gust: Math.round(windGust[index]?.[1] ?? average),
		lull: Math.round(windLull[index]?.[1] ?? average),
		dir: windDirection[index]?.[1] ?? null,
	}))
}
