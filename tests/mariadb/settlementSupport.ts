import { db, seedApproval } from "./businessSupport.js";

// Catálogos sintéticos mínimos; nunca se copian filas de desarrollo.
export async function seedSettlement(idusuario: number, currency = "PEN", bank = 1) {
  const { factoring, propuesta } = await seedApproval(idusuario);
  const moneda = await db.moneda.findFirstOrThrow({ where: { codigo: currency } });
  const banco = await db.banco.create({ data: { idbanco: bank, tipo: "Prueba", nombre: "Banco sintetico", alias: "IT" } });
  const tipo = await db.cuenta_tipo.create({ data: { nombre: "Prueba", alias: "IT" } });
  const estadoCuenta = await db.cuenta_bancaria_estado.create({ data: { nombre: "Prueba", alias: "IT" } });
  const cuenta = await db.cuenta_bancaria.create({ data: { code: "IT-CUENTA", idbanco: banco.idbanco, idcuentatipo: tipo.idcuentatipo, idmoneda: moneda.idmoneda, idcuentabancariaestado: estadoCuenta.idcuentabancariaestado, numero: "000000001", cci: "00000000000000000001", alias: "Sintetica" } });
  const riesgo = await db.riesgo.create({ data: { code: "IT-RIESGO", nombre: "Prueba", alias: "IT", score: 1, color: "blue" } });
  await db.factoring_config_comision.create({ data: { idfactoringconfigcomision: 1, code: "IT", idriesgo: riesgo.idriesgo, version: 1, factor1: "0.01", factor2: 0, factor3: 1 } });
  for (const [id, valor] of [[1, "0.18"], [2, "15"], [3, "7.5"], [5, "5"], [6, "2.5"]] as const) await db.configuracion_app.create({ data: { idconfiguracionapp: id, code: `IT-${id}`, variable: `IT-${id}`, valor, unidad: "Prueba", fecha_inicio: new Date("2026-01-01") } });
  for (const id of [1, 2, 3, 4, 5]) await db.financiero_tipo.create({ data: { idfinancierotipo: id, code: `IT-${id}`, nombre: "Prueba", alias: "IT", color: "blue" } });
  for (const id of [1, 2, 3, 4, 7, 8, 9, 20]) await db.financiero_concepto.create({ data: { idfinancieroconcepto: id, code: `IT-${id}`, nombre: "Prueba", alias: "IT", color: "blue", factor: [7, 8].includes(id) ? 1 : -1, afecto_igv: [1, 2, 9, 20].includes(id) } });
  const liquidacionEstados = [];
  const transferenciaEstados = [];
  for (const id of [1, 4]) {
    liquidacionEstados.push(await db.factoring_liquidacion_estado.create({ data: { idfactoringliquidacionestado: id, code: `IT-${id}`, nombre: "Prueba", alias: "IT", color: "blue", visible_cedente: 1 } }));
    transferenciaEstados.push(await db.factoring_transferencia_estado.create({ data: { idfactoringtransferenciaestado: id, code: `IT-${id}`, nombre: "Prueba", alias: "IT", color: "blue", visible_cedente: 1 } }));
  }
  const transferenciaTipo = await db.factoring_transferencia_tipo.create({ data: { idfactoringtransferenciatipo: 1, code: "IT", nombre: "Prueba", alias: "IT", color: "blue" } });
  const cuentaFactor = await db.factor_cuenta_bancaria.create({ data: { idfactorcuentabancaria: 1, code: "IT", idfactor: 1, idcuentabancaria: cuenta.idcuentabancaria } });
  const cuentaEmpresa = await db.empresa_cuenta_bancaria.create({ data: { code: "IT", idempresa: factoring.idcedente, idcuentabancaria: cuenta.idcuentabancaria } });
  const archivo = await db.archivo.create({ data: { idarchivotipo: 9, idarchivoestado: 1, codigo: "IT-CONSTANCIA", ruta: "", nombrereal: "constancia.pdf", nombrealmacenamiento: "constancia.pdf", mimetype: "application/pdf", extension: "pdf", encoding: "utf8" } });
  await db.factoring_propuesta.update({ where: { idfactoringpropuesta: propuesta.idfactoringpropuesta }, data: { idriesgooperacion: riesgo.idriesgo, monto_neto: 20000, porcentaje_financiado_estimado: "0.8", tdm: "0.02", porcentaje_comision_descuento: "0.01", monto_garantia: 4000, monto_descuento: 320, fecha_pago_estimado: new Date("2026-10-01T05:00:00Z") } });
  await db.factoring.update({ where: { idfactoring: factoring.idfactoring }, data: { idcuentabancaria: cuenta.idcuentabancaria, idmoneda: moneda.idmoneda, idfactoringpropuestaaceptada: propuesta.idfactoringpropuesta, fecha_operacion: new Date("2026-09-01T05:00:00Z"), fecha_emision: new Date("2026-09-01T05:00:00Z"), monto_factura: 20000, monto_neto: 20000 } });
  const liquidacionDto = { factoringid: factoring.factoringid, factoringliquidacionestadoid: liquidacionEstados[0].factoringliquidacionestadoid, fecha_liquidacion: "2026-10-01T05:00:00Z", fecha_pago_efectivo: "2026-10-01T05:00:00Z" };
  const transferenciaDto = { factoringid: factoring.factoringid, factoringtransferenciatipoid: transferenciaTipo.factoringtransferenciatipoid, factoringtransferenciaestadoid: transferenciaEstados[0].factoringtransferenciaestadoid, factorcuentabancariaid: cuentaFactor.factorcuentabancariaid, empresacuentabancariaid: cuentaEmpresa.empresacuentabancariaid, monedaid: moneda.monedaid, numero_operacion: "IT-OPERACION", monto: 4000.15, fecha: "2026-10-01T05:00:00Z", archivo_constancia_transferencia: archivo.archivoid };
  return { factoring, propuesta, liquidacionEstados, transferenciaEstados, liquidacionDto, transferenciaDto, archivo };
}
