'use client'

import styles from './Rasp.module.css'
import { useEffect, useMemo, useState } from 'react'
import { addDays, format, previousDay } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import sites from '@/app/lib/data/raspSites.json'

const getNextItem = (array: any[], currentIndex: number) => array[(currentIndex + 1) % array.length]

const getPacificTimestamp = () => toZonedTime(Date.now(), 'America/Los_Angeles')

// const getTimeSuffix = (date: Date) =>
//   date.getDay() + date.getHours() > 6 && date.getHours() < 19 ? 'am' : 'pm'

const preloadImages = (srcs: string[]) => {
  srcs.forEach((src) => {
    const img = new Image()
    img.src = src
  })
}

const Rasp = () => {
  const [siteIndex, setSiteIndex] = useState(0)
  const [periodIndex, setPeriodIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [nowPT, setNowPT] = useState<Date | null>(null)

  const periods = useMemo(() => nowPT ? [
    ['Today', `oneDay/${format(nowPT, 'yyyy-MM-dd')}`],
    ['Tomorrow', `oneDay/${format(addDays(nowPT, 1), 'yyyy-MM-dd')}`],
    ['Two Day', 'twoDay'],
  ] : [], [nowPT])

  const period = periods[periodIndex]?.[1]
  const site = sites[siteIndex][1]

  const src = `https://canadarasp.com/windgrams-data/${period}/hrdpswindgram${site}.png`

  const cyclePeriod = () => updateImage((periodIndex + 1) % periods.length, siteIndex)

  const handlePeriodSelection = (index: number) => updateImage(index, siteIndex)

  const handleSiteSelection = (index: number) => updateImage(periodIndex, index)

  const updateImage = (newPeriodIndex: number, newSiteIndex: number) => {
    const newPeriod = periods[newPeriodIndex][1]
    const newSite = sites[newSiteIndex][1]
    const newSrc = `https://canadarasp.com/windgrams-data/${newPeriod}/hrdpswindgram${newSite}.png`
    const img = new Image()
    img.src = newSrc
    // img.onload = () => {
    //   setPeriodIndex(newPeriodIndex)
    //   setSiteIndex(newSiteIndex)
    // }
    setPeriodIndex(newPeriodIndex)
    setSiteIndex(newSiteIndex)
  }

  // Set the time on the client to prevent pre-rendering on the server (otherwise you end up with the date from build)
  useEffect(() => {
    setNowPT(getPacificTimestamp())
  }, [])

  // Preload next site and next period of to pre-empt RASP navigation
  useEffect(() => {
    const preloadImageSrcs = [
      `https://canadarasp.com/windgrams-data/${getNextItem(periods, periodIndex)?.[1]}/hrdpswindgram${site}.png`,
      `https://canadarasp.com/windgrams-data/${period}/hrdpswindgram${getNextItem(sites, siteIndex)[1]}.png`,
    ]
    preloadImages(preloadImageSrcs)
  }, [period, periods, site, siteIndex, periodIndex])

  return (
    <>
      <div className={styles.raspWrapper} onClick={() => setImageError(false)}>
        <div className={styles.periodBtns}>
          {periods.map((e, i) => (
            <button
              key={e[0]}
              onClick={() => handlePeriodSelection(i)}
              className={`${styles.periodBtn} ${periodIndex === i ? styles.active : ''}`}
            >
              {e[0]}
            </button>
          ))}
        </div>
        <button onClick={cyclePeriod} className={styles.imgShared}>
          {imageError ? (
            <div className={styles.error}>Keep Parawaiting</div>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={src}
              alt={'Rasp Windgram'}
              className={styles.raspImg}
              width={450}
              height={450}
              onError={() => setImageError(true)}
            />
          )}
        </button>
        <div className={styles.btnContainer}>
          <div className={styles.raspBtns}>
            {sites.map((e, i) => (
              <button
                key={e[0]}
                onClick={() => handleSiteSelection(i)}
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
