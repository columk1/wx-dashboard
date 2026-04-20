'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import type {
	SpitWindForecastData,
	WindGraphChartPoint,
	WindGraphData,
	WXView,
} from '@/app/lib/definitions'
import CustomXAxisTick from '@/app/ui/CustomXAxisTick'
import Legend from '@/app/ui/Legend'
import Spinner from '@/app/ui/Spinner/Spinner'
import styles from './WindGraph.module.css'

const mergeChartData = (
	observedData: WindGraphData,
	forecastData?: SpitWindForecastData,
): WindGraphChartPoint[] => {
	const chartData: WindGraphChartPoint[] = [...(observedData ?? [])]
	const safeForecastData = Array.isArray(forecastData) ? forecastData : []

	safeForecastData.forEach((point) => {
		const existingPoint = chartData.find(
			(chartPoint) => chartPoint.time === point.time,
		)

		if (existingPoint) {
			existingPoint.predicted = point.predicted
			existingPoint.predictedDir = point.dir
			return
		}

		chartData.push({
			time: point.time,
			predicted: point.predicted,
			predictedDir: point.dir,
		})
	})

	return chartData.sort((left, right) => left.time - right.time)
}

const WindGraph = ({
	data,
	forecastData,
	view = 'spit',
}: {
	data: WindGraphData
	forecastData?: SpitWindForecastData
	view?: WXView
}) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const [showPredictedWind, setShowPredictedWind] = useState(true)
	const chartData = mergeChartData(data, forecastData)
	const showLull = view === 'spit'
	const hasPredictedWind =
		view === 'spit' && chartData.some((point) => point.predicted != null)
	const showPredicted = hasPredictedWind && showPredictedWind

	useEffect(() => {
		if (containerRef.current && chartData.length > 0) {
			containerRef.current.scrollLeft = containerRef.current.scrollWidth
		}
	}, [chartData])

	const maxWindValue = Math.max(
		40,
		...chartData.map((point) =>
			Math.max(
				point.avg ?? 0,
				point.gust ?? 0,
				showLull ? (point.lull ?? 0) : 0,
				showPredicted ? (point.predicted ?? 0) : 0,
			),
		),
	)

	const defaultTooltipIndex = Math.max(
		0,
		chartData.findLastIndex((point) => point.avg != null),
	)

	const getTimeTicks = useCallback(() => {
		const ONE_HOUR = 3600000
		const startTime = chartData[0]?.time || 0
		const endTime = chartData[chartData.length - 1]?.time || 0

		// Round the startTime up to the nearest whole hour
		const firstHour = Math.ceil(startTime / ONE_HOUR) * ONE_HOUR

		// Calculate the number of hours between the rounded start time and the end time
		const hourlyTicks = Math.ceil((endTime - firstHour) / ONE_HOUR)

		// Generate an array of timestamps for each hour
		// return Array.from(Array(hourlyTicks).keys()).map((i) => firstHour + i * ONE_HOUR)
		return Array.from(
			{ length: hourlyTicks },
			(_, i) => firstHour + i * ONE_HOUR,
		)
	}, [chartData])

	return !data || data.length === 0 ? (
		<div className={styles.fallback}>
			<Spinner />
		</div>
	) : (
		<div className={styles.wrapper}>
			<div ref={containerRef} className={styles.container}>
				<LineChart
					id="wind-graph"
					width={1600}
					height={300}
					data={chartData}
					// data={data.wind_avg_data}
					margin={{ top: 0, right: -10, bottom: 30, left: 20 }}
					className={styles.lineChart}
				>
					<CartesianGrid
						strokeDasharray="3 3"
						stroke="currentColor"
						opacity={0.3}
					/>
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
						defaultIndex={defaultTooltipIndex}
						formatter={(value, name) => [
							`${value ?? 0}km/h`,
							typeof name === 'string'
								? name[0].toUpperCase() + name.slice(1)
								: String(name),
						]}
						labelFormatter={(label) =>
							new Date(label).toLocaleTimeString('en-US', {
								hour: '2-digit',
								minute: '2-digit',
							})
						}
						labelStyle={{
							display: 'block',
							color: 'rgb(var(--background-start-rgb))',
						}}
						contentStyle={{
							padding: '0.5rem 0.75rem',
							fontSize: '0.9rem',
							backgroundColor:
								'color-mix(in srgb, currentColor 90%, transparent)',
							borderRadius: '5px',
						}}
						itemStyle={{ padding: '0.15rem' }}
						itemSorter={(item) => {
							switch (item.dataKey) {
								case 'gust':
									return 0
								case 'avg':
									return 1
								case 'lull':
									return 2
								case 'predicted':
									return 3
								default:
									return 4
							}
						}}
					/>
					{/* Time X-Axis */}
					<XAxis
						xAxisId={0}
						axisLine={false}
						dataKey="time"
						domain={['auto', 'auto']}
						orientation="top"
						scale="time"
						tickFormatter={(time) =>
							new Date(time).toLocaleString('en-US', {
								hour: 'numeric',
								hour12: true,
							})
						}
						ticks={getTimeTicks()}
						type="number"
						style={{ fontSize: '0.8rem' }}
					/>
					{/* Wind Direction X-Axis */}
					<XAxis
						xAxisId={1}
						axisLine={false}
						dataKey="time"
						domain={['auto', 'auto']}
						scale="time"
						ticks={chartData
							.filter(
								(point) =>
									point.dir != null ||
									(showPredicted && point.predictedDir != null),
							)
							.map((point) => point.time)}
						tickFormatter={(_time) => ''}
						tick={
							<CustomXAxisTick
								directionArray={chartData}
								showPredicted={showPredicted}
							/>
						}
						tickLine={false}
						mirror={true}
						tickMargin={-8}
						type="number"
					/>
					<YAxis
						domain={[0, (dataMax: number) => Math.ceil(dataMax / 10) * 10]}
						padding={{ top: 0, bottom: 0 }}
						ticks={Array.from(
							{ length: Math.ceil((maxWindValue + 10) / 20) }, // count multiples of 20
							(_, index) => index * 20, // multiply each index by 20
						)}
						label={{
							value: 'km/h',
							angle: -90,
							position: 'outside',
							dx: 5,
							style: { fontSize: '0.8rem' },
						}}
						width={70}
						orientation="right"
						style={{ fontSize: '0.9rem' }}
					/>
					<Line
						type="monotone"
						dataKey="avg"
						stroke="rgb(var(--wind-avg-rgb))"
						dot={false}
						activeDot={{ strokeWidth: 1, r: 4 }}
						xAxisId={0}
						connectNulls={true}
						isAnimationActive={false}
					/>
					<Line
						type="monotone"
						dataKey="gust"
						stroke="rgb(var(--wind-gust-rgb))"
						dot={false}
						activeDot={{ strokeWidth: 1, r: 4 }}
						connectNulls={true}
						isAnimationActive={false}
					/>
					{showLull && (
						<Line
							type="monotone"
							dataKey="lull"
							stroke="rgb(var(--wind-lull-rgb))"
							dot={false}
							activeDot={{ strokeWidth: 1, r: 4 }}
							connectNulls={true}
							isAnimationActive={false}
						/>
					)}
					{showPredicted && (
						<Line
							type="monotone"
							dataKey="predicted"
							stroke="rgb(var(--wind-predicted-rgb))"
							strokeDasharray="5 4"
							dot={{
								r: 2,
								strokeWidth: 0,
								fill: 'rgb(var(--wind-predicted-rgb))',
							}}
							activeDot={{ strokeWidth: 1, r: 4 }}
							connectNulls={true}
							isAnimationActive={false}
						/>
					)}
				</LineChart>
			</div>
			{/* Custom version of the generated legend, placed outside the scrollable container */}
			<Legend
				showLull={showLull}
				showPredicted={hasPredictedWind}
				predictedEnabled={showPredictedWind}
				onPredictedToggle={() =>
					setShowPredictedWind((currentValue) => !currentValue)
				}
			/>
		</div>
	)
}

export default WindGraph
