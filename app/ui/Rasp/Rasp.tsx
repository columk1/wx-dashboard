'use client'

import styles from './Rasp.module.css'
import { useEffect, useReducer, useState } from 'react'
import { addDays, format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import sites from '@/app/lib/data/raspSites.json'

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
  const [imageError, setImageError] = useState(false)
  const period = periods[periodIndex][1]
  const site = sites[siteIndex][1]

  const [src, setSrc] = useState<string | null>(null)
  // const src = `https://canadarasp.com/windgrams-data/${period}/hrdpswindgram${site}.png`
  // const [src, setSrc] = useState(`https://canadarasp.com/windgrams-data/${period}/hrdpswindgram${site}.png`)

  const cyclePeriod = () => setPeriodIndex((prev) => (prev + 1) % periods.length)

  // Set the src on the client to prevent pre-rendering on the server (for caching/timing consistency)
  useEffect(() => {
    //   // setSrc(`/api/windgrams?period=${period}&site=${sites[siteIndex][1]}`)
    setSrc(`https://canadarasp.com/windgrams-data/${period}/hrdpswindgram${site}.png`)
  }, [site, period])

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
            src && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={'Rasp Windgram'}
                className={styles.raspImg}
                width={450}
                height={450}
                onError={() => setImageError(true)}
              />
            )
          )}
          {/* Preload next period of current site */}
          <link
            rel='preload'
            as='image'
            // Used with own caching layer
            // href={`/api/windgrams?period=${getNextItem(periods, periodIndex)[1]}&site=${sites[siteIndex][1]}`}
            // Used with Next/Image caching
            // href={`https://canadarasp.com/windgrams-data/${getNextItem(periods, periodIndex)[1]}/hrdpswindgram${sites[siteIndex][1]}.png?${getTimeSuffix(nowPT)}`}
            href={`https://canadarasp.com/windgrams-data/${
              getNextItem(periods, periodIndex)[1]
            }/hrdpswindgram${sites[siteIndex][1]}.png`}
          />
          {/* Preload next site with current period */}
          <link
            rel='preload'
            as='image'
            // Used with own caching layer
            // href={`/api/windgrams?period=${periods[periodIndex][1]}&site=${getNextItem(sites, siteIndex)[1]}`}
            // Used with Next/Image caching
            // href={`https://canadarasp.com/windgrams-data/${period}/hrdpswindgram${getNextItem(sites, siteIndex)[1]}.png?${getTimeSuffix(nowPT)}`}
            href={`https://canadarasp.com/windgrams-data/${period}/hrdpswindgram${
              getNextItem(sites, siteIndex)[1]
            }.png`}
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
