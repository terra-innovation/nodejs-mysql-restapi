import { afterAll, afterEach, beforeEach, expect, it } from "vitest";
import { db, cleanFixtures, seedMasters, seedApproval } from "./businessSupport.js";
import { getFactoringConsolidado } from "#src/daos/factoringConsolidado.Dao.js";

beforeEach(async () => {
  await cleanFixtures();
});
afterEach(async () => {
  await db.factoring_factura_factor.deleteMany({});
  await db.factura_estado.deleteMany({});
  await db.detraccion_estado.deleteMany({});
  await cleanFixtures();
});
afterAll(async () => {
  await db.$disconnect();
});

it("consulta real conserva granularidad por factura, propuestas ausentes, eliminados y fechas Lima sin alterar la sesión", async () => {
  const usuario = await seedMasters();
  const { factoring, propuesta } = await seedApproval(usuario.idusuario);
  await db.factoring.update({
    where: { idfactoring: factoring.idfactoring },
    data: {
      fecha_operacion: new Date("2026-10-15T04:59:59Z"),
      estado: 2,
    },
  });
  for (const numero of ["0001", "0002"]) {
    const factura = await db.factura.create({
      data: {
        code: "IT-FACT-" + numero,
        idusuarioupload: usuario.idusuario,
        serie: "F001",
        numero_comprobante: numero,
        fecha_emision: new Date("2026-10-01T05:00:00Z"),
        codigo_tipo_moneda: "PEN",
        importe_bruto: 1180.25,
        importe_neto: 1180.25,
        proveedor_ruc: "20000000002",
        proveedor_razon_social: "Cedente sintetico",
        cliente_ruc: "20000000003",
        cliente_razon_social: "Pagador sintetico",
      },
    });
    await db.factoring_factura.create({ data: { idfactoring: factoring.idfactoring, idfactura: factura.idfactura } });
  }
  let rows = await getFactoringConsolidado(db);
  expect(rows).toHaveLength(2);
  expect(rows.map((row) => row.c10).sort()).toEqual(["0001", "0002"]);
  expect(rows[0]).toMatchObject({ c1: "2026-10-14", c3: "ELIMINADO", c11: null, c27: null, c49: null });
  await db.factoring.update({
    where: { idfactoring: factoring.idfactoring },
    data: {
      idfactoringpropuestaaceptada: propuesta.idfactoringpropuesta,
    },
  });
  await db.factoring_propuesta.update({
    where: { idfactoringpropuesta: propuesta.idfactoringpropuesta },
    data: {
      monto_neto: "1180.25",
      monto_garantia: "100.50",
      fecha_pago_estimado: new Date("2026-11-01T05:00:00Z"),
    },
  });
  rows = await getFactoringConsolidado(db);
  expect(rows[0].c13).toBe("2026-11-01");
  expect(Number(rows[0].c11)).toBe(1180.25);
  expect(Number(rows[0].c29)).toBe(1180.25);
  expect(Number(rows[0].c18)).toBe(100.5);
  expect(Number(rows[0].c31)).toBe(100.5);
  const [session] = await db.$queryRaw<Array<{ timezone: string }>>`SELECT @@session.time_zone AS timezone`;
  expect(session.timezone).toBe("+00:00");
});
