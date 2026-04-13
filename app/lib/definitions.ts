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
	model_time_utc: string
	wind_speed: number
	wind_dir: number
}

export type SpitWindForecastApiResponse = {
	model_data: SpitWindForecastApiPoint[]
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
			windGusts?: number
			windLull?: number
			windDirectionText?: string
			updatedAtText?: string
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
