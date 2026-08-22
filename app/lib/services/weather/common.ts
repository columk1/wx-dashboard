import 'server-only'

export const fetchJson = async <T>(endpoint?: string): Promise<T> => {
	if (!endpoint) throw new Error('Missing weather API endpoint')

	const response = await fetch(endpoint, { cache: 'no-store' })

	if (!response.ok) {
		throw new Error(
			`Weather request failed with ${response.status} ${response.statusText}`,
		)
	}

	return response.json() as Promise<T>
}

export const withWeatherFallback = async <T>(
	label: string,
	loader: () => Promise<T>,
): Promise<T | null> => {
	try {
		return await loader()
	} catch (error) {
		console.error(`${label} loader failed`, error)
		return null
	}
}
