export type ChartData = {
  wind_avg_data: number[][]
  wind_gust_data: number[][]
  wind_lull_data: number[][]
  wind_dir_data: number[][]
  last_wind_dir_text: string
} | null

export type WXCardData = {
  windDirection?: number
  windSpeed: number
  windGusts: number
  windDirectionText?: string
} | null
