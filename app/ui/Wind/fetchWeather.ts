export const fetchWeather = async <T>(url: string): Promise<T> => {
	const response = await fetch(url)

	if (!response.ok) {
		throw new Error(`Weather request failed with ${response.status}`)
	}

	return response.json()
}
