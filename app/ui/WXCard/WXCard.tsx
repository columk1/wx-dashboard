import Link from 'next/link'
import type { WXCardData } from '@/app/lib/definitions'
import Arrow from '@/app/ui/Arrow'
import Spinner from '@/app/ui/Spinner/Spinner'
import styles from '@/app/ui/WXCard/WXCard.module.css'

const WXCard = ({
	title,
	href,
	data,
	isActive = false,
	external = false,
}: {
	title: string
	href: string
	data: WXCardData
	isActive?: boolean
	external?: boolean
}) => {
	const titleRow = (
		<div className={styles.titleContainer}>
			<h2 className={styles.title}>{title}</h2>
			{data?.updatedAtText && (
				<p className={styles.updatedAt}>{data.updatedAtText}</p>
			)}
		</div>
	)

	const cardClassName = `${styles.card} ${isActive ? styles.cardActive : ''}`
	const cardContent = !data ? (
		<div className={cardClassName}>
			{titleRow}
			<div className={styles.spinnerContainer}>
				<Spinner />
			</div>
		</div>
	) : (
		<div className={cardClassName}>
			{titleRow}
			<div className={styles.flexContainer}>
				<div className={styles.arrowBorder}>
					<Arrow size={'1.6em'} angle={data?.windDirection || 0} />
				</div>
				<h2 className={styles.directionText}>{data?.windDirectionText}</h2>
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
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)

	return (
		<div className={styles.container}>
			{external ? (
				<a href={href} target="_blank" rel="noopener noreferrer">
					{cardContent}
				</a>
			) : (
				<Link
					href={href}
					className={styles.link}
					aria-current={isActive ? 'page' : undefined}
				>
					{cardContent}
				</Link>
			)}
		</div>
	)
}

export default WXCard
