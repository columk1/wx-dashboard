'use client'

import styles from './WindGraph.module.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import Legend from '@/app/ui/Legend'
import CustomXAxisTick from '@/app/ui/CustomXAxisTick'
import Spinner from '@/app/ui/Spinner/Spinner'
import { ChartData } from '@/app/lib/definitions'

const WindGraph = ({ data }: { data: ChartData }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const yAxisRef = useRef<SVGElement>(null)
  // const [loading, setLoading] = useState(true)

  useEffect(() => {
    containerRef.current && (containerRef.current.scrollLeft = containerRef?.current?.scrollWidth)
    const yAxis = document.querySelector('.recharts-yAxis')
    yAxis instanceof SVGElement && (yAxis.style.transform = `translateX(0px)`)
  }, [data])

  const maxGust =
    data?.wind_gust_data.reduce((acc, curr) => Math.max(acc, curr[1]), -Infinity) || 40

  const getTimeTicks = useCallback(() => {
    const ONE_HOUR = 3600000
    const startTime = data?.wind_avg_data[0][0] || 0
    const endTime = data?.wind_avg_data[data?.wind_avg_data.length - 1][0] || 0

    // Round the startTime up to the nearest whole hour
    const firstHour = Math.ceil(startTime / ONE_HOUR) * ONE_HOUR

    // Calculate the number of hours between the rounded start time and the end time
    const hourlyTicks = Math.ceil((endTime - firstHour) / ONE_HOUR)

    // Generate an array of timestamps for each hour
    // return Array.from(Array(hourlyTicks).keys()).map((i) => firstHour + i * ONE_HOUR)
    return Array.from({ length: hourlyTicks }, (_, i) => firstHour + i * ONE_HOUR)
  }, [data])

  return !data ? (
    <div className={styles.fallback}>
      <Spinner />
    </div>
  ) : (
    <div className={styles.wrapper}>
      <div ref={containerRef} className={styles.container}>
        <LineChart
          id='wind-graph'
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
          margin={{ top: 0, right: -10, bottom: 30, left: 20 }}
        >
          <CartesianGrid strokeDasharray='3 3' stroke='currentColor' opacity={0.3} />
          {/* <Legend
            align='right'
            iconSize={8}
            iconType='circle'
            wrapperStyle={{
              fontSize: '0.75rem',
              bottom: 20,
              right: 50,
              padding: 4,
            }}
            formatter={(value) => value[0].toUpperCase() + value.slice(1)}
          /> */}
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
            axisLine={false}
            dataKey='time'
            domain={['auto', 'auto']}
            orientation='top'
            scale='time'
            tickFormatter={(time) =>
              new Date(time).toLocaleString('en-US', { hour: '2-digit', hour12: false }) + 'h'
            }
            ticks={getTimeTicks()}
            type='number'
          />
          {/* Wind Direction X-Axis */}
          <XAxis
            xAxisId={1}
            dataKey='dir'
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
            isAnimationActive={false}
          />
          <Line
            type='monotone'
            dataKey='gust'
            stroke='#f84c56'
            dot={false}
            activeDot={{ strokeWidth: 1, r: 4 }}
            connectNulls={true}
            isAnimationActive={false}
          />
          <Line
            type='monotone'
            dataKey='lull'
            stroke='#0f6b8a'
            dot={false}
            activeDot={{ strokeWidth: 1, r: 4 }}
            connectNulls={true}
            isAnimationActive={false}
          />
        </LineChart>
      </div>
      {/* Custom version of the generated legend, placed outside the scrollable container */}
      <Legend />
    </div>
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
