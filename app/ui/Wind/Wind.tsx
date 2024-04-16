import testData from '@/app/lib/testData.json'
// import WindGraph from '@/app/ui/WindGraph/WindGraph'
import GondolaWX from '@/app/ui/GondolaWX/GondolaWX'
import WXCard from '@/app/ui/WXCard/WXCard'
import styles from './Wind.module.css'
import { fetchWindGraph } from '@/app/lib/actions'
import dynamic from 'next/dynamic'

type ChartData = {
  wind_avg_data: number[][]
  wind_gust_data: number[][]
  wind_lull_data: number[][]
  wind_dir_data: number[][]
  last_wind_dir_text: string
} | null

const Wind = async () => {
  const WindGraph = dynamic(() => import('@/app/ui/WindGraph/WindGraph'), {
    ssr: false,
  })
  // const [data, setData] = useState<ChartData>(null)
  // const fetchData = async () => {
  const json = process.env.NODE_ENV === 'development' ? testData.wind : await fetchWindGraph()

  // const json = await fetchWindGraph()
  // console.log(json)
  const data = {
    wind_avg_data: json.wind_avg_data.slice(0, -1) as number[][],
    wind_gust_data: json.wind_gust_data.slice(0, -1) as number[][],
    wind_lull_data: json.wind_lull_data.slice(0, -1) as number[][],
    wind_dir_data: json.wind_dir_data.slice(0, -1) as number[][],
    last_wind_dir_text: json.last_ob_dir_txt as string,
  }

  // fetchData()
  return (
    <>
      <div className={styles.flexContainer}>
        {data && (
          <WXCard
            title='Spit'
            data={{
              windSpeed: Math.round(data?.wind_avg_data[data?.wind_avg_data.length - 1][1]),
              windDirection: data?.wind_dir_data[data?.wind_avg_data.length - 1][1],
              windGusts: Math.round(data?.wind_gust_data[data?.wind_avg_data.length - 1][1]),
              windDirectionText: data?.last_wind_dir_text,
            }}
          />
        )}
        <GondolaWX />
      </div>
      <WindGraph data={data} />
    </>
  )
}

export default Wind
