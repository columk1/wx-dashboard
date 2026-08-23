import type {
	PamRocksApiResponse,
	SpitWindForecastData,
	WindCardSnapshot,
	WindGraphData,
	WXView,
} from '@/app/lib/definitions'
import WindCards from '@/app/ui/Wind/WindCards'
import WindGraphController from '@/app/ui/Wind/WindGraphController'

const Wind = ({
	activeView,
	initialCards,
	initialGraphData,
	initialPamRocksData,
	initialForecastData,
}: {
	activeView: WXView
	initialCards: WindCardSnapshot
	initialGraphData: WindGraphData
	initialPamRocksData?: PamRocksApiResponse | null
	initialForecastData?: SpitWindForecastData
}) => {
	return (
		<>
			<WindCards activeView={activeView} initialCards={initialCards} />
			<WindGraphController
				activeView={activeView}
				initialGraphData={initialGraphData}
				initialPamRocksData={initialPamRocksData}
				initialForecastData={initialForecastData}
			/>
		</>
	)
}

export default Wind
