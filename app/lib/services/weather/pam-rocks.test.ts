import { afterEach, describe, expect, test, vi } from 'vitest'
import { getPamRocksData } from './pam-rocks'

vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({
	unstable_cache: (loader: () => Promise<unknown>) => loader,
}))

afterEach(() => {
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

describe('Pam Rocks API loader', () => {
	test('fetches just the station wind history and derives the current card from it', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			Response.json({
				features: [
					{
						properties: {
							'date_tm-value': '2026-09-30T17:00:00Z',
							avg_wnd_spd_10m_pst10mts: 22,
							avg_wnd_dir_10m_pst10mts: 6,
							max_wnd_spd_10m_pst10mts: 26.1,
						},
					},
				],
			}),
		)
		vi.stubGlobal('fetch', fetchMock)

		const data = await getPamRocksData()
		expect(data?.current?.windSpeed).toBe(22)
		expect(data?.points).toHaveLength(1)
		expect(fetchMock).toHaveBeenCalledTimes(1)
		const [endpoint, options] = fetchMock.mock.calls[0]
		const url = new URL(endpoint)
		expect(url.origin + url.pathname).toBe(
			'https://api.weather.gc.ca/collections/swob-realtime/items',
		)
		expect(Object.fromEntries(url.searchParams)).toEqual({
			f: 'json',
			'msc_id-value': '10459NN',
			sortby: '-date_tm-value',
			limit: '24',
			skipGeometry: 'true',
			properties:
				'date_tm-value,avg_wnd_spd_10m_pst10mts,avg_wnd_dir_10m_pst10mts,max_wnd_spd_10m_pst10mts',
		})
		expect(options).toEqual({ cache: 'no-store' })
	})

	test.each([
		new Response(null, { status: 503 }),
		Response.json({ features: [] }),
		new Response('invalid JSON'),
	])('preserves the unavailable-data fallback on upstream failure', async (response) => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
		expect(await getPamRocksData()).toBeNull()
	})
})
