export type DirectionTick = {
	time: number
	direction: number
	isPredicted: boolean
}

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
	directionTicks: DirectionTick[]
	size?: number
}

const CustomXAxisTick = ({
	x,
	y,
	payload,
	directionTicks,
	size = 12,
}: CustomXAxisTickProps) => {
	const directionTick = payload
		? directionTicks.find((tick) => tick.time === payload.value)
		: null
	const fill = directionTick?.isPredicted
		? 'rgb(var(--wind-predicted-rgb))'
		: '#1d91a0'

	if (!payload || !directionTick) return null

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
			<title>Wind direction: {directionTick.direction}°</title>
			<g transform={`rotate(${directionTick.direction + 135} ${size} ${size})`}>
				<path d="M10.368 19.102c.349 1.049 1.011 1.086 1.478.086l5.309-11.375c.467-1.002.034-1.434-.967-.967l-11.376 5.308c-1.001.467-.963 1.129.085 1.479l4.103 1.367 1.368 4.102z"></path>
			</g>
		</svg>
	)
}

export default CustomXAxisTick
