'use client'

import styles from './WindGraph.module.css'
import { useEffect, useRef, useState } from 'react'
import testData from '@/app/lib/testData.json'
import { fetchWindGraph } from '@/app/lib/actions'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const WindGraph = () => {
  const svgRef = useRef(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<number[][]>([])
  const [width, setWidth] = useState<number | null>(null)
  const [height, setHeight] = useState<number | null>(null)

  const getSvgContainerSize = () => {
    const newWidth = containerRef?.current?.clientWidth
    newWidth && setWidth(newWidth)

    const newHeight = containerRef?.current?.clientHeight
    newHeight && setHeight(newHeight)
  }

  useEffect(() => {
    const fetchData = async () => {
      // const response = await fetch(process.env.VITE_WINDGRAPH_URL)
      // const json = await response.json()
      // const json = await fetchWindGraph()
      const json = testData
      console.log(json)
      setData(json.wind_avg_data.slice(0, -1) as number[][])
    }

    fetchData()
  }, [])

  useEffect(() => {
    containerRef.current && (containerRef.current.scrollLeft = containerRef?.current?.scrollWidth)
  })

  const tickFormatter = (time: number) => {
    const date = new Date(time)
    const roundedHours = date.getHours() * 2 // Round to the nearest two-hour interval
    date.setHours(roundedHours, 0, 0, 0) // Set minutes, seconds, and milliseconds to zero
    return date.toLocaleTimeString([], { hour: '2-digit' }) + 'h'
  }

  return data.length ? (
    <div ref={containerRef} className={styles.container}>
      {/* <ResponsiveContainer minWidth='1400px' height='100%'> */}
      <LineChart
        width={1400}
        height={300}
        data={data.map((e, i) => ({ time: e[0], value: e[1] }))}
        margin={{ top: 0, right: 30, bottom: 0, left: 20 }}
      >
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis
          dataKey='time'
          domain={['auto', 'auto']}
          tickFormatter={tickFormatter}
          interval={12}
          type='number'
          scale='time'
        />
        <YAxis
          domain={[0, (dataMax: number) => Math.ceil(dataMax / 10) * 10]}
          padding={{ top: 0, bottom: 10 }}
        />
        <Legend />
        <Line type='monotone' dataKey='value' stroke='#1d91a0' dot={false} activeDot={{ r: 8 }} />
      </LineChart>
      {/* </ResponsiveContainer> */}
    </div>
  ) : (
    // <div ref={containerRef} className={styles.container}>
    //   <h2>Line Chart</h2>
    //   <svg ref={svgRef} style={{ margin: '100px', display: 'block' }}></svg>
    // </div>
    <h1>No Data</h1>
  )
}

export default WindGraph
