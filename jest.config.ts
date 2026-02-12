import type { Config } from "jest";

const config: Config = {
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
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"], // opcional
};

export default config;
