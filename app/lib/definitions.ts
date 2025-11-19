export type WindDataPoint = [number, number]
export type WindDataSeries = WindDataPoint[]

export type WindDataPointRaw = (number | null)[]
export type WindDataSeriesRaw = WindDataPointRaw[]

export type WindGraphPoint = {
  time: number
  avg: number
  gust: number
  lull: number
  dir: number
}

export type WindGraphData = WindGraphPoint[] | null

export type WXCardData = {
  windDirection?: number
  windSpeed: number
  windGusts: number
  windLull?: number
  windDirectionText?: string
} | null

export type SpitWindApiResponse = {
  wind_avg_data: WindDataSeriesRaw
  wind_gust_data: WindDataSeriesRaw
  wind_lull_data: WindDataSeriesRaw
  wind_dir_data: WindDataSeriesRaw
  last_ob_dir_txt: string
}

export type GondolaObservation = {
  winddir: number
  metric: {
    windSpeed: number
    windGust: number
  }
}

export type GondolaApiResponse = {
  observations: GondolaObservation[]
}
