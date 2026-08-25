import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'
import type { BrowserCommand } from 'vitest/node'

const transparentPng = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
	'base64',
)

const mockRaspImages: BrowserCommand = async ({ context, provider }) => {
	if (provider.name !== 'playwright') {
		throw new Error('RASP image mocking requires the Playwright provider')
	}

	await context.route('https://canadarasp.com/**', async (route) => {
		await route.fulfill({
			body: transparentPng,
			contentType: 'image/png',
			status: 200,
		})
	})
}

export default defineConfig({
	define: { 'process.env': '{}' },
	plugins: [react()],
	resolve: { tsconfigPaths: true },
	test: {
		projects: [
			{
				extends: true,
				test: {
					environment: 'node',
					include: ['app/**/*.test.ts'],
					name: 'unit',
				},
			},
			{
				extends: true,
				test: {
					browser: {
						commands: { mockRaspImages },
						enabled: true,
						headless: true,
						instances: [{ browser: 'chromium' }],
						provider: playwright(),
						screenshotDirectory: 'test-results/vitest',
					},
					include: ['app/**/*.browser.test.tsx'],
					name: 'chromium',
				},
			},
		],
	},
})
