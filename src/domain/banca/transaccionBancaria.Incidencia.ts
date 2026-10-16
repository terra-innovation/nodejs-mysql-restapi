import { importe, legado } from "#src/domain/banca/transaccionBancaria.Policy.js";
import type { RemoteRow } from "#src/domain/banca/transaccionBancaria.Policy.js";

export function explicarIncidencia(tipo: string, raw: unknown) {
  let row: RemoteRow | undefined;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) row = parsed;
  } catch {
    /* Evidencia antigua ilegible: mostrar un diagnóstico explícito sin inventar campos. */
  }
  const titles: Record<string, string> = {
    ENRIQUECIMIENTO_INVALIDO: "Datos auxiliares históricos inválidos",
    IDENTIDAD_AMBIGUA: "Identidad bancaria ambigua",
    DATOS_ORIGEN_DISTINTOS: "Diferencias con un movimiento ya importado",
    IDENTIDAD_CORREGIDA: "Coincidencia con un movimiento corregido",
    SIGNO_INCONSISTENTE: "Dirección e importe incompatibles",
    MONEDA_INCONSISTENTE: "Moneda distinta de la cuenta local",
    CUENTA_SIN_MAPEO: "Cuenta sin vinculación local",
    DATOS_ORIGEN_INVALIDOS: "Datos bancarios de origen inválidos",
    DATOS_BANCARIOS_INVALIDOS: "Datos bancarios incompletos o demasiado extensos",
  };
  let detalles: ReturnType<typeof legado>["detalles"] = [];
  if (tipo === "ENRIQUECIMIENTO_INVALIDO" && row) {
    try {
      const sign = importe(row.monto, true).startsWith("-") ? -1 : 1;
      const captured = Array.isArray(row._campos_observados) ? row._campos_observados : undefined;
      detalles = legado(row, sign, false).detalles.filter((d) => !captured || captured.includes(d.campo));
    } catch {
      /* No inferir signo si la evidencia no permite validarlo. */
    }
  }
  const labels: Record<string, string> = { detalle_hora: "Hora de detalle", detalle_fecha: "Fecha de detalle", origen_comision: "Comisión de origen", destino_comision: "Comisión de destino", monto_neto: "Monto neto", tipooperacion: "Tipo de operación", origen_cuenta: "Cuenta de origen", origen_nombre: "Ordenante", destino_cuenta: "Cuenta de destino", destino_nombre: "Beneficiario", referencia_descripcion: "Referencia", referencia_proveedor_ruc: "RUC de proveedor", referencia_proveedor_factura: "Factura de proveedor", referencia_proveedor_boleta: "Boleta de proveedor", referencia_ft_factura: "Factura del factor", referencia_ft_op_factoring: "Referencia de operaciones" };
  const fields = detalles.map((d) => ({ ...d, campo_label: labels[d.campo] || d.campo }));
  const motivo =
    tipo === "ENRIQUECIMIENTO_INVALIDO"
      ? fields.length
        ? fields.map((d) => `${d.campo_label}: ${d.motivo}`).join(" ")
        : "La evidencia disponible no permite identificar los campos auxiliares omitidos. Revise el detalle original."
      : (
          {
            IDENTIDAD_AMBIGUA: "Varias filas del origen tienen la misma identidad bancaria; no se eligió una automáticamente.",
            DATOS_ORIGEN_DISTINTOS: "La fila recibida difiere de los datos de un movimiento ya registrado; no se sobrescribió el trabajo local.",
            IDENTIDAD_CORREGIDA: "La fila coincide con valores de un movimiento corregido localmente; requiere revisar su vínculo.",
            SIGNO_INCONSISTENTE: "La dirección suma/resta recibida no coincide con el signo del importe de origen.",
            MONEDA_INCONSISTENTE: "La moneda recibida no coincide con la moneda de la cuenta bancaria vinculada.",
            CUENTA_SIN_MAPEO: "No se encontró una cuenta local habilitada para la etiqueta recibida.",
            DATOS_ORIGEN_INVALIDOS: "Revise importe, fecha, número de operación y descripción en la evidencia recibida.",
            DATOS_BANCARIOS_INVALIDOS: "El número de operación o la descripción están vacíos o exceden el tamaño admitido.",
          } as Record<string, string>
        )[tipo] || "Revise la evidencia de origen y el movimiento relacionado antes de resolver esta incidencia.";
  return { tipo_label: titles[tipo] || tipo, motivo, efecto: tipo === "ENRIQUECIMIENTO_INVALIDO" ? "Movimiento importado. Se omitieron únicamente los campos auxiliares observados; los demás datos se conservaron." : "Fila pendiente de revisión; se conservaron los movimientos locales existentes.", accion_sugerida: tipo === "ENRIQUECIMIENTO_INVALIDO" ? "Revise cada campo indicado y documente la resolución. La regla actual convierte horas AM/PM a 24 horas y comisiones a magnitud positiva para nuevas importaciones. Repetir la sincronización no reemplaza enriquecimientos locales ya importados." : "Compare la evidencia con el movimiento local y corrija el origen o su vinculación según corresponda. Documente el resultado al resolver.", detalles_incidencia: fields, operacion_origen: row && typeof row.numerooperacion === "string" ? row.numerooperacion : undefined };
}
