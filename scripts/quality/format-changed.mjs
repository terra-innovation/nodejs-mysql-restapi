import { execFileSync } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as prettier from "prettier";

// Usa Git y la API local de Prettier: sin shells, descargas ni ejecución del código inspeccionado.
const root = realpathSync(fileURLToPath(new URL("../../", import.meta.url)));
const args = process.argv.slice(2);
const mode = args.shift();
if (!["--check", "--write"].includes(mode) || (args.length !== 0 && (args.length !== 2 || args[0] !== "--base"))) {
  console.error("Uso: node scripts/quality/format-changed.mjs <--check|--write> [--base <revision>]");
  process.exit(2);
}
const git = (...options) => execFileSync("git", options, { cwd: root, encoding: "utf8" });
const split = (output) => output.split("\0").filter(Boolean);
const changed = new Set();
if (args.length) {
  // Resolver primero la referencia evita interpretar un argumento como una opción de Git.
  const base = git("rev-parse", "--verify", "--end-of-options", `${args[1]}^{commit}`).trim();
  for (const name of split(git("diff", "--name-only", "--diff-filter=ACMR", "-z", `${base}...HEAD`, "--"))) changed.add(name);
}
for (const options of [
  ["diff", "--name-only", "--diff-filter=ACMR", "-z", "--"],
  ["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z", "--"],
  ["ls-files", "--others", "--exclude-standard", "-z"],
]) {
  for (const name of split(git(...options))) changed.add(name);
}

const inScope = (name) => /^(src|tests)\/.*\.(ts|tsx|js|jsx|mjs|cjs)$/.test(name) || /^scripts\/.*\.(ts|js|mjs|cjs)$/.test(name) || /^[^/]+\.(json|js|mjs|cjs)$/.test(name);
let checked = 0;
let differences = 0;
for (const name of [...changed].sort()) {
  if (!inScope(name)) continue;
  const candidate = path.resolve(root, name);
  if (!existsSync(candidate)) continue;
  const relative = path.relative(root, realpathSync(candidate));
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`Ruta fuera del repositorio: ${name}`);
  const info = await prettier.getFileInfo(candidate, { ignorePath: [path.join(root, ".gitignore"), path.join(root, ".prettierignore")] });
  if (info.ignored || !info.inferredParser) continue;
  const options = { ...(await prettier.resolveConfig(candidate)), filepath: candidate };
  const input = await readFile(candidate, "utf8");
  checked++;
  if (await prettier.check(input, options)) continue;
  differences++;
  console.log(`${mode === "--write" ? "Formateado" : "Pendiente"}: ${name}`);
  if (mode === "--write") await writeFile(candidate, await prettier.format(input, options));
}
console.log(`Formato: ${checked} archivos revisados; ${differences} ${mode === "--write" ? "formateados" : "con diferencias"}.`);
if (mode === "--check" && differences) process.exitCode = 1;
