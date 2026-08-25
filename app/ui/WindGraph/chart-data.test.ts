import { describe, expect, test } from 'vitest'
import type { SpitWindForecastData, WindGraphData } from '@/app/lib/definitions'
import { buildWindChartData, getChartTimeDomain } from './chart-data'

describe('forecast chart extension', () => {
	test('extends the domain to the latest forecast without changing observations', () => {
		const observations: WindGraphData = [
			{ time: 2_000, avg: 12, gust: 16, dir: 180 },
			{ time: 1_000, avg: 10, gust: 14, dir: 170 },
		]
		const forecast: SpitWindForecastData = [
			{ time: 3_000, predicted: 15, dir: 210 },
			{ time: 2_000, predicted: 14, dir: 200 },
			{ time: 1_500, predicted: 13, dir: 190 },
		]
		const originalObservations = structuredClone(observations)

		const { observedChartData, predictedChartData } = buildWindChartData(
			observations,
			forecast,
		)

		expect(getChartTimeDomain(observedChartData)).toEqual([1_000, 2_000])
		expect(getChartTimeDomain(predictedChartData)).toEqual([1_000, 3_000])
		expect(predictedChartData.map(({ time }) => time)).toEqual([
			1_000, 1_500, 2_000, 3_000,
		])
		expect(predictedChartData.find(({ time }) => time === 2_000)).toEqual({
			time: 2_000,
			avg: 12,
			gust: 16,
			dir: 180,
			predicted: 14,
			predictedDir: 200,
		})
		expect(observations).toEqual(originalObservations)
	})
})
