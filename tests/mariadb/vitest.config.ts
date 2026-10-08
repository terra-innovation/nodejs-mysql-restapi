import { defineConfig } from "vitest/config";
import base from "../../vitest.config.js";

export default defineConfig({
  resolve: base.resolve,
  test: {
    environment: "node", globals: false,
    include: ["tests/mariadb/**/*.test.ts"],
    maxWorkers: 1, fileParallelism: false, isolate: true,
    clearMocks: true, restoreMocks: true, allowOnly: false,
    passWithNoTests: false, testTimeout: 15000, hookTimeout: 30000,
    coverage: { enabled: false },
    reporters: ["default", "junit"],
    outputFile: { junit: "coverage/mariadb/junit.xml" },
  },
});
