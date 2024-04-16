import styles from './page.module.css'
import Wind from '@/app/ui/Wind/Wind'
import Rasp from './ui/Rasp/Rasp'
import { addDays, format } from 'date-fns'
import { Suspense } from 'react'
import Loading from '@/app/ui/Loading/Loading'
import ChiefCam from '@/app/ui/ChiefCam/ChiefCam'

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>Chief Lap Copilot&nbsp;</p>
      </div>

      {/* Chief Cam */}
      <ChiefCam />
      {/* Wind cards and wind graph */}
      <Suspense fallback={<Loading />}>
        <Wind />
      </Suspense>

      {/* Canada Rasp Windgram selector */}
      <Rasp />

      {/* External Links */}
      <div className={styles.grid}>
        <a
          href='https://us-west1-rugged-nimbus-347223.cloudfunctions.net/wind?spot=1436'
          className={styles.card}
          target='_blank'
          rel='noopener noreferrer'
        >
          <h4>
            Spit <span>📈</span>
          </h4>
          <p>Wind meter</p>
        </a>

        <a
          href='https://www.windy.com/49.682/-123.144/airgram?clouds,49.653,-123.167,12'
          className={styles.card}
          target='_blank'
          rel='noopener noreferrer'
        >
          <h4>
            Windy <span>🪂</span>
          </h4>
          <p>Squamish airgram</p>
        </a>

        <a
          href='https://www.windy.com/?42.864,-138.880,4,m:fjXac0Z'
          className={styles.card}
          target='_blank'
          rel='noopener noreferrer'
        >
          <h4>
            Windy <span>🌪</span>
          </h4>
          <p>Pressure Systems</p>
        </a>

        <a
          href='https://canadarasp.com/windgrams/?region=1&location=0&plotType=1'
          className={styles.card}
          target='_blank'
          rel='noopener noreferrer'
        >
          <h4>
            Rasp<span>&nbsp;🌞</span>
          </h4>
          <p>Windgrams</p>
        </a>

        <a
          href='https://ocean.weather.gov/P_e_sfc_color.png'
          className={styles.card}
          target='_blank'
          rel='noopener noreferrer'
        >
          <h4>
            Ocean Weather <span>🌀</span>
          </h4>
          <p>Surface Analysis</p>
        </a>

        <a
          href='https://whistlerpeak.com/temps/'
          className={styles.card}
          target='_blank'
          rel='noopener noreferrer'
        >
          <h4>
            Whistler Peak<span>&nbsp;🏔</span>
          </h4>
          <p>Weather and cams</p>
        </a>

        <a
          href='https://xcfind.paraglide.us/map.html?id=114'
          className={styles.card}
          target='_blank'
          rel='noopener noreferrer'
        >
          <h4>
            XC Find<span>&nbsp;📍</span>
          </h4>
          <p>Western Canada</p>
        </a>

        <a
          href={`https://www.xcontest.org/canada/en/flights/#filter[date]=${format(
            addDays(new Date(), -1),
            'yyyy-MM-dd'
          )}@flights[sort]=reg`}
          className={styles.card}
          target='_blank'
          rel='noopener noreferrer'
        >
          <h4>
            XContest<span>&nbsp;🏆</span>
          </h4>
          <p>Yesterday's flights</p>
        </a>
      </div>
    </main>
  )
}
