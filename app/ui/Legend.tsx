const Legend = () => {
  return (
    <div
      className='recharts-legend-wrapper'
      style={{
        width: '100%',
        fontSize: '0.75rem',
        marginTop: '5px',
      }}
    >
      <ul
        className='recharts-default-legend'
        style={{ padding: '0px', margin: '0px, auto', textAlign: 'center' }}
      >
        <li
          className='recharts-legend-item legend-item-0'
          style={{ display: 'inline-block', marginRight: '10px' }}
        >
          <svg
            className='recharts-surface'
            width='8'
            height='8'
            viewBox='0 0 32 32'
            style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}
          >
            <title></title>
            <desc></desc>
            <path
              fill='rgb(29, 145, 160)'
              cx='16'
              cy='16'
              className='recharts-symbols'
              transform='translate(16, 16)'
              d='M16,0A16,16,0,1,1,-16,0A16,16,0,1,1,16,0'
            ></path>
          </svg>
          <span className='recharts-legend-item-text' style={{ color: 'rgb(29, 145, 160)' }}>
            Avg
          </span>
        </li>
        <li
          className='recharts-legend-item legend-item-1'
          style={{ display: 'inline-block', marginRight: '10px' }}
        >
          <svg
            className='recharts-surface'
            width='8'
            height='8'
            viewBox='0 0 32 32'
            style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}
          >
            <title></title>
            <desc></desc>
            <path
              fill='#f84c56'
              cx='16'
              cy='16'
              className='recharts-symbols'
              transform='translate(16, 16)'
              d='M16,0A16,16,0,1,1,-16,0A16,16,0,1,1,16,0'
            ></path>
          </svg>
          <span className='recharts-legend-item-text' style={{ color: 'rgb(248, 76, 86)' }}>
            Gust
          </span>
        </li>
        <li
          className='recharts-legend-item legend-item-2'
          style={{ display: 'inline-block', marginRight: '10px' }}
        >
          <svg
            className='recharts-surface'
            width='8'
            height='8'
            viewBox='0 0 32 32'
            style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}
          >
            <title></title>
            <desc></desc>
            <path
              fill='#0f6b8a'
              cx='16'
              cy='16'
              className='recharts-symbols'
              transform='translate(16, 16)'
              d='M16,0A16,16,0,1,1,-16,0A16,16,0,1,1,16,0'
            ></path>
          </svg>
          <span className='recharts-legend-item-text' style={{ color: 'rgb(15, 107, 138)' }}>
            Lull
          </span>
        </li>
        <li
          className='recharts-legend-item'
          style={{ display: 'inline-block', marginRight: '10px' }}
        >
          <svg
            stroke='currentColor'
            fill='#1d91a0'
            strokeWidth='0'
            version='1.2'
            baseProfile='tiny'
            viewBox='0 0 24 24'
            height='15'
            width='15'
          >
            <g transform={`rotate(0) translate(-3, 5)`}>
              <path d='M10.368 19.102c.349 1.049 1.011 1.086 1.478.086l5.309-11.375c.467-1.002.034-1.434-.967-.967l-11.376 5.308c-1.001.467-.963 1.129.085 1.479l4.103 1.367 1.368 4.102z'></path>
            </g>
          </svg>
          <span className='recharts-legend-item-text' style={{ color: '#1d91a0' }}>
            Direction
          </span>
        </li>
      </ul>
    </div>
  )
}

export default Legend
