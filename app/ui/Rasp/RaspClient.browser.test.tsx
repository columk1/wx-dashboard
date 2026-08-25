import { beforeAll, describe, expect, test } from 'vitest'
import { commands } from 'vitest/browser'
import { render } from 'vitest-browser-react'
import sites from '@/app/lib/data/raspSites.json'
import RaspClient from './RaspClient'
import { getRaspImageUrl, type RaspPeriod } from './rasp-data'

declare module 'vitest/browser' {
	interface BrowserCommands {
		mockRaspImages: () => Promise<void>
	}
}

const periods: RaspPeriod[] = [
	['Today', 'oneDay/2026-08-24'],
	['Tomorrow', 'oneDay/2026-08-25'],
	['Two Day', 'twoDay'],
]
const initialSrc = getRaspImageUrl(periods[0][1], sites[0][1])

beforeAll(async () => {
	await commands.mockRaspImages()
})

describe('RaspClient', () => {
	test('preserves the initial URL and selects every period', async () => {
		const screen = await render(
			<RaspClient initialPeriods={periods} initialSrc={initialSrc} />,
		)
		const image = screen.getByRole('img', { name: 'Rasp Windgram' })

		await expect.element(image).toHaveAttribute('src', initialSrc)

		for (const [label, period] of periods) {
			await screen.getByRole('button', { name: label, exact: true }).click()
			await expect
				.element(image)
				.toHaveAttribute('src', getRaspImageUrl(period, sites[0][1]))
		}
	})

	test('selects every site without changing the period', async () => {
		const screen = await render(
			<RaspClient initialPeriods={periods} initialSrc={initialSrc} />,
		)
		const image = screen.getByRole('img', { name: 'Rasp Windgram' })

		for (const [label, site] of sites) {
			await screen.getByRole('button', { name: label, exact: true }).click()
			await expect
				.element(image)
				.toHaveAttribute('src', getRaspImageUrl(periods[0][1], site))
		}
	})

	test('cycles periods by clicking the image and wraps around', async () => {
		const screen = await render(
			<RaspClient initialPeriods={periods} initialSrc={initialSrc} />,
		)
		const image = screen.getByRole('img', { name: 'Rasp Windgram' })
		const imageButton = screen.getByRole('button', {
			name: 'Rasp Windgram',
			exact: true,
		})

		for (const [, period] of [periods[1], periods[2], periods[0]]) {
			await imageButton.click()
			await expect
				.element(image)
				.toHaveAttribute('src', getRaspImageUrl(period, sites[0][1]))
		}
	})

	test('shows the current failure message and restores the image on retry', async () => {
		const screen = await render(
			<RaspClient initialPeriods={periods} initialSrc={initialSrc} />,
		)
		const image = screen.getByRole('img', { name: 'Rasp Windgram' })

		image.element().dispatchEvent(new Event('error'))
		const errorMessage = screen.getByText('Keep Parawaiting')
		await expect.element(errorMessage).toBeVisible()

		await errorMessage.click()
		await expect
			.element(screen.getByRole('img', { name: 'Rasp Windgram' }))
			.toBeVisible()
	})
})
