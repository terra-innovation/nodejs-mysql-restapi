import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, it, vi } from "vitest";
import { createEnvironment, createPlan, executePlan, parseArguments } from "#root/scripts/quality/ci-runner.js";

const plan = () => createPlan("all", "base-commit");
const statuses = (failure?: string) => {
  const run = vi.fn((step: { id: string }) => ({ exitCode: step.id === failure ? 1 : 0 }));
  return { run, results: executePlan(plan(), run) };
};

it("exige base explícita y rechaza opciones que pudieran omitir controles", () => {
  expect(() => parseArguments([])).toThrow("--base");
  expect(() => parseArguments(["--base"])).toThrow("Falta");
  expect(() => parseArguments(["--skip-tests"])).toThrow("no admitido");
  expect(() => parseArguments(["--scope", "quality", "--scope", "integration"])).toThrow("repetido");
  expect(parseArguments(["--scope", "integration", "--plan"])).toMatchObject({ scope: "integration", plan: true });
  expect(parseArguments([], "pr-base-sha").base).toBe("pr-base-sha");
});

it("conserva los comandos de ambos jobs del workflow y la cobertura de CI", () => {
  const workflow = readFileSync(new URL("../../../.github/workflows/backend-quality.yml", import.meta.url), "utf8");
  const scripts = [...workflow.matchAll(/npm run ([\w:-]+)/g)].map((match) => match[1]);
  expect(
    new Set(
      plan()
        .filter((step) => step.command[0] === "npm")
        .map((step) => step.command[1]),
    ),
  ).toEqual(new Set(scripts));
  const verifiers = [...workflow.matchAll(/node (scripts\/quality\/[\w-]+\.mjs)/g)].map((match) => match[1]);
  expect(
    new Set(
      plan()
        .filter((step) => step.command[0] === "node")
        .map((step) => step.command[1]),
    ),
  ).toEqual(new Set(verifiers));
  expect(plan().find((step) => step.id === "vitest")!.command).toEqual(["npm", "test:vitest:ci"]);
  expect(plan().find((step) => step.id === "format")!.command).toEqual(["npm", "format:changed", "--", "--base", "base-commit"]);
  expect(plan().some((step) => /prisma-sync|build-prod|db:ddl/.test(step.command.join(" ")))).toBe(false);
});

it("aprueba solo si todos los controles terminaron con salida cero", () => {
  const { results, run } = statuses();
  expect(run).toHaveBeenCalledTimes(plan().length);
  expect(results.every((result) => result.status === "passed")).toBe(true);
});

it("un fallo de tipos no oculta otros diagnósticos y bloquea integración", () => {
  const { results } = statuses("types");
  expect(results.find((result) => result.id === "types")?.status).toBe("failed");
  for (const id of ["lint", "format", "vitest", "build"]) expect(results.find((result) => result.id === id)?.status).toBe("passed");
  for (const id of ["doctor", "integration", "evidence"]) expect(results.find((result) => result.id === id)?.status).toBe("skipped");
});

it("sin cliente Prisma omite los consumidores pero conserva lint y formato", () => {
  const { results } = statuses("prisma");
  for (const id of ["types", "frontend-contract", "vitest", "build"]) expect(results.find((result) => result.id === id)?.status).toBe("skipped");
  for (const id of ["lint", "format"]) expect(results.find((result) => result.id === id)?.status).toBe("passed");
});

it("si falla la referencia de fechas no lanza Vitest y no pierde el fallo", () => {
  const { results } = statuses("frontend-contract");
  expect(results.find((result) => result.id === "frontend-contract")?.status).toBe("failed");
  expect(results.find((result) => result.id === "vitest")?.status).toBe("skipped");
});

it("comprueba evidencia y limpieza aun si el runner de MariaDB falla", () => {
  const { results, run } = statuses("integration");
  expect(results.find((result) => result.id === "integration")?.status).toBe("failed");
  expect(results.find((result) => result.id === "evidence")?.status).toBe("passed");
  expect(run.mock.calls.at(-1)?.[0].id).toBe("evidence");
  const blocked = statuses("doctor").results;
  expect(blocked.find((result) => result.id === "integration")?.status).toBe("skipped");
  expect(blocked.find((result) => result.id === "evidence")?.status).toBe("skipped");
});

it("las variantes conservan prerrequisitos sin ejecutar grupos ajenos", () => {
  expect(createPlan("quality", "base").every((step) => step.group === "quality")).toBe(true);
  const integration = createPlan("integration");
  expect(integration.map((step) => step.id)).toEqual(["prisma", "doctor", "integration", "evidence"]);
  expect(executePlan(integration, () => ({ exitCode: 0 })).every((result) => result.status === "passed")).toBe(true);
});

it("inyecta el fixture sintético y la referencia de CI sin mutar el entorno padre", () => {
  const inherited = { APP_ENV_FILE: "local.env", CI: "false", LIQUIDACION_FRONTEND_ROOT: "otro-checkout", PRISMA_DATABASE_FACTORING_URL: "inherited" };
  const fixture = { PRISMA_DATABASE_FACTORING_URL: "synthetic-only" };
  const env = createEnvironment(inherited, fixture, { quick: true }, "/checkout", "2026-10-17T00:00:00Z");
  expect(env.PRISMA_DATABASE_FACTORING_URL).toBe("synthetic-only");
  expect(env.APP_ENV_FILE).toBeUndefined();
  expect(env).toMatchObject({ CI: "true", TZ: "UTC", NODE_ENV: "test", CI_INTEGRATION_STARTED_AT: "2026-10-17T00:00:00Z" });
  expect(env.LIQUIDACION_FRONTEND_ROOT).toBe(path.join("/checkout", "tests/fixtures/frontend-date-contract"));
  expect(inherited.APP_ENV_FILE).toBe("local.env");
  expect(createEnvironment(inherited, fixture, { production: true }, "/checkout").NODE_ENV).toBe("production");
});
