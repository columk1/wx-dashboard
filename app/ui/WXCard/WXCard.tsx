import Arrow from '@/app/ui/Arrow'
import styles from '@/app/ui/WXCard/WXCard.module.css'
import { WXCardData } from '@/app/lib/definitions'
import Link from 'next/link'
import Spinner from '@/app/ui/Spinner/Spinner'

const WXCard = ({ title, url, data }: { title: string; url: string; data: WXCardData }) => {
  // console.log(data?.windDirectionText)
  return (
    <div className={styles.container}>
      {!data ? (
        <div className={styles.card}>
          <div className={styles.titleContainer}>
            <h2 className={styles.title}>{title}</h2>
          </div>
          <div className={styles.spinnerContainer}>
            <Spinner />
          </div>
        </div>
      ) : (
        <Link href={url}>
          <div className={styles.card}>
            <div className={styles.titleContainer}>
              <h2 className={styles.title}>{title}</h2>
            </div>
            <div className={styles.flexContainer}>
              <div className={styles.arrowBorder}>
                <Arrow size={'1.6em'} angle={data?.windDirection || 0} />
              </div>
              <h2 className={styles.directionText}>{data?.windDirectionText}</h2>
              <div className={styles.windSpeedContainer}>
                <p className={styles.avg}>
                  {data?.windSpeed}
                  <small className={styles.small}>km/h</small>
                </p>
                <div className={styles.gustContainer}>
                  <p className={styles.item}>Gust{data?.windLull !== undefined && 'ing'}</p>
                  <p className={styles.gust}>
                    {data?.windLull !== undefined && <span>{data?.windLull} - </span>}
                    {data?.windGusts}
                    {/* <small className={styles.small}>km/h</small> */}
                  </p>
                </div>
                {/* <p>
            Temp: 2.0 <small>°C</small>
          </p> */}
              </div>
            </div>
          </div>
        </Link>
      )}
    </div>
  )
}

export default WXCard
