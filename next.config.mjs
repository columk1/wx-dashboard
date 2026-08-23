/** @type {import('next').NextConfig} */
const nextConfig = {
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
