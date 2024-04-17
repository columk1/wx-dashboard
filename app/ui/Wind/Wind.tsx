'use client'

import testData from '@/app/lib/testData.json'
import WXCard from '@/app/ui/WXCard/WXCard'
import styles from './Wind.module.css'
import { fetchWindGraph, fetchGondolaData } from '@/app/lib/actions'
import WindGraph from '@/app/ui/WindGraph/WindGraph'
import dynamic from 'next/dynamic'
import { Suspense, useEffect, useState } from 'react'
import { ChartData, WXCardData } from '@/app/lib/definitions'
import Spinner from '@/app/ui/Spinner/Spinner'

// const WindGraph = dynamic(() => import('@/app/ui/WindGraph/WindGraph'), {
//   ssr: false,
// })

const getWindDirectionText = (windDirection: number) => {
  // prettier-ignore
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return directions[Math.round(windDirection / 22.5)]
}

const Wind = () => {
  const [spitData, setSpitData] = useState<ChartData>(null)
  const [gondolaData, setGondolaData] = useState<WXCardData>(null)

  useEffect(() => {
    const fetchData = async () => {
      const json = process.env.NODE_ENV === 'development' ? testData.wind : await fetchWindGraph()

      setSpitData({
        wind_avg_data: json.wind_avg_data.slice(0, -1) as number[][],
        wind_gust_data: json.wind_gust_data.slice(0, -1) as number[][],
        wind_lull_data: json.wind_lull_data.slice(0, -1) as number[][],
        wind_dir_data: json.wind_dir_data.slice(0, -1) as number[][],
        last_wind_dir_text: json.last_ob_dir_txt as string,
      })
    }
    fetchData()

    const interval = setInterval(fetchData, 120000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const json =
        process.env.NODE_ENV === 'development' ? testData.gondola : await fetchGondolaData()
      // console.log(json)
      if (!json) return
      setGondolaData({
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

  return (
    <>
      <div className={styles.flexContainer}>
        <WXCard
          title='Spit'
          url='https://us-west1-rugged-nimbus-347223.cloudfunctions.net/wind?spot=1436'
          data={
            spitData && {
              windSpeed: Math.round(spitData?.wind_avg_data[spitData?.wind_avg_data.length - 1][1]),
              windDirection: spitData?.wind_dir_data[spitData?.wind_avg_data.length - 1][1],
              windGusts: Math.round(
                spitData?.wind_gust_data[spitData?.wind_avg_data.length - 1][1]
              ),
              windDirectionText: spitData?.last_wind_dir_text,
            }
          }
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
