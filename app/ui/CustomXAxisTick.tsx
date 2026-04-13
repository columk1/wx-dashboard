import type { WindGraphChartPoint } from '@/app/lib/definitions'

type CustomXAxisTickProps = {
	x?: number
	y?: number
	payload?: {
		coordinate: number
		index: number
		isShow: boolean
		offset: number
		tickCoord: number
		value: number
	}
	directionArray: WindGraphChartPoint[]
	size?: number
}

const CustomXAxisTick = (props: CustomXAxisTickProps) => {
	const { x, y, payload, directionArray, size = 12 } = props
	const point = payload
		? directionArray.find(
				(directionPoint) => directionPoint.time === payload.value,
			)
		: null
	const direction = point?.predictedDir ?? point?.dir ?? null
	const fill =
		point?.predictedDir != null ? 'rgb(var(--wind-predicted-rgb))' : '#1d91a0'

	if (!payload || direction == null) return null

	return (
		<svg
			x={(x ?? 0) - size / 2}
			y={y}
			stroke="currentColor"
			fill={fill}
			strokeWidth="0"
			version="1.2"
			baseProfile="tiny"
			viewBox="0 0 24 24"
			height={size}
			width={size}
		>
			<title>Wind direction: {direction}°</title>
			<g transform={`rotate(${direction + 135} ${size} ${size})`}>
				<path d="M10.368 19.102c.349 1.049 1.011 1.086 1.478.086l5.309-11.375c.467-1.002.034-1.434-.967-.967l-11.376 5.308c-1.001.467-.963 1.129.085 1.479l4.103 1.367 1.368 4.102z"></path>
			</g>
		</svg>
	)
}

export default CustomXAxisTick
