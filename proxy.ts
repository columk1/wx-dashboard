import { type NextRequest, NextResponse } from 'next/server'

const isDevelopment = process.env.NODE_ENV === 'development'

const createContentSecurityPolicy = (nonce: string) =>
	[
		"default-src 'self'",
		`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval' https://va.vercel-scripts.com" : ''}`,
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' blob: data: https://canadarasp.com",
		"font-src 'self'",
		"connect-src 'self'",
		'frame-src https://chiefcam.com',
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'",
		...(isDevelopment
			? []
			: ["require-trusted-types-for 'script'", 'trusted-types nextjs']),
		'report-uri /api/csp-reports',
	].join('; ')

export function proxy(request: NextRequest) {
	const nonce = crypto.randomUUID()
	const contentSecurityPolicy = createContentSecurityPolicy(nonce)
	const requestHeaders = new Headers(request.headers)

	requestHeaders.set(
		'Content-Security-Policy-Report-Only',
		contentSecurityPolicy,
	)

	const response = NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	})

	response.headers.set(
		'Content-Security-Policy-Report-Only',
		contentSecurityPolicy,
	)

	return response
}

export const config = {
	matcher: [
		{
			source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
			missing: [
				{ type: 'header', key: 'next-router-prefetch' },
				{ type: 'header', key: 'purpose', value: 'prefetch' },
			],
		},
	],
}
