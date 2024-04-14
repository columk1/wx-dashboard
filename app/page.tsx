import Image from 'next/image'
import styles from './page.module.css'
import Wind from '@/app/ui/Wind/Wind'
import GondolaWX from './ui/GondolaWX/GondolaWX'
import Rasp from './ui/Rasp/Rasp'

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>Chicken Hub&nbsp;</p>
        {/* <div>
          <a
            href='https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app'
            target='_blank'
            rel='noopener noreferrer'
          >
            By columk
            <Image
              src='/vercel.svg'
              alt='Vercel Logo'
              className={styles.vercelLogo}
              width={100}
              height={24}
              priority
            />
          </a>
        </div> */}
      </div>

      <Wind />

      {/* Chief Cam */}
      <div className={styles.iFrameWrapper}>
        <iframe
          className={styles.iFrame}
          width='450'
          height='211'
          src='https://chiefcam.com/embed/live'
          frameBorder='0'
          allow='autoplay; encrypted-media; fullscreen; picture-in-picture'
          allowFullScreen
        ></iframe>
      </div>

      <Rasp />

      <div className={styles.grid}>
        <a
          href='https://www.windy.com/49.682/-123.144/airgram?clouds,49.653,-123.167,12'
          className={styles.card}
          target='_blank'
          rel='noopener noreferrer'
        >
          <h2>
            Windy <span>-&gt;</span>
          </h2>
          <p>Squamish airgram with an extended forecast.</p>
        </a>

        <a
          href='https://www.windy.com/?42.864,-138.880,4,m:fjXac0Z'
          className={styles.card}
          target='_blank'
          rel='noopener noreferrer'
        >
          <h2>
            Windy <span>-&gt;</span>
          </h2>
          <p>East Pacific Pressure Systems</p>
        </a>

        <a
          href='https://ocean.weather.gov/P_e_sfc_color.png'
          className={styles.card}
          target='_blank'
          rel='noopener noreferrer'
        >
          <h2>
            Surface Analysis <span>-&gt;</span>
          </h2>
          <p>East Pacific</p>
        </a>

        <a
          href='https://whistlerpeak.com/temps/'
          className={styles.card}
          target='_blank'
          rel='noopener noreferrer'
        >
          <h2>
            Whistler Peak<span>-&gt;</span>
          </h2>
          <p>Wind speed and cams</p>
        </a>
      </div>
    </main>
  )
}
