'use client'

import Image from 'next/image'
import styles from './Rasp.module.css'
import { useState } from 'react'
import { addDays, format } from 'date-fns'

const sites = [
  ['Squamish', '20'],
  ['Pemberton', '15'],
  ['Demon', '260'],
  ['Cloudburst', '146'],
  ['Tunnel', '231'],
]

const today = `oneDay/${format(new Date(), 'yyyy-MM-dd')}`
const tomorrow = `oneDay/${format(addDays(new Date(), 1), 'yyyy-MM-dd')}`
const twoDay = 'twoDay'

const periods = [today, tomorrow, twoDay]

const Rasp = () => {
  const [site, setSite] = useState('20')
  const [periodIndex, setPeriodIndex] = useState(0)

  const period = periods[periodIndex]

  const getNextPeriod = (currentIndex: number) => (currentIndex + 1) % periods.length

  const cyclePeriod = () => setPeriodIndex((prev) => getNextPeriod(prev))

  const src = `https://canadarasp.com/windgrams-data/${period}/hrdpswindgram${site}.png`

  return (
    <>
      <div className={styles.raspWrapper}>
        <button onClick={cyclePeriod}>
          <Image
            src={src}
            alt={'Rasp Windgram'}
            width={450}
            height={450}
            className={styles.raspImg}
          />
          <Image
            src={`https://canadarasp.com/windgrams-data/${getNextPeriod(
              periodIndex
            )}/hrdpswindgram${site}.png`}
            alt={'Preload Next Rasp Windgram'}
            width={450}
            height={450}
            className={styles.raspImg + ' sr-only'}
          />
        </button>
        <div className={styles.rasp}>
          {sites.map((e) => (
            <button
              key={e[1]}
              onClick={() => setSite(e[1])}
              className={`${styles.raspBtn} ${site === e[1] ? styles.active : ''}`}
            >
              <p>{e[0]}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

export default Rasp
