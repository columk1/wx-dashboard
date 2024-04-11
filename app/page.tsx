import Image from 'next/image'
import styles from './page.module.css'
import WindGraph from '@/app/ui/WindGraph/WindGraph'

export default function Home() {
  const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>Squamish Aviation Dashboard&nbsp;</p>
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

      <WindGraph />

      <div className={styles.iFrameWrapper}>
        <iframe
          className={styles.iFrame}
          width='450'
          height='210'
          src='https://chiefcam.com/embed/live'
          frameBorder='0'
          allow='autoplay; encrypted-media; fullscreen; picture-in-picture'
          allowFullScreen
        ></iframe>
      </div>

      <Image
        src={`https://canadarasp.com/windgrams-data/oneDay/${date}/hrdpswindgram20.png`}
        alt={'Rasp Windgram'}
        width={400}
        height={400}
      />

      <div className={styles.grid}>
        <a
          href='https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app'
          className={styles.card}
          target='_blank'
          rel='noopener noreferrer'
        >
          <h2>
            Docs <span>-&gt;</span>
          </h2>
          <p>Find in-depth information about Next.js features and API.</p>
        </a>

        <a
          href='https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app'
          className={styles.card}
          target='_blank'
          rel='noopener noreferrer'
        >
          <h2>
            Learn <span>-&gt;</span>
          </h2>
          <p>Learn about Next.js in an interactive course with&nbsp;quizzes!</p>
        </a>

        <a
          href='https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app'
          className={styles.card}
          target='_blank'
          rel='noopener noreferrer'
        >
          <h2>
            Templates <span>-&gt;</span>
          </h2>
          <p>Explore starter templates for Next.js.</p>
        </a>

        <a
          href='https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app'
          className={styles.card}
          target='_blank'
          rel='noopener noreferrer'
        >
          <h2>
            Deploy <span>-&gt;</span>
          </h2>
          <p>Instantly deploy your Next.js site to a shareable URL with Vercel.</p>
        </a>
      </div>
    </main>
  )
}
