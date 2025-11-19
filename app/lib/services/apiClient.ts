export const fetchData = async <T>(endpoint?: string): Promise<T | null> => {
  if (!endpoint) return null
  try {
    const response = await fetch(endpoint)
    if (!response.ok) console.log(response.statusText)
    return (await response.json()) as T
  } catch (error) {
    console.log(error)
    return null
  }
}
