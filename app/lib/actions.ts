'use server'

import type { GondolaApiResponse, SpitWindApiResponse } from '@/app/lib/definitions'
import { fetchData } from '@/app/lib/services/apiClient'

const fetchWindGraph = async () =>
  fetchData<SpitWindApiResponse>(`${process.env.SPIT_WINDMETER_API}&_=${Date.now()}`)
const fetchGondolaData = async () =>
  fetchData<GondolaApiResponse>(process.env.GONDOLA_WINDMETER_API)
const fetchVcliffeData = async () =>
  fetchData(`${process.env.VALLEYCLIFFE_WINDMETER_API}&_=${Date.now()}`)

export { fetchWindGraph, fetchGondolaData, fetchVcliffeData }
