import { NextResponse } from 'next/server'
import { getSpitData } from '@/app/lib/services/weather/spit'

export async function GET() {
	const data = await getSpitData()

	if (!data) {
		return NextResponse.json(
			{ error: 'Failed to fetch Spit data' },
			{ status: 503 },
		)
	}

	return NextResponse.json(data)
}
