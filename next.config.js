const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	sassOptions: {
		includePaths: [path.join(__dirname, "styles")],
	},
	experimental: {
		concurrentFeatures: true,
		outputStandalone: true,
	},
};

module.exports = nextConfig;
