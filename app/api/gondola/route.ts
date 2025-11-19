import { NextResponse } from 'next/server'
import { fetchData } from '@/app/lib/services/apiClient'
import testData from '@/app/lib/data/testData.json'
import type { GondolaApiResponse, GondolaObservation, WXCardData } from '@/app/lib/definitions'
import { getWindDirectionText } from '@/app/lib/utils/wind'

const buildGondolaCardData = (observation: GondolaObservation): WXCardData => {
  const newWindDirection = Math.round(observation.winddir)

  return {
    windDirection: newWindDirection,
    windDirectionText: getWindDirectionText(newWindDirection),
    windSpeed: Math.round(observation.metric.windSpeed),
    windGusts: Math.round(observation.metric.windGust),
  }
}

const fetchGondola = async () => {
  const endpoint = process.env.GONDOLA_WINDMETER_API
  return fetchData<GondolaApiResponse>(endpoint)
}

export async function GET() {
  const json: GondolaApiResponse | null =
    process.env.NODE_ENV === 'development'
      ? (testData.gondola as GondolaApiResponse)
      : await fetchGondola()

  if (!json || !json.observations?.length) {
    return NextResponse.json({ error: 'Failed to fetch Gondola data' }, { status: 500 })
  }

  const observation = json.observations[0]
  const data = buildGondolaCardData(observation)

  return NextResponse.json(data)
}
