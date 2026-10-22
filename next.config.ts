import type { NextConfig } from 'next'

const isDevelopment = process.env.NODE_ENV === 'development'

const contentSecurityPolicy = [
	"default-src 'self'",
	// Next.js bootstrap scripts need inline execution without per-request nonces.
	`script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval' https://va.vercel-scripts.com" : ''}`,
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' blob: data: https://canadarasp.com",
	"font-src 'self'",
	"connect-src 'self'",
	'frame-src https://chiefcam.com',
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
	// Vercel Analytics assigns plain script URLs, so Trusted Types is not yet compatible.
	'report-uri /api/csp-reports',
].join('; ')

const nextConfig: NextConfig = {
	reactCompiler: true,
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{
						key: 'Content-Security-Policy',
						value: contentSecurityPolicy,
					},
					{
						key: 'Cross-Origin-Opener-Policy',
						value: 'same-origin',
					},
					{
						key: 'X-Frame-Options',
						value: 'DENY',
					},
				],
			},
		]
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'canadarasp.com',
				port: '',
				pathname: '**/*',
			},
		],
	},
	agentRules: false,
}

export default nextConfig
