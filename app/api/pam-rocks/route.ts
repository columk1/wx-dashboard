import { NextResponse } from 'next/server'
import { getPamRocksData } from '@/app/lib/services/weather/pam-rocks'

export async function GET() {
	const data = await getPamRocksData()

	if (!data) {
		return NextResponse.json(
			{ error: 'Failed to fetch Pam Rocks data' },
			{ status: 503 },
		)
	}

	return NextResponse.json(data)
}
