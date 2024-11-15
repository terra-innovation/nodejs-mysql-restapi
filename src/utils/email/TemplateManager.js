import * as config from "../../config.js";
import fs from "fs/promises";
import path from "path";
import * as yup from "yup";

class TemplaceManager {
  constructor() {
    this.templateDir = path.join(process.cwd(), "src/utils/email/templates");
  }

  async loadTemplate(templateName) {
    const templatePath = path.join(this.templateDir, templateName);
    return await fs.readFile(templatePath, "utf8");
  }

  async renderTemplate(templateName, params) {
    let template = await this.loadTemplate(templateName);

    // Reemplazar los placeholders en la plantilla
    Object.keys(params).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      template = template.replace(regex, params[key]);
    });

    return template;
  }

  async templateCodigoVerificacion(params) {
    const methodName = "templateCodigoVerificacion";
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
      logger.error(line(), `Error en ${methodName}:`, error);
      throw error;
    }
  }

  async templateCodigoVerificacion(params) {
    const methodName = "templateCodigoVerificacion";
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
      logger.error(line(), `Error en ${methodName}:`, error);
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
      logger.error(line(), `Error en ${methodName}:`, error);
      throw error;
    }
  }
}

export default TemplaceManager;
