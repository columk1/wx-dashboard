import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import testData from './testData.json'

const LineChart = () => {
  const svgRef = useRef(null)
  const [data, setData] = useState<number[][]>([])

  useEffect(() => {
    const fetchData = async () => {
      // const response = await fetch(import.meta.env.VITE_WINDGRAPH_URL)
      // const json = await response.json()
      const json = testData
      console.log(json)
      setData(json.wind_avg_data.slice(0, -1) as number[][])
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (!data.length) return
    const w = 600
    const h = 200
    const max = data.reduce((acc, cur) => Math.max(acc, cur[1]), 0)
    const boundsHeight = Math.ceil(max / 10) * 10

    const svg = d3
      .select(svgRef.current)
      .attr('width', w)
      .attr('height', h)
      .style('overflow', 'visible')
      .style('background', '#c5f6fa')

    // Set the scaling
    const start = new Date(data[0][0])
    const end = new Date(data[data.length - 1][0])
    console.log('Start, end', start, ' ', end)
    const xScale = d3.scaleTime().domain([start, end]).range([0, w])
    const yScale = d3
      .scaleLinear()
      .domain([0, boundsHeight + 10])
      .range([h, 0])

    // Draw the line
    const generateScaledLine = d3
      .line()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]))
      .curve(d3.curveCardinal)

    // Setting the Axes
    const xAxis = d3.axisBottom(xScale)
    const yAxis = d3.axisLeft(yScale).ticks(boundsHeight / 10)

    // Drawing the axes on the svg
    svg.append('g').call(xAxis).attr('transform', `translate(0, ${h})`)
    svg.append('g').call(yAxis)

    svg
      .selectAll('.line')
      .data([data])
      .join('path')
      .attr('d', (d) => generateScaledLine(d))
      .attr('fill', 'none')
      .attr('stroke', 'black')
  }, [data])

  return (
    <div>
      <h2>Line Chart</h2>
      <svg ref={svgRef} style={{ margin: '100px', display: 'block' }}></svg>
    </div>
  )
}

export default LineChart
