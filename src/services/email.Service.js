import TemplateManager from "#src/utils/email/TemplateManager.ts";
import EmailSender from "#src/utils/email/emailSender.ts";
import { log, line } from "#src/utils/logger.pino.js";
import { ClientError } from "#src/utils/CustomErrors.js";

import * as df from "#src/utils/dateUtils.js";
import * as nf from "#src/utils/numberUtils.js";

// Instanciar clases
const templateManager = new TemplateManager();
const emailSender = new EmailSender();

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
