import { NextResponse } from 'next/server'
import { getSpitData } from '@/app/lib/services/weather/spit'

export async function GET(request: Request) {
	const data = await getSpitData()

	if (!data) {
		return NextResponse.json(
			{ error: 'Failed to fetch Spit data' },
			{ status: 503 },
		)
	}

	const latest = new URL(request.url).searchParams.get('latest') === 'true'

	return NextResponse.json(latest ? (data.at(-1) ?? null) : data)
}
