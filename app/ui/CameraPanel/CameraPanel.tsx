'use client'

import { Activity } from 'react'
import type { WXView } from '@/app/lib/definitions'
import ChiefCam from '@/app/ui/ChiefCam/ChiefCam'
import GondolaWebcam from '@/app/ui/GondolaWebcam/GondolaWebcam'
import styles from './CameraPanel.module.css'

type CameraPanelProps = {
	activeView: WXView
}

const CameraPanel = ({ activeView }: CameraPanelProps) => {
	const isChiefCamVisible = activeView !== 'gondola'

	return (
		<div className={styles.panel}>
			<Activity mode={isChiefCamVisible ? 'visible' : 'hidden'}>
				<ChiefCam />
			</Activity>
			{!isChiefCamVisible ? <GondolaWebcam /> : null}
		</div>
	)
}

export default CameraPanel
