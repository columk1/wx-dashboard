import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { WindGraphPoint } from '@/app/lib/definitions'
import { getSpitData } from '@/app/lib/services/weather/spit'
import { GET } from './route'

vi.mock('@/app/lib/services/weather/spit', () => ({
	getSpitData: vi.fn(),
}))

const observations: WindGraphPoint[] = [
	{ time: 1_000, avg: 10, gust: 15, lull: 7, dir: 180 },
	{ time: 2_000, avg: 12, gust: 17, lull: 9, dir: 200 },
]

describe('Spit API', () => {
	beforeEach(() => {
		vi.mocked(getSpitData).mockResolvedValue(observations)
	})

	test('returns the full cached series by default', async () => {
		const response = await GET(new Request('http://localhost/api/spit'))

		expect(response.status).toBe(200)
		expect(await response.json()).toEqual(observations)
	})

	test('returns only the latest point when requested', async () => {
		const response = await GET(
			new Request('http://localhost/api/spit?latest=true'),
		)

		expect(response.status).toBe(200)
		expect(await response.json()).toEqual(observations.at(-1))
	})

	test('returns null when the latest point is requested from an empty series', async () => {
		vi.mocked(getSpitData).mockResolvedValue([])

		const response = await GET(
			new Request('http://localhost/api/spit?latest=true'),
		)

		expect(response.status).toBe(200)
		expect(await response.json()).toBeNull()
	})
})
