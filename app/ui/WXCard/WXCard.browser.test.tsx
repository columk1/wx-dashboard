import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import WXCard from './WXCard'

test('shows the current missing-weather fallback', async () => {
	const screen = await render(
		<WXCard title="Spit" href="/?view=spit" data={null} />,
	)

	await expect
		.element(screen.getByText('Weather data unavailable'))
		.toBeVisible()
})
