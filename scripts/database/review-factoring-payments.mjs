import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import mariadb from 'mariadb';
import { root, readDevelopmentTarget, safeError } from './maintenance-core.mjs';

// Auditoría de desarrollo: solo SELECT y metadatos, sin filas de clientes.
const report = { reviewedAt: new Date().toISOString(), source: '.env.development', mode: 'READ ONLY', status: 'preparing' };
const output = path.join(root, `docs/registros/bbdd/revision-pagos-factoring-${report.reviewedAt.replace(/[:.]/g, '-')}.json`);
let connection;
let stage = 'environment';
try {
  const target = await readDevelopmentTarget();
  report.targetFingerprint = target.fingerprint;
  report.runtime = { version: process.version, executable: process.execPath };
  stage = 'connection';
  connection = await mariadb.createConnection(target.options);
  await connection.query("SET SESSION time_zone = '+00:00'");
  await connection.query('SET SESSION TRANSACTION READ ONLY');
  await connection.query('START TRANSACTION WITH CONSISTENT SNAPSHOT');
  stage = 'metadata';
  const tables = ['factoring_pago', 'factoring', 'factoring_propuesta', 'factor_transaccion_bancaria'];
  report.tables = await connection.query('SELECT TABLE_NAME AS name, ENGINE AS engine FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN (?,?,?,?) ORDER BY TABLE_NAME', tables);
  if (report.tables.length !== tables.length) throw new Error('Required tables unavailable');
  report.paymentColumns = await connection.query("SELECT COLUMN_NAME AS name, COLUMN_TYPE AS type, IS_NULLABLE AS nullable FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='factoring_pago' ORDER BY ORDINAL_POSITION");
  report.referencesToPayments = await connection.query("SELECT TABLE_NAME AS tableName, COLUMN_NAME AS columnName, REFERENCED_COLUMN_NAME AS paymentColumn FROM information_schema.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_SCHEMA=DATABASE() AND REFERENCED_TABLE_NAME='factoring_pago' ORDER BY TABLE_NAME,COLUMN_NAME");
  stage = 'aggregates';
  const legacy = report.paymentColumns.some(c => c.name === 'monto_pagado');
  report.model = legacy ? 'ABONOS_LEGADOS' : 'MAESTRO_DETALLE';
  if (!legacy) {
    [report.payments] = await connection.query('SELECT COUNT(*) AS total,COUNT(DISTINCT _idfactoring) AS operations,COALESCE(SUM(estado=1),0) AS active FROM factoring_pago');
    [report.details] = await connection.query('SELECT COUNT(*) AS total,COALESCE(SUM(estado=1),0) AS active,COALESCE(SUM(estado=2),0) AS deleted FROM factoring_pago_detalle');
    [report.bankMovements] = await connection.query('SELECT COUNT(*) AS total,COALESCE(SUM(estado=1 AND signo=1),0) AS activeCredits FROM factor_transaccion_bancaria');
    [report.pendingMasters] = await connection.query('SELECT COUNT(*) AS total FROM factoring f WHERE f.estado=1 AND f.fecha_operacion IS NOT NULL AND NOT EXISTS(SELECT 1 FROM factoring_pago p WHERE p._idfactoring=f._idfactoring)');
  } else {
  [report.payments] = await connection.query(`SELECT COUNT(*) AS total,
    COUNT(DISTINCT _idfactoring) AS operations,
    COALESCE(SUM(estado=1),0) AS active,
    COALESCE(SUM(estado=2),0) AS deleted,
    COALESCE(SUM(estado NOT IN (1,2)),0) AS otherStates,
    COALESCE(SUM(monto_pagado<=0),0) AS nonPositiveAmounts,
    COALESCE(SUM(TRIM(numero_operacion)=''),0) AS emptyBankNumbers
    FROM factoring_pago`);
  [report.multiplePayments] = await connection.query(`SELECT COUNT(*) AS operationsWithMultipleRows,
    COALESCE(MAX(n),0) AS largestRowCountPerOperation
    FROM (SELECT COUNT(*) n FROM factoring_pago GROUP BY _idfactoring HAVING COUNT(*)>1) groupedPayments`);
  [report.duplicatePairs] = await connection.query(`SELECT COUNT(*) AS groupsWithRepeatedBankReference
    FROM (SELECT 1 FROM factoring_pago GROUP BY _idfactoring,_idfactorcuentabancaria,numero_operacion,DATE(fecha_pago) HAVING COUNT(*)>1) groupedPayments`);
  [report.paymentIntegrity] = await connection.query(`SELECT
    COALESCE(SUM(f._idfactoring IS NULL),0) AS missingOperation,
    COALESCE(SUM(f._idfactoring IS NOT NULL AND f._idfactoringpropuestaaceptada IS NULL),0) AS missingAcceptedProposal,
    COALESCE(SUM(p._idfactoringpropuesta IS NOT NULL AND p._idfactoring<>f._idfactoring),0) AS acceptedProposalFromOtherOperation,
    COALESCE(SUM(p._idfactoringpropuesta IS NULL AND f._idfactoringpropuestaaceptada IS NOT NULL),0) AS brokenAcceptedProposal,
    COALESCE(SUM(fcb._idfactor IS NOT NULL AND fcb._idfactor<>f._idfactor),0) AS bankAccountFromOtherFactor
    FROM factoring_pago fp LEFT JOIN factoring f ON f._idfactoring=fp._idfactoring
    LEFT JOIN factoring_propuesta p ON p._idfactoringpropuesta=f._idfactoringpropuestaaceptada
    LEFT JOIN factor_cuenta_bancaria fcb ON fcb._idfactorcuentabancaria=fp._idfactorcuentabancaria`);
  [report.bankMovements] = await connection.query(`SELECT COUNT(*) AS total,
    COALESCE(SUM(estado=1 AND signo=1),0) AS activeCredits FROM factor_transaccion_bancaria`);
  // El timestamp legado no acredita fecha civil Lima: medir ambas posibilidades
  // sin convertir ninguna coincidencia en una asociación aprobada.
  [report.bankCandidates] = await connection.query(`SELECT COUNT(*) AS examinedPayments,
    COALESCE(SUM(utcCandidates=0),0) AS withoutUtcDateCandidate,
    COALESCE(SUM(utcCandidates=1),0) AS singleUtcDateCandidate,
    COALESCE(SUM(utcCandidates>1),0) AS ambiguousUtcDateCandidates,
    COALESCE(SUM(limaCandidates=0),0) AS withoutLimaDateCandidate,
    COALESCE(SUM(limaCandidates=1),0) AS singleLimaDateCandidate,
    COALESCE(SUM(limaCandidates>1),0) AS ambiguousLimaDateCandidates
    FROM (SELECT
      (SELECT COUNT(*) FROM factor_transaccion_bancaria b WHERE b._idfactorcuentabancaria=fp._idfactorcuentabancaria AND b.numero_operacion=fp.numero_operacion AND b.fecha=DATE(fp.fecha_pago) AND b.estado=1 AND b.signo=1 AND b.monto>=fp.monto_pagado) utcCandidates,
      (SELECT COUNT(*) FROM factor_transaccion_bancaria b WHERE b._idfactorcuentabancaria=fp._idfactorcuentabancaria AND b.numero_operacion=fp.numero_operacion AND b.fecha=DATE(DATE_SUB(fp.fecha_pago,INTERVAL 5 HOUR)) AND b.estado=1 AND b.signo=1 AND b.monto>=fp.monto_pagado) limaCandidates
      FROM factoring_pago fp WHERE fp.estado=1) candidateCounts`);
  report.candidateLimit = 'Coincidencias exploratorias por cuenta, número, fecha y monto suficiente. No acreditan pagador, moneda, disponibilidad global ni asociación autorizada. No se publican filas ni importes.';
  }
  await connection.query('ROLLBACK');
  report.status = 'reviewed';
} catch (error) {
  report.status = 'failed';
  report.failedStage = stage;
  report.error = safeError(error);
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(report, (_key, value) => typeof value === 'bigint' ? value.toString() : value, 2) + '\n');
console.log(JSON.stringify({ status: report.status, output, payments: report.payments, multiplePayments: report.multiplePayments, bankMovements: report.bankMovements, failedStage: report.failedStage, error: report.error }, (_key, value) => typeof value === 'bigint' ? value.toString() : value));
