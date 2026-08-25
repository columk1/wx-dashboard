import { describe, expect, test } from 'vitest'
import { getRaspImageUrl, getRaspPeriods } from './rasp-data'

describe('RASP periods', () => {
	test.each([
		{
			instant: '2026-01-01T07:30:00.000Z',
			today: 'oneDay/2025-12-31',
			tomorrow: 'oneDay/2026-01-01',
		},
		{
			instant: '2026-03-01T07:30:00.000Z',
			today: 'oneDay/2026-02-28',
			tomorrow: 'oneDay/2026-03-01',
		},
		{
			instant: '2026-08-24T06:30:00.000Z',
			today: 'oneDay/2026-08-23',
			tomorrow: 'oneDay/2026-08-24',
		},
	])('uses the Pacific calendar date at $instant', ({
		instant,
		today,
		tomorrow,
	}) => {
		expect(getRaspPeriods(new Date(instant))).toEqual([
			['Today', today],
			['Tomorrow', tomorrow],
			['Two Day', 'twoDay'],
		])
	})

	test('builds the current Canada RASP image URL', () => {
		expect(getRaspImageUrl('oneDay/2026-08-24', '20')).toBe(
			'https://canadarasp.com/windgrams-data/oneDay/2026-08-24/hrdpswindgram20.png',
		)
	})
})
