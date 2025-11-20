'use client'
import WXCard from '@/app/ui/WXCard/WXCard'
import styles from './Wind.module.css'
import WindGraph from '@/app/ui/WindGraph/WindGraph'
import { useEffect } from 'react'
import { WXCardData, WindGraphData } from '@/app/lib/definitions'
import { getWindDirectionText } from '@/app/lib/utils/wind'
import useSWR from 'swr'

const SPIT_INTERVAL = 30000 // 30 seconds
const GONDOLA_INTERVAL = 10000 // 10 seconds
const MAX_INTERVAL = 300000 // 5 minutes

const getSpitCardData = (spitData: WindGraphData): WXCardData => {
  if (!spitData || spitData.length === 0) return null

  const lastPoint = spitData[spitData.length - 1]

  return {
    windSpeed: lastPoint.avg,
    windDirection: lastPoint.dir,
    windLull: lastPoint.lull,
    windGusts: lastPoint.gust,
    windDirectionText: getWindDirectionText(lastPoint.dir),
  }
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const Wind = () => {
  // const lastSpitUpdate = spitData?.[spitData.length - 1]?.time

  // Spit wind data
  const { data: spitData } = useSWR<WindGraphData>('/api/spit', fetcher, {
    refreshInterval: SPIT_INTERVAL,
  })

  // Gondola data
  const { data: gondolaData } = useSWR<WXCardData>('/api/gondola', fetcher, {
    refreshInterval: GONDOLA_INTERVAL,
  })

  // Update the document title with the current wind speed average
  useEffect(() => {
    const lastPoint = spitData?.[spitData?.length - 1]
    const windSpeed = `${lastPoint?.avg} km/h`
    document.title = `${windSpeed} | Chief Lap Copilot`
  }, [spitData])

  return (
    <>
      <div className={styles.flexContainer}>
        <WXCard
          title='Spit'
          url='https://rugged-nimbus-599635289503.us-west1.run.app/?spot=1436'
          data={getSpitCardData(spitData)}
        />
        <WXCard
          title='Gondola'
          url='https://www.seatoskygondola.com/weather-and-cams/'
          data={gondolaData}
        />
      </div>
      <WindGraph data={spitData} />
    </>
  )
}

export default Wind
