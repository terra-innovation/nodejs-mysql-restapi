/** @type {import('jest').Config} */
export default {
  verbose: true,
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],
  transform: {
    "^.+\\.(ts|js)$": "ts-jest",
  },
  moduleNameMapper: {
    "^#root/(.*)$": "<rootDir>/$1",
    "^#src/(.*)$": "<rootDir>/src/$1",
  },
};
