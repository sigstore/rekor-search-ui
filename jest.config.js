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

	transformIgnorePatterns: [
		"/node_modules/",
		"^.+\\.module\\.(css|sass|scss)$",
	],
	verbose: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config);
