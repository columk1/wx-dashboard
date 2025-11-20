'use client'

import styles from './WindGraph.module.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import Legend from '@/app/ui/Legend'
import CustomXAxisTick from '@/app/ui/CustomXAxisTick'
import Spinner from '@/app/ui/Spinner/Spinner'
import type { WindGraphData } from '@/app/lib/definitions'

const WindGraph = ({ data }: { data: WindGraphData }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    containerRef.current && (containerRef.current.scrollLeft = containerRef?.current?.scrollWidth)
  }, [data])

  const maxGust = data?.reduce((acc, curr) => Math.max(acc, curr.gust), -Infinity) || 40

  const getTimeTicks = useCallback(() => {
    const ONE_HOUR = 3600000
    const startTime = data?.[0]?.time || 0
    const endTime = data?.[data.length - 1]?.time || 0

    // Round the startTime up to the nearest whole hour
    const firstHour = Math.ceil(startTime / ONE_HOUR) * ONE_HOUR

    // Calculate the number of hours between the rounded start time and the end time
    const hourlyTicks = Math.ceil((endTime - firstHour) / ONE_HOUR)

    // Generate an array of timestamps for each hour
    // return Array.from(Array(hourlyTicks).keys()).map((i) => firstHour + i * ONE_HOUR)
    return Array.from({ length: hourlyTicks }, (_, i) => firstHour + i * ONE_HOUR)
  }, [data])

  return !data || data.length === 0 ? (
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
          data={data}
          // data={data.wind_avg_data}
          margin={{ top: 0, right: -10, bottom: 30, left: 20 }}
        >
          <CartesianGrid strokeDasharray='3 3' stroke='currentColor' opacity={0.3} />
          {/* Legend which was generated and then customized and placed outside of the chart */}
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
            // offset={50}
            defaultIndex={data.length - 1}
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
              new Date(time).toLocaleString('en-US', { hour: 'numeric', hour12: true })
            }
            ticks={getTimeTicks()}
            type='number'
            style={{ fontSize: '0.8rem' }}
          />
          {/* Wind Direction X-Axis */}
          <XAxis
            xAxisId={1}
            dataKey='dir'
            tickFormatter={(time) => ''}
            tick={<CustomXAxisTick directionArray={data} />}
            axisLine={false}
            tickLine={false}
            mirror={true}
            tickMargin={-8}
          />
          <YAxis
            domain={[0, (dataMax: number) => Math.ceil(dataMax / 10) * 10]}
            padding={{ top: 0, bottom: 0 }}
            ticks={Array.from(
              { length: Math.ceil((maxGust + 10) / 20) }, // count multiples of 20
              (_, index) => index * 20 // multiply each index by 20
            )}
            label={{
              value: 'km/h',
              angle: -90,
              position: 'outsideLeft',
              dx: 5,
              style: { fontSize: '0.8rem' },
            }}
            width={70}
            orientation='right'
            style={{ fontSize: '0.9rem' }}
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

export default WindGraph
