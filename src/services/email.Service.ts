import TemplateManager from "#src/utils/email/TemplateManager.js";
import EmailSender from "#src/utils/email/emailSender.js";
import { log, line } from "#src/utils/logger.pino.js";
import { ClientError } from "#src/utils/CustomErrors.js";

import * as df from "#src/utils/dateUtils.js";
import * as nf from "#src/utils/numberUtils.js";

// Instanciar clases
const templateManager = new TemplateManager();
const emailSender = new EmailSender();

export const sendFactoringEmpresaServicioFactoringCedenteNotificacionInicioOperacion = async (to, params) => {
  try {
    const cabecera = {
      fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
    };

    const factoring_formateado = {
      factura: "" + params.factoring?.factoring_facturas[0].factura.serie + "-" + params.factoring?.factoring_facturas[0].factura.numero_comprobante,
      fecha_registro: df.formatDateTimeLocale(params.factoring?.fecha_registro),
      fecha_operacion: df.formatDateLocale(params.factoring?.fecha_operacion),
      monto_factura: nf.formatNumber(params.factoring?.monto_factura),
      monto_detraccion: nf.formatNumber(params.factoring?.monto_detraccion),
      monto_neto: nf.formatNumber(params.factoring?.monto_neto),
      fecha_pago_estimado: df.formatDateUTC(params.factoring?.fecha_pago_estimado),
    };

    const factoringpropuesta_formateado = {
      fecha_propuesta: df.formatDateTimeLocale(params.factoringpropuesta?.fecha_propuesta),
      monto_neto: nf.formatNumber(params.factoringpropuesta?.monto_neto),
      fecha_pago_estimado: df.formatDateUTC(params.factoringpropuesta?.fecha_pago_estimado),
      tdm: nf.formatPercentage(params.factoringpropuesta?.tdm),
      porcentaje_financiado_estimado: nf.formatPercentage(params.factoringpropuesta?.porcentaje_financiado_estimado),
      monto_garantia: nf.formatNumber(params.factoringpropuesta?.monto_garantia),
      monto_financiado: nf.formatNumber(params.factoringpropuesta?.monto_financiado),
      monto_descuento: nf.formatNumber(params.factoringpropuesta?.monto_descuento),
      monto_comision: nf.formatNumber(params.factoringpropuesta?.monto_comision),
      monto_costo_estimado: nf.formatNumber(params.factoringpropuesta?.monto_costo_estimado),
      monto_total_igv: nf.formatNumber(params.factoringpropuesta?.monto_total_igv),
      monto_adelanto: nf.formatNumber(params.factoringpropuesta?.monto_adelanto),
    };

    params = {
      ...params,
      cabecera,
      factoring_formateado,
      factoringpropuesta_formateado,
    };

    const emailTemplate = await templateManager.templateFactoringEmpresaServicioFactoringCedenteNotificacionInicioOperacion(params);

    const mailOptions = {
      to: to,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };

    await emailSender.sendContactoFinanzatech(mailOptions);
  } catch (error) {
    log.error(line(), "", error);
    throw error;
  }
};

export const sendFactoringEmpresaServicioFactoringDeudorNotificacionTransferencia = async (to, cc, params) => {
  try {
    const cabecera = {
      fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
    };

    const factoring_formateado = {
      factura: "" + params.factoring?.factoring_facturas[0].factura.serie + "-" + params.factoring?.factoring_facturas[0].factura.numero_comprobante,
      monto_factura: nf.formatNumber(params.factoring?.monto_factura),
      monto_neto: nf.formatNumber(params.factoring?.monto_neto),
      fecha_pago_estimado: df.formatDateUTC(params.factoring?.fecha_pago_estimado),
    };

    params = {
      ...params,
      cabecera,
      factoring_formateado,
    };

    const emailTemplate = await templateManager.templateFactoringEmpresaServicioFactoringDeudorNotificacionTransferencia(params);

    const mailOptions = {
      to: to,
      cc: cc,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };

    console.log(emailTemplate.html);
    //await emailSender.sendContactoFinanzatech(mailOptions);
  } catch (error) {
    log.error(line(), "", error);
    throw error;
  }
};

export const sendFactoringEmpresaServicioFactoringCedenteConfirmacionTransferencia = async (to, params) => {
  try {
    const cabecera = {
      fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
    };

    const factoring_formateado = {
      factura: "" + params.factoring?.factoring_facturas[0].factura.serie + "-" + params.factoring?.factoring_facturas[0].factura.numero_comprobante,
      monto_neto: nf.formatNumber(params.factoring?.monto_neto),
      fecha_pago_estimado: df.formatDateUTC(params.factoring?.fecha_pago_estimado),
    };

    const factoringtransferenciacedente_formateado = {
      fecha: df.formatDateLocale(params.factoringtransferenciacedente?.fecha),
      monto: nf.formatNumber(params.factoringtransferenciacedente?.monto),
    };

    params = {
      ...params,
      cabecera,
      factoring_formateado,
      factoringtransferenciacedente_formateado,
    };

    const emailTemplate = await templateManager.templateFactoringEmpresaServicioFactoringCedenteConfirmacionTransferencia(params);

    const mailOptions = {
      to: to,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };

    await emailSender.sendContactoFinanzatech(mailOptions);
  } catch (error) {
    log.error(line(), "", error);
    throw error;
  }
};

export const sendFactoringEmpresaServicioFactoringDeudorSolicitudConfirmacion = async (to, cc, params) => {
  try {
    const cabecera = {
      fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
    };

    const factoring_formateado = {
      factura: "" + params.factoring?.factoring_facturas[0].factura.serie + "-" + params.factoring?.factoring_facturas[0].factura.numero_comprobante,
      monto_neto: nf.formatNumber(params.factoring?.monto_neto),
      fecha_pago_estimado: df.formatDateUTC(params.factoring?.fecha_pago_estimado),
    };

    params = {
      ...params,
      cabecera,
      factoring_formateado,
    };

    const emailTemplate = await templateManager.templateFactoringEmpresaServicioFactoringDeudorSolicitudConfirmacion(params);

    const mailOptions = {
      to: to,
      cc: cc,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };

    await emailSender.sendContactoFinanzatech(mailOptions);
  } catch (error) {
    log.error(line(), "", error);
    throw error;
  }
};

export const sendFactoringEmpresaServicioFactoringPropuestaAceptada = async (to, params) => {
  try {
    const cabecera = {
      fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
    };

    const factoring_formateado = {
      fecha_registro: df.formatDateTimeLocale(params.factoring?.fecha_registro),
      monto_factura: nf.formatNumber(params.factoring?.monto_factura),
      monto_detraccion: nf.formatNumber(params.factoring?.monto_detraccion),
      monto_neto: nf.formatNumber(params.factoring?.monto_neto),
      fecha_pago_estimado: df.formatDateUTC(params.factoring?.fecha_pago_estimado),
    };

    const factoringpropuesta_formateado = {
      fecha_propuesta: df.formatDateTimeLocale(params.factoringpropuesta?.fecha_propuesta),
      monto_neto: nf.formatNumber(params.factoringpropuesta?.monto_neto),
      fecha_pago_estimado: df.formatDateUTC(params.factoringpropuesta?.fecha_pago_estimado),
      tdm: nf.formatPercentage(params.factoringpropuesta?.tdm),
      porcentaje_financiado_estimado: nf.formatPercentage(params.factoringpropuesta?.porcentaje_financiado_estimado),
      monto_garantia: nf.formatNumber(params.factoringpropuesta?.monto_garantia),
      monto_financiado: nf.formatNumber(params.factoringpropuesta?.monto_financiado),
      monto_descuento: nf.formatNumber(params.factoringpropuesta?.monto_descuento),
      monto_comision: nf.formatNumber(params.factoringpropuesta?.monto_comision),
      monto_costo_estimado: nf.formatNumber(params.factoringpropuesta?.monto_costo_estimado),
      monto_total_igv: nf.formatNumber(params.factoringpropuesta?.monto_total_igv),
      monto_adelanto: nf.formatNumber(params.factoringpropuesta?.monto_adelanto),
    };

    params = {
      ...params,
      cabecera,
      factoring_formateado,
      factoringpropuesta_formateado,
    };

    const emailTemplate = await templateManager.templateFactoringEmpresaServicioFactoringPropuestaAceptada(params);

    const mailOptions = {
      to: to,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };

    await emailSender.sendContactoFinanzatech(mailOptions);
  } catch (error) {
    log.error(line(), "", error);
    throw error;
  }
};

export const sendFactoringEmpresaServicioFactoringPropuestaDisponible = async (to, params) => {
  try {
    const cabecera = {
      fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
    };

    const factoring_formateado = {
      fecha_registro: df.formatDateTimeLocale(params.factoring?.fecha_registro),
      monto_factura: nf.formatNumber(params.factoring?.monto_factura),
      monto_detraccion: nf.formatNumber(params.factoring?.monto_detraccion),
      monto_neto: nf.formatNumber(params.factoring?.monto_neto),
      fecha_pago_estimado: df.formatDateUTC(params.factoring?.fecha_pago_estimado),
    };

    const factoringpropuesta_formateado = {
      fecha_propuesta: df.formatDateTimeLocale(params.factoringpropuesta?.fecha_propuesta),
    };

    params = {
      ...params,
      cabecera,
      factoring_formateado,
      factoringpropuesta_formateado,
    };

    const emailTemplate = await templateManager.templateFactoringEmpresaServicioFactoringPropuestaDisponible(params);

    const mailOptions = {
      to: to,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };

    await emailSender.sendContactoFinanzatech(mailOptions);
  } catch (error) {
    log.error(line(), "", error);
    throw error;
  }
};

export const sendFactoringEmpresaServicioFactoringSolicitud = async (to, params) => {
  try {
    const cabecera = {
      fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
    };

    const factoring_formateado = {
      fecha_registro: df.formatDateTimeLocale(params.factoring?.fecha_registro),
      monto_factura: nf.formatNumber(params.factoring?.monto_factura),
      monto_detraccion: nf.formatNumber(params.factoring?.monto_detraccion),
      monto_neto: nf.formatNumber(params.factoring?.monto_neto),
      fecha_pago_estimado: df.formatDateUTC(params.factoring?.fecha_pago_estimado),
    };

    params = {
      ...params,
      cabecera,
      factoring_formateado,
    };

    const emailTemplate = await templateManager.templateFactoringEmpresaServicioFactoringSolicitud(params);

    const mailOptions = {
      to: to,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };

    await emailSender.sendContactoFinanzatech(mailOptions);
  } catch (error) {
    log.error(line(), "", error);
    throw error;
  }
};
