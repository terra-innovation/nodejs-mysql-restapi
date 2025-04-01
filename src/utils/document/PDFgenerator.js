import PDFDocument from "pdfkit-table";
import { createWriteStream } from "fs";

import { formatNumber, formatPercentage } from "../../utils/numberUtils.js";
import { formatDate1, formatDate2 } from "../../utils/dateUtils.js";

class PDFGenerator {
  constructor(filePath) {
    this.filePath = filePath; // Ruta donde se guardará el PDF
  }

  generateFactoringQuote(factoring, factoringpropuesta) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      const stream = createWriteStream(this.filePath);
      doc.pipe(stream);

      var y = 0;

      // Encabezado

      const imagePath = "./src/utils/document/cotizacion/LogoFinanzaTech.png";
      doc.image(imagePath, 50, 40, { width: 200 });

      const addText = (size, font, text, yOffset) => {
        doc
          .fontSize(size)
          .font(font)
          .text(text, 50, (y += yOffset));
      };

      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("Propuesta de Factoring", 50, (y += 127), { align: "center" });
      addText(11, "Helvetica", `Fecha: ${formatDate2(factoringpropuesta.fecha_propuesta)}`, 50);
      addText(11, "Helvetica", `Código de propuesta: ${factoringpropuesta.code}`, 17);
      addText(5, "Helvetica", ``, 5);
      addText(11, "Helvetica", `Cliente: ${factoring.cedente_empresa.razon_social}`, 17);
      addText(11, "Helvetica", `RUC: ${factoring.cedente_empresa.ruc}`, 17);
      addText(5, "Helvetica", ``, 5);
      addText(11, "Helvetica", `Pagador: ${factoring.aceptante_empresa.razon_social}`, 17);
      addText(11, "Helvetica", `RUC: ${factoring.aceptante_empresa.ruc}`, 17);
      addText(5, "Helvetica", ``, 5);

      const facturas = factoring.factura_factura_factoring_facturas.map((obj) => `${obj.serie}-${obj.numero_comprobante}`).join(", ");

      // Detalle de la cotización (tabla)

      const table = {
        headers: [
          { label: "Concepto", property: "concepto", width: 200, columnColor: "#e0e0e0", renderer: null },
          { label: "Descripción", property: "descripcion", width: 200, align: "right", renderer: null },
        ],

        datas: [
          { concepto: "Factura", descripcion: facturas },
          { concepto: "Valor neto", descripcion: formatNumber(factoringpropuesta.monto_neto, 2) },
          { concepto: "Moneda", descripcion: factoring.moneda_moneda.codigo + " (" + factoring.moneda_moneda.nombre + ")" },
          { concepto: "Fecha de pago (estimado)", descripcion: formatDate1(factoringpropuesta.fecha_pago_estimado) },

          { concepto: "Días (estimado)", descripcion: factoringpropuesta.dias_pago_estimado },
          { concepto: "Tasa mensual", descripcion: formatPercentage(factoringpropuesta.tdm, 2) },
          { concepto: "Financiamiento", descripcion: formatPercentage(factoringpropuesta.porcentaje_financiado_estimado, 2) },
          { concepto: "Tipo factoring", descripcion: factoringpropuesta.factoringtipo_factoring_tipo.nombre },

          { concepto: "Valor garantía", descripcion: formatNumber(factoringpropuesta.monto_garantia, 2) },
          { concepto: "Valor financiado", descripcion: formatNumber(factoringpropuesta.monto_financiado, 2) },
          { concepto: "Valor descuento", descripcion: formatNumber(factoringpropuesta.monto_descuento, 2) },
          { concepto: "Comisión FT", descripcion: formatNumber(factoringpropuesta.monto_comision, 2) },
          { concepto: "Costo + Gastos", descripcion: formatNumber(factoringpropuesta.monto_costo_estimado, 2) },
          { concepto: "IGV", descripcion: formatNumber(factoringpropuesta.monto_total_igv, 2) },
          { concepto: "Valor adelanto", descripcion: "bold:" + formatNumber(factoringpropuesta.monto_adelanto, 2) },
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
      addText(10, "Helvetica", `(1) Los intereses aplicados (Valor descuento) dependen del día de financiamiento de la factura.`, 17);

      doc.end();
      // Resolvemos la promesa cuando el stream termine
      stream.on("finish", () => resolve(this.filePath));
      stream.on("error", (err) => reject(err));
    });
  }
}

export default PDFGenerator;
