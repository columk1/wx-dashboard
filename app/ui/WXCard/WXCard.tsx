import Arrow from '@/app/ui/Arrow'
import styles from '@/app/ui/WXCard/WXCard.module.css'

type WindData = {
  windDirection: number
  windSpeed: number
  windGusts: number
  windDirectionText: string
} | null

const WXCard = ({ title, data }: { title: string; data: WindData }) => {
  // console.log(data?.windDirectionText)
  return (
    <div className={styles.card}>
      <div className={styles.titleContainer}>
        <h2 className={styles.title}>{title}</h2>
        <h2 className={styles.directionText}>{data?.windDirectionText}</h2>
      </div>
      <div className={styles.flexContainer}>
        <div className={styles.arrowBorder}>
          <Arrow size={'2em'} angle={data?.windDirection || 0} />
        </div>
        <div className={styles.windSpeedContainer}>
          <p className={styles.avg}>
            {data?.windSpeed}
            <small className={styles.small}>km/h</small>
          </p>
          <div className={styles.gustContainer}>
            <p className={styles.item}>Gust </p>
            <p className={styles.gust}>
              {data?.windGusts}
              <small className={styles.small}></small>
            </p>
          </div>
          {/* <p>
            Temp: 2.0 <small>°C</small>
          </p> */}
        </div>
      </div>
    </div>
  )
}

export default WXCard
