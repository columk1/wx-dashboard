import { unstable_cache } from 'next/cache'
import type { PamRocksApiResponse } from '@/app/lib/definitions'
import { withWeatherFallback } from './common'
import { parsePamRocksObservations } from './pam-rocks-data'

const PAM_ROCKS_CACHE_TTL_SECONDS = 60 * 60
const PAM_ROCKS_URL =
	'https://api.weather.gc.ca/collections/swob-realtime/items?' +
	new URLSearchParams({
		f: 'json',
		'msc_id-value': '10459NN',
		sortby: '-date_tm-value',
		limit: '24',
		skipGeometry: 'true',
		properties: [
			'date_tm-value',
			'avg_wnd_spd_10m_pst10mts',
			'avg_wnd_dir_10m_pst10mts',
			'max_wnd_spd_10m_pst10mts',
		].join(','),
	})

const fetchPamRocksData = async (): Promise<PamRocksApiResponse> => {
	const response = await fetch(PAM_ROCKS_URL, { cache: 'no-store' })
	if (!response.ok) {
		throw new Error(`Pam Rocks request failed with ${response.status}`)
	}

	const data = parsePamRocksObservations(await response.json())
	if (!data) throw new Error('Pam Rocks response has no usable observations')
	return data
}

const getCachedPamRocksData = unstable_cache(
	fetchPamRocksData,
	['pam-rocks-data-store-v4'],
	{
		tags: ['pam-rocks'],
		revalidate: PAM_ROCKS_CACHE_TTL_SECONDS,
	},
)

export const getPamRocksData = () =>
	withWeatherFallback<PamRocksApiResponse>('Pam Rocks', getCachedPamRocksData)
