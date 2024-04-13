'use client'

import { fetchGondolaData } from '@/app/lib/actions'
import { useEffect, useState } from 'react'
import Arrow from '@/app/ui/Arrow'
import styles from './GondolaWX.module.css'

type WindData = {
  windDirection: number
  windSpeed: number
  windGusts: number
} | null

const GondolaWX = () => {
  const [data, setData] = useState<WindData>(null)

  useEffect(() => {
    const fetchData = async () => {
      const json = await fetchGondolaData()
      console.log(json)
      setData({
        windDirection: Math.round(json.observations[0].winddir),
        windSpeed: Math.round(json.observations[0].metric.windSpeed),
        windGusts: Math.round(json.observations[0].metric.windGust),
      })
    }

    fetchData()
    // TODO: Set interval in production
    // const interval = setInterval(fetchData, 10000)
    // return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Gondola</h2>
      <div className={styles.flexContainer}>
        <div className={styles.arrowBorder}>
          <Arrow size={48} angle={data?.windDirection || 0} />
        </div>
        <div>
          <p className={styles.item}>
            Avg: <span className={styles.data}>{data?.windSpeed}</span>
            <small className={styles.small}>km/h</small>
          </p>
          <p className={styles.item}>
            Gust: <span className={styles.data}>{data?.windGusts}</span>
            <small className={styles.small}>km/h</small>
          </p>
          {/* <p>
            Temp: 2.0 <small>°C</small>
          </p> */}
        </div>
      </div>
    </div>
  )
}

export default GondolaWX
