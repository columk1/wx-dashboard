'use client'

import Image from 'next/image'
import styles from './Rasp.module.css'
import { useEffect, useState } from 'react'
import { addDays, format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const sites = [
  ['Squamish', '20'],
  ['Pemberton', '15'],
  ['Demon', '260'],
  ['Mamquam', '14'],
  ['Cloudburst', '146'],
  ['Tunnel', '231'],
]

const getNextItem = (array: any[], currentIndex: number) => array[(currentIndex + 1) % array.length]

const getPacificTimestamp = () => toZonedTime(Date.now(), 'America/Los_Angeles')

const getTimeSuffix = (date: Date) =>
  date.getDay() + date.getHours() > 6 && date.getHours() < 19 ? 'am' : 'pm'

const Rasp = () => {
  // Get the current timestamp in Pacific Time
  const nowPT = getPacificTimestamp()

  const periods = [
    ['Today', `oneDay/${format(nowPT, 'yyyy-MM-dd')}`],
    ['Tomorrow', `oneDay/${format(addDays(nowPT, 1), 'yyyy-MM-dd')}`],
    ['Two Day', 'twoDay'],
  ]

  const [siteIndex, setSiteIndex] = useState(0)
  const [periodIndex, setPeriodIndex] = useState(0)
  const period = periods[periodIndex][1]
  const [imageError, setImageError] = useState(false)

  const src = `https://canadarasp.com/windgrams-data/${periods[periodIndex][1]}/hrdpswindgram${
    sites[siteIndex][1]
  }.png?${getTimeSuffix(nowPT)}`

  const cyclePeriod = () => setPeriodIndex((prev) => (prev + 1) % periods.length)

  return (
    <>
      <div className={styles.raspWrapper} onClick={() => setImageError(false)}>
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
          {imageError ? (
            <div className={styles.error}>Keep Parawaiting</div>
          ) : (
            <Image
              key={src}
              src={src}
              alt={'Rasp Windgram'}
              width={450}
              height={450}
              className={styles.raspImg}
              priority
              onError={() => setImageError(true)}
            />
          )}
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
