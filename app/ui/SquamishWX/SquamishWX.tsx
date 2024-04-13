'use client'

import { fetchGondolaData } from '@/app/lib/actions'
import { useEffect, useState } from 'react'
import Arrow from '@/app/ui/Arrow'
import styles from '@/app/ui/SquamishWX/SquamishWX.module.css'

type WindData = {
  windDirection: number
  windSpeed: number
  windGusts: number
} | null

const SquamishWX = ({ data }: { data: WindData }) => {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Spit</h2>
      <div className={styles.flexContainer}>
        <div className={styles.arrowBorder}>
          <Arrow size={48} angle={data?.windDirection || 0} />
        </div>
        <div>
          <p className={styles.item}>
            Avg: <span className={styles.data}>{data?.windSpeed}</span>
            <small className={styles.small}>km/h</small>
          </p>
          <p className={styles.item}>
            Gust: <span className={styles.data}>{data?.windGusts}</span>
            <small className={styles.small}>km/h</small>
          </p>
          {/* <p>
            Temp: 2.0 <small>°C</small>
          </p> */}
        </div>
      </div>
    </div>
  )
}

export default SquamishWX
