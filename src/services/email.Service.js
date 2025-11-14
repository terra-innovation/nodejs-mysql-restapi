import TemplateManager from "#src/utils/email/TemplateManager.ts";
import EmailSender from "#src/utils/email/emailSender.ts";
import { log, line } from "#src/utils/logger.pino.js";
import { ClientError } from "#src/utils/CustomErrors.js";

import * as df from "#src/utils/dateUtils.js";
import * as nf from "#src/utils/numberUtils.js";

// Instanciar clases
const templateManager = new TemplateManager();
const emailSender = new EmailSender();

export const sendFactoringEmpresaServicioFactoringPropuestaAceptada = async (to, params) => {
  try {
    const cabecera = {
      fecha_actual: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
    };

    const factoring_fomateado = {
      fecha_registro: df.formatDateTimeLocale(params.factoring?.fecha_registro),
      monto_factura: nf.formatNumber(params.factoring?.monto_factura),
      monto_detraccion: nf.formatNumber(params.factoring?.monto_detraccion),
      monto_neto: nf.formatNumber(params.factoring?.monto_neto),
      fecha_pago_estimado: df.formatDateUTC(params.factoring?.fecha_pago_estimado),
    };

    const factoringpropuesta_fomateado = {
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
      factoring_fomateado,
      factoringpropuesta_fomateado,
    };

    const emailTemplate = await templateManager.templateFactoringEmpresaServicioFactoringPropuestaAceptada(params);

    const mailOptions = {
      to: to,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };

    //await emailSender.sendContactoFinanzatech(mailOptions);
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

    const factoring_fomateado = {
      fecha_registro: df.formatDateTimeLocale(params.factoring?.fecha_registro),
      monto_factura: nf.formatNumber(params.factoring?.monto_factura),
      monto_detraccion: nf.formatNumber(params.factoring?.monto_detraccion),
      monto_neto: nf.formatNumber(params.factoring?.monto_neto),
      fecha_pago_estimado: df.formatDateUTC(params.factoring?.fecha_pago_estimado),
    };

    const factoringpropuesta_fomateado = {
      fecha_propuesta: df.formatDateTimeLocale(params.factoringpropuesta?.fecha_propuesta),
    };

    params = {
      ...params,
      cabecera,
      factoring_fomateado,
      factoringpropuesta_fomateado,
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

    const factoring_fomateado = {
      fecha_registro: df.formatDateTimeLocale(params.factoring?.fecha_registro),
      monto_factura: nf.formatNumber(params.factoring?.monto_factura),
      monto_detraccion: nf.formatNumber(params.factoring?.monto_detraccion),
      monto_neto: nf.formatNumber(params.factoring?.monto_neto),
      fecha_pago_estimado: df.formatDateUTC(params.factoring?.fecha_pago_estimado),
    };

    params = {
      ...params,
      cabecera,
      factoring_fomateado,
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
