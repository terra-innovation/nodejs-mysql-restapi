// Auditoría de las funciones reales de fechas de React; no modifica el frontend.
const fs = require("fs");
const vm = require("vm");
const ts = require("typescript");
const path = require("path");

const frontendRoot = process.env.LIQUIDACION_FRONTEND_ROOT || "D:/10_Workspace_react/ft-app-frontend-mantis";
const sourcePath = ["src/utils/dateUtils.ts", "src/utils/dateUtils.js"].map((relative) => path.join(frontendRoot, relative)).find((candidate) => fs.existsSync(candidate));
if (!sourcePath) throw new Error("No se encontró dateUtils.ts/js en el frontend configurado.");
const source = fs.readFileSync(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  fileName: sourcePath,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const exported = {};
vm.runInNewContext(compiled, {
  exports: exported,
  require: (name) => {
    if (name !== "luxon") throw new Error(`Importación no prevista en dateUtils: ${name}`);
    return require("luxon");
  },
  Date,
  console,
});
const selectedDate = process.argv[2];
const iso = exported.toIsoUtcFromLima(selectedDate);
const invoiceDate = process.argv[3];
process.stdout.write(
  JSON.stringify({
    zone: process.env.TZ,
    selectedDate,
    iso,
    recoveredDate: exported.toDateInputValueLima(iso),
    ...(invoiceDate ? { invoiceInput: exported.toDateInputValue(invoiceDate), invoiceLabel: exported.formatDateUTC(invoiceDate) } : {}),
  }),
);
