/** @type {import('next').NextConfig} */
const nextConfig = {
	reactCompiler: true,
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
