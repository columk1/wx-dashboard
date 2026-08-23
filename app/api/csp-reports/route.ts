const getString = (value: unknown) =>
	typeof value === 'string' ? value.slice(0, 2_048) : undefined

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null

const logReport = (report: unknown) => {
	if (!isRecord(report)) {
		console.warn('Received an invalid Content Security Policy report')
		return
	}

	const details = isRecord(report.body)
		? report.body
		: isRecord(report['csp-report'])
			? report['csp-report']
			: undefined

	if (!details) {
		console.warn('Received an invalid Content Security Policy report')
		return
	}

	console.warn('Content Security Policy violation', {
		blockedURL: getString(details.blockedURL ?? details['blocked-uri']),
		directive: getString(
			details.effectiveDirective ?? details['violated-directive'],
		),
		documentURL: getString(details.documentURL ?? details['document-uri']),
		originalPolicy: getString(
			details.originalPolicy ?? details['original-policy'],
		),
	})
}

export async function POST(request: Request) {
	try {
		const payload: unknown = await request.json()
		const reports = Array.isArray(payload) ? payload : [payload]

		reports.slice(0, 10).forEach(logReport)
	} catch {
		console.warn('Received an invalid Content Security Policy report')
	}

	return new Response(null, { status: 204 })
}
