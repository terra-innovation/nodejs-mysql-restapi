import { PrismaClient } from "#root/generated/prisma/ft_factoring/client.js";
import { createMariaDbAdapter } from "#src/models/prisma/mariadbAdapter.js";
import { assertTestTarget, connect, guardTable, loadBaseline, quoteIdentifier } from "../../scripts/integration/mariadb-common.mjs";

// Validar identidad antes de permitir que los servicios importados obtengan el cliente.
const runId = process.env.FT_INTEGRATION_RUN_ID;
const url = process.env.FT_INTEGRATION_DATABASE_URL;
const options = assertTestTarget(url, runId);
const baseline = await loadBaseline();
const connection = await connect(options);
try {
  const rows = await connection.query(`SELECT * FROM ${quoteIdentifier(guardTable)} WHERE run_id=?`, [runId]);
  if (rows.length !== 1 || rows[0].schema_hash !== baseline.sha256) throw new Error("Base ajena o estructura incorrecta.");
} finally { await connection.end(); }
export const db = new PrismaClient({ adapter: createMariaDbAdapter(url) });

export async function seedMasters() {
  await db.documento_tipo.create({ data: { iddocumentotipo: 1, nombre: "Prueba", alias: "PRUEBA" } });
  const usuario = await db.usuario.create({ data: { code: "IT-USUARIO", iddocumentotipo: 1, documentonumero: "IT-0001", usuarionombres: "Sintetico", apellidopaterno: "Prueba", apellidomaterno: "Prueba", email: "it@example.test", celular: "000000000", hash: "it-hash" } });
  await db.archivo_estado.create({ data: { idarchivoestado: 1, nombre: "Prueba" } });
  for (const id of [8, 9]) await db.archivo_tipo.create({ data: { idarchivotipo: id, nombre: `Prueba ${id}`, extensiones_permitidas: "xml,pdf", mimetypes_permitidos: "application/xml,application/pdf" } });
  for (const codigo of ["PEN", "USD"]) await db.moneda.create({ data: { idmoneda: codigo === "PEN" ? 1 : 2, code: codigo, codigo, nombre: codigo, alias: codigo, simbolo: codigo === "PEN" ? "S/" : "$", color: "blue" } });
  return usuario;
}

export async function seedAuthorization(idusuario: number) {
  for (const idrol of [2, 3, 4, 5, 6]) {
    await db.rol.create({ data: { idrol, code: `IT-${idrol}`, codigo: `IT-${idrol}`, nombre: "Sintético", alias: "IT" } });
    await db.usuario_rol.create({ data: { idusuario, idrol } });
  }
}

export async function seedApproval(idusuario: number) {
  await db.factoring_cartera.create({ data: { idfactoringcartera: 1, code: "IT-CARTERA", estado1: "Prueba" } });
  for (const id of [3, 4]) await db.factoring_estado.create({ data: { idfactoringestado: id, code: `IT-${id}`, estado1: "Prueba", estado2: "Prueba" } });
  for (const id of [4, 6]) await db.factoring_propuesta_estado.create({ data: { idfactoringpropuestaestado: id, code: `IT-${id}`, nombre: "Prueba", alias: "Prueba", color: "blue" } });
  const empresas = [];
  for (const i of [1, 2, 3]) empresas.push(await db.empresa.create({ data: { code: `IT-EMP-${i}`, ruc: `2000000000${i}`, razon_social: `Empresa sintetica ${i}` } }));
  const servicio = await db.servicio.create({ data: { code: "IT-SERVICIO", nombre: "Prueba", alias: "Prueba", descripcion: "Sintetico", urlcontrato: "", pathroute: "" } });
  await db.usuario_servicio_empresa_estado.create({ data: { idusuarioservicioempresaestado: 1, code: "IT", nombre: "Prueba", alias: "Prueba", color: "blue" } });
  await db.usuario_servicio_empresa_rol.create({ data: { idusuarioservicioempresarol: 1, code: "IT", nombre: "Prueba", alias: "Prueba", color: "blue" } });
  await db.usuario_servicio_empresa.create({ data: { code: "IT-MIEMBRO", idusuario, idempresa: empresas[1].idempresa, idservicio: servicio.idservicio, idusuarioservicioempresaestado: 1, idusuarioservicioempresarol: 1 } });
  const moneda = await db.moneda.findFirstOrThrow({ where: { codigo: "PEN" } });
  const date = new Date("2026-10-01T00:00:00Z");
  const factor = await db.factor.create({ data: { idfactor: 1, code: "IT-FACTOR", ruc: "20000000009", razon_social: "Factor sintetico" } });
  const factoring = await db.factoring.create({ data: { code: "IT-FACTORING", idfactor: factor.idfactor, idcedente: empresas[1].idempresa, idaceptante: empresas[2].idempresa, idmoneda: moneda.idmoneda, idfactoringestado: 3, cantidad_facturas: 1, fecha_registro: date, fecha_emision: date, fecha_pago_estimado: date, monto_factura: 1180, monto_neto: 1180, monto_detraccion: 0, monto_retencion: 0 } });
  const propuesta = await db.factoring_propuesta.create({ data: { code: "IT-PROPUESTA", idfactoring: factoring.idfactoring, idfactoringpropuestaestado: 4, fecha_propuesta: date, fecha_pago_estimado: date, dias_pago_estimado: 30, dias_antiguedad_estimado: 0, monto_neto: 1180 } });
  return { factoring, propuesta, dto: { factoringid: factoring.factoringid, factoringpropuestaid: propuesta.factoringpropuestaid, idusuario } };
}

export async function cleanFixtures() {
  await db.usuario_rol.deleteMany({});
  await db.credencial.deleteMany({});
  await db.rol.deleteMany({});
  // Solo la base exclusiva verificada arriba; conservar FK activas y eliminar en orden.
  await db.factoring.updateMany({ data: { idfactoringpropuestaaceptada: null } });
  await db.factoring_simulacion_financiero.deleteMany({});
  await db.factoring_simulacion.deleteMany({});
  await db.factoring_propuesta_financiero.deleteMany({});
  await db.archivo_factoring_historial_estado.deleteMany({});
  for (const table of ["archivo_factoring_transferencia_cedente", "factoring_transferencia_cedente", "factoring_liquidacion_financiero", "factoring_liquidacion", "factor_cuenta_bancaria", "empresa_cuenta_bancaria", "factoring_transferencia_estado", "factoring_transferencia_tipo", "factoring_liquidacion_estado", "financiero_tipo", "financiero_concepto", "configuracion_app", "factoring_config_comision"]) await db.$executeRawUnsafe(`DELETE FROM ${quoteIdentifier(table)}`);
  const tables = ["factoring_propuesta_historial_estado", "factoring_historial_estado", "factoring_propuesta", "factoring_factura", "factoring", "contacto", "colaborador", "persona", "persona_verificacion_estado", "cuenta_bancaria", "cuenta_bancaria_estado", "cuenta_tipo", "banco", "factor_limite", "cedente_limite", "pagador_limite", "factor", "usuario_servicio_empresa", "usuario_servicio_empresa_rol", "usuario_servicio_empresa_estado", "servicio", "empresa", "factoring_propuesta_estado", "factoring_estado", "factoring_cartera", "archivo_factura", "factura_item", "factura_nota", "factura_impuesto", "factura_medio_pago", "factura_termino_pago", "factura", "archivo", "archivo_tipo", "archivo_estado", "moneda", "usuario", "documento_tipo"] as const;
  for (const table of tables) await db.$executeRawUnsafe(`DELETE FROM ${quoteIdentifier(table)}`);
  await db.riesgo.deleteMany({});
  await db.factoring_tipo.deleteMany({});
  await db.factoring_estrategia.deleteMany({});
}

export async function seedEntrepreneur(idusuario: number, currency = "PEN") {
  const cedente = await db.empresa.create({ data: { code: "IT-CEDENTE", ruc: "20100000001", razon_social: "Cedente sintetico" } });
  const pagador = await db.empresa.create({ data: { code: "IT-PAGADOR", ruc: "20600000002", razon_social: "Pagador sintetico" } });
  const servicio = await db.servicio.create({ data: { code: "IT-SERVICIO", nombre: "Prueba", alias: "Prueba", descripcion: "Sintetico", urlcontrato: "", pathroute: "" } });
  await db.usuario_servicio_empresa_estado.create({ data: { idusuarioservicioempresaestado: 1, code: "IT", nombre: "Prueba", alias: "Prueba", color: "blue" } });
  await db.usuario_servicio_empresa_rol.create({ data: { idusuarioservicioempresarol: 1, code: "IT", nombre: "Prueba", alias: "Prueba", color: "blue" } });
  await db.usuario_servicio_empresa.create({ data: { code: "IT-MIEMBRO", idusuario, idempresa: cedente.idempresa, idservicio: servicio.idservicio, idusuarioservicioempresaestado: 1, idusuarioservicioempresarol: 1 } });
  await db.factor.create({ data: { idfactor: 1, code: "IT-FACTOR", ruc: "20000000009", razon_social: "Factor sintetico" } });
  const moneda = await db.moneda.findFirstOrThrow({ where: { codigo: currency } });
  const amounts = { usado: 0, disponible: 1180, total: 1180, idmoneda: moneda.idmoneda };
  await db.factor_limite.create({ data: { code: "IT-FACTOR-LIM", idfactor: 1, ...amounts } });
  await db.cedente_limite.create({ data: { code: "IT-CEDENTE-LIM", idcedente: cedente.idempresa, ...amounts } });
  await db.pagador_limite.create({ data: { code: "IT-PAGADOR-LIM", idpagador: pagador.idempresa, ...amounts } });
  return { cedente, pagador, moneda };
}

export async function seedOperationDependencies(idusuario: number, currency = "PEN") {
  const parties = await seedEntrepreneur(idusuario, currency);
  await db.persona_verificacion_estado.create({ data: { idpersonaverificacionestado: 1, code: "IT", nombre: "Prueba", alias: "Prueba", color: "blue" } });
  const persona = await db.persona.create({ data: { code: "IT-PERSONA", idusuario, idpersonaverificacionestado: 1, documentonumero: "IT-0001", personanombres: "Sintetico", apellidopaterno: "Prueba", apellidomaterno: "Prueba", email: "it@example.test", celular: "000000000" } });
  await db.colaborador.create({ data: { code: "IT-COLABORADOR", idempresa: parties.cedente.idempresa, idpersona: persona.idpersona, nombrecolaborador: "Sintetico", apellidocolaborador: "Prueba", cargo: "Prueba", email: "it@example.test", telefono: "000", poderpartidanumero: "IT", poderpartidaciudad: "Prueba" } });
  const contacto = await db.contacto.create({ data: { code: "IT-CONTACTO", idempresa: parties.pagador.idempresa, nombrecontacto: "Prueba", email: "pagador@example.test" } });
  const banco = await db.banco.create({ data: { tipo: "Prueba", nombre: "Banco sintetico", alias: "IT" } });
  const tipo = await db.cuenta_tipo.create({ data: { nombre: "Prueba", alias: "IT" } });
  const estado = await db.cuenta_bancaria_estado.create({ data: { nombre: "Prueba", alias: "IT" } });
  const cuenta = await db.cuenta_bancaria.create({ data: { code: "IT-CUENTA", idbanco: banco.idbanco, idcuentatipo: tipo.idcuentatipo, idmoneda: parties.moneda.idmoneda, idcuentabancariaestado: estado.idcuentabancariaestado, numero: "000000001", cci: "00000000000000000001", alias: "Sintetica" } });
  await db.factoring_cartera.create({ data: { idfactoringcartera: 1, code: "IT-CARTERA", estado1: "Prueba" } });
  await db.factoring_estado.create({ data: { idfactoringestado: 1, code: "IT-1", estado1: "Prueba", estado2: "Prueba" } });
  return { ...parties, persona, contacto, cuenta };
}
