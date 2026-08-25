import { expect, test } from '@playwright/test'
import { formatInTimeZone } from 'date-fns-tz'

const transparentPng = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
	'base64',
)

test.beforeEach(async ({ page }) => {
	await page.route('https://canadarasp.com/**', async (route) => {
		await route.fulfill({
			body: transparentPng,
			contentType: 'image/png',
			status: 200,
		})
	})
	await page.route('**/api/gondola-webcam**', async (route) => {
		await route.fulfill({
			body: transparentPng,
			contentType: 'image/png',
			status: 200,
		})
	})
})

test('loads the dashboard with a request-current RASP date', async ({
	page,
}) => {
	const dateBeforeRequest = formatInTimeZone(
		Date.now(),
		'America/Vancouver',
		'yyyy-MM-dd',
	)
	await page.goto('/')
	const dateAfterRequest = formatInTimeZone(
		Date.now(),
		'America/Vancouver',
		'yyyy-MM-dd',
	)

	await expect(
		page.getByRole('heading', { level: 1, name: /Chief Lap Copilot/ }),
	).toBeVisible()
	await expect(page.locator('a[aria-current="page"]')).toContainText('Spit')
	await expect(page.getByTitle('Chief Cam')).toBeVisible()
	await expect(page.locator('#wind-graph')).toBeVisible()
	await expect(
		page.getByRole('button', { name: 'Today', exact: true }),
	).toBeVisible()
	await expect(page.getByRole('link', { name: /Paragliding WX/ })).toBeVisible()

	const raspSrc = await page
		.getByRole('img', { name: 'Rasp Windgram' })
		.getAttribute('src')
	expect(
		[dateBeforeRequest, dateAfterRequest].some((date) =>
			raspSrc?.includes(`/oneDay/${date}/`),
		),
	).toBe(true)
})

test('navigates the weather views along the current happy path', async ({
	page,
}) => {
	await page.goto('/')

	await page.locator('a[href="/?view=gondola"]').click()
	await expect(page).toHaveURL(/\?view=gondola$/)
	await expect(page.locator('a[aria-current="page"]')).toContainText('Gondola')
	await expect(
		page.getByRole('img', { name: 'Sea to Sky Gondola summit webcam' }),
	).toBeVisible()

	await page.locator('a[href="/?view=pam-rocks"]').click()
	await expect(page).toHaveURL(/\?view=pam-rocks$/)
	await expect(page.locator('a[aria-current="page"]')).toContainText(
		'Pam Rocks',
	)
	await expect(page.getByTitle('Chief Cam')).toBeVisible()

	await page.locator('a[href="/?view=spit"]').click()
	await expect(page).toHaveURL(/\?view=spit$/)
	await expect(page.locator('a[aria-current="page"]')).toContainText('Spit')
	await expect(
		page.getByRole('button', { name: 'Today', exact: true }),
	).toBeVisible()
})
