import type { PamRocksApiResponse, WindGraphPoint } from '@/app/lib/definitions'
import {
	formatWindObservationTime,
	getWindDirectionText,
} from '@/app/lib/utils/wind'

type PamRocksObservationResponse = {
	features?: Array<{
		properties?: {
			'date_tm-value'?: string | null
			avg_wnd_spd_10m_pst10mts?: number | null
			avg_wnd_dir_10m_pst10mts?: number | null
			max_wnd_spd_10m_pst10mts?: number | null
		} | null
	}>
}

const isWindSpeed = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value) && value >= 0

export const parsePamRocksObservations = (
	response: PamRocksObservationResponse,
): PamRocksApiResponse | null => {
	if (!Array.isArray(response?.features)) return null

	const points: WindGraphPoint[] = []
	for (const feature of response.features) {
		const properties = feature?.properties
		if (!properties) continue

		const date = properties['date_tm-value']
		const time = typeof date === 'string' ? Date.parse(date) : Number.NaN
		const avg = properties.avg_wnd_spd_10m_pst10mts
		if (!Number.isFinite(time) || !isWindSpeed(avg)) continue

		const dir = properties.avg_wnd_dir_10m_pst10mts
		const gust = properties.max_wnd_spd_10m_pst10mts
		points.push({
			time,
			avg,
			gust: isWindSpeed(gust) ? gust : null,
			dir:
				typeof dir === 'number' &&
				Number.isFinite(dir) &&
				dir >= 0 &&
				dir <= 360
					? dir
					: null,
		})
	}

	points.sort((left, right) => left.time - right.time)
	const latest = points.at(-1)
	if (!latest) return null

	return {
		current: {
			windSpeed: latest.avg,
			windDirection: latest.dir ?? undefined,
			windDirectionText:
				latest.dir == null ? '' : getWindDirectionText(latest.dir),
			windGusts: latest.gust ?? undefined,
			observedAt: latest.time,
			updatedAtText: formatWindObservationTime(latest.time),
		},
		points,
	}
}
