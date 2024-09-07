'use server'

const fetchData = async (endpoint?: string) => {
  if (!endpoint) return null
  try {
    const response = await fetch(endpoint)
    if (!response.ok) console.log(response.statusText)
    return response.json()
  } catch (error) {
    console.log(error)
  }
}

const fetchWindGraph = async () => fetchData(`${process.env.SPIT_WINDMETER_API}&_=${Date.now()}`)
const fetchGondolaData = async () => fetchData(process.env.GONDOLA_WINDMETER_API)
const fetchVcliffeData = async () =>
  fetchData(`${process.env.VALLEYCLIFFE_WINDMETER_API}&_=${Date.now()}`)

export { fetchWindGraph, fetchGondolaData, fetchVcliffeData }
