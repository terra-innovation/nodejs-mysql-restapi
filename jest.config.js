export default {
  verbose: true,
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],
  transform: {
    // Prisma 7 conserva ESM; las suites existentes mantienen jest.mock en CommonJS.
    "[/\\\\]generated[/\\\\]prisma[/\\\\].+\\.ts$": [
      "<rootDir>/tests/transformers/prismaEsm.cjs",
      { tsconfig: "<rootDir>/tests/tsconfig.jest.json", useESM: true },
    ],
    "^.+\\.(ts|js)$": ["ts-jest", { tsconfig: "<rootDir>/tests/tsconfig.jest.json", useESM: true }],
  },
  moduleNameMapper: {
    "^file-type$": "<rootDir>/tests/mocks/fileTypeMock.ts",
    "^#root/(.*)\\.js$": ["<rootDir>/$1.ts", "<rootDir>/$1.js", "<rootDir>/$1"],
    "^#root/(.*)$": ["<rootDir>/$1.ts", "<rootDir>/$1.js", "<rootDir>/$1"],
    "^#src/(.*)\\.js$": ["<rootDir>/src/$1.ts", "<rootDir>/src/$1.js", "<rootDir>/src/$1"],
    "^#src/(.*)$": ["<rootDir>/src/$1.ts", "<rootDir>/src/$1.js", "<rootDir>/src/$1"],
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  roots: ["<rootDir>/tests/unit", "<rootDir>/tests/e2e"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "tests/e2e/index.test.ts"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/e2e/setup.ts"],
};
