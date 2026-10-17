import { execFileSync, spawnSync } from "node:child_process";
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "dotenv";

type Scope = "all" | "quality" | "integration";
type Step = { id: string; command: string[]; group: "quality" | "integration"; dependencies?: string[]; afterExecution?: string; production?: boolean; quick?: boolean };
type Result = { id: string; status: "passed" | "failed" | "skipped"; exitCode?: number; log?: string };
const root = fileURLToPath(new URL("../../", import.meta.url));

export function parseArguments(args: string[], defaultBase?: string) {
  let scope: Scope = "all";
  let base = defaultBase;
  let plan = false;
  let help = false;
  const seen = new Set<string>();
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (seen.has(arg)) throw new Error(`Argumento repetido: ${arg}`);
    seen.add(arg);
    if (arg === "--plan") plan = true;
    else if (arg === "--help") help = true;
    else if (arg === "--base" || arg === "--scope") {
      const value = args[++i];
      if (!value || value.startsWith("--")) throw new Error(`Falta el valor de ${arg}`);
      if (arg === "--base") base = value;
      else {
        if (!["all", "quality", "integration"].includes(value)) throw new Error("Scope válido: all, quality o integration.");
        scope = value as Scope;
      }
    } else throw new Error(`Argumento no admitido: ${arg}`);
  }
  if (!help && scope !== "integration" && !base?.trim()) throw new Error("Indique --base <SHA o referencia de la base del PR>; no se asumirá HEAD^.");
  return { scope, base, plan, help };
}

export function createPlan(scope: Scope, base?: string): Step[] {
  const quality: Step[] = [
    { id: "prisma", command: ["npm", "prisma:generate:ci"], group: "quality" },
    { id: "types", command: ["npm", "typecheck:all"], group: "quality", dependencies: ["prisma"] },
    { id: "lint", command: ["npm", "lint"], group: "quality" },
    { id: "format", command: ["npm", "format:changed", "--", "--base", base!], group: "quality" },
    { id: "frontend-contract", command: ["node", "scripts/quality/verify-frontend-date-contract.mjs"], group: "quality", dependencies: ["prisma"], quick: true },
    { id: "vitest", command: ["npm", "test:vitest:ci"], group: "quality", dependencies: ["frontend-contract"], quick: true },
    { id: "build", command: ["npm", "build"], group: "quality", dependencies: ["prisma"], production: true },
  ];
  const prerequisite = scope === "all" ? quality.map((step) => step.id) : [];
  const integration: Step[] = [...(scope === "integration" ? [{ id: "prisma", command: ["npm", "prisma:generate:ci"], group: "integration" as const }] : []), { id: "doctor", command: ["npm", "test:integration:doctor"], group: "integration", dependencies: prerequisite }, { id: "integration", command: ["npm", "test:integration"], group: "integration", dependencies: ["doctor", "prisma"] }, { id: "evidence", command: ["node", "scripts/quality/verify-integration-report.mjs"], group: "integration", afterExecution: "integration" }];
  return scope === "quality" ? quality : scope === "integration" ? integration : [...quality, ...integration];
}

// Inyección del ejecutor permite comprobar fallos y dependencias sin lanzar pruebas, builds o Docker.
export function executePlan(steps: Step[], run: (step: Step) => Omit<Result, "id" | "status">): Result[] {
  const results: Result[] = [];
  for (const step of steps) {
    const status = (id: string) => results.find((result) => result.id === id)?.status;
    const skip = step.afterExecution ? !["passed", "failed"].includes(status(step.afterExecution) ?? "") : (step.dependencies ?? []).some((id) => status(id) !== "passed");
    if (skip) results.push({ id: step.id, status: "skipped" });
    else {
      const result = run(step);
      results.push({ id: step.id, status: result.exitCode === 0 ? "passed" : "failed", ...result });
    }
  }
  return results;
}

export function createEnvironment(inherited: NodeJS.ProcessEnv, fixture: Record<string, string>, step: Pick<Step, "quick" | "production">, projectRoot: string, integrationStartedAt?: string) {
  const env: NodeJS.ProcessEnv = { ...inherited, CI: "true", TZ: "UTC" };
  // Una selección local de archivo no forma parte del entorno del workflow.
  delete env.APP_ENV_FILE;
  if (step.quick) {
    Object.assign(env, fixture, { CI: "true", TZ: "UTC", NODE_ENV: "test", LIQUIDACION_FRONTEND_ROOT: path.join(projectRoot, "tests/fixtures/frontend-date-contract") });
  }
  if (step.production) env.NODE_ENV = "production";
  if (integrationStartedAt) env.CI_INTEGRATION_STARTED_AT = integrationStartedAt;
  return env;
}

function main() {
  const options = parseArguments(process.argv.slice(2), process.env.FORMAT_BASE);
  if (options.help) {
    console.info("npm run ci:check -- --base <revision> [--plan]\nnpm run ci:quality -- --base <revision> [--plan]\nnpm run ci:integration -- [--plan]\nNo instala dependencias ni ejecuta build-prod o mantenimiento de BBDD. Ver docs/ci/validacion-pre-pr.md.");
    return;
  }
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  if (process.versions.node !== readFileSync(path.join(root, ".node-version"), "utf8").trim()) throw new Error("Seleccione la versión exacta de Node indicada en .node-version.");
  const npmCli = process.env.npm_execpath;
  if (!npmCli) throw new Error("Ejecutar mediante npm run ci:check, ci:quality o ci:integration.");
  const npmVersion = execFileSync(process.execPath, [npmCli, "--version"], { encoding: "utf8", windowsHide: true }).trim();
  if (`npm@${npmVersion}` !== pkg.packageManager) throw new Error("Seleccione la versión exacta de npm declarada en packageManager.");
  const git = (...args: string[]) => execFileSync("git", args, { cwd: root, encoding: "utf8", windowsHide: true }).trim();
  const base = options.scope === "integration" ? undefined : git("rev-parse", "--verify", "--end-of-options", `${options.base}^{commit}`);
  const mergeBase = base ? git("merge-base", base, "HEAD") : undefined;
  const steps = createPlan(options.scope, base);
  if (options.plan) {
    console.info(JSON.stringify({ scope: options.scope, base, mergeBase, node: process.versions.node, npm: npmVersion, steps, note: "Plan únicamente; no se ejecutaron controles ni se escribieron informes." }, null, 2));
    return;
  }
  if (options.scope !== "integration" && existsSync(path.join(root, ".env.test"))) throw new Error("Use un checkout aislado sin .env.test local para reproducir el fixture del backend en CI. No se sobrescribió ningún perfil.");
  const fixture = parse(readFileSync(path.join(root, "tests/fixtures/ci-quick.env")));
  const startedAt = new Date().toISOString();
  const commit = git("rev-parse", "HEAD");
  const dirty = git("status", "--porcelain").length > 0;
  let integrationStartedAt: string | undefined;
  const results = executePlan(steps, (step) => {
    if (step.id === "integration") integrationStartedAt = new Date().toISOString();
    const relativeLog = step.id === "build" ? "docs/registros/compilaciones/build-ci-backend.log" : `docs/registros/pruebas/test-ci-backend-${step.id}.log`;
    const log = path.join(root, relativeLog);
    mkdirSync(path.dirname(log), { recursive: true });
    const descriptor = openSync(log, "w");
    let result;
    try {
      const [kind, ...args] = step.command;
      result = spawnSync(process.execPath, kind === "npm" ? [npmCli, "run", "--silent", ...args] : args, {
        cwd: root,
        shell: false,
        windowsHide: true,
        stdio: ["ignore", descriptor, descriptor],
        env: createEnvironment(process.env, fixture, step, root, integrationStartedAt),
      });
    } finally {
      closeSync(descriptor);
    }
    const exitCode = result.status ?? 1;
    console.info(`${step.id}: ${exitCode === 0 ? "APROBADO" : "FALLÓ"}; ${relativeLog}`);
    if (result.error) console.error(`${step.id}: no se pudo completar el proceso (${result.error.code ?? "sin código"}).`);
    return { exitCode, log: relativeLog };
  });
  const report = { startedAt, finishedAt: new Date().toISOString(), commit, dirty, base, mergeBase, scope: options.scope, platform: process.platform, arch: process.arch, node: process.versions.node, npm: npmVersion, results };
  const summary = path.join(root, "docs/registros/pruebas/test-ci-backend-summary.json");
  mkdirSync(path.dirname(summary), { recursive: true });
  writeFileSync(summary, JSON.stringify(report, null, 2) + "\n");
  for (const result of results.filter((item) => item.status === "skipped")) console.info(`${result.id}: OMITIDO por un requisito fallido; no cuenta como aprobado.`);
  console.info("Resumen: docs/registros/pruebas/test-ci-backend-summary.json");
  if (results.some((result) => result.status !== "passed")) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : "No se pudo preparar la validación.");
    process.exitCode = 1;
  }
}
