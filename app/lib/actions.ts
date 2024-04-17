'use server'

const fetchData = async (endpoint?: string) => {
  if (!endpoint) return null
  try {
    const response = await fetch(endpoint)
    return response.json()
  } catch (error) {
    console.log(error)
  }
}

const fetchWindGraph = async () => fetchData(process.env.SPIT_WINDMETER_API)
const fetchGondolaData = async () => fetchData(process.env.GONDOLA_WINDMETER_API)

export { fetchWindGraph, fetchGondolaData }
