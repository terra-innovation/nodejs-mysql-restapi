import { afterAll, afterEach, beforeEach, expect, it, vi } from "vitest";
import { db, cleanFixtures, seedMasters, seedApproval } from "./businessSupport.js";
vi.mock("#src/models/prisma/db-factoring.js", async () => ({ prismaFT: { client: (await import("./businessSupport.js")).db, transactionTimeout: 10000 } }));
import { actualizarDetraccionService, getDetraccionService, listarDetraccionesService } from "#src/services/financiero/factoringdetraccion.Service.js";
let fixture: Awaited<ReturnType<typeof seed>>;
async function seed() {
  const user = await seedMasters();
  const { factoring } = await seedApproval(user.idusuario);
  const estados = [];
  for (const [id, code, nombre] of [
    [1, "DE00001", "PENDIENTE"],
    [2, "DE00002", "PAGADA"],
    [3, "DE00003", "NO APLICA"],
  ] as const)
    estados.push(await db.detraccion_estado.create({ data: { iddetraccionestado: id, code, nombre, alias: nombre, color: "blue" } }));
  await db.factura_estado.create({ data: { idfacturaestado: 1, code: "IT", nombre: "PENDIENTE", alias: "IT", color: "blue" } });
  await db.archivo_tipo.create({ data: { idarchivotipo: 12, code: "AT012000", nombre: "Constancia", extensiones_permitidas: "pdf,png,jpg,jpeg", mimetypes_permitidos: "application/pdf,image/png,image/jpeg" } });
  const factura = await db.factura.create({ data: { code: "IT-DET", idusuarioupload: user.idusuario, serie: "IT", numero_comprobante: "1", codigo_tipo_moneda: "USD", fecha_emision: new Date("2026-10-01"), importe_bruto: "552.46", importe_neto: "486.19", detraccion_monto: "223", proveedor_ruc: "20000000009", proveedor_razon_social: "Factor sintetico", cliente_ruc: "20000000002", cliente_razon_social: "Cedente sintetico" } });
  const registro = await db.factoring_factura_factor.create({ data: { code: "IT-DET", idfactura: factura.idfactura, idfactoring: factoring.idfactoring, idfacturaestado: 1, iddetraccionestado: 1, fecha_pago_factura: new Date("2026-10-02T05:00:00Z") } });
  const archivo = await db.archivo.create({ data: { idarchivotipo: 12, idarchivoestado: 1, codigo: "IT-DET", nombrereal: "sintetico.pdf", nombrealmacenamiento: "sintetico.pdf", ruta: "integration-only", tamanio: 100, mimetype: "application/pdf", encoding: "7bit", extension: "pdf", idusuariocrea: user.idusuario } });
  return { user, factoring, factura, registro, archivo, estados };
}
beforeEach(async () => {
  fixture = await seed();
});
afterEach(async () => {
  await db.$executeRawUnsafe("DROP TRIGGER IF EXISTS it_detraccion_link_failure");
  await db.factoring_factura_factor.deleteMany({});
  await db.factura_estado.deleteMany({});
  await db.detraccion_estado.deleteMany({});
  await cleanFixtures();
});
afterAll(async () => {
  await db.$disconnect();
});
const query = () => ({ estado: "PENDIENTE" as const, pagina: 1, tamanio: 10, busqueda: "", ordenarPor: "fechaEmision" as const, direccion: "asc" as const });
it("detalle conserva datos XML activos para la guía SUNAT sin ampliar la bandeja", async () => {
  const idfactura = fixture.factura.idfactura;
  await db.factura.update({ where: { idfactura }, data: { codigo_tipo_documento: "01" } });
  await db.factura_medio_pago.createMany({
    data: [
      { idfactura, id: "Detraccion", cuenta_bancaria: "00000000001" },
      { idfactura, id: "Detraccion", cuenta_bancaria: "inactiva", estado: 0 },
    ],
  });
  await db.factura_termino_pago.createMany({
    data: [
      { idfactura, id: "Detraccion", forma_pago: "037" },
      { idfactura, id: "Detraccion", forma_pago: "022", estado: 0 },
    ],
  });
  const detalle = await getDetraccionService(fixture.registro.factoringfacturafactorid);
  expect(detalle.factura).toMatchObject({ codigo_tipo_documento: "01", factura_medio_pagos: [{ id: "Detraccion", cuenta_bancaria: "00000000001" }], factura_termino_pagos: [{ id: "Detraccion", forma_pago: "037" }] });
  expect((await listarDetraccionesService(query())).registros[0].factura).not.toHaveProperty("factura_medio_pagos");
});
it("listado y detalle incluyen solo facturas negociadas activas en orden estable para pendientes y pagadas", async () => {
  const idfactoring = fixture.factoring.idfactoring;
  const facturas = [];
  for (let i = 0; i < 3; i++) facturas.push(await db.factura.create({ data: { code: `IT-NEG-${i}`, idusuarioupload: fixture.user.idusuario, serie: "F001", numero_comprobante: String(i + 1), codigo_tipo_moneda: "PEN", importe_bruto: "100", importe_neto: "100", proveedor_ruc: "20000000001", proveedor_razon_social: "Cedente sintetico", cliente_ruc: "20000000002", cliente_razon_social: "Pagador sintetico", estado: i === 2 ? 0 : 1 } }));
  await db.factoring_factura.createMany({ data: facturas.map((f) => ({ idfactoring, idfactura: f.idfactura })) });
  const esperadas = facturas.slice(0, 2).map((f) => ({ factura: { serie: f.serie, numero_comprobante: f.numero_comprobante } }));
  expect((await listarDetraccionesService(query())).registros[0].factoring.factoring_facturas).toEqual(esperadas);
  expect((await getDetraccionService(fixture.registro.factoringfacturafactorid)).factoring.factoring_facturas).toEqual(esperadas);
  await db.factoring_factura.update({ where: { idfactoring_idfactura: { idfactoring, idfactura: facturas[1].idfactura } }, data: { estado: 0 } });
  await db.factoring_factura_factor.update({ where: { factoringfacturafactorid: fixture.registro.factoringfacturafactorid }, data: { iddetraccionestado: 2 } });
  expect((await listarDetraccionesService({ ...query(), estado: "PAGADA" })).registros[0].factoring.factoring_facturas).toEqual(esperadas.slice(0, 1));
});
async function pago() {
  const detail = await getDetraccionService(fixture.registro.factoringfacturafactorid);
  return { id: fixture.registro.factoringfacturafactorid, detraccionestadoid: fixture.estados[1].detraccionestadoid, fecha_pago_detraccion: "2026-10-13T05:00:00.000Z", detraccionarchivoid: fixture.archivo.archivoid, version: detail.version, idusuario: fixture.user.idusuario };
}
it("filtro/paginación conserva operaciones liquidadas y omite NO APLICA/eliminados", async () => {
  await db.factoring_estado.update({ where: { idfactoringestado: fixture.factoring.idfactoringestado }, data: { estado1: "Operación", estado2: "Liquidado" } });
  await db.factoring_factura_factor.create({ data: { code: "IT-NO", idfactura: fixture.factura.idfactura, idfactoring: fixture.factoring.idfactoring, idfacturaestado: 1, iddetraccionestado: 3 } });
  let result = await listarDetraccionesService(query());
  expect(result.total).toBe(1);
  expect(result.registros[0].factura.importe_bruto.toString()).toBe("552.46");
  expect(await listarDetraccionesService({ ...query(), busqueda: "missing" })).toMatchObject({ total: 0, registros: [] });
  expect(await listarDetraccionesService({ ...query(), pagina: 2, tamanio: 1 })).toMatchObject({ total: 1, registros: [] });
  for (const ordenarPor of ["operacion", "cedente", "comprobante", "importeTotal", "detraccionMonto", "fechaPagoDetraccion"] as const) expect((await listarDetraccionesService({ ...query(), ordenarPor })).total).toBe(1);
  await db.factura.update({ where: { idfactura: fixture.factura.idfactura }, data: { estado: 2 } });
  expect((await listarDetraccionesService(query())).total).toBe(0);
});
it("paga, corrige y reabre conservando fecha, archivos y campos ajenos", async () => {
  const before = await db.factoring_factura_factor.findUniqueOrThrow({ where: { idfactoringfacturafactor: fixture.registro.idfactoringfacturafactor } });
  let detail = await actualizarDetraccionService(await pago());
  expect(detail.detraccion_estado.code).toBe("DE00002");
  expect(detail.factura.archivo_facturas).toHaveLength(1);
  expect((await listarDetraccionesService(query())).total).toBe(0);
  const nueva = await db.archivo.create({ data: { idarchivotipo: 12, idarchivoestado: 1, codigo: "IT-DET-2", nombrereal: "correccion.pdf", nombrealmacenamiento: "correccion.pdf", ruta: "integration-only", tamanio: 100, mimetype: "application/pdf", encoding: "7bit", extension: "pdf", idusuariocrea: fixture.user.idusuario } });
  const correction = { ...(await pago()), detraccionarchivoid: nueva.archivoid, fecha_pago_detraccion: "2026-10-12T05:00:00.000Z" };
  detail = await actualizarDetraccionService(correction);
  detail = await actualizarDetraccionService({ ...correction, version: detail.version, detraccionestadoid: fixture.estados[0].detraccionestadoid });
  expect(detail.fecha_pago_detraccion).toEqual(new Date(correction.fecha_pago_detraccion));
  expect(detail.factura.archivo_facturas).toHaveLength(2);
  const after = await db.factoring_factura_factor.findUniqueOrThrow({ where: { idfactoringfacturafactor: fixture.registro.idfactoringfacturafactor } });
  expect([after.idfactura, after.idfactoring, after.idfacturaestado, after.fecha_pago_factura]).toEqual([before.idfactura, before.idfactoring, before.idfacturaestado, before.fecha_pago_factura]);
  expect(await db.factura.findUnique({ where: { idfactura: fixture.factura.idfactura } })).toEqual(fixture.factura);
  expect((await listarDetraccionesService(query())).total).toBe(1);
});
it("dos comprobantes de una operación conservan filas, búsqueda compuesta y orden con fecha nula al final", async () => {
  const factura = await db.factura.create({ data: { code: "IT-DET-2", idusuarioupload: fixture.user.idusuario, serie: "IT", numero_comprobante: "2", codigo_tipo_moneda: "PEN", importe_bruto: 0, importe_neto: 0, detraccion_monto: 0, proveedor_ruc: "20000000009", proveedor_razon_social: "Factor sintetico", cliente_ruc: "20000000002", cliente_razon_social: "Cedente sintetico" } });
  const segunda = await db.factoring_factura_factor.create({ data: { code: "IT-DET-2", idfactura: factura.idfactura, idfactoring: fixture.factoring.idfactoring, idfacturaestado: 1, iddetraccionestado: 1 } });
  const result = await listarDetraccionesService({ ...query(), tamanio: 1 });
  expect(result.total).toBe(2);
  expect(result.registros[0].factoringfacturafactorid).toBe(fixture.registro.factoringfacturafactorid);
  expect((await listarDetraccionesService({ ...query(), pagina: 2, tamanio: 1 })).registros[0].factoringfacturafactorid).toBe(segunda.factoringfacturafactorid);
  expect((await listarDetraccionesService({ ...query(), busqueda: "IT-2" })).registros[0].factoringfacturafactorid).toBe(segunda.factoringfacturafactorid);
  await db.factoring_factura_factor.update({ where: { idfactoringfacturafactor: segunda.idfactoringfacturafactor }, data: { estado: 2 } });
  expect((await listarDetraccionesService(query())).total).toBe(1);
});
it("fallo de vínculo revierte estado/fecha/auditoría en SQL real", async () => {
  const dto = await pago();
  await db.$executeRawUnsafe("CREATE TRIGGER it_detraccion_link_failure BEFORE INSERT ON archivo_factura FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='fixture failure'");
  await expect(actualizarDetraccionService(dto)).rejects.toThrow();
  expect(await db.factoring_factura_factor.findUnique({ where: { idfactoringfacturafactor: fixture.registro.idfactoringfacturafactor } })).toEqual(fixture.registro);
  expect(await db.archivo_factura.count()).toBe(0);
});
it("dos escritores con una versión producen un éxito y un conflicto sin duplicar archivos", async () => {
  const dto = await pago();
  const results = await Promise.allSettled([actualizarDetraccionService(dto), actualizarDetraccionService(dto)]);
  expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  const rejected = results.find((r) => r.status === "rejected");
  expect(rejected?.status === "rejected" && rejected.reason.statusCode).toBe(409);
  expect(await db.archivo_factura.count()).toBe(1);
});
