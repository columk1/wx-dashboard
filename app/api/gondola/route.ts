import { NextResponse } from 'next/server'
import { getGondolaData } from '@/app/lib/services/weather/gondola'

export async function GET() {
	const data = await getGondolaData()

	if (!data) {
		return NextResponse.json(
			{ error: 'Failed to fetch Gondola data' },
			{ status: 503 },
		)
	}

	return NextResponse.json(data)
}
