'use client'
import WXCard from '@/app/ui/WXCard/WXCard'
import styles from './Wind.module.css'
// import { fetchVcliffeData } from '@/app/lib/actions'
import WindGraph from '@/app/ui/WindGraph/WindGraph'
import { useEffect, useState } from 'react'
import { WXCardData, WindGraphData } from '@/app/lib/definitions'
import { getWindDirectionText } from '@/app/lib/utils/wind'

const SPIT_INTERVAL = 30000 // 30 seconds
const MAX_INTERVAL = 300000 // 5 minutes

const isStale = (lastUpdate: number, interval: number) => {
  if (lastUpdate && Date.now() - lastUpdate > interval) {
    return true
  }
  return false
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
      const res = await fetch('/api/spit')
      if (!res.ok) return
      const series = await res.json()

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
      const res = await fetch('/api/gondola')
      if (!res.ok) return
      const data: WXCardData = await res.json()

      // Update state. Sometimes direction data is missing from the API response
      setGondolaData(data)
      // setLoading(false)
    }
    fetchData()

    const interval = setInterval(fetchData, 10000) // 10 seconds
    return () => clearInterval(interval)
  }, [])

  /*
  TODO: Valleycliffe wind data (currently offline, uncomment when back online)
  useEffect(() => {
    const fetchData = async () => {
      const json =
        process.env.NODE_ENV === 'development' ? testData.valleycliffe : await fetchVcliffeData()
      const data = json.current_conditions
      const newWindDirection = Math.round(data.wind_direction)
      if (!json) return

      setVcliffeData((prev) => ({
        ...prev,
        ...(typeof newWindDirection === 'number' && {
          windDirection: newWindDirection,
          windDirectionText: getWindDirectionText(newWindDirection),
        }),
        windSpeed: Math.round(data.wind_avg),
        windGusts: Math.round(data.wind_gust),
      }))
      // setLoading(false)
    }
    fetchData()
    const interval = setInterval(fetchData, 150000) // 2.5 minutes
    return () => clearInterval(interval)
  }, [])
*/
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
