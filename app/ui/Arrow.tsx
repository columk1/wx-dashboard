const Arrow = ({ size = '12', angle }: { size?: string; angle: number }) => {
  return (
    <svg
      // x={x}
      // y={y}
      stroke='currentColor'
      fill='#1d91a0'
      strokeWidth='0'
      version='1.2'
      baseProfile='tiny'
      viewBox='0 0 24 24'
      height={size}
      width={size}
    >
      <g transform={`rotate(${angle + 135} 12 12.5)`}>
        <path d='M10.368 19.102c.349 1.049 1.011 1.086 1.478.086l5.309-11.375c.467-1.002.034-1.434-.967-.967l-11.376 5.308c-1.001.467-.963 1.129.085 1.479l4.103 1.367 1.368 4.102z'></path>
      </g>
    </svg>
  )
}

export default Arrow
