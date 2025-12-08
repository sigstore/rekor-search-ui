const nextJest = require("next/jest");

const createJestConfig = nextJest({
	dir: "./",
});

/** @type {import('jest').Config} */
const config = {
	// automatically clear mock calls and instances between every test
	clearMocks: true,

	// whether the coverage information should be collected while executing the test
	collectCoverage: true,

	// directory where Jest should output its coverage files
	coverageDirectory: "coverage",
	coverageProvider: "v8",

	globals: {
		"ts-jest": {
			tsconfig: "<rootDir>/tsconfig.test.json",
		},
	},

	moduleNameMapper: {
		// handle module aliases
		"^@/components/(.*)$": "<rootDir>/components/$1",
	},

	// add more setup options before each test is run
	setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

	testEnvironment: "jest-environment-jsdom",

	testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],

	transformIgnorePatterns: ["^.+\\.module\\.(css|sass|scss)$"],
	verbose: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = async () => {
	const fn = createJestConfig(config);
	const actualConfig = await fn();

	// 1. Locate the default pattern that ignores node_modules
	// (It usually looks like '/node_modules/' or 'node_modules/')
	const transformIgnorePatterns = actualConfig.transformIgnorePatterns.filter(
		pattern => pattern !== "/node_modules/" && pattern !== "node_modules/",
	);

	// 2. Add your whitelist pattern to the START of the list
	// We use a wildcard for hast-util-* and unist-util-* to catch the deep dependency tree
	return {
		...actualConfig,
		transformIgnorePatterns: [
			"node_modules/(?!(refractor|hastscript|hast-util-.*|unist-util-.*|vfile|vfile-location|property-information|space-separated-tokens|comma-separated-tokens|web-namespaces|html-void-elements|character-entities|zwitch|ccount|markdown-table)/)",
			...transformIgnorePatterns,
		],
	};
};
