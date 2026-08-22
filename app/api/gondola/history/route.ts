import { NextResponse } from 'next/server'
import { getGondolaHistory } from '@/app/lib/services/weather/gondola'

export async function GET() {
	const data = await getGondolaHistory()

	if (!data) {
		return NextResponse.json(
			{ error: 'Failed to fetch Gondola history data' },
			{ status: 503 },
		)
	}

	return NextResponse.json(data)
}
