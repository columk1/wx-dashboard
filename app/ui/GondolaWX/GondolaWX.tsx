'use client'

import { fetchGondolaData } from '@/app/lib/actions'
import { useEffect, useMemo, useState } from 'react'
import Arrow from '@/app/ui/Arrow'
import styles from './GondolaWX.module.css'
import WXCard from '@/app/ui/WXCard/WXCard'

type WindData = {
  windDirection: number
  windSpeed: number
  windGusts: number
  windDirectionText: string
} | null

const GondolaWX = () => {
  const [data, setData] = useState<WindData>(null)

  // Get wind direction in string format, e.g. 'WNW' from angle.
  const getWindDirectionText = (windDirection: number) => {
    // prettier-ignore
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    return directions[Math.round(windDirection / 22.5)]
  }

  useEffect(() => {
    const fetchData = async () => {
      const json = await fetchGondolaData()
      console.log(json)
      setData({
        windDirection: Math.round(json.observations[0].winddir),
        windSpeed: Math.round(json.observations[0].metric.windSpeed),
        windGusts: Math.round(json.observations[0].metric.windGust),
        windDirectionText: getWindDirectionText(json.observations[0].winddir),
      })
    }

    fetchData()
    // TODO: Set interval in production
    // const interval = setInterval(fetchData, 10000)
    // return () => clearInterval(interval)
  }, [])

  return <WXCard title='Gondola' data={data} />
}

export default GondolaWX
