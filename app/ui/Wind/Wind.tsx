'use client'
import WXCard from '@/app/ui/WXCard/WXCard'
import styles from './Wind.module.css'
import WindGraph from '@/app/ui/WindGraph/WindGraph'
import { useEffect } from 'react'
import { SpitWindForecastData, WXCardData, WindGraphData } from '@/app/lib/definitions'
import { getWindDirectionText } from '@/app/lib/utils/wind'
import useSWR from 'swr'

const SPIT_INTERVAL = 30000 // 30 seconds
const GONDOLA_INTERVAL = 10000 // 10 seconds

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

  const { data: spitForecastData } = useSWR<SpitWindForecastData>('/api/spit/forecast', fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  // Gondola data
  const { data: gondolaData } = useSWR<WXCardData>('/api/gondola', fetcher, {
    refreshInterval: GONDOLA_INTERVAL,
  })

  const { data: pamRocksData } = useSWR<WXCardData>('/api/pam-rocks', fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 0,
  })

  // Update the document title with the current wind speed average
  useEffect(() => {
    const lastPoint = spitData?.[spitData?.length - 1]
    const windSpeed = `${lastPoint?.avg} km/h`
    document.title = `${windSpeed} | Chief Lap Copilot`
  }, [spitData])

  return (
    <>
      <div className={styles.wxCards}>
        <WXCard
          title='Spit'
          url='https://squamishwindsports.com/conditions/wind/'
          data={getSpitCardData(spitData)}
        />
        <WXCard
          title='Gondola'
          url='https://www.seatoskygondola.com/weather-and-cams/'
          data={gondolaData}
        />
        <WXCard
          title='Pam Rocks'
          url='https://weather.gc.ca/past_conditions/index_e.html?station=was'
          data={pamRocksData}
        />
      </div>
      <WindGraph data={spitData} forecastData={spitForecastData} />
    </>
  )
}

export default Wind
