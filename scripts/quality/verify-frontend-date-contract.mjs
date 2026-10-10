import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

// Comprueba integridad; no importa ni ejecuta el helper o las suites.
const fixtureRoot = new URL("../../tests/fixtures/frontend-date-contract/", import.meta.url);
const provenance = JSON.parse(readFileSync(new URL("provenance.json", fixtureRoot), "utf8"));
const source = readFileSync(new URL("src/utils/dateUtils.js", fixtureRoot));
assert.match(provenance.sourceRevision, /^[a-f0-9]{40}$/);
assert.match(provenance.sha256, /^[a-f0-9]{64}$/);
assert.equal(source.length, provenance.bytes, "Cambió el tamaño de la referencia de contrato");
assert.equal(createHash("sha256").update(source).digest("hex"), provenance.sha256, "Cambió la referencia de contrato sin actualizar su procedencia");
console.log(`Referencia de fechas íntegra: frontend ${provenance.sourceRevision}, SHA-256 ${provenance.sha256}`);
