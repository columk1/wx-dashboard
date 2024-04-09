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

type ChartData = {
  wind_avg_data: number[][]
  wind_gust_data: number[][]
  wind_lull_data: number[][]
  wind_dir_data: number[][]
} | null

const WindGraph = () => {
  const svgRef = useRef(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<ChartData>(null)
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
      setData({
        wind_avg_data: json.wind_avg_data.slice(0, -1) as number[][],
        wind_gust_data: json.wind_gust_data.slice(0, -1) as number[][],
        wind_lull_data: json.wind_lull_data.slice(0, -1) as number[][],
        wind_dir_data: json.wind_dir_data.slice(0, -1) as number[][],
      })
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

  return data?.wind_avg_data.length ? (
    <div ref={containerRef} className={styles.container}>
      {/* <ResponsiveContainer minWidth='1400px' height='100%'> */}
      <LineChart
        width={1600}
        height={300}
        data={data.wind_avg_data.map((e, i) => ({
          time: e[0],
          avg: e[1],
          gust: data.wind_gust_data[i][1],
          lull: data.wind_lull_data[i][1],
          dir: data.wind_dir_data[i][1],
        }))}
        // data={data.wind_avg_data}
        margin={{ top: 0, right: 30, bottom: 30, left: 20 }}
      >
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis
          xAxisId={0}
          dataKey='time'
          domain={['auto', 'auto']}
          tickFormatter={tickFormatter}
          interval={12}
          type='number'
          scale='time'
        />
        <XAxis
          xAxisId={1}
          dataKey='dir'
          // tickFormatter={(time, index) => data.wind_dir_data[index][1].toString()}
          tickFormatter={(time) => ''}
          tick={<CustomXAxisTick dirArray={data.wind_dir_data} />}
        />
        <YAxis
          domain={[0, (dataMax: number) => Math.ceil(dataMax / 10) * 10]}
          padding={{ top: 0, bottom: 10 }}
        />
        <Legend />
        <Line
          type='monotone'
          dataKey='avg'
          stroke='#1d91a0'
          dot={false}
          activeDot={{ r: 8 }}
          xAxisId={0}
        />
        <Line
          type='monotone'
          dataKey='gust'
          stroke='#f84c56'
          dot={false}
          activeDot={{ r: 8 }}
          connectNulls={true}
        />
        <Line
          type='monotone'
          dataKey='lull'
          stroke='#0f6b8a'
          dot={false}
          activeDot={{ r: 8 }}
          connectNulls={true}
        />
        {/* <Line dataKey='dir' hide={true} dot={false} xAxisId={1} /> */}
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

const CustomXAxisTick = (props: any) => {
  const { x, y, payload, dirArray } = props
  console.log('payload', payload)

  return (
    // <g className='icon' style={{ color: 'rgb(0, 0, 0)', backgroundColor: 'rgb(255, 255, 255)' }}>
    <svg
      // transform={`rotate(${dirArray[payload.index][1]})`}
      x={x}
      y={y}
      stroke='#000'
      fill='#000'
      strokeWidth='0'
      viewBox='0 0 512 512'
      height='8'
      width='8'
    >
      <g transform={`rotate(${dirArray[payload.index][1] + 135} 270 270)`}>
        <path d='M444.52 3.52L28.74 195.42c-47.97 22.39-31.98 92.75 19.19 92.75h175.91v175.91c0 51.17 70.36 67.17 92.75 19.19l191.9-415.78c15.99-38.39-25.59-79.97-63.97-63.97z'></path>
      </g>
    </svg>
    // <g transform={`translate(${x},${y})`}>
    //   <text textAnchor='end' fill='#666' transform={`rotate(${payload.value})`}>
    //     {payload.value}
    //   </text>
    // </g>
  )
}

// Override console.error
// This is a hack to suppress the warning about missing defaultProps in recharts library as of version 2.12
// @link https://github.com/recharts/recharts/issues/3615
const error = console.error
console.error = (...args: any) => {
  if (/defaultProps/.test(args[0])) return
  error(...args)
}

export default WindGraph
