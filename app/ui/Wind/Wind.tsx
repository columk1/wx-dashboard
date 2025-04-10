'use client'

import testData from '@/app/lib/data/testData.json'
import WXCard from '@/app/ui/WXCard/WXCard'
import styles from './Wind.module.css'
import { fetchWindGraph, fetchGondolaData, fetchVcliffeData } from '@/app/lib/actions'
import WindGraph from '@/app/ui/WindGraph/WindGraph'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { ChartData, WXCardData } from '@/app/lib/definitions'

const SPIT_INTERVAL = 120000 // 2 minutes
const MAX_INTERVAL = 300000 // 5 minutes

const getWindDirectionText = (windDirection: number) => {
  // prettier-ignore
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return directions[Math.round(windDirection / 22.5)]
}

const isStale = (lastUpdate: number, interval: number) => {
  if (lastUpdate && Date.now() - lastUpdate > interval) {
    return true
  }
  return false
}

const Wind = () => {
  const [spitData, setSpitData] = useState<ChartData>(null)
  const [gondolaData, setGondolaData] = useState<WXCardData>(null)
  const [vcliffeData, setVcliffeData] = useState<WXCardData>(null)

  // Spit wind data
  useEffect(() => {
    const lastSpitUpdate = spitData?.wind_avg_data[spitData?.wind_avg_data.length - 1][0]

    // Method to ensure we re-fetch if the max interval has passed (called when focus is back on the page)
    const fetchIfStale = () => {
      if (lastSpitUpdate && !isStale(lastSpitUpdate, MAX_INTERVAL)) return

      fetchData()
    }

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

    fetchIfStale()

    const interval = setInterval(fetchData, SPIT_INTERVAL)
    window.addEventListener('focus', fetchIfStale)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', fetchIfStale)
    }
  }, [])

  // Gondola wind data
  useEffect(() => {
    const fetchData = async () => {
      const json =
        process.env.NODE_ENV === 'development' ? testData.gondola : await fetchGondolaData()
      const newWindDirection = Math.round(json.observations[0].winddir)
      if (!json) return

      // Update state. Sometimes direction data is missing from the API response
      setGondolaData((prev) => ({
        ...prev,
        ...(typeof newWindDirection === 'number' && {
          windDirection: newWindDirection,
          windDirectionText: getWindDirectionText(newWindDirection),
        }),
        windSpeed: Math.round(json.observations[0].metric.windSpeed),
        windGusts: Math.round(json.observations[0].metric.windGust),
      }))
      // setLoading(false)
    }
    fetchData()

    const interval = setInterval(fetchData, 10000) // 10 seconds
    return () => clearInterval(interval)
  }, [])

  // TODO: Valleycliffe wind data (currently offline, uncomment when back online)
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const json =
  //       process.env.NODE_ENV === 'development' ? testData.valleycliffe : await fetchVcliffeData()
  //     const data = json.current_conditions
  //     const newWindDirection = Math.round(data.wind_direction)
  //     if (!json) return

  //     setVcliffeData((prev) => ({
  //       ...prev,
  //       ...(typeof newWindDirection === 'number' && {
  //         windDirection: newWindDirection,
  //         windDirectionText: getWindDirectionText(newWindDirection),
  //       }),
  //       windSpeed: Math.round(data.wind_avg),
  //       windGusts: Math.round(data.wind_gust),
  //     }))
  //     // setLoading(false)
  //   }
  //   fetchData()
  //   const interval = setInterval(fetchData, 150000) // 2.5 minutes
  //   return () => clearInterval(interval)
  // }, [])

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
              windLull: Math.round(spitData?.wind_lull_data[spitData?.wind_avg_data.length - 1][1]),
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
        {/* <WXCard
          title='Valleycliffe'
          url='https://tempestwx.com/station/101122/graph/258849/wind/2'
          data={vcliffeData}
        /> */}
      </div>
      <WindGraph data={spitData} />
    </>
  )
}

export default Wind
