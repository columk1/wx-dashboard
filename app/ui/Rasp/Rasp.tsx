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

const periods = [
  ['Today', `oneDay/${format(now, 'yyyy-MM-dd')}`],
  ['Tomorrow', `oneDay/${format(addDays(now, 1), 'yyyy-MM-dd')}`],
  ['Two Day', 'twoDay'],
]

const Rasp = () => {
  const [siteIndex, setSiteIndex] = useState(0)
  const [periodIndex, setPeriodIndex] = useState(0)

  useEffect(() => {
    const currentDate = new Date()
    if (currentDate.getDate() !== now.getDate()) setPeriodIndex((prev) => prev)
  }, [])

  const period = periods[periodIndex][1]

  const getNextIndex = (array: any[], currentIndex: number) => (currentIndex + 1) % array.length

  const getNextItem = (array: any[], currentIndex: number) =>
    array[(currentIndex + 1) % array.length]

  const cyclePeriod = () => setPeriodIndex((prev) => getNextIndex(periods, prev))

  const src = `https://canadarasp.com/windgrams-data/${period}/hrdpswindgram${sites[siteIndex][1]}.png`

  return (
    <>
      <div className={styles.raspWrapper}>
        <div className={styles.periodBtns}>
          {periods.map((e, i) => (
            <button
              key={e[0]}
              onClick={() => setPeriodIndex(i)}
              className={`${styles.periodBtn} ${periodIndex === i ? styles.active : ''}`}
            >
              {e[0]}
            </button>
          ))}
        </div>
        <button onClick={cyclePeriod}>
          <Image
            src={src}
            alt={'Rasp Windgram'}
            width={450}
            height={450}
            className={styles.raspImg}
            priority
          />
          {/* Preload next period of current site */}
          <Image
            src={`https://canadarasp.com/windgrams-data/${
              getNextItem(periods, periodIndex)[1]
            }/hrdpswindgram${sites[siteIndex][1]}.png`}
            alt={'Preload Next Rasp Windgram'}
            width={450}
            height={450}
            loading='eager'
            className={styles.raspImg + ' sr-only'}
          />
          {/* Preload next site with current period */}
          <Image
            src={`https://canadarasp.com/windgrams-data/${period}/hrdpswindgram${
              getNextItem(sites, siteIndex)[1]
            }.png`}
            alt={'Preload Next Rasp Windgram'}
            width={450}
            height={450}
            loading='eager'
            className={styles.raspImg + ' sr-only'}
          />
        </button>
        <div className={styles.btnContainer}>
          <div className={styles.raspBtns}>
            {sites.map((e, i) => (
              <button
                key={e[0]}
                onClick={() => setSiteIndex(i)}
                className={`${styles.raspBtn} ${siteIndex === i ? styles.active : ''}`}
              >
                <p>{e[0]}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Rasp
