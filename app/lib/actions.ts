'use server'

import type { GondolaApiResponse, SpitWindApiResponse } from '@/app/lib/definitions'

const fetchData = async <T>(endpoint?: string): Promise<T | null> => {
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

const fetchWindGraph = async () =>
  fetchData<SpitWindApiResponse>(`${process.env.SPIT_WINDMETER_API}&_=${Date.now()}`)
const fetchGondolaData = async () =>
  fetchData<GondolaApiResponse>(process.env.GONDOLA_WINDMETER_API)
const fetchVcliffeData = async () =>
  fetchData(`${process.env.VALLEYCLIFFE_WINDMETER_API}&_=${Date.now()}`)

export { fetchWindGraph, fetchGondolaData, fetchVcliffeData }
