import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	reactCompiler: true,
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
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
