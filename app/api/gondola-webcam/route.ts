import { NextResponse } from 'next/server'

const WEBCAM_URL = 'https://www.seatoskygondola.com/webcam-data-url.php'
const FIVE_MINUTES = 300

export async function GET() {
	const response = await fetch(WEBCAM_URL, {
		next: { revalidate: FIVE_MINUTES },
	})

	if (!response.ok) {
		return NextResponse.json(
			{ error: 'Failed to fetch gondola webcam page' },
			{ status: 502 },
		)
	}

	const html = await response.text()
	const match = html.match(/src="(data:image\/(?:jpg|jpeg);base64,[^"]+)"/i)

	if (!match) {
		return NextResponse.json(
			{ error: 'Failed to extract gondola webcam image' },
			{ status: 502 },
		)
	}

	const base64 = match[1].replace(/^data:image\/(?:jpg|jpeg);base64,/i, '')
	const image = Buffer.from(base64, 'base64')

	return new NextResponse(image, {
		headers: {
			'Content-Type': 'image/jpeg',
			'Cache-Control': `public, s-maxage=${FIVE_MINUTES}, stale-while-revalidate=${FIVE_MINUTES}`,
		},
	})
}
