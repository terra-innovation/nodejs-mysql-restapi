import * as config from "#src/config";
import fs from "fs/promises";
import path from "path";
import * as yup from "yup";
import { htmlToText } from "html-to-text";
import { log, line } from "#src/utils/logger.pino.js";
import { Prisma } from "#root/generated/prisma/ft_factoring/client.js";

class TemplaceManager {
  private templateDir: string;

  constructor() {
    this.templateDir = path.join(process.cwd(), "static", "email", "templates");
  }

  async loadTemplate(templateName) {
    const templatePath = path.join(this.templateDir, templateName);
    return await fs.readFile(templatePath, "utf8");
  }

  /**
   * Convierte un objeto en un mapa plano con notación de puntos y soporte para arrays.
   * Ejemplo: { cliente: { nombre: "Juan" }, items: [{ nombre: "Producto" }] }
   * => { "cliente.nombre": "Juan", "items[0].nombre": "Producto" }
   */
  flattenObject(obj, prefix = "", res = {}) {
    for (let key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          this.flattenObject(item, `${newKey}[${index}]`, res);
        });
      } else if (value instanceof Date) {
        res[newKey] = value.toISOString(); // formato estándar
      } else if (value instanceof Prisma.Decimal) {
        res[newKey] = value.toString(); // formato estándar
      } else if (typeof value === "object" && value !== null) {
        this.flattenObject(value, newKey, res);
      } else {
        res[newKey] = value ?? ""; // Si es null/undefined, usar cadena vacía
      }
    }
    return res;
  }

  /**
   * Renderiza una plantilla reemplazando {{key}} por valores del objeto params.
   * Soporta claves anidadas y arrays.
   */
  async renderTemplate(templateName, params) {
    let template = await this.loadTemplate(templateName);
    const flatParams = this.flattenObject(params);

    //console.log("flatParams: ", JSON.stringify(flatParams, null, 2));

    Object.keys(flatParams).forEach((key) => {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`{{\\s*${escapedKey}\\s*}}`, "g"); // Soporta espacios
      template = template.replace(regex, flatParams[key]);
    });

    return template;
  }

  async renderTemplate_20251110_2201(templateName, params) {
    let template = await this.loadTemplate(templateName);
    Object.keys(params).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      template = template.replace(regex, params[key]);
    });

    return template;
  }

  async renderSubject(subject, params) {
    const flatParams = this.flattenObject(params);

    Object.keys(flatParams).forEach((key) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g"); // Soporta espacios
      subject = subject.replace(regex, flatParams[key]);
    });
    return subject;
  }

  async renderSubject_20251110_2201(subject, params) {
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

  async templateFactoringEmpresaServicioFactoringCedenteConfirmacionTransferencia(params) {
    try {
      const paramsSchema = yup
        .object()
        .shape({
          usuario: yup
            .object({
              usuarionombres: yup.string().required(),
              email: yup.string().required(),
            })
            .required(),
          cabecera: yup
            .object({
              fecha_actual: yup.string().trim().required().min(1).max(200),
            })
            .required(),
          factoring: yup
            .object({
              code: yup.string().required(),
              fecha_registro: yup.string().required(),
              monto_factura: yup.string().required(),
              monto_detraccion: yup.string().required(),
              monto_neto: yup.string().required(),
              fecha_pago_estimado: yup.string().required(),
              empresa_cedente: yup.object({
                ruc: yup.string().required(),
                razon_social: yup.string().required(),
              }),
              empresa_aceptante: yup.object({
                ruc: yup.string().required(),
                razon_social: yup.string().required(),
              }),
              moneda: yup.object({
                codigo: yup.string().required(),
                nombre: yup.string().required(),
              }),
            })
            .required(),
          factoring_formateado: yup
            .object({
              factura: yup.string().required(),
            })
            .required(),
          factoringtransferenciacedente: yup
            .object({
              code: yup.string().required(),
              fecha: yup.string().required(),
              monto: yup.string().required(),
              numero_operacion: yup.string().required(),
              factoring_transferencia_estado: yup.object({
                nombre: yup.string().required(),
              }),
              factoring_transferencia_tipo: yup.object({
                nombre: yup.string().required(),
              }),
              factor_cuenta_bancaria: yup.object({
                cuenta_bancaria: yup.object({
                  numero: yup.string().required(),
                  banco: yup.object({
                    nombre: yup.string().required(),
                  }),
                }),
              }),
              empresa_cuenta_bancaria: yup.object({
                cuenta_bancaria: yup.object({
                  numero: yup.string().required(),
                  banco: yup.object({
                    nombre: yup.string().required(),
                  }),
                }),
              }),
              moneda: yup.object({
                codigo: yup.string().required(),
                nombre: yup.string().required(),
                simbolo: yup.string().required(),
              }),
            })
            .required(),
          factoringtransferenciacedente_formateado: yup
            .object({
              fecha: yup.string().required(),
              monto: yup.string().required(),
            })
            .required(),
        })
        .required();
      var paramsValidated = paramsSchema.validateSync(params, { abortEarly: false, stripUnknown: true });

      const bodyEmailTHTML = await this.renderTemplate("factoring-empresa-servicio-factoring-cedente-confirmacion-transferencia.html", paramsValidated);
      const bodyEmailText = await this.convertirHTMLaTextoPlano(bodyEmailTHTML);
      const subjectEmailText = await this.renderSubject("Confirmación de transferencia bancaria por Operación de Factoring de factura {{factoring_formateado.factura}}", paramsValidated);

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

  async templateFactoringEmpresaServicioFactoringDeudorSolicitudConfirmacion(params) {
    try {
      const paramsSchema = yup
        .object()
        .shape({
          cabecera: yup
            .object({
              fecha_actual: yup.string().trim().required().min(1).max(200),
            })
            .required(),
          factoring: yup
            .object({
              code: yup.string().required(),
              fecha_registro: yup.string().required(),
              monto_factura: yup.string().required(),
              monto_detraccion: yup.string().required(),
              monto_neto: yup.string().required(),
              fecha_pago_estimado: yup.string().required(),
              empresa_cedente: yup.object({
                ruc: yup.string().required(),
                razon_social: yup.string().required(),
              }),
              empresa_aceptante: yup.object({
                ruc: yup.string().required(),
                razon_social: yup.string().required(),
              }),
              moneda: yup.object({
                codigo: yup.string().required(),
                nombre: yup.string().required(),
              }),
              factoring_facturas: yup
                .array()
                .of(
                  yup.object().shape({
                    factura: yup.object({
                      serie: yup.string().required(),
                      numero_comprobante: yup.string().required(),
                    }),
                  })
                )
                .min(1)
                .required(),
            })
            .required(),
          factoring_formateado: yup
            .object({
              factura: yup.string().required(),
              monto_neto: yup.string().required(),
              fecha_pago_estimado: yup.string().required(),
            })
            .required(),
        })
        .required();
      var paramsValidated = paramsSchema.validateSync(params, { abortEarly: false, stripUnknown: true });

      const bodyEmailTHTML = await this.renderTemplate("factoring-empresa-servicio-factoring-deudor-solicitud-confirmacion.html", paramsValidated);
      const bodyEmailText = await this.convertirHTMLaTextoPlano(bodyEmailTHTML);
      const subjectEmailText = await this.renderSubject("Confirmación de factura {{factoring_formateado.factura}} para Operación de Factoring", paramsValidated);

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

  async templateFactoringEmpresaServicioFactoringPropuestaAceptada(params) {
    try {
      const paramsSchema = yup
        .object()
        .shape({
          cabecera: yup
            .object({
              fecha_actual: yup.string().trim().required().min(1).max(200),
            })
            .required(),
          factoring: yup
            .object({
              code: yup.string().required(),
              fecha_registro: yup.string().required(),
              monto_factura: yup.string().required(),
              monto_detraccion: yup.string().required(),
              monto_neto: yup.string().required(),
              fecha_pago_estimado: yup.string().required(),
              empresa_cedente: yup.object({
                ruc: yup.string().required(),
                razon_social: yup.string().required(),
              }),
              empresa_aceptante: yup.object({
                ruc: yup.string().required(),
                razon_social: yup.string().required(),
              }),
              moneda: yup.object({
                codigo: yup.string().required(),
                nombre: yup.string().required(),
              }),
              factoring_facturas: yup
                .array()
                .of(
                  yup.object().shape({
                    factura: yup.object({
                      serie: yup.string().required(),
                      numero_comprobante: yup.string().required(),
                    }),
                  })
                )
                .min(1)
                .required(),
            })
            .required(),
          factoringpropuesta: yup
            .object({
              code: yup.string().required(),
              fecha_propuesta: yup.string().required(),
              dias_pago_estimado: yup.string().required(),
              factoring_tipo: yup.object({
                nombre: yup.string().required(),
              }),
            })
            .required(),
          usuario: yup
            .object({
              usuarionombres: yup.string().required(),
              email: yup.string().required(),
            })
            .required(),
          factoring_formateado: yup
            .object({
              fecha_registro: yup.string().required(),
            })
            .required(),
          factoringpropuesta_formateado: yup
            .object({
              fecha_propuesta: yup.string().required(),
              monto_neto: yup.string().required(),
              fecha_pago_estimado: yup.string().required(),
              tdm: yup.string().required(),
              porcentaje_financiado_estimado: yup.string().required(),
              monto_garantia: yup.string().required(),
              monto_financiado: yup.string().required(),
              monto_descuento: yup.string().required(),
              monto_comision: yup.string().required(),
              monto_costo_estimado: yup.string().required(),
              monto_total_igv: yup.string().required(),
              monto_adelanto: yup.string().required(),
            })
            .required(),
        })
        .required();
      var paramsValidated = paramsSchema.validateSync(params, { abortEarly: false, stripUnknown: true });

      const bodyEmailTHTML = await this.renderTemplate("factoring-empresa-servicio-factoring-propuesta-aceptada.html", paramsValidated);
      const bodyEmailText = await this.convertirHTMLaTextoPlano(bodyEmailTHTML);
      const subjectEmailText = await this.renderSubject("Propuesta de factoring aceptada [#{{factoring.code}}]", paramsValidated);

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

  async templateFactoringEmpresaServicioFactoringPropuestaDisponible(params) {
    try {
      const paramsSchema = yup
        .object()
        .shape({
          cabecera: yup
            .object({
              fecha_actual: yup.string().trim().required().min(1).max(200),
            })
            .required(),
          factoring: yup
            .object({
              code: yup.string().required(),
              fecha_registro: yup.string().required(),
              monto_factura: yup.string().required(),
              monto_detraccion: yup.string().required(),
              monto_neto: yup.string().required(),
              fecha_pago_estimado: yup.string().required(),
              empresa_cedente: yup.object({
                ruc: yup.string().required(),
                razon_social: yup.string().required(),
              }),
              empresa_aceptante: yup.object({
                ruc: yup.string().required(),
                razon_social: yup.string().required(),
              }),
              moneda: yup.object({
                codigo: yup.string().required(),
                nombre: yup.string().required(),
              }),
              factoring_facturas: yup
                .array()
                .of(
                  yup.object().shape({
                    factura: yup.object({
                      serie: yup.string().required(),
                      numero_comprobante: yup.string().required(),
                    }),
                  })
                )
                .min(1)
                .required(),
            })
            .required(),
          factoringpropuesta: yup
            .object({
              code: yup.string().required(),
              fecha_propuesta: yup.string().required(),
            })
            .required(),
          usuario: yup
            .object({
              usuarionombres: yup.string().required(),
              email: yup.string().required(),
            })
            .required(),
          factoring_formateado: yup
            .object({
              fecha_registro: yup.string().required(),
            })
            .required(),
          factoringpropuesta_formateado: yup
            .object({
              fecha_propuesta: yup.string().required(),
            })
            .required(),
        })
        .required();
      var paramsValidated = paramsSchema.validateSync(params, { abortEarly: false, stripUnknown: true });

      const bodyEmailTHTML = await this.renderTemplate("factoring-empresa-servicio-factoring-propuesta-disponible.html", paramsValidated);
      const bodyEmailText = await this.convertirHTMLaTextoPlano(bodyEmailTHTML);
      const subjectEmailText = await this.renderSubject("Propuesta de factoring disponible [#{{factoring.code}}]", paramsValidated);

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

  async templateFactoringEmpresaServicioFactoringSolicitud(params) {
    try {
      const paramsSchema = yup
        .object()
        .shape({
          cabecera: yup
            .object({
              fecha_actual: yup.string().trim().required().min(1).max(200),
            })
            .required(),
          factoring: yup
            .object({
              code: yup.string().required(),
              fecha_registro: yup.string().required(),
              monto_factura: yup.string().required(),
              monto_detraccion: yup.string().required(),
              monto_neto: yup.string().required(),
              fecha_pago_estimado: yup.string().required(),
              empresa_cedente: yup.object({
                ruc: yup.string().required(),
                razon_social: yup.string().required(),
              }),
              empresa_aceptante: yup.object({
                ruc: yup.string().required(),
                razon_social: yup.string().required(),
              }),
              moneda: yup.object({
                codigo: yup.string().required(),
                nombre: yup.string().required(),
              }),
              factoring_facturas: yup
                .array()
                .of(
                  yup.object().shape({
                    factura: yup.object({
                      serie: yup.string().required(),
                      numero_comprobante: yup.string().required(),
                    }),
                  })
                )
                .min(1)
                .required(),
            })
            .required(),
          usuario: yup
            .object({
              usuarionombres: yup.string().required(),
              email: yup.string().required(),
            })
            .required(),
          factoring_formateado: yup
            .object({
              fecha_registro: yup.string().required(),
              monto_factura: yup.string().required(),
              monto_detraccion: yup.string().required(),
              monto_neto: yup.string().required(),
              fecha_pago_estimado: yup.string().required(),
            })
            .required(),
        })
        .required();
      var paramsValidated = paramsSchema.validateSync(params, { abortEarly: false, stripUnknown: true });

      const bodyEmailTHTML = await this.renderTemplate("factoring-empresa-servicio-factoring-solicitud.html", paramsValidated);
      const bodyEmailText = await this.convertirHTMLaTextoPlano(bodyEmailTHTML);
      const subjectEmailText = await this.renderSubject("Solicitud de operación de factoring [#{{factoring.code}}]", paramsValidated);

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

  async templateFactoringInversionistaVerificacionMasInformacion(params) {
    try {
      const paramsSchema = yup
        .object()
        .shape({
          codigo_servicio_inversionista: yup.string().trim().required().min(1).max(20),
          nombres: yup.string().trim().required().min(1).max(100),
          fecha_actual: yup.string().trim().required().min(1).max(200),
          razon_no_aceptada: yup.string().trim().required().min(1).max(1000),
        })
        .required();
      var paramsValidated = paramsSchema.validateSync(params, { abortEarly: false, stripUnknown: true });
      const bodyEmailTHTML = await this.renderTemplate("factoring-inversionista-verificacion-mas-informacion.html", paramsValidated);
      const bodyEmailText = await this.convertirHTMLaTextoPlano(bodyEmailTHTML);
      const subjectEmailText = await this.renderSubject("Información adicional requerida para su suscripción al servicio de Inversión en Facturas de Factoring [{{codigo_servicio_inversionista}}]", paramsValidated);

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

  async templateFactoringInversionistaVerificacionRechazado(params) {
    try {
      const paramsSchema = yup
        .object()
        .shape({
          codigo_servicio_inversionista: yup.string().trim().required().min(1).max(20),
          nombres: yup.string().trim().required().min(1).max(100),
          fecha_actual: yup.string().trim().required().min(1).max(200),
        })
        .required();
      var paramsValidated = paramsSchema.validateSync(params, { abortEarly: false, stripUnknown: true });
      const bodyEmailTHTML = await this.renderTemplate("factoring-inversionista-verificacion-rechazado.html", paramsValidated);
      const bodyEmailText = await this.convertirHTMLaTextoPlano(bodyEmailTHTML);
      const subjectEmailText = await this.renderSubject("Actualización sobre su solicitud de suscripción al servicio de Inversión en Facturas de Factoring [{{codigo_servicio_inversionista}}]", paramsValidated);

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

  async templateFactoringInversionistaVerificacionAprobado(params) {
    try {
      const paramsSchema = yup
        .object()
        .shape({
          codigo_servicio_inversionista: yup.string().trim().required().min(1).max(20),
          nombres: yup.string().trim().required().min(1).max(100),
          fecha_actual: yup.string().trim().required().min(1).max(200),
        })
        .required();
      var paramsValidated = paramsSchema.validateSync(params, { abortEarly: false, stripUnknown: true });
      const bodyEmailTHTML = await this.renderTemplate("factoring-inversionista-verificacion-aprobado.html", paramsValidated);
      const bodyEmailText = await this.convertirHTMLaTextoPlano(bodyEmailTHTML);
      const subjectEmailText = await this.renderSubject("¡Bienvenido a Inversión en Facturas de Factoring! [{{codigo_servicio_inversionista}}]", paramsValidated);

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
          otp: yup.string().trim().required().min(1).max(100),
          duracion_minutos: yup.number().required().min(1).max(200),
          fecha_actual: yup.string().trim().required().min(1).max(200),
        })
        .required();
      var paramsValidated = paramsSchema.validateSync(params, { abortEarly: false, stripUnknown: true });
      const bodyEmailTHTML = await this.renderTemplate("codigo-verificacion.html", paramsValidated);
      const bodyEmailText = await this.convertirHTMLaTextoPlano(bodyEmailTHTML);
      const subjectEmailText = await this.renderSubject("Código de verificación de Finanza Tech", paramsValidated);

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
