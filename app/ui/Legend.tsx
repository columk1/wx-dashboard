const Legend = ({
	showLull = true,
	showPredicted = true,
	predictedEnabled = true,
	onPredictedToggle,
}: {
	showLull?: boolean
	showPredicted?: boolean
	predictedEnabled?: boolean
	onPredictedToggle?: () => void
}) => {
	const avgColor = 'rgb(var(--wind-avg-rgb))'
	const gustColor = 'rgb(var(--wind-gust-rgb))'
	const lullColor = 'rgb(var(--wind-lull-rgb))'
	const predictedColor = 'rgb(var(--wind-predicted-rgb))'
	const directionColor = avgColor

	return (
		<div
			className="recharts-legend-wrapper"
			style={{
				width: '100%',
				fontSize: '0.75rem',
				marginTop: '5px',
			}}
		>
			<ul
				className="recharts-default-legend"
				style={{ padding: '0px', margin: '0px, auto', textAlign: 'center' }}
			>
				<li
					className="recharts-legend-item legend-item-0"
					style={{ display: 'inline-block', marginRight: '10px' }}
				>
					<svg
						className="recharts-surface"
						width="8"
						height="8"
						viewBox="0 0 32 32"
						style={{
							display: 'inline-block',
							verticalAlign: 'middle',
							marginRight: '4px',
							marginTop: '-2px',
						}}
					>
						<title>Average wind speed</title>
						<path
							fill={avgColor}
							cx="16"
							cy="16"
							className="recharts-symbols"
							transform="translate(16, 16)"
							d="M16,0A16,16,0,1,1,-16,0A16,16,0,1,1,16,0"
						></path>
					</svg>
					<span
						className="recharts-legend-item-text"
						style={{ color: avgColor }}
					>
						Avg
					</span>
				</li>
				<li
					className="recharts-legend-item legend-item-1"
					style={{ display: 'inline-block', marginRight: '10px' }}
				>
					<svg
						className="recharts-surface"
						width="8"
						height="8"
						viewBox="0 0 32 32"
						style={{
							display: 'inline-block',
							verticalAlign: 'middle',
							marginRight: '4px',
							marginTop: '-2px',
						}}
					>
						<title>Wind gust</title>
						<path
							fill={gustColor}
							cx="16"
							cy="16"
							className="recharts-symbols"
							transform="translate(16, 16)"
							d="M16,0A16,16,0,1,1,-16,0A16,16,0,1,1,16,0"
						></path>
					</svg>
					<span
						className="recharts-legend-item-text"
						style={{ color: gustColor }}
					>
						Gust
					</span>
				</li>
				{showLull && (
					<li
						className="recharts-legend-item legend-item-2"
						style={{ display: 'inline-block', marginRight: '10px' }}
					>
						<svg
							className="recharts-surface"
							width="8"
							height="8"
							viewBox="0 0 32 32"
							style={{
								display: 'inline-block',
								verticalAlign: 'middle',
								marginRight: '4px',
								marginTop: '-2px',
							}}
						>
							<title>Wind lull</title>
							<path
								fill={lullColor}
								cx="16"
								cy="16"
								className="recharts-symbols"
								transform="translate(16, 16)"
								d="M16,0A16,16,0,1,1,-16,0A16,16,0,1,1,16,0"
							></path>
						</svg>
						<span
							className="recharts-legend-item-text"
							style={{ color: lullColor }}
						>
							Lull
						</span>
					</li>
				)}
				<li
					className="recharts-legend-item"
					style={{ display: 'inline-block', marginRight: '10px' }}
				>
					<svg
						stroke="currentColor"
						fill={directionColor}
						strokeWidth="0"
						version="1.2"
						baseProfile="tiny"
						viewBox="0 0 24 24"
						height="15"
						width="15"
					>
						<title>Wind direction</title>
						<g transform={`rotate(0) translate(-3, 5)`}>
							<path d="M10.368 19.102c.349 1.049 1.011 1.086 1.478.086l5.309-11.375c.467-1.002.034-1.434-.967-.967l-11.376 5.308c-1.001.467-.963 1.129.085 1.479l4.103 1.367 1.368 4.102z"></path>
						</g>
					</svg>
					<span
						className="recharts-legend-item-text"
						style={{ color: directionColor }}
					>
						Direction
					</span>
				</li>
				{showPredicted && (
					<li
						className="recharts-legend-item"
						style={{ display: 'inline-block', marginRight: '10px' }}
					>
						<button
							type="button"
							aria-pressed={predictedEnabled}
							onClick={onPredictedToggle}
							style={{
								alignItems: 'center',
								background: 'transparent',
								color: predictedColor,
								display: 'inline-flex',
								font: 'inherit',
								gap: '4px',
								opacity: predictedEnabled ? 1 : 0.45,
								padding: 0,
								verticalAlign: 'middle',
							}}
						>
							<svg
								className="recharts-surface"
								width="8"
								height="8"
								viewBox="0 0 32 32"
								style={{
									display: 'inline-block',
									verticalAlign: 'middle',
									marginTop: '-2px',
								}}
							>
								<title>Toggle predicted wind</title>
								<path
									fill={predictedColor}
									cx="16"
									cy="16"
									className="recharts-symbols"
									transform="translate(16, 16)"
									d="M16,0A16,16,0,1,1,-16,0A16,16,0,1,1,16,0"
								></path>
							</svg>
							<span
								className="recharts-legend-item-text"
								style={{
									color: predictedColor,
									textDecoration: predictedEnabled ? 'none' : 'line-through',
								}}
							>
								Predicted
							</span>
						</button>
					</li>
				)}
			</ul>
		</div>
	)
}

export default Legend
