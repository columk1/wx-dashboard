import { describe, expect, test } from 'vitest'
import type { SpitWindApiResponse } from '@/app/lib/definitions'
import { getSpitCardData } from '@/app/lib/utils/wind'
import { buildSpitSeries } from './spit-data'

describe('Spit data transformation', () => {
	test('normalizes the aligned series and selects the latest complete observation', () => {
		const raw: SpitWindApiResponse = {
			current_time_epoch_utc: 4,
			last_ob_time_local: '2026-08-24 12:00',
			tz_offset: -7,
			wind_avg_data: [
				[1_000, 10.4],
				[2_000, null],
				[3_000, 12.6],
				[4_000, 99],
			],
			wind_gust_data: [
				[1_000, 15.4],
				[2_000, null],
				[3_000, 17.6],
				[4_000, 99],
			],
			wind_lull_data: [
				[1_000, 7.4],
				[2_000, null],
				[3_000, 9.6],
				[4_000, 99],
			],
			wind_dir_data: [
				[1_000, 180],
				[2_000, null],
				[3_000, 200],
				[4_000, 99],
			],
		}

		const series = buildSpitSeries(raw)

		expect(series).toEqual([
			{ time: 1_000, avg: 10, gust: 15, lull: 7, dir: 180 },
			{ time: 2_000, avg: 10, gust: 15, lull: 7, dir: 180 },
			{ time: 3_000, avg: 13, gust: 18, lull: 10, dir: 200 },
		])
		expect(getSpitCardData(series)).toEqual({
			windSpeed: 13,
			windDirection: 200,
			windLull: 10,
			windGusts: 18,
			windDirectionText: 'SSW',
			observedAt: 3_000,
		})
	})
})
