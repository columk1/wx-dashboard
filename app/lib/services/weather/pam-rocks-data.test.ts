import { describe, expect, test } from 'vitest'
import { parsePamRocksObservations } from './pam-rocks-data'

const observation = (
	date: string,
	avg: number | null = 22,
	dir: number | null = 358,
	gust: number | null = 26.1,
) => ({
	properties: {
		'date_tm-value': date,
		avg_wnd_spd_10m_pst10mts: avg,
		avg_wnd_dir_10m_pst10mts: dir,
		max_wnd_spd_10m_pst10mts: gust,
	},
})

describe('Pam Rocks API observations', () => {
	test('uses UTC timestamps, preserves wind units and precision, and sorts history', () => {
		const data = parsePamRocksObservations({
			features: [
				observation('2026-09-30T17:00:00.000Z'),
				observation('2026-09-30T16:00:00.000Z', 26.7, 5, 30.6),
			],
		})

		expect(data).toEqual({
			current: {
				windSpeed: 22,
				windDirection: 358,
				windDirectionText: 'N',
				windGusts: 26.1,
				observedAt: Date.parse('2026-09-30T17:00:00Z'),
				updatedAtText: '10:00 AM',
			},
			points: [
				{
					time: Date.parse('2026-09-30T16:00:00Z'),
					avg: 26.7,
					dir: 5,
					gust: 30.6,
				},
				{
					time: Date.parse('2026-09-30T17:00:00Z'),
					avg: 22,
					dir: 358,
					gust: 26.1,
				},
			],
		})
	})

	test('keeps calm readings and treats missing gust and direction as unavailable', () => {
		const data = parsePamRocksObservations({
			features: [observation('2026-01-30T17:00:00Z', 0, null, null)],
		})

		expect(data?.current).toMatchObject({
			windSpeed: 0,
			windGusts: undefined,
			windDirection: undefined,
			windDirectionText: '',
			updatedAtText: '9:00 AM',
		})
		expect(data?.points[0]).toMatchObject({ avg: 0, dir: null, gust: null })
	})

	test('skips missing speeds and invalid timestamps rather than inventing zero readings', () => {
		const data = parsePamRocksObservations({
			features: [
				observation('2026-09-30T18:00:00Z', null),
				observation('invalid'),
				observation('2026-09-30T17:00:00Z', Number.NaN),
				observation('2026-09-30T16:00:00Z', -1),
				observation('2026-09-30T15:00:00Z', 10, 360, 0),
			],
		})

		expect(data?.points).toHaveLength(1)
		expect(data?.current).toMatchObject({
			windSpeed: 10,
			windDirectionText: 'N',
			windGusts: 0,
		})
	})

	test('rejects empty or unusable responses', () => {
		expect(parsePamRocksObservations({})).toBeNull()
		expect(parsePamRocksObservations({ features: [] })).toBeNull()
		expect(
			parsePamRocksObservations({ features: [{ properties: null }] }),
		).toBeNull()
	})
})
