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

export type WindGraphData = WindGraphPoint[] | null | undefined

export type SpitWindForecastApiPoint = {
  model_time_local: string
  model_time_utc: string
  wind_speed: number
  wind_gust: number
  wind_dir: number
}

export type SpitWindForecastApiResponse = {
  graphDataExists: boolean
  is_premium: boolean
  is_upgrade_available: boolean
  model_color: string
  model_data: SpitWindForecastApiPoint[]
  model_name: string
  model_short_name: string
  spot_id: number
  status: {
    status_code: number
    status_message: string
  }
  tz_name: string
  units_distance: string
  units_temp: string
  units_wind: string
}

export type SpitWindForecastPoint = {
  time: number
  predicted: number
  dir: number
}

export type SpitWindForecastData = SpitWindForecastPoint[] | null | undefined

export type WindGraphChartPoint = {
  time: number
  avg?: number | null
  gust?: number | null
  lull?: number | null
  dir?: number | null
  predicted?: number | null
  predictedDir?: number | null
}

export type WXCardData =
  | {
      windDirection?: number
      windSpeed: number
      windGusts: number
      windLull?: number
      windDirectionText?: string
    }
  | null
  | undefined

export type SpitWindApiResponse = {
  wind_avg_data: WindDataSeriesRaw
  wind_gust_data: WindDataSeriesRaw
  wind_lull_data: WindDataSeriesRaw
  wind_dir_data: WindDataSeriesRaw
  current_time_epoch_utc: number
  last_ob_time_local: string
  last_ob_avg: number
  last_ob_gust: number
  last_ob_lull: number
  last_ob_dir: number
  last_ob_dir_txt: string
  last_ob_wind_desc: string
  tz_offset: number
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
