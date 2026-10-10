import { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { line, log } from "#src/utils/logger.pino.js";
import fs from "fs/promises";
import { htmlToText } from "html-to-text";
import path from "path";
import { z } from "zod";
import { objectInput, stringInput, numberInput, inputEmailPattern } from "#src/utils/validationInputs.js";

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
  private getNestedValue(obj, path) {
    if (!path) return obj;
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  }

  flattenObject(obj, prefix = "", res = {}) {
    for (let key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
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
    // 0. Procesar primero los condicionales (if/else)
    template = this.processConditionals(template, params);
    // 1. Procesar los bucles (foreach)
    template = this.processLoops(template, params);

    // 2. Aplanar el resto para variables simples (como ya lo haces)

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

  private processLoops(template: string, params: any): string {
    // Regex para capturar {{#foreach nombreArray}} contenido {{/foreach}}
    // Ahora soporta puntos en el nombre (ej: factoringpropuesta.gastos) y el alias (ej: as financiero)
    const loopRegex = /{{\s*#foreach\s+([\w.]+)(?:\s+as\s+(\w+))?\s*}}([\s\S]*?){{\s*\/foreach\s*}}/g;

    return template.replace(loopRegex, (match, arrayPath, alias, subTemplate) => {
      const list = this.getNestedValue(params, arrayPath);

      if (!Array.isArray(list)) return "";

      // Para cada item en el array, renderizamos el subTemplate
      return list
        .map((item) => {
          let renderedItem = subTemplate;

          // Aplanamos el item actual para soportar objetos anidados dentro del array
          // Si hay un alias, lo usamos como prefijo
          const flatItem = this.flattenObject(item, alias || "");

          Object.keys(flatItem).forEach((key) => {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
            renderedItem = renderedItem.replace(regex, flatItem[key]);
          });

          return renderedItem;
        })
        .join("");
    });
  }

  /**
   * Procesa bloques condicionales en la plantilla.
   *
   * Sintaxis soportada:
   *   {{#if variable}}               → truthy/falsy
   *   {{#if variable == "valor"}}     → igualdad estricta (string o número)
   *   {{#if variable != "valor"}}     → desigualdad
   *   {{#if variable > 0}}            → comparación numérica (>, <, >=, <=)
   *   {{#else}}                       → bloque alternativo (opcional)
   *   {{/if}}                         → cierre del bloque
   *
   * Ejemplo HTML:
   *   {{#if factoringliquidacion.monto_total_por_cobrar > 0}}
   *     <p>Hay un monto por cobrar</p>
   *   {{#else}}
   *     <p>No hay monto por cobrar</p>
   *   {{/if}}
   */
  private processConditionals(template: string, params: any): string {
    const flatParams = this.flattenObject(params);

    // Regex: captura la condición, el bloque "then" y el bloque "else" opcional
    const ifRegex = /{{\s*#if\s+(.+?)\s*}}([\s\S]*?)(?:{{\s*#else\s*}}([\s\S]*?))?{{\s*\/if\s*}}/g;

    return template.replace(ifRegex, (match, condition, thenBlock, elseBlock = "") => {
      const result = this.evaluateCondition(condition.trim(), flatParams);
      return result ? thenBlock : elseBlock;
    });
  }

  /**
   * Evalúa una expresión de condición contra los params aplanados.
   * Soporta: truthy, ==, !=, >, <, >=, <=
   */
  private evaluateCondition(condition: string, flatParams: Record<string, any>): boolean {
    // Operadores soportados (orden importa: >= y <= antes que > y <)
    const operatorRegex = /^(.+?)\s*(===|!==|==|!=|>=|<=|>|<)\s*(.+)$/;
    const match = condition.match(operatorRegex);

    if (match) {
      const [, leftRaw, operator, rightRaw] = match;
      const leftVal = this.resolveValue(leftRaw.trim(), flatParams);
      const rightVal = this.resolveValue(rightRaw.trim(), flatParams);

      // Intentar comparación numérica si ambos son números
      const leftNum = Number(leftVal);
      const rightNum = Number(rightVal);
      const bothNumeric = !isNaN(leftNum) && !isNaN(rightNum);

      switch (operator) {
        case "==":
        case "===":
          return bothNumeric ? leftNum === rightNum : String(leftVal) === String(rightVal);
        case "!=":
        case "!==":
          return bothNumeric ? leftNum !== rightNum : String(leftVal) !== String(rightVal);
        case ">":
          return bothNumeric && leftNum > rightNum;
        case "<":
          return bothNumeric && leftNum < rightNum;
        case ">=":
          return bothNumeric && leftNum >= rightNum;
        case "<=":
          return bothNumeric && leftNum <= rightNum;
      }
    }

    // Sin operador: evalúa truthy/falsy del valor de la variable
    const value = this.resolveValue(condition, flatParams);
    return !!value && value !== "0" && value !== "false" && value !== "";
  }

  /**
   * Resuelve el valor de un token: si existe en flatParams lo devuelve,
   * si es un literal entre comillas devuelve el string, si no lo trata como literal.
   */
  private resolveValue(token: string, flatParams: Record<string, any>): any {
    // Literal string entre comillas simples o dobles
    if (/^["'].*["']$/.test(token)) {
      return token.slice(1, -1);
    }
    // Clave en flatParams
    if (token in flatParams) {
      return flatParams[token];
    }
    // Literal numérico u otro
    return token;
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

  async templateEmailingVentaEnFrio(params) {
    try {
      const paramsSchema = objectInput(
        z.object({
          cabecera: objectInput(
            z.object({
              fecha_actual: stringInput(
                z
                  .string()
                  .refine((value) => value.length > 0, "Campo requerido")
                  .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
                  .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
                { trim: true },
              ),
            }),
          ),
          random_subject: stringInput(z.string().optional(), { trim: true }),
        }),
      );
      var paramsValidated = paramsSchema.parse(params);

      // Lista de asuntos
      let subjectList = [];
      subjectList.push("Obtén liquidez con el servicio de factoring de Finanza Tech");
      subjectList.push("¿Tus ventas son a crédito? Convierte facturas en liquidez con Finanza Tech");
      subjectList.push("Convierte tus facturas en liquidez con Finanza Tech");

      // Selección aleatoria
      const randomSubject = subjectList[Math.floor(Math.random() * subjectList.length)];

      paramsValidated.random_subject = randomSubject;

      const bodyEmailTHTML = await this.renderTemplate("emailing-venta-en-frio.html", paramsValidated);
      const bodyEmailText = await this.convertirHTMLaTextoPlano(bodyEmailTHTML);
      const subjectEmailText = await this.renderSubject(randomSubject, paramsValidated);

      const mailOptions = {
        subject: subjectEmailText,
        text: bodyEmailText,
        html: bodyEmailTHTML,
      };
      return mailOptions;
    } catch (error) {
      log.error(line(), error);
      throw error;
    }
  }

  async templateFactoringEmpresaServicioFactoringCedenteNotificacionLiquidacion(params) {
    try {
      const paramsSchema = objectInput(
        z.object({
          usuario: objectInput(
            z.object({
              usuarionombres: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              email: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
            }),
          ),
          cabecera: objectInput(
            z.object({
              fecha_actual: stringInput(
                z
                  .string()
                  .refine((value) => value.length > 0, "Campo requerido")
                  .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
                  .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
                { trim: true },
              ),
            }),
          ),
          factoring: objectInput(
            z.object({
              code: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_registro: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_factura: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_detraccion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_retencion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_neto: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_pago_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              empresa_cedente: objectInput(
                z.object({
                  ruc: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  razon_social: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              empresa_aceptante: objectInput(
                z.object({
                  ruc: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  razon_social: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              moneda: objectInput(
                z.object({
                  codigo: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  nombre: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  simbolo: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
            }),
          ),
          factoring_formateado: objectInput(
            z.object({
              factura: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
            }),
          ),
          factoringliquidacion: objectInput(
            z.object({
              code: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_liquidacion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_total_por_cobrar: numberInput(z.custom<number>((value) => typeof value === "number" && !Number.isNaN(value))),
              monto_total_a_favor: numberInput(z.custom<number>((value) => typeof value === "number" && !Number.isNaN(value))),
            }),
          ),
          factoringliquidacion_formateado: objectInput(
            z.object({
              fecha_liquidacion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
            }),
          ),
        }),
      );
      var paramsValidated = paramsSchema.parse(params);

      const bodyEmailTHTML = await this.renderTemplate("factoring-empresa-servicio-factoring-cedente-notificacion-liquidacion.html", paramsValidated);
      const bodyEmailText = await this.convertirHTMLaTextoPlano(bodyEmailTHTML);
      const subjectEmailText = await this.renderSubject("Liquidación disponible | OP:{{factoring.code}} - Factura: {{factoring_formateado.factura}}", paramsValidated);

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

  async templateFactoringEmpresaServicioFactoringCedenteNotificacionInicioOperacion(params) {
    try {
      const paramsSchema = objectInput(
        z.object({
          cabecera: objectInput(
            z.object({
              fecha_actual: stringInput(
                z
                  .string()
                  .refine((value) => value.length > 0, "Campo requerido")
                  .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
                  .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
                { trim: true },
              ),
            }),
          ),
          factoring: objectInput(
            z.object({
              code: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_registro: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_factura: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_detraccion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_retencion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_neto: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_pago_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              empresa_cedente: objectInput(
                z.object({
                  ruc: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  razon_social: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              empresa_aceptante: objectInput(
                z.object({
                  ruc: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  razon_social: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              moneda: objectInput(
                z.object({
                  codigo: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  nombre: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  simbolo: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              factoring_facturas: z
                .array(
                  objectInput(
                    z.object({
                      factura: objectInput(
                        z.object({
                          serie: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                          numero_comprobante: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                        }),
                      ),
                    }),
                  ),
                )
                .min(1),
            }),
          ),
          factoringpropuesta: objectInput(
            z.object({
              code: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_propuesta: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              dias_pago_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              factoring_tipo: objectInput(
                z.object({
                  nombre: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              costos: z
                .array(
                  objectInput(
                    z.object({
                      monto: z.custom<any>((value) => value !== null && value !== undefined),
                      financiero_concepto: objectInput(
                        z.object({
                          alias: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                        }),
                      ),
                    }),
                  ),
                )
                .optional(),
              gastos: z
                .array(
                  objectInput(
                    z.object({
                      monto: z.custom<any>((value) => value !== null && value !== undefined),
                      financiero_concepto: objectInput(
                        z.object({
                          alias: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                        }),
                      ),
                    }),
                  ),
                )
                .optional(),
              gastos_excento_igv: z
                .array(
                  objectInput(
                    z.object({
                      monto: z.custom<any>((value) => value !== null && value !== undefined),
                      financiero_concepto: objectInput(
                        z.object({
                          alias: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                        }),
                      ),
                    }),
                  ),
                )
                .optional(),
            }),
          ),
          usuario: objectInput(
            z.object({
              usuarionombres: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              email: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
            }),
          ),
          factoring_formateado: objectInput(
            z.object({
              factura: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_registro: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_operacion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
            }),
          ),
          factoringpropuesta_formateado: objectInput(
            z.object({
              fecha_propuesta: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_neto: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_pago_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              tdm: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              porcentaje_financiado_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_garantia: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_financiado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_descuento: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_comision: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_costo_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_total_igv: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_adelanto: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
            }),
          ),
        }),
      );
      var paramsValidated = paramsSchema.parse(params);

      const bodyEmailTHTML = await this.renderTemplate("factoring-empresa-servicio-factoring-cedente-confirmacion-inicio-operacion.html", paramsValidated);
      const bodyEmailText = await this.convertirHTMLaTextoPlano(bodyEmailTHTML);
      const subjectEmailText = await this.renderSubject("Confirmación de inicio de Operación de Factoring [#{{factoring.code}}]", paramsValidated);

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

  async templateFactoringEmpresaServicioFactoringDeudorNotificacionTransferencia(params) {
    try {
      const paramsSchema = objectInput(
        z.object({
          cabecera: objectInput(
            z.object({
              fecha_actual: stringInput(
                z
                  .string()
                  .refine((value) => value.length > 0, "Campo requerido")
                  .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
                  .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
                { trim: true },
              ),
            }),
          ),
          factoring: objectInput(
            z.object({
              code: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_registro: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_factura: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_detraccion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_retencion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_neto: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_pago_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              empresa_cedente: objectInput(
                z.object({
                  ruc: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  razon_social: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              empresa_aceptante: objectInput(
                z.object({
                  ruc: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  razon_social: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              moneda: objectInput(
                z.object({
                  codigo: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  nombre: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  simbolo: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              factoring_facturas: z
                .array(
                  objectInput(
                    z.object({
                      factura: objectInput(
                        z.object({
                          serie: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                          numero_comprobante: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                        }),
                      ),
                    }),
                  ),
                )
                .min(1),
            }),
          ),
          factoringpropuesta: objectInput(
            z.object({
              code: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_propuesta: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              dias_pago_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              factoring_tipo: objectInput(
                z.object({
                  nombre: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              costos: z
                .array(
                  objectInput(
                    z.object({
                      monto: z.custom<any>((value) => value !== null && value !== undefined),
                      financiero_concepto: objectInput(
                        z.object({
                          alias: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                        }),
                      ),
                    }),
                  ),
                )
                .optional(),
              gastos: z
                .array(
                  objectInput(
                    z.object({
                      monto: z.custom<any>((value) => value !== null && value !== undefined),
                      financiero_concepto: objectInput(
                        z.object({
                          alias: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                        }),
                      ),
                    }),
                  ),
                )
                .optional(),
              gastos_excento_igv: z
                .array(
                  objectInput(
                    z.object({
                      monto: z.custom<any>((value) => value !== null && value !== undefined),
                      financiero_concepto: objectInput(
                        z.object({
                          alias: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                        }),
                      ),
                    }),
                  ),
                )
                .optional(),
            }),
          ),
          factoring_formateado: objectInput(
            z.object({
              factura: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_factura: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_neto: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_pago_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
            }),
          ),
          factoringpropuesta_formateado: objectInput(
            z.object({
              fecha_propuesta: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_neto: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_pago_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              tdm: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              porcentaje_financiado_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_garantia: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_financiado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_descuento: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_comision: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_costo_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_total_igv: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_adelanto: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
            }),
          ),
          factorcuentabancaria: objectInput(
            z.object({
              factor: objectInput(
                z.object({
                  razon_social: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              cuenta_bancaria: objectInput(
                z.object({
                  numero: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  cci: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  banco: objectInput(
                    z.object({
                      nombre: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                    }),
                  ),
                  cuenta_tipo: objectInput(
                    z.object({
                      nombre: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                    }),
                  ),
                  moneda: objectInput(
                    z.object({
                      codigo: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                      nombre: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                      simbolo: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                    }),
                  ),
                }),
              ),
            }),
          ),
        }),
      );
      var paramsValidated = paramsSchema.parse(params);

      const bodyEmailTHTML = await this.renderTemplate("factoring-empresa-servicio-factoring-deudor-notificacion-transferencia.html", paramsValidated);
      const bodyEmailText = await this.convertirHTMLaTextoPlano(bodyEmailTHTML);
      const subjectEmailText = await this.renderSubject("Confirmación de transferencia de factura {{factoring_formateado.factura}} y datos para pago", paramsValidated);

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

  async templateFactoringEmpresaServicioFactoringCedenteConfirmacionTransferencia(params) {
    try {
      const paramsSchema = objectInput(
        z.object({
          usuario: objectInput(
            z.object({
              usuarionombres: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              email: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
            }),
          ),
          cabecera: objectInput(
            z.object({
              fecha_actual: stringInput(
                z
                  .string()
                  .refine((value) => value.length > 0, "Campo requerido")
                  .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
                  .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
                { trim: true },
              ),
            }),
          ),
          factoring: objectInput(
            z.object({
              code: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_registro: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_factura: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_detraccion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_retencion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_neto: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_pago_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              empresa_cedente: objectInput(
                z.object({
                  ruc: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  razon_social: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              empresa_aceptante: objectInput(
                z.object({
                  ruc: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  razon_social: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              moneda: objectInput(
                z.object({
                  codigo: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  nombre: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  simbolo: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
            }),
          ),
          factoring_formateado: objectInput(
            z.object({
              factura: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
            }),
          ),
          factoringtransferenciacedente: objectInput(
            z.object({
              code: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              numero_operacion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              factoring_transferencia_estado: objectInput(
                z.object({
                  nombre: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              factoring_transferencia_tipo: objectInput(
                z.object({
                  nombre: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              factor_cuenta_bancaria: objectInput(
                z.object({
                  cuenta_bancaria: objectInput(
                    z.object({
                      numero: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                      banco: objectInput(
                        z.object({
                          nombre: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                        }),
                      ),
                    }),
                  ),
                }),
              ),
              empresa_cuenta_bancaria: objectInput(
                z.object({
                  cuenta_bancaria: objectInput(
                    z.object({
                      numero: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                      banco: objectInput(
                        z.object({
                          nombre: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                        }),
                      ),
                    }),
                  ),
                }),
              ),
              moneda: objectInput(
                z.object({
                  codigo: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  nombre: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  simbolo: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
            }),
          ),
          factoringtransferenciacedente_formateado: objectInput(
            z.object({
              fecha: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
            }),
          ),
        }),
      );
      var paramsValidated = paramsSchema.parse(params);

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
      const paramsSchema = objectInput(
        z.object({
          cabecera: objectInput(
            z.object({
              fecha_actual: stringInput(
                z
                  .string()
                  .refine((value) => value.length > 0, "Campo requerido")
                  .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
                  .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
                { trim: true },
              ),
            }),
          ),
          factoring: objectInput(
            z.object({
              code: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_registro: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_factura: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_detraccion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_retencion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_neto: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_pago_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              empresa_cedente: objectInput(
                z.object({
                  ruc: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  razon_social: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              empresa_aceptante: objectInput(
                z.object({
                  ruc: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  razon_social: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              moneda: objectInput(
                z.object({
                  codigo: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  nombre: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  simbolo: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              factoring_facturas: z
                .array(
                  objectInput(
                    z.object({
                      factura: objectInput(
                        z.object({
                          serie: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                          numero_comprobante: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                        }),
                      ),
                    }),
                  ),
                )
                .min(1),
            }),
          ),
          factoring_formateado: objectInput(
            z.object({
              factura: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_neto: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_pago_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
            }),
          ),
        }),
      );
      var paramsValidated = paramsSchema.parse(params);

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
      const paramsSchema = objectInput(
        z.object({
          cabecera: objectInput(
            z.object({
              fecha_actual: stringInput(
                z
                  .string()
                  .refine((value) => value.length > 0, "Campo requerido")
                  .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
                  .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
                { trim: true },
              ),
            }),
          ),
          factoring: objectInput(
            z.object({
              code: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_registro: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_factura: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_detraccion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_retencion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_neto: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_pago_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              empresa_cedente: objectInput(
                z.object({
                  ruc: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  razon_social: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              empresa_aceptante: objectInput(
                z.object({
                  ruc: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  razon_social: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              moneda: objectInput(
                z.object({
                  codigo: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  nombre: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  simbolo: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              factoring_facturas: z
                .array(
                  objectInput(
                    z.object({
                      factura: objectInput(
                        z.object({
                          serie: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                          numero_comprobante: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                        }),
                      ),
                    }),
                  ),
                )
                .min(1),
            }),
          ),
          factoringpropuesta: objectInput(
            z.object({
              code: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_propuesta: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              dias_pago_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              factoring_tipo: objectInput(
                z.object({
                  nombre: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              costos: z
                .array(
                  objectInput(
                    z.object({
                      monto: z.custom<any>((value) => value !== null && value !== undefined),
                      financiero_concepto: objectInput(
                        z.object({
                          alias: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                        }),
                      ),
                    }),
                  ),
                )
                .optional(),
              gastos: z
                .array(
                  objectInput(
                    z.object({
                      monto: z.custom<any>((value) => value !== null && value !== undefined),
                      financiero_concepto: objectInput(
                        z.object({
                          alias: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                        }),
                      ),
                    }),
                  ),
                )
                .optional(),
              gastos_excento_igv: z
                .array(
                  objectInput(
                    z.object({
                      monto: z.custom<any>((value) => value !== null && value !== undefined),
                      financiero_concepto: objectInput(
                        z.object({
                          alias: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                        }),
                      ),
                    }),
                  ),
                )
                .optional(),
            }),
          ),
          usuario: objectInput(
            z.object({
              usuarionombres: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              email: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
            }),
          ),
          factoring_formateado: objectInput(
            z.object({
              fecha_registro: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
            }),
          ),
          factoringpropuesta_formateado: objectInput(
            z.object({
              fecha_propuesta: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_neto: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_pago_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              tdm: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              porcentaje_financiado_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_garantia: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_financiado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_descuento: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_comision: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_costo_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_total_igv: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_adelanto: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
            }),
          ),
        }),
      );
      var paramsValidated = paramsSchema.parse(params);

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
      const paramsSchema = objectInput(
        z.object({
          cabecera: objectInput(
            z.object({
              fecha_actual: stringInput(
                z
                  .string()
                  .refine((value) => value.length > 0, "Campo requerido")
                  .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
                  .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
                { trim: true },
              ),
            }),
          ),
          factoring: objectInput(
            z.object({
              code: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_registro: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_factura: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_detraccion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_retencion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_neto: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_pago_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              empresa_cedente: objectInput(
                z.object({
                  ruc: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  razon_social: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              empresa_aceptante: objectInput(
                z.object({
                  ruc: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  razon_social: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              moneda: objectInput(
                z.object({
                  codigo: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  nombre: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  simbolo: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              factoring_facturas: z
                .array(
                  objectInput(
                    z.object({
                      factura: objectInput(
                        z.object({
                          serie: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                          numero_comprobante: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                        }),
                      ),
                    }),
                  ),
                )
                .min(1),
            }),
          ),
          factoringpropuesta: objectInput(
            z.object({
              code: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_propuesta: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
            }),
          ),
          usuario: objectInput(
            z.object({
              usuarionombres: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              email: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
            }),
          ),
          factoring_formateado: objectInput(
            z.object({
              fecha_registro: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
            }),
          ),
          factoringpropuesta_formateado: objectInput(
            z.object({
              fecha_propuesta: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
            }),
          ),
        }),
      );
      var paramsValidated = paramsSchema.parse(params);

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
      const paramsSchema = objectInput(
        z.object({
          cabecera: objectInput(
            z.object({
              fecha_actual: stringInput(
                z
                  .string()
                  .refine((value) => value.length > 0, "Campo requerido")
                  .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
                  .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
                { trim: true },
              ),
            }),
          ),
          factoring: objectInput(
            z.object({
              code: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_registro: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_factura: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_detraccion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_retencion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_neto: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_pago_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              empresa_cedente: objectInput(
                z.object({
                  ruc: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  razon_social: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              empresa_aceptante: objectInput(
                z.object({
                  ruc: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  razon_social: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              moneda: objectInput(
                z.object({
                  codigo: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  nombre: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                  simbolo: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                }),
              ),
              factoring_facturas: z
                .array(
                  objectInput(
                    z.object({
                      factura: objectInput(
                        z.object({
                          serie: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                          numero_comprobante: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
                        }),
                      ),
                    }),
                  ),
                )
                .min(1),
            }),
          ),
          usuario: objectInput(
            z.object({
              usuarionombres: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              email: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
            }),
          ),
          factoring_formateado: objectInput(
            z.object({
              fecha_registro: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_factura: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_detraccion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_retencion: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              monto_neto: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
              fecha_pago_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
            }),
          ),
        }),
      );
      var paramsValidated = paramsSchema.parse(params);

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
      const paramsSchema = objectInput(
        z.object({
          codigo_servicio_inversionista: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
            { trim: true },
          ),
          nombres: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
            { trim: true },
          ),
          fecha_actual: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
            { trim: true },
          ),
          razon_no_aceptada: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 20000, "Debe tener como máximo 20000 caracteres"),
            { trim: true },
          ),
        }),
      );
      var paramsValidated = paramsSchema.parse(params);
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
      const paramsSchema = objectInput(
        z.object({
          codigo_servicio_inversionista: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
            { trim: true },
          ),
          nombres: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
            { trim: true },
          ),
          fecha_actual: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
            { trim: true },
          ),
        }),
      );
      var paramsValidated = paramsSchema.parse(params);
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
      const paramsSchema = objectInput(
        z.object({
          codigo_servicio_inversionista: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
            { trim: true },
          ),
          nombres: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
            { trim: true },
          ),
          fecha_actual: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
            { trim: true },
          ),
        }),
      );
      var paramsValidated = paramsSchema.parse(params);
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
      const paramsSchema = objectInput(
        z.object({
          codigo_servicio_empresa: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
            { trim: true },
          ),
          nombres: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
            { trim: true },
          ),
          fecha_actual: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
            { trim: true },
          ),
          empresa_razon_social: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 500, "Debe tener como máximo 500 caracteres"),
            { trim: true },
          ),
          empresa_ruc: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
            { trim: true },
          ),
          razon_no_aceptada: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 20000, "Debe tener como máximo 20000 caracteres"),
            { trim: true },
          ),
        }),
      );
      var paramsValidated = paramsSchema.parse(params);
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
      const paramsSchema = objectInput(
        z.object({
          codigo_servicio_empresa: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
            { trim: true },
          ),
          nombres: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
            { trim: true },
          ),
          fecha_actual: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
            { trim: true },
          ),
          empresa_razon_social: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 500, "Debe tener como máximo 500 caracteres"),
            { trim: true },
          ),
          empresa_ruc: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
            { trim: true },
          ),
        }),
      );
      var paramsValidated = paramsSchema.parse(params);
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
      const paramsSchema = objectInput(
        z.object({
          codigo_servicio_empresa: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
            { trim: true },
          ),
          nombres: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
            { trim: true },
          ),
          fecha_actual: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
            { trim: true },
          ),
          empresa_razon_social: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 500, "Debe tener como máximo 500 caracteres"),
            { trim: true },
          ),
          empresa_ruc: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
            { trim: true },
          ),
        }),
      );
      var paramsValidated = paramsSchema.parse(params);
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
      const paramsSchema = objectInput(
        z.object({
          otp: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
            { trim: true },
          ),
          duracion_minutos: numberInput(
            z
              .custom<number>((value) => typeof value === "number" && !Number.isNaN(value))
              .refine((value) => value >= 1, "Debe ser mayor o igual que 1")
              .refine((value) => value <= 200, "Debe ser menor o igual que 200"),
          ),
          fecha_actual: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
            { trim: true },
          ),
        }),
      );
      var paramsValidated = paramsSchema.parse(params);
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
      const paramsSchema = objectInput(
        z.object({
          codigo_usuario: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
            { trim: true },
          ),
          nombres: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
            { trim: true },
          ),
          razon_no_aceptada: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 20000, "Debe tener como máximo 20000 caracteres"),
            { trim: true },
          ),
          fecha_actual: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
            { trim: true },
          ),
        }),
      );
      var paramsValidated = paramsSchema.parse(params);
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
      const paramsSchema = objectInput(
        z.object({
          codigo_usuario: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 20, "Debe tener como máximo 20 caracteres"),
            { trim: true },
          ),
          nombres: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
            { trim: true },
          ),
          fecha_actual: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
            { trim: true },
          ),
        }),
      );
      var paramsValidated = paramsSchema.parse(params);
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

  async templateRecuperarContrasena(params) {
    try {
      const paramsSchema = objectInput(
        z.object({
          url: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 2000, "Debe tener como máximo 2000 caracteres"),
            { trim: true },
          ),
          duracion_minutos: numberInput(
            z
              .custom<number>((value) => typeof value === "number" && !Number.isNaN(value))
              .refine((value) => value >= 1, "Debe ser mayor o igual que 1")
              .refine((value) => value <= 10080, "Debe ser menor o igual que 10080"),
          ),
          fecha_actual: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
            { trim: true },
          ),
        }),
      );
      var paramsValidated = paramsSchema.parse(params);
      const bodyEmailTHTML = await this.renderTemplate("recuperar-contrasena.html", paramsValidated);
      const bodyEmailText = await this.convertirHTMLaTextoPlano(bodyEmailTHTML);
      const subjectEmailText = await this.renderSubject("Recuperación de contraseña", paramsValidated);

      const recuperarContrasenaMailOptions = {
        subject: subjectEmailText,
        text: bodyEmailText,
        html: bodyEmailTHTML,
      };
      return recuperarContrasenaMailOptions;
    } catch (error) {
      log.error(line(), error);
      throw error;
    }
  }

  async templateEjemplo(params) {
    const methodName = "templateEjemplo";
    try {
      const paramsSchema = objectInput(
        z.object({
          name: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
            { trim: true },
          ),
          email: stringInput(
            z
              .string()
              .refine((value) => value === "" || inputEmailPattern.test(value), "Debe ser un correo válido")
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
            { trim: true },
          ),
          fechacrea: stringInput(
            z
              .string()
              .refine((value) => value.length > 0, "Campo requerido")
              .refine((value) => value.length >= 1, "Debe tener al menos 1 caracteres")
              .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
            { trim: true },
          ),
        }),
      );
      var paramsValidated = paramsSchema.parse(params);
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
