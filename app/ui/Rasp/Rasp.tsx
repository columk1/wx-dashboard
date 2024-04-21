'use client'

import Image from 'next/image'
import styles from './Rasp.module.css'
import { useEffect, useState } from 'react'
import { addDays, format } from 'date-fns'

const sites = [
  ['Squamish', '20'],
  ['Pemberton', '15'],
  ['Demon', '260'],
  ['Cloudburst', '146'],
  ['Tunnel', '231'],
]

const now = new Date()
const today = `oneDay/${format(now, 'yyyy-MM-dd')}`
const tomorrow = `oneDay/${format(addDays(now, 1), 'yyyy-MM-dd')}`
const twoDay = 'twoDay'

const periods = [today, tomorrow, twoDay]

const Rasp = () => {
  const [siteIndex, setSiteIndex] = useState(0)
  const [periodIndex, setPeriodIndex] = useState(0)

  useEffect(() => {
    const currentDate = new Date()
    if (currentDate.getDate() !== now.getDate()) setPeriodIndex((prev) => prev)
  }, [])

  const period = periods[periodIndex]

  const getNextIndex = (array: any[], currentIndex: number) => (currentIndex + 1) % periods.length

  const getNextItem = (array: any[], currentIndex: number) =>
    array[(currentIndex + 1) % periods.length]

  const cyclePeriod = () => setPeriodIndex((prev) => getNextIndex(periods, prev))

  const src = `https://canadarasp.com/windgrams-data/${period}/hrdpswindgram${sites[siteIndex][1]}.png`

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
          {/* Preload next period of current site */}
          <Image
            src={`https://canadarasp.com/windgrams-data/${getNextItem(
              periods,
              periodIndex
            )}/hrdpswindgram${sites[siteIndex][1]}.png`}
            alt={'Preload Next Rasp Windgram'}
            width={450}
            height={450}
            className={styles.raspImg + ' sr-only'}
          />
          {/* Preload next site with current period */}
          <Image
            src={`https://canadarasp.com/windgrams-data/${period}/hrdpswindgram${getNextItem(
              sites,
              siteIndex
            )}.png`}
            alt={'Preload Next Rasp Windgram'}
            width={450}
            height={450}
            className={styles.raspImg + ' sr-only'}
          />
        </button>
        <div className={styles.rasp}>
          {sites.map((e, i) => (
            <button
              key={e[1]}
              onClick={() => setSiteIndex(i)}
              className={`${styles.raspBtn} ${siteIndex === i ? styles.active : ''}`}
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
