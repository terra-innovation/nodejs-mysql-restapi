export interface FactoringToCreateTelegram {
  code?: string | null;
  monto_factura?: number | string | any;
  monto_detraccion?: number | string | any;
  monto_retencion?: number | string | any;
  monto_neto?: number | string | any;
}

export const newFactoringMessage = (factoringToCreate: FactoringToCreateTelegram) => {
  return {
    title: "Nueva Operación de Factoring",
    code: factoringToCreate.code,
    monto_factura: factoringToCreate.monto_factura,
    monto_detraccion: factoringToCreate.monto_detraccion,
    monto_retencion: factoringToCreate.monto_retencion,
    monto_neto: factoringToCreate.monto_neto,
  };
};
