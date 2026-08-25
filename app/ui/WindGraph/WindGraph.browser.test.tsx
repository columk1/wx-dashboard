import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import type { SpitWindForecastData, WindGraphData } from '@/app/lib/definitions'
import WindGraph from './WindGraph'

test('forecast visibility extends and restores the rendered time range', async () => {
	const baseTime = new Date('2026-08-24T17:23:00-07:00').getTime()
	const observations: WindGraphData = [
		{ time: baseTime - 60 * 60 * 1_000, avg: 10, gust: 14, lull: 7, dir: 180 },
		{ time: baseTime, avg: 12, gust: 16, lull: 8, dir: 190 },
	]
	const forecast: SpitWindForecastData = [
		{ time: baseTime - 23 * 60 * 1_000, predicted: 13, dir: 220 },
		{ time: baseTime + 37 * 60 * 1_000, predicted: 14, dir: 230 },
		{ time: baseTime + 97 * 60 * 1_000, predicted: 15, dir: 271 },
	]
	const latestForecastTime = forecast.at(-1)?.time ?? 0
	const extendedTick = new Date(
		latestForecastTime - 60 * 60 * 1_000,
	).toLocaleString('en-US', { hour: 'numeric', hour12: true })

	localStorage.setItem(
		'wx-dashboard:preferences:v1',
		JSON.stringify({ showPredictedWind: false }),
	)

	const screen = await render(
		<WindGraph data={observations} forecastData={forecast} view="spit" />,
	)
	const showForecast = screen.getByRole('button', {
		name: 'Show predicted wind',
	})

	await expect.element(showForecast).toHaveAttribute('aria-pressed', 'false')
	await expect.element(screen.getByText(extendedTick)).not.toBeInTheDocument()

	await showForecast.click()
	const hideForecast = screen.getByRole('button', {
		name: 'Hide predicted wind',
	})
	await expect.element(hideForecast).toHaveAttribute('aria-pressed', 'true')
	await expect.element(screen.getByText(extendedTick)).toBeVisible()
	expect(localStorage.getItem('wx-dashboard:preferences:v1')).toBe(
		JSON.stringify({ showPredictedWind: true }),
	)

	await hideForecast.click()
	await expect
		.element(screen.getByRole('button', { name: 'Show predicted wind' }))
		.toHaveAttribute('aria-pressed', 'false')
	await expect.element(screen.getByText(extendedTick)).not.toBeInTheDocument()
})

test('shows the current empty-history fallback', async () => {
	const screen = await render(<WindGraph data={null} />)

	await expect
		.element(screen.getByText('Wind history unavailable'))
		.toBeVisible()
})
