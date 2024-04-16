'use server'

const fetchData = async (endpoint?: string, revalidateLifetime = 0, tags?: string[]) => {
  if (!endpoint) return null
  try {
    const response = revalidateLifetime
      ? await fetch(endpoint, { next: { revalidate: revalidateLifetime, tags: tags } })
      : await fetch(endpoint)
    return response.json()
  } catch (error) {
    console.log(error)
  }
}

const fetchWindGraph = async () => fetchData(process.env.WINDGRAPH_URL)
const fetchGondolaData = async () => fetchData(process.env.GONDOLA_API_URL, 10)

export { fetchWindGraph, fetchGondolaData }
