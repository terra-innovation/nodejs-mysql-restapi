import { afterAll, afterEach, beforeEach, expect, it } from "vitest";
import { db, cleanFixtures, seedMasters, seedApproval } from "./businessSupport.js";
import { inspectHistoricalFactoring } from "../../scripts/integration/historical-factoring-query.mjs";

let user: Awaited<ReturnType<typeof seedMasters>>;
beforeEach(async () => { user = await seedMasters(); });
afterEach(async () => { await cleanFixtures(); });
afterAll(async () => { await db.$disconnect(); });
const audit = () => inspectHistoricalFactoring(sql => db.$queryRawUnsafe(sql));
async function arrange() {
  const { factoring } = await seedApproval(user.idusuario);
  for (const [code, gross, net, withholding] of [["IT-1", "1180", "1180", "0"], ["IT-2", "100.25", "90.15", "5.05"]]) {
    const invoice = await db.factura.create({ data: { code, idusuarioupload: user.idusuario, serie: "IT", numero_comprobante: code, codigo_tipo_moneda: "PEN", importe_bruto: gross, importe_neto: net, detraccion_monto: withholding, retencion_monto: withholding, proveedor_ruc: "20100000001", proveedor_razon_social: "Sintetica", cliente_ruc: "20600000002", cliente_razon_social: "Sintetica" } });
    await db.factoring_factura.create({ data: { idfactoring: factoring.idfactoring, idfactura: invoice.idfactura } });
  }
  await db.factoring.update({ where: { idfactoring: factoring.idfactoring }, data: { cantidad_facturas: 2, monto_factura: "1280.25", monto_neto: "1270.15", monto_detraccion: "5.05", monto_retencion: "5.05" } });
  return factoring;
}
it("audita sumas Decimal correctas sin falsos positivos ni escrituras", async () => {
  await arrange();
  const before = await db.factoring.findMany();
  expect(await audit()).toMatchObject({ totalOperations: 1, checked: 1, consistent: 1, findings: [] });
  expect(await db.factoring.findMany()).toEqual(before);
});
it("detecta importes concatenados sin atribuir automáticamente su causa", async () => {
  const f = await arrange();
  await db.factoring.update({ where: { idfactoring: f.idfactoring }, data: { monto_factura: "1180100.25", monto_neto: "118090.15" } });
  const result = await audit();
  expect(result.findings).toHaveLength(1);
  expect(result.findings[0].diferencias).toEqual([
    { campo: "monto_factura", guardado: "1180100.25", suma_facturas_actuales: "1280.25" },
    { campo: "monto_neto", guardado: "118090.15", suma_facturas_actuales: "1270.15" },
  ]);
});
it("marca vínculos faltantes y conserva en alcance operaciones eliminadas", async () => {
  const f = await arrange();
  await db.factoring.update({ where: { idfactoring: f.idfactoring }, data: { estado: 2, cantidad_facturas: 3 } });
  expect((await audit()).findings[0]).toMatchObject({ estado: 2, declaradas: 3, vinculadas: 2, asociaciones_incompletas: true, diferencias: [] });
});
it("detecta monedas inconsistentes aunque los importes coincidan", async () => {
  await arrange();
  await db.factura.updateMany({ where: { code: "IT-2" }, data: { codigo_tipo_moneda: "USD" } });
  expect((await audit()).findings[0]).toMatchObject({ monedas_inconsistentes: true, diferencias: [] });
});
it("detecta varias facturas vinculadas aunque la cantidad declarada sea uno", async () => {
  const f = await arrange();
  await db.factoring.update({ where: { idfactoring: f.idfactoring }, data: { cantidad_facturas: 1 } });
  expect((await audit()).findings[0]).toMatchObject({ declaradas: 1, vinculadas: 2, asociaciones_incompletas: true });
});
