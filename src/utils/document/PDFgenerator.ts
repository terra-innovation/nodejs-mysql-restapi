import { FactoringPDF, FactoringpropuestaPDF, FactoringsimulacionPDF } from "#src/types/Prisma.types.js";
import PDFDocument from "pdfkit-table";
import { createWriteStream } from "fs";

import * as df from "#src/utils/dateUtils.js";
import * as nf from "#src/utils/numberUtils.js";
import path from "path";

import * as storageUtils from "#src/utils/storageUtils.js";

class PDFGenerator {
  private filePath: string;

  constructor(filePath) {
    this.filePath = filePath; // Ruta donde se guardará el PDF
  }

  generateFactoringQuote(factoring: FactoringPDF, factoringpropuesta: FactoringpropuestaPDF) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      const stream = createWriteStream(this.filePath);
      doc.pipe(stream);

      var y = 0;

      // Encabezado
      const imagePath = path.join(storageUtils.pathApp(), "assets", "images", "cotizacion", "LogoFinanzaTech.png");
      doc.image(imagePath, 50, 40, { width: 200 });

      const addText = (size, font, text, yOffset, options = {}) => {
        doc
          .fontSize(size)
          .font(font)
          .text(text, 50, (y += yOffset), { ...options });
      };

      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("Propuesta de Factoring", 50, (y += 127), { align: "center" });
      addText(11, "Helvetica", `Fecha: ${df.formatDateTimeLocale(factoringpropuesta.fecha_propuesta)}`, 50);
      addText(11, "Helvetica", `Código de propuesta: ${factoringpropuesta.code}`, 17);
      addText(5, "Helvetica", ``, 5);
      addText(11, "Helvetica", `Cedente: ${factoring.empresa_cedente.razon_social}`, 17);
      addText(11, "Helvetica", `RUC: ${factoring.empresa_cedente.ruc}`, 17);
      addText(5, "Helvetica", ``, 5);
      addText(11, "Helvetica", `Pagador: ${factoring.empresa_aceptante.razon_social}`, 17);
      addText(11, "Helvetica", `RUC: ${factoring.empresa_aceptante.ruc}`, 17);
      addText(5, "Helvetica", ``, 5);

      const facturas = factoring.factoring_facturas.map((obj) => `${obj.factura.serie}-${obj.factura.numero_comprobante}`).join(", ");

      // Detalle de la cotización (tabla)

      const pruebaBorrar = nf.formatNumber(factoringpropuesta.monto_neto);

      const table = {
        headers: [
          { label: "Concepto", property: "concepto", width: 200, columnColor: "#e0e0e0", renderer: null },
          { label: "Descripción", property: "descripcion", width: 200, align: "right", renderer: null },
        ],

        datas: [
          { concepto: "Factura", descripcion: facturas },
          { concepto: "Valor neto", descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(factoringpropuesta.monto_neto) },
          { concepto: "Moneda", descripcion: factoring.moneda.codigo + " (" + factoring.moneda.nombre + ")" },
          { concepto: "Fecha de pago (estimada)", descripcion: df.formatDateUTC(factoringpropuesta.fecha_pago_estimado) },

          { concepto: "Días (estimados)", descripcion: factoringpropuesta.dias_pago_estimado },
          { concepto: "Tasa mensual", descripcion: nf.formatPercentage(factoringpropuesta.tdm) },
          { concepto: "Financiamiento", descripcion: nf.formatPercentage(factoringpropuesta.porcentaje_financiado_estimado) },
          { concepto: "Tipo factoring", descripcion: factoringpropuesta.factoring_tipo.nombre },

          { concepto: "Valor garantía", descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(factoringpropuesta.monto_garantia) },
          { concepto: "Valor financiado", descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(factoringpropuesta.monto_financiado) },
          { concepto: "Valor descuento (1)", descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(factoringpropuesta.monto_descuento) },
          { concepto: "Comisión FT", descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(factoringpropuesta.monto_comision) },
          { concepto: "Costo + Gastos", descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(factoringpropuesta.monto_costo_estimado) },
          { concepto: "IGV", descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(factoringpropuesta.monto_total_igv) },
          { concepto: "Valor adelanto", descripcion: "bold:" + factoring.moneda.simbolo + " " + nf.formatNumber(factoringpropuesta.monto_adelanto) },
        ],
      };

      const tableWidth = 400;
      const table_center_x = (doc.page.width - tableWidth) / 2;

      doc.table(table, {
        x: table_center_x,
        y: (y += 20),
        width: tableWidth,
        hideHeader: true,
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(11), // {Function}
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => doc.font("Helvetica").fontSize(11), // {Function}
      });

      addText(5, "Helvetica", ``, 350);

      addText(10, "Helvetica", `Nota:`, 17);

      addText(7, "Helvetica", "(1)", 17, { continued: true });
      addText(10, "Helvetica", ` Los intereses aplicados (Valor descuento) dependen de los días efectivos de financiamiento de la factura.`, 0);

      doc.end();
      // Resolvemos la promesa cuando el stream termine
      stream.on("finish", () => resolve(this.filePath));
      stream.on("error", (err) => reject(err));
    });
  }

  generateFactoringSimulacion(factoringsimulacion: FactoringsimulacionPDF) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      const stream = createWriteStream(this.filePath);
      doc.pipe(stream);

      var y = 0;

      // Encabezado
      const imagePath = path.join(storageUtils.pathApp(), "assets", "images", "cotizacion", "LogoFinanzaTech.png");
      doc.image(imagePath, 50, 40, { width: 200 });

      const addText = (size, font, text, yOffset, options = {}) => {
        doc
          .fontSize(size)
          .font(font)
          .text(text, 50, (y += yOffset), { ...options });
      };

      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("Simulación de Factoring", 50, (y += 127), { align: "center" });
      addText(11, "Helvetica", `Fecha: ${df.formatDateTimeLocale(factoringsimulacion.fecha_simulacion)}`, 50);
      addText(11, "Helvetica", `Código de simulación: ${factoringsimulacion.code}`, 17);
      addText(5, "Helvetica", ``, 5);
      addText(11, "Helvetica", `Cedente: ${factoringsimulacion.razon_social_cedente}`, 17);
      addText(11, "Helvetica", `RUC: ${factoringsimulacion.ruc_cedente}`, 17);
      addText(5, "Helvetica", ``, 5);
      addText(11, "Helvetica", `Pagador: ${factoringsimulacion.razon_social_aceptante}`, 17);
      addText(11, "Helvetica", `RUC: ${factoringsimulacion.ruc_aceptante}`, 17);
      addText(5, "Helvetica", ``, 5);

      const facturas = "-";

      // Detalle de la cotización (tabla)

      const pruebaBorrar = nf.formatNumber(factoringsimulacion.monto_neto);

      const table = {
        headers: [
          { label: "Concepto", property: "concepto", width: 200, columnColor: "#e0e0e0", renderer: null },
          { label: "Descripción", property: "descripcion", width: 200, align: "right", renderer: null },
        ],

        datas: [
          { concepto: "Factura", descripcion: facturas },
          { concepto: "Valor neto", descripcion: factoringsimulacion.moneda.simbolo + " " + nf.formatNumber(factoringsimulacion.monto_neto) },
          { concepto: "Moneda", descripcion: factoringsimulacion.moneda.codigo + " (" + factoringsimulacion.moneda.nombre + ")" },
          { concepto: "Fecha de pago (estimada)", descripcion: df.formatDateUTC(factoringsimulacion.fecha_pago_estimado) },

          { concepto: "Días (estimados)", descripcion: factoringsimulacion.dias_pago_estimado },
          { concepto: "Tasa mensual", descripcion: nf.formatPercentage(factoringsimulacion.tdm) },
          { concepto: "Financiamiento", descripcion: nf.formatPercentage(factoringsimulacion.porcentaje_financiado_estimado) },
          { concepto: "Tipo factoring", descripcion: factoringsimulacion.factoring_tipo.nombre },

          { concepto: "Valor garantía", descripcion: factoringsimulacion.moneda.simbolo + " " + nf.formatNumber(factoringsimulacion.monto_garantia) },
          { concepto: "Valor financiado", descripcion: factoringsimulacion.moneda.simbolo + " " + nf.formatNumber(factoringsimulacion.monto_financiado) },
          { concepto: "Valor descuento (1)", descripcion: factoringsimulacion.moneda.simbolo + " " + nf.formatNumber(factoringsimulacion.monto_descuento) },
          { concepto: "Comisión FT", descripcion: factoringsimulacion.moneda.simbolo + " " + nf.formatNumber(factoringsimulacion.monto_comision) },
          { concepto: "Costo + Gastos", descripcion: factoringsimulacion.moneda.simbolo + " " + nf.formatNumber(factoringsimulacion.monto_costo_estimado) },
          { concepto: "IGV", descripcion: factoringsimulacion.moneda.simbolo + " " + nf.formatNumber(factoringsimulacion.monto_total_igv) },
          { concepto: "Valor adelanto", descripcion: "bold:" + factoringsimulacion.moneda.simbolo + " " + nf.formatNumber(factoringsimulacion.monto_adelanto) },
        ],
      };

      const tableWidth = 400;
      const table_center_x = (doc.page.width - tableWidth) / 2;

      doc.table(table, {
        x: table_center_x,
        y: (y += 20),
        width: tableWidth,
        hideHeader: true,
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(11), // {Function}
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => doc.font("Helvetica").fontSize(11), // {Function}
      });

      addText(5, "Helvetica", ``, 350);

      addText(10, "Helvetica", `Nota:`, 17);

      addText(7, "Helvetica", "(1)", 17, { continued: true });
      addText(10, "Helvetica", ` Los intereses aplicados (Valor descuento) dependen de los días efectivos de financiamiento de la factura.`, 0);

      doc.end();
      // Resolvemos la promesa cuando el stream termine
      stream.on("finish", () => resolve(this.filePath));
      stream.on("error", (err) => reject(err));
    });
  }
}

export default PDFGenerator;
