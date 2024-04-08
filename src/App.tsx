import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
// import { scrapeData } from '../scraper'

function App() {
  const [count, setCount] = useState(0)
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(import.meta.env.VITE_WINDGRAPH_URL)
      const json = await response.json()
      console.log(json)
      setData(json)
    }

    fetchData()
  }, [])

  const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  return (
    <>
      <div>
        <a href='https://vitejs.dev' target='_blank'>
          <img src={viteLogo} className='logo' alt='Vite logo' />
        </a>
        <a href='https://react.dev' target='_blank'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className='card'>
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className='read-the-docs'>Click on the Vite and React logos to learn more</p>
      <img src={`https://canadarasp.com/windgrams-data/oneDay/${date}/hrdpswindgram20.png`} />
    </>
  )
}

export default App
