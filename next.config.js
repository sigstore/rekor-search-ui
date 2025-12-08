/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	transpilePackages: [
	  "refractor",
	  "hastscript",
	  "hast-util-parse-selector",
	  "hast-util-to-string",
	  "unist-util-filter",
	  "unist-util-visit",
	  "unist-util-visit-parents",
	  "unist-util-is",
	  "vfile",
	  "vfile-location",
	  "property-information",
	  "space-separated-tokens",
	  "comma-separated-tokens",
	  "web-namespaces",
	  "html-void-elements",
	  "character-entities",
	],
	output: "export",
};

module.exports = nextConfig;
