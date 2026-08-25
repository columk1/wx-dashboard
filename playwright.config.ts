import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
	forbidOnly: Boolean(process.env.CI),
	fullyParallel: false,
	outputDir: 'test-results',
	projects: [
		{
			name: 'desktop-chromium',
			use: { ...devices['Desktop Chrome'], browserName: 'chromium' },
		},
		{
			name: 'mobile-chromium',
			use: { ...devices['iPhone 12'], browserName: 'chromium' },
		},
	],
	reporter: process.env.CI ? 'github' : 'list',
	retries: process.env.CI ? 1 : 0,
	testDir: './e2e',
	use: {
		baseURL: 'http://localhost:3000',
		screenshot: 'only-on-failure',
		trace: 'retain-on-failure',
	},
	webServer: {
		command: 'pnpm dev',
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
		url: 'http://localhost:3000',
	},
})
