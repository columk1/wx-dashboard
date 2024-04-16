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

const Rasp = () => {
  const [site, setSite] = useState('20')
  const [period, setPeriod] = useState('today')

  const today = format(new Date(), 'yyyy-MM-dd')
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')

  const getNextPeriod = (currentPeriod: string) => {
    if (currentPeriod === 'twoDay') {
      return 'today'
    }
    if (currentPeriod === 'today') {
      return 'tomorrow'
    }
    return 'twoDay'
  }

  return (
    <div className={styles.raspWrapper}>
      <button onClick={() => setPeriod((prev) => getNextPeriod(prev))}>
        <Image
          src={
            period === 'today'
              ? `https://canadarasp.com/windgrams-data/oneDay/${today}/hrdpswindgram${site}.png`
              : period === 'tomorrow'
              ? `https://canadarasp.com/windgrams-data/oneDay/${tomorrow}/hrdpswindgram${site}.png`
              : `https://canadarasp.com/windgrams-data/twoDay/hrdpswindgram${site}.png`
          }
          alt={'Rasp Windgram'}
          width={450}
          height={450}
          className={styles.raspImg}
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
  )
}

export default Rasp
