const fetchWindGraph = async () => {
  const endpoint = process.env.VITE_WINDGRAPH_URL
  if (!endpoint) return null
  try {
    const response = await fetch(endpoint)
    return response.json()
  } catch (error) {
    console.log(error)
  }
}

export { fetchWindGraph }
