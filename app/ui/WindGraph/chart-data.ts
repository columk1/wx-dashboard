import type {
	SpitWindForecastData,
	WindGraphChartPoint,
	WindGraphData,
} from '@/app/lib/definitions'

const sortByTime = (left: WindGraphChartPoint, right: WindGraphChartPoint) =>
	left.time - right.time

const buildObservedChartData = (
	observedData: WindGraphData,
): WindGraphChartPoint[] => [...(observedData ?? [])].sort(sortByTime)

const buildForecastChartData = (
	forecastData?: SpitWindForecastData,
): WindGraphChartPoint[] =>
	(Array.isArray(forecastData) ? forecastData : [])
		.map((point) => ({
			time: point.time,
			predicted: point.predicted,
			predictedDir: point.dir,
		}))
		.sort(sortByTime)

const buildPredictedChartData = (
	observedChartData: WindGraphChartPoint[],
	forecastChartData: WindGraphChartPoint[],
): WindGraphChartPoint[] => {
	if (forecastChartData.length === 0) return observedChartData

	// Recharts tooltips resolve against chart rows, so visible forecast values
	// need to be overlaid into `data`. Hidden forecast rows are never included.
	const chartDataByTime = new Map<number, WindGraphChartPoint>(
		observedChartData.map((point) => [point.time, { ...point }]),
	)

	forecastChartData.forEach((point) => {
		const observedPoint = chartDataByTime.get(point.time)

		chartDataByTime.set(point.time, {
			...observedPoint,
			time: point.time,
			predicted: point.predicted,
			predictedDir: point.predictedDir,
		})
	})

	return Array.from(chartDataByTime.values()).sort(sortByTime)
}

export const buildWindChartData = (
	observedData: WindGraphData,
	forecastData?: SpitWindForecastData,
) => {
	const observedChartData = buildObservedChartData(observedData)
	const forecastChartData = buildForecastChartData(forecastData)
	const predictedChartData = buildPredictedChartData(
		observedChartData,
		forecastChartData,
	)

	return { observedChartData, forecastChartData, predictedChartData }
}

export const getChartTimeDomain = (
	chartData: WindGraphChartPoint[],
): [number, number] => [
	chartData[0]?.time ?? 0,
	chartData[chartData.length - 1]?.time ?? 0,
]
