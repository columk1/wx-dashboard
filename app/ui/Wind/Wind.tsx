'use client'

import testData from '@/app/lib/data/testData.json'
import WXCard from '@/app/ui/WXCard/WXCard'
import styles from './Wind.module.css'
import { fetchWindGraph, fetchGondolaData, fetchVcliffeData } from '@/app/lib/actions'
import WindGraph from '@/app/ui/WindGraph/WindGraph'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import {
  WXCardData,
  SpitWindApiResponse,
  WindDataPoint,
  WindDataSeries,
  GondolaApiResponse,
  WindGraphData,
  WindGraphPoint,
} from '@/app/lib/definitions'

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

const trimLast = <T,>(data: T[]): T[] => data.slice(0, -1)

const normalizeSeries = (series: SpitWindApiResponse['wind_avg_data']): WindDataSeries => {
  let lastValue = 0
  let lastTimestamp = 0

  return trimLast(series).map(([timestamp, value]): WindDataPoint => {
    const nextTimestamp = timestamp ?? lastTimestamp
    const nextValue = value ?? lastValue
    lastTimestamp = nextTimestamp
    lastValue = nextValue
    return [nextTimestamp, nextValue]
  })
}

const buildSpitSeries = (json: SpitWindApiResponse): WindGraphPoint[] => {
  const wind_avg = normalizeSeries(json.wind_avg_data)
  const wind_gust = normalizeSeries(json.wind_gust_data)
  const wind_lull = normalizeSeries(json.wind_lull_data)
  const wind_dir = normalizeSeries(json.wind_dir_data)

  return wind_avg.map(([time, avg], index) => ({
    time,
    avg: Math.round(avg),
    gust: Math.round(wind_gust[index][1]),
    lull: Math.round(wind_lull[index][1]),
    dir: wind_dir[index][1],
  }))
}

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

const getGondolaCardData = (
  json: GondolaApiResponse,
  prev: WXCardData
): WXCardData => {
  const observation = json.observations[0]
  const newWindDirection = Math.round(observation.winddir)

  return {
    ...(prev || {}),
    ...(typeof newWindDirection === 'number' && {
      windDirection: newWindDirection,
      windDirectionText: getWindDirectionText(newWindDirection),
    }),
    windSpeed: Math.round(observation.metric.windSpeed),
    windGusts: Math.round(observation.metric.windGust),
  }
}

const devSpitData: SpitWindApiResponse = testData.wind
const devGondolaData: GondolaApiResponse = testData.gondola

const Wind = () => {
  const [spitData, setSpitData] = useState<WindGraphData>(null)
  const [gondolaData, setGondolaData] = useState<WXCardData>(null)
  // const [vcliffeData, setVcliffeData] = useState<WXCardData>(null)

  const lastSpitUpdate = spitData?.[spitData.length - 1]?.time
  // Spit wind data
  useEffect(() => {

    // Method to ensure we re-fetch if the max interval has passed (called when focus is back on the page)
    const fetchIfStale = () => {
      if (lastSpitUpdate && !isStale(lastSpitUpdate, MAX_INTERVAL)) return

      fetchData()
    }

    const fetchData = async () => {
      const json =
        process.env.NODE_ENV === 'development' ? devSpitData : await fetchWindGraph()

      if (!json) return

      const series = buildSpitSeries(json)

      setSpitData(series)
      const lastPoint = series[series.length - 1]
      const windSpeed = `${lastPoint.avg} km/h`
      if (typeof window !== 'undefined') {
        document.title = `${windSpeed} | Chief Lap Copilot`
      }
    }

    fetchIfStale()

    const interval = setInterval(fetchData, SPIT_INTERVAL)
    window.addEventListener('focus', fetchIfStale)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', fetchIfStale)
    }
  }, [lastSpitUpdate])

  // Gondola wind data
  useEffect(() => {
    const fetchData = async () => {
      const json: GondolaApiResponse | null =
        process.env.NODE_ENV === 'development' ? devGondolaData : await fetchGondolaData()

      if (!json) return
      // Update state. Sometimes direction data is missing from the API response
      setGondolaData((prev) => getGondolaCardData(json, prev))
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
      {typeof window !== 'undefined' && <title>{document?.title}</title>}
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
