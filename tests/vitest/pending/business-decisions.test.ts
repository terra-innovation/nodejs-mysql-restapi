import { describe, it } from "vitest";

describe("Criterios pendientes: no son contratos aprobados ni pruebas ejecutadas", () => {
  it.todo("DT-LIQ-02: definir límites de cantidades/importes y autorización de reversos");
  it.todo("DT-LIQ-03: unificar el criterio IGV según la matriz de tipos y conceptos autorizada");
  it.todo("DT-LIQ-04: definir residual de redondeo sin cambiar propuestas aceptadas");
  it.todo("DT-LIQ-05: representar cobertura con tasa cero sin Infinity ni NaN");
  it.todo("DT-LIQ-06: definir tarifa de transferencia del reintegro sin garantía");
  it.todo("DT-TEST-01: eliminar la copia final de archivo si falla su registro en BD");
  it.todo("DT-TEST-02: unificar el rango de financiamiento entre simular y crear propuesta");
});
