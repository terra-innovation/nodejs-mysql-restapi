export interface FactoringPropuestaTelegram {
  code?: string | null;
}

export interface FactoringPropuestaDetailsTelegram {
  tdm?: number | string | any;
  monto_neto?: number | string | any;
  monto_adelanto?: number | string | any;
  fecha_pago_estimado?: Date | string | null;
  dias_pago_estimado?: number | null;
}

export const buildFactoringPropuestaAceptadaMessage = (factoring: FactoringPropuestaTelegram, factoringpropuesta: FactoringPropuestaDetailsTelegram) => {
  return {
    title: "Factoring Electrónico: propuesta aceptada",
    code: factoring.code,
    tdm: factoringpropuesta.tdm,
    monto_neto: factoringpropuesta.monto_neto,
    monto_adelanto: factoringpropuesta.monto_adelanto,
    fecha_pago_estimado: factoringpropuesta.fecha_pago_estimado,
    dias_pago_estimado: factoringpropuesta.dias_pago_estimado,
  };
};
