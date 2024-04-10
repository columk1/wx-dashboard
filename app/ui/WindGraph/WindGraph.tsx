'use client'

import styles from './WindGraph.module.css'
import { useEffect, useRef, useState } from 'react'
import testData from '@/app/lib/testData.json'
import { fetchWindGraph } from '@/app/lib/actions'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import CustomXAxisTick from '@/app/ui/CustomXAxisTick'

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

  const maxGust =
    data?.wind_gust_data.reduce((acc, curr) => Math.max(acc, curr[1]), -Infinity) || 40

  const tickFormatter = (time: number) => {
    const date = new Date(time)
    const roundedHours = date.getHours() * 2 // Round to the nearest two-hour interval
    date.setHours(roundedHours, 0, 0, 0) // Set minutes, seconds, and milliseconds to zero
    return date.toLocaleTimeString([], { hour: '2-digit' }) + 'h'
  }

  return data?.wind_avg_data.length ? (
    <div ref={containerRef} className={styles.container}>
      <LineChart
        width={1600}
        height={300}
        data={data.wind_avg_data.map((e, i) => ({
          time: e[0],
          avg: Math.round(e[1]),
          gust: Math.round(data.wind_gust_data[i][1]),
          lull: Math.round(data.wind_lull_data[i][1]),
          dir: data.wind_dir_data[i][1],
        }))}
        // data={data.wind_avg_data}
        margin={{ top: 0, right: 0, bottom: 30, left: 20 }}
      >
        <CartesianGrid strokeDasharray='3 3' stroke='currentColor' opacity={0.3} />
        <Legend
          align='right'
          iconSize={8}
          iconType='circle'
          wrapperStyle={{
            fontSize: '0.75rem',
            bottom: 18,
            right: 55,
            padding: 2,
          }}
          formatter={(value) => value[0].toUpperCase() + value.slice(1)}
        />
        <Tooltip
          offset={50}
          formatter={(value: number, name: string) => [
            value + 'km/h',
            name[0].toUpperCase() + name.slice(1),
          ]}
          label='time'
          labelFormatter={(label) =>
            new Date(label).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          }
          labelStyle={{ display: 'block', color: 'rgb(var(--background-start-rgb))' }}
          contentStyle={{
            padding: '0.5rem 0.75rem',
            fontSize: '0.9rem',
            backgroundColor: 'color-mix(in srgb, currentColor 90%, transparent)',
            borderRadius: '5px',
          }}
          itemStyle={{ padding: '0.15rem' }}
          itemSorter={(item) => {
            switch (item.dataKey) {
              case 'gust':
                return 0
              case 'avg':
                return 1
              default:
                return 2
            }
          }}
        />
        {/* Time X-Axis */}
        <XAxis
          xAxisId={0}
          dataKey='time'
          domain={['auto', 'auto']}
          tickFormatter={tickFormatter}
          interval={12}
          type='number'
          scale='time'
          axisLine={false}
          orientation='top'
        />
        {/* Wind Direction X-Axis */}
        <XAxis
          xAxisId={1}
          dataKey='dir'
          // tickFormatter={(time, index) => data.wind_dir_data[index][1].toString()}
          tickFormatter={(time) => ''}
          tick={<CustomXAxisTick dirArray={data.wind_dir_data} />}
          axisLine={false}
          tickLine={false}
          mirror={true}
          tickMargin={-8}
        />
        <YAxis
          domain={[0, (dataMax: number) => Math.ceil(dataMax / 10) * 10]}
          padding={{ top: 0, bottom: 0 }}
          ticks={Array.from(
            { length: Math.ceil(maxGust / 20) }, // count multiples of 20
            (_, index) => index * 20 // multiply each index by 20
          )}
          orientation='right'
        />
        <Line
          type='monotone'
          dataKey='avg'
          stroke='#1d91a0'
          dot={false}
          activeDot={{ strokeWidth: 1, r: 4 }}
          xAxisId={0}
        />
        <Line
          type='monotone'
          dataKey='gust'
          stroke='#f84c56'
          dot={false}
          activeDot={{ strokeWidth: 1, r: 4 }}
          connectNulls={true}
        />
        <Line
          type='monotone'
          dataKey='lull'
          stroke='#0f6b8a'
          dot={false}
          activeDot={{ strokeWidth: 1, r: 4 }}
          connectNulls={true}
        />
        {/* <Line dataKey='dir' hide={true} dot={false} xAxisId={1} /> */}
      </LineChart>
    </div>
  ) : (
    // <div ref={containerRef} className={styles.container}>
    //   <h2>Line Chart</h2>
    //   <svg ref={svgRef} style={{ margin: '100px', display: 'block' }}></svg>
    // </div>
    <h1>No Data</h1>
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
