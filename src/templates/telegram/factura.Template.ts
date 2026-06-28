export interface FacturaFinalTelegram {
  proveedor?: {
    ruc?: string | null;
    razon_social?: string | null;
  } | null;
  cliente?: {
    ruc?: string | null;
    razon_social?: string | null;
  } | null;
}

export interface FacturaToCreateTelegram {
  serie?: string | null;
  numero_comprobante?: string | null;
  fecha_pago_mayor_estimado?: Date | string | null;
  importe_bruto?: number | string | any;
  importe_neto?: number | string | any;
  dias_estimados_para_pago?: number | null;
  dias_desde_emision?: number | null;
}

export const limitMessage = (title: string, restriccion: "Factor" | "Cedente" | "Pagador", facturaFinal: FacturaFinalTelegram, facturaToCreate: FacturaToCreateTelegram, limitData?: any) => {
  return {
    title,
    restriccion,
    cedente_ruc: facturaFinal.proveedor?.ruc,
    cedente_razon_social: facturaFinal.proveedor?.razon_social,
    pagador_ruc: facturaFinal.cliente?.ruc,
    pagador_razon_social: facturaFinal.cliente?.razon_social,
    serie: facturaToCreate.serie,
    numero_comprobante: facturaToCreate.numero_comprobante,
    fecha_pago_mayor_estimado: facturaToCreate.fecha_pago_mayor_estimado,
    importe_bruto: facturaToCreate.importe_bruto,
    importe_neto: facturaToCreate.importe_neto,
    dias_estimados_para_pago: facturaToCreate.dias_estimados_para_pago,
    dias_desde_emision: facturaToCreate.dias_desde_emision,
    ...limitData,
  };
};
export interface FacturaCargadaTelegram {
  code?: string | null;
  serie?: string | null;
  numero_comprobante?: string | null;
  fecha_pago_mayor_estimado?: Date | string | null;
  importe_bruto?: number | string | any;
  importe_neto?: number | string | any;
  dias_estimados_para_pago?: number | null;
  dias_desde_emision?: number | null;
  proveedor_ruc?: string | null;
  proveedor_razon_social?: string | null;
  cliente_ruc?: string | null;
  cliente_razon_social?: string | null;
}

export const newFacturaCargadaMessage = (facturaToCreate: FacturaCargadaTelegram) => {
  return {
    title: "Nueva factura cargada",
    code: facturaToCreate.code,
    serie: facturaToCreate.serie,
    numero_comprobante: facturaToCreate.numero_comprobante,
    fecha_pago_mayor_estimado: facturaToCreate.fecha_pago_mayor_estimado,
    importe_bruto: facturaToCreate.importe_bruto,
    importe_neto: facturaToCreate.importe_neto,
    dias_estimados_para_pago: facturaToCreate.dias_estimados_para_pago,
    dias_desde_emision: facturaToCreate.dias_desde_emision,
    proveedor_ruc: facturaToCreate.proveedor_ruc,
    proveedor_razon_social: facturaToCreate.proveedor_razon_social,
    cliente_ruc: facturaToCreate.cliente_ruc,
    cliente_razon_social: facturaToCreate.cliente_razon_social,
  };
};
