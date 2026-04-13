import type { WXCardData } from '@/app/lib/definitions'
import Arrow from '@/app/ui/Arrow'
import Spinner from '@/app/ui/Spinner/Spinner'
import styles from '@/app/ui/WXCard/WXCard.module.css'

const WXCard = ({
	title,
	url,
	data,
}: {
	title: string
	url: string
	data: WXCardData
}) => {
	// console.log(data?.windDirectionText)
	const titleRow = (
		<div className={styles.titleContainer}>
			<h2 className={styles.title}>{title}</h2>
			{data?.updatedAtText && (
				<p className={styles.updatedAt}>{data.updatedAtText}</p>
			)}
		</div>
	)

	return (
		<div className={styles.container}>
			{!data ? (
				<div className={styles.card}>
					{titleRow}
					<div className={styles.spinnerContainer}>
						<Spinner />
					</div>
				</div>
			) : (
				<a href={url} target="_blank" rel="noopener noreferrer">
					<div className={styles.card}>
						{titleRow}
						<div className={styles.flexContainer}>
							<div className={styles.arrowBorder}>
								<Arrow size={'1.6em'} angle={data?.windDirection || 0} />
							</div>
							<h2 className={styles.directionText}>
								{data?.windDirectionText}
							</h2>
							<div className={styles.windSpeedContainer}>
								<p className={styles.avg}>
									{data?.windSpeed}
									<small className={styles.small}>km/h</small>
								</p>
								{data?.windGusts !== undefined && (
									<div className={styles.gustContainer}>
										<p className={styles.item}>
											Gust{data?.windLull !== undefined && 'ing'}
										</p>
										<p className={styles.gust}>
											{data?.windLull !== undefined && (
												<span>{data?.windLull} - </span>
											)}
											{data?.windGusts}
											{/* <small className={styles.small}>km/h</small> */}
										</p>
									</div>
								)}
								{/* <p>
            Temp: 2.0 <small>°C</small>
          </p> */}
							</div>
						</div>
					</div>
				</a>
			)}
		</div>
	)
}

export default WXCard
