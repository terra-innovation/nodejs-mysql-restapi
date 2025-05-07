import * as config from "#src/config";
import fs from "fs/promises";
import path from "path";
import * as yup from "yup";
import { htmlToText } from "html-to-text";
import logger, { line, log } from "#src/utils/logger.js";

class TemplaceManager {
  private templateDir: string;

  constructor() {
    this.templateDir = path.join(process.cwd(), "src/utils/email/templates");
  }

  async loadTemplate(templateName) {
    const templatePath = path.join(this.templateDir, templateName);
    return await fs.readFile(templatePath, "utf8");
  }

  async renderTemplate(templateName, params) {
    let template = await this.loadTemplate(templateName);
    Object.keys(params).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      template = template.replace(regex, params[key]);
    });

    return template;
  }

  async renderSubject(subject, params) {
    Object.keys(params).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      subject = subject.replace(regex, params[key]);
    });
    return subject;
  }

  async convertirHTMLaTextoPlano(html) {
    const textoPlano = htmlToText(html, {
      wordwrap: 130, // Opcional: establece el límite de líneas para el texto plano
    });
    return textoPlano;
  }

  async templateFactoringEmpresaVerificacionMasInformacion(params) {
    try {
      const paramsSchema = yup
        .object()
        .shape({
          codigo_servicio_empresa: yup.string().trim().required().min(1).max(20),
          nombres: yup.string().trim().required().min(1).max(100),
          fecha_actual: yup.string().trim().required().min(1).max(200),
          empresa_razon_social: yup.string().trim().required().min(1).max(500),
          empresa_ruc: yup.string().trim().required().min(1).max(20),
          razon_no_aceptada: yup.string().trim().required().min(1).max(1000),
        })
        .required();
      var paramsValidated = paramsSchema.validateSync(params, { abortEarly: false, stripUnknown: true });
      const bodyEmailTHTML = await this.renderTemplate("factoring-empresa-verificacion-mas-informacion.html", paramsValidated);
      const bodyEmailText = await this.convertirHTMLaTextoPlano(bodyEmailTHTML);
      const subjectEmailText = await this.renderSubject("Información adicional requerida para su suscripción al Factoring Electrónico [{{codigo_servicio_empresa}}]", paramsValidated);

      const codigoverificacionMailOptions = {
        subject: subjectEmailText,
        text: bodyEmailText,
        html: bodyEmailTHTML,
      };
      return codigoverificacionMailOptions;
    } catch (error) {
      log.error(line(), error);
      throw error;
    }
  }

  async templateFactoringEmpresaVerificacionRechazado(params) {
    try {
      const paramsSchema = yup
        .object()
        .shape({
          codigo_servicio_empresa: yup.string().trim().required().min(1).max(20),
          nombres: yup.string().trim().required().min(1).max(100),
          fecha_actual: yup.string().trim().required().min(1).max(200),
          empresa_razon_social: yup.string().trim().required().min(1).max(500),
          empresa_ruc: yup.string().trim().required().min(1).max(20),
        })
        .required();
      var paramsValidated = paramsSchema.validateSync(params, { abortEarly: false, stripUnknown: true });
      const bodyEmailTHTML = await this.renderTemplate("factoring-empresa-verificacion-rechazado.html", paramsValidated);
      const bodyEmailText = await this.convertirHTMLaTextoPlano(bodyEmailTHTML);
      const subjectEmailText = await this.renderSubject("Actualización sobre su solicitud de suscripción al servicio de Factoring Electrónico [{{codigo_servicio_empresa}}]", paramsValidated);

      const codigoverificacionMailOptions = {
        subject: subjectEmailText,
        text: bodyEmailText,
        html: bodyEmailTHTML,
      };
      return codigoverificacionMailOptions;
    } catch (error) {
      log.error(line(), error);
      throw error;
    }
  }

  async templateFactoringEmpresaVerificacionAprobado(params) {
    try {
      const paramsSchema = yup
        .object()
        .shape({
          codigo_servicio_empresa: yup.string().trim().required().min(1).max(20),
          nombres: yup.string().trim().required().min(1).max(100),
          fecha_actual: yup.string().trim().required().min(1).max(200),
          empresa_razon_social: yup.string().trim().required().min(1).max(500),
          empresa_ruc: yup.string().trim().required().min(1).max(20),
        })
        .required();
      var paramsValidated = paramsSchema.validateSync(params, { abortEarly: false, stripUnknown: true });
      const bodyEmailTHTML = await this.renderTemplate("factoring-empresa-verificacion-aprobado.html", paramsValidated);
      const bodyEmailText = await this.convertirHTMLaTextoPlano(bodyEmailTHTML);
      const subjectEmailText = await this.renderSubject("¡Bienvenido a Factoring Electrónico! [{{codigo_servicio_empresa}}]", paramsValidated);

      const codigoverificacionMailOptions = {
        subject: subjectEmailText,
        text: bodyEmailText,
        html: bodyEmailTHTML,
      };
      return codigoverificacionMailOptions;
    } catch (error) {
      log.error(line(), error);
      throw error;
    }
  }

  async templateCodigoVerificacion(params) {
    try {
      const paramsSchema = yup
        .object()
        .shape({
          name: yup.string().trim().required().min(1).max(100),
          codigo: yup.string().trim().required().min(1).max(100),
          fecha_actual: yup.string().trim().required().min(1).max(200),
          duracion_minutos: yup.number().required().min(1).max(200),
          fechacrea: yup.string().trim().required().min(1).max(200),
        })
        .required();
      var paramsValidated = paramsSchema.validateSync(params, { abortEarly: false, stripUnknown: true });
      const codigoverificacionEmail = await this.renderTemplate("codigo-verificacion.html", paramsValidated);

      const codigoverificacionMailOptions = {
        subject: "Código de verificación de Finanza Tech " + paramsValidated.fechacrea,
        text: "Hola. Su código de verificación es: " + paramsValidated.codigo,
        html: codigoverificacionEmail,
      };
      return codigoverificacionMailOptions;
    } catch (error) {
      log.error(line(), error);
      throw error;
    }
  }

  async templateCuentaUsarioVerificadaMasInformacion(params) {
    try {
      const paramsSchema = yup
        .object()
        .shape({
          codigo_usuario: yup.string().trim().required().min(1).max(20),
          nombres: yup.string().trim().required().min(1).max(100),
          razon_no_aceptada: yup.string().trim().required().min(1).max(1000),
          fecha_actual: yup.string().trim().required().min(1).max(200),
        })
        .required();
      var paramsValidated = paramsSchema.validateSync(params, { abortEarly: false, stripUnknown: true });
      const bodyEmailTHTML = await this.renderTemplate("cuenta-usuario-verificada-mas-informacion.html", paramsValidated);
      const bodyEmailText = await this.convertirHTMLaTextoPlano(bodyEmailTHTML);
      const subjectEmailText = await this.renderSubject("Información importante sobre sus documentos [{{codigo_usuario}}]", paramsValidated);

      const codigoverificacionMailOptions = {
        subject: subjectEmailText,
        text: bodyEmailText,
        html: bodyEmailTHTML,
      };
      return codigoverificacionMailOptions;
    } catch (error) {
      log.error(line(), error);
      throw error;
    }
  }

  async templateCuentaUsarioVerificadaExito(params) {
    try {
      const paramsSchema = yup
        .object()
        .shape({
          codigo_usuario: yup.string().trim().required().min(1).max(20),
          nombres: yup.string().trim().required().min(1).max(100),
          fecha_actual: yup.string().trim().required().min(1).max(200),
        })
        .required();
      var paramsValidated = paramsSchema.validateSync(params, { abortEarly: false, stripUnknown: true });
      const bodyEmailTHTML = await this.renderTemplate("cuenta-usuario-verificada-exito.html", paramsValidated);
      const bodyEmailText = await this.convertirHTMLaTextoPlano(bodyEmailTHTML);
      const subjectEmailText = await this.renderSubject("¡Tu cuenta de usuario ha sido verificada con éxito! [{{codigo_usuario}}]", paramsValidated);

      const codigoverificacionMailOptions = {
        subject: subjectEmailText,
        text: bodyEmailText,
        html: bodyEmailTHTML,
      };
      return codigoverificacionMailOptions;
    } catch (error) {
      log.error(line(), error);
      throw error;
    }
  }

  async templateEjemplo(params) {
    const methodName = "templateEjemplo";
    try {
      const paramsSchema = yup
        .object()
        .shape({
          name: yup.string().trim().required().min(1).max(100),
          email: yup.string().trim().email().required().min(1).max(200),
          fechacrea: yup.string().trim().required().min(1).max(200),
        })
        .required();
      var paramsValidated = paramsSchema.validateSync(params, { abortEarly: false, stripUnknown: true });
      const ejemploEmail = await this.renderTemplate("ejemplo.html", paramsValidated);

      const ejemploMailOptions = {
        subject: "Prueba del correo a las " + paramsValidated.fechacrea,
        text: "Contenido del correo en texto plano",
        html: ejemploEmail,
      };
      return ejemploMailOptions;
    } catch (error) {
      log.error(line(), `Error en ${methodName}:`, error);
      throw error;
    }
  }
}

export default TemplaceManager;
