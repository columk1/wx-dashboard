'use client'

import { useEffect, useState } from 'react'
import testData from '@/app/lib/testData.json'
import WindGraph from '@/app/ui/WindGraph/WindGraph'
import GondolaWX from '@/app/ui/GondolaWX/GondolaWX'
import SquamishWX from '@/app/ui/SquamishWX/SquamishWX'
import styles from './Wind.module.css'

type ChartData = {
  wind_avg_data: number[][]
  wind_gust_data: number[][]
  wind_lull_data: number[][]
  wind_dir_data: number[][]
} | null

const Wind = () => {
  const [data, setData] = useState<ChartData>(null)
  useEffect(() => {
    const fetchData = async () => {
      // const json = await fetchWindGraph()
      const json = testData.wind
      console.log(json)
      setData({
        wind_avg_data: json.wind_avg_data.slice(0, -1) as number[][],
        wind_gust_data: json.wind_gust_data.slice(0, -1) as number[][],
        wind_lull_data: json.wind_lull_data.slice(0, -1) as number[][],
        wind_dir_data: json.wind_dir_data.slice(0, -1) as number[][],
      })
    }

    fetchData()
  }, [])
  return (
    <>
      <div className={styles.flexContainer}>
        {data && (
          <SquamishWX
            data={{
              windSpeed: Math.round(data?.wind_avg_data[data?.wind_avg_data.length - 1][1]),
              windDirection: data?.wind_dir_data[data?.wind_avg_data.length - 1][1],
              windGusts: Math.round(data?.wind_gust_data[data?.wind_avg_data.length - 1][1]),
            }}
          />
        )}
        <GondolaWX />
      </div>
      <WindGraph data={data} />
    </>
  )
}

export default Wind