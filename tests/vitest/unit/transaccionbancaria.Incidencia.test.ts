import { expect, it } from "vitest";
import { explicarIncidencia } from "#src/domain/banca/transaccionBancaria.Incidencia.js";

it("explica el motivo histórico aunque la regla actual ya normalice hora y comisiones", () => {
  const row = { numerooperacion: "00001", monto: "-100.00", detalle_hora: "01:05 PM", origen_comision: "-1.00", destino_comision: "-2.00" };
  const result = explicarIncidencia("ENRIQUECIMIENTO_INVALIDO", JSON.stringify(row));
  expect(result.detalles_incidencia.map((d) => d.campo)).toEqual(["origen_comision", "destino_comision", "detalle_hora"]);
  expect(result.efecto).toContain("Movimiento importado");
  expect(result.motivo).toContain("Comisión de origen");
  expect(result.motivo).toContain("Hora de detalle");
  expect(result.operacion_origen).toBe("00001");
  expect(result.accion_sugerida).toContain("no reemplaza");
});
it("en observaciones nuevas muestra únicamente los campos capturados al importar", () => {
  const result = explicarIncidencia("ENRIQUECIMIENTO_INVALIDO", { monto: "-100", origen_comision: "-1", detalle_fecha: "2026-02-30", _version_validacion: 2, _campos_observados: ["detalle_fecha"] });
  expect(result.detalles_incidencia.map((d) => d.campo)).toEqual(["detalle_fecha"]);
});
it("explica límites de texto y distingue moneda inconsistente", () => {
  const result = explicarIncidencia("ENRIQUECIMIENTO_INVALIDO", { monto: "1", referencia_ft_factura: "x".repeat(51) });
  expect(result.detalles_incidencia[0].motivo).toContain("50 caracteres");
  expect(explicarIncidencia("MONEDA_INCONSISTENTE", {}).motivo).toContain("moneda");
});
it("evidencia ilegible no inventa razones ni expone datos ajenos al diagnóstico", () => {
  expect(explicarIncidencia("ENRIQUECIMIENTO_INVALIDO", "{incompleto").detalles_incidencia).toEqual([]);
  expect(JSON.stringify(explicarIncidencia("ENRIQUECIMIENTO_INVALIDO", { monto: "1", password: "secreto-privado", detalle_hora: "99:99" }))).not.toContain("secreto-privado");
});
