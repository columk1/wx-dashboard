import styles from './page.module.css'
import Wind from '@/app/ui/Wind/Wind'
import Rasp from './ui/Rasp/Rasp'
import ChiefCam from '@/app/ui/ChiefCam/ChiefCam'
import links from '@/app/lib/data/links.json'

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>Chief Lap Copilot&nbsp;</h1>
      </header>

      {/* Chief Cam */}
      <ChiefCam />

      {/* Wind cards and wind graph */}
      <Wind />

      {/* Canada Rasp Windgram selector */}
      <Rasp />

      {/* External Links */}
      <section className={styles.section}>
        <ul className={styles.grid}>
          {links.map((link) => (
            <li key={link.url} className={styles.card}>
              <a href={link.url} target='_blank' rel='noopener noreferrer'>
                <h4>
                  {link.name} <span>{link.emoji}</span>
                </h4>
                <p>{link.description}</p>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
