import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Solo lee evidencia de la ejecución actual; no conecta ni elimina recursos.
const root = new URL("../../", import.meta.url);
const read = (name) => JSON.parse(readFileSync(new URL(name, root), "utf8"));
const earliest = Date.parse(process.env.CI_INTEGRATION_STARTED_AT ?? "");
assert.ok(Number.isFinite(earliest), "Falta el inicio de la ejecución actual");
const report = read("coverage/mariadb/last-run.json");
assert.match(report.runId, /^[a-f0-9]{24}$/);
assert.ok(Date.parse(report.startedAt) >= earliest, "El reporte pertenece a una ejecución anterior");
assert.ok(Date.parse(report.finishedAt) >= Date.parse(report.startedAt), "El reporte no tiene un cierre válido");
assert.equal(report.status, "passed", "La integración no aprobó");
assert.equal(report.cleanup, "removed", "No se confirmó la eliminación del contenedor propio");
assert.equal(report.schemaHash, read("tests/mariadb/schema/baseline.json").sha256, "El esquema probado no coincide con el versionado");
const runtime = read(`coverage/mariadb/runtime/result-${report.runId}.json`);
assert.equal(runtime.runId, report.runId);
assert.equal(runtime.status, "passed", "El runtime no aprobó");
assert.equal(runtime.platform, process.platform);
assert.equal(runtime.arch, process.arch);
assert.equal(runtime.node, process.version);
assert.equal(runtime.compilation?.sourceTypecheck, "passed");
assert.equal(runtime.compilation?.isolatedOutput, true);
assert.ok(runtime.cases?.length > 0 && runtime.cases.every((item) => item.passed === true));
if (process.platform === "linux") {
  assert.ok(
    runtime.cases.some((item) => item.signalDelivery === "native-SIGTERM"),
    "Falta evidencia de SIGTERM nativo",
  );
}
console.log(`Integración y runtime aprobados: ${report.runId}; contenedor eliminado; ${runtime.platform}/${runtime.arch}.`);
