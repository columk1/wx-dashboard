'use client'

import { fetchGondolaData } from '@/app/lib/actions'
import { useEffect, useState } from 'react'
import WXCard from '@/app/ui/WXCard/WXCard'
import testData from '@/app/lib/testData.json'

type WindData = {
  windDirection: number
  windSpeed: number
  windGusts: number
  windDirectionText: string
} | null

const GondolaWX = () => {
  const [data, setData] = useState<WindData>(null)
  // const [loading, setLoading] = useState(true)

  // Get wind direction in string format, e.g. 'WNW' from angle.
  const getWindDirectionText = (windDirection: number) => {
    // prettier-ignore
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    return directions[Math.round(windDirection / 22.5)]
  }

  useEffect(() => {
    const fetchData = async () => {
      const json =
        process.env.NODE_ENV === 'development' ? testData.gondola : await fetchGondolaData()
      // console.log(json)
      setData({
        windDirection: Math.round(json.observations[0].winddir),
        windSpeed: Math.round(json.observations[0].metric.windSpeed),
        windGusts: Math.round(json.observations[0].metric.windGust),
        windDirectionText: getWindDirectionText(json.observations[0].winddir),
      })
      // setLoading(false)
    }
    fetchData()

    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  return <WXCard title='Gondola' data={data} />
}

export default GondolaWX
