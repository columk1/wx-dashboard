'use client'

import { useEffect, useRef } from 'react'
import styles from './ChiefCam.module.css'

const ChiefCam = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.style.visibility = 'visible'
    }
  }, [])

  return (
    <div className={styles.iFrameWrapper}>
      <iframe
        ref={iframeRef}
        className={styles.iFrame}
        // width='450'
        // height='211'
        src='https://chiefcam.com/embed/live'
        allow='autoplay; encrypted-media; fullscreen; picture-in-picture'
        style={{ visibility: 'hidden' }}
      ></iframe>
    </div>
  )
}

export default ChiefCam
