import { FactoringliquidacionPDF, FactoringPDF, FactoringpropuestaPDF, FactoringsimulacionPDF } from "#src/types/Prisma.types.js";
import { createWriteStream } from "fs";
import PDFDocument from "pdfkit-table";

import * as df from "#src/utils/dateUtils.js";
import * as nf from "#src/utils/numberUtils.js";
import path from "path";

import * as storageUtils from "#src/utils/storageUtils.js";

class PDFGenerator {
  private filePath: string;

  constructor(filePath) {
    this.filePath = filePath; // Ruta donde se guardará el PDF
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

      const tableWidth = 400;
      const col1Width = Math.round(tableWidth * 0.5);
      const col2Width = tableWidth - col1Width;

      const table = {
        headers: [
          { label: "Concepto", property: "concepto", width: col1Width, columnColor: "#e0e0e0", renderer: null },
          { label: "Descripción", property: "descripcion", width: col2Width, align: "right", renderer: null },
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
          { concepto: "bold:Valor financiado", descripcion: factoringsimulacion.moneda.simbolo + " " + nf.formatNumber(factoringsimulacion.monto_financiado) },
          { concepto: "(-) Valor descuento (1)", descripcion: factoringsimulacion.moneda.simbolo + " " + nf.formatNumber(factoringsimulacion.monto_descuento) },
          ...factoringsimulacion.comisiones.map((item) => {
            const descuentoTexto = factoringsimulacion.porcentaje_comision_descuento.gt(0) ? ` (${nf.formatPercentage(factoringsimulacion.porcentaje_comision_descuento, 1)} de descuento)` : "";
            return {
              concepto: `(-) ${item.financiero_concepto.alias}${descuentoTexto}`,
              descripcion: factoringsimulacion.moneda.simbolo + " " + nf.formatNumber(item.monto),
            };
          }),
          ...factoringsimulacion.costos.map((item) => ({
            concepto: `(-) ${item.financiero_concepto.alias}`,
            descripcion: factoringsimulacion.moneda.simbolo + " " + nf.formatNumber(item.monto),
          })),
          ...factoringsimulacion.gastos.map((item) => ({
            concepto: `(-) ${item.financiero_concepto.alias}`,
            descripcion: factoringsimulacion.moneda.simbolo + " " + nf.formatNumber(item.monto),
          })),
          { concepto: "(-) IGV", descripcion: factoringsimulacion.moneda.simbolo + " " + nf.formatNumber(factoringsimulacion.monto_total_igv) },
          ...factoringsimulacion.gastos_excento_igv.map((item) => ({
            concepto: `(-) ${item.financiero_concepto.alias}`,
            descripcion: factoringsimulacion.moneda.simbolo + " " + nf.formatNumber(item.monto),
          })),
          { concepto: "bold:(=) Valor adelanto", descripcion: "bold:" + factoringsimulacion.moneda.simbolo + " " + nf.formatNumber(factoringsimulacion.monto_adelanto) },
        ],
      };

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

  generateFactoringPropuesta(factoring: FactoringPDF, factoringpropuesta: FactoringpropuestaPDF) {
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

      const tableWidth = 400;
      const col1Width = Math.round(tableWidth * 0.5);
      const col2Width = tableWidth - col1Width;

      const table = {
        headers: [
          { label: "Concepto", property: "concepto", width: col1Width, columnColor: "#e0e0e0", renderer: null },
          { label: "Descripción", property: "descripcion", width: col2Width, align: "right", renderer: null },
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
          { concepto: "bold:Valor financiado", descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(factoringpropuesta.monto_financiado) },
          { concepto: "(-) Valor descuento (1)", descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(factoringpropuesta.monto_descuento) },
          ...factoringpropuesta.comisiones.map((item) => {
            const descuentoTexto = factoringpropuesta.porcentaje_comision_descuento.gt(0) ? ` (${nf.formatPercentage(factoringpropuesta.porcentaje_comision_descuento, 1)} de descuento)` : "";
            return {
              concepto: `(-) ${item.financiero_concepto.alias}${descuentoTexto}`,
              descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(item.monto),
            };
          }),
          ...factoringpropuesta.costos.map((item) => ({
            concepto: `(-) ${item.financiero_concepto.alias}`,
            descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(item.monto),
          })),
          ...factoringpropuesta.gastos.map((item) => ({
            concepto: `(-) ${item.financiero_concepto.alias}`,
            descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(item.monto),
          })),
          { concepto: "(-) IGV", descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(factoringpropuesta.monto_total_igv) },

          ...factoringpropuesta.gastos_excento_igv.map((item) => ({
            concepto: `(-) ${item.financiero_concepto.alias}`,
            descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(item.monto),
          })),
          { concepto: "bold:(=) Valor adelanto", descripcion: "bold:" + factoring.moneda.simbolo + " " + nf.formatNumber(factoringpropuesta.monto_adelanto) },
        ],
      };

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

  generateFactoringliquidacion(factoring: FactoringPDF, factoringliquidacion: FactoringliquidacionPDF, factorcuentasbancarias: any[] = []) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      const stream = createWriteStream(this.filePath);
      doc.pipe(stream);

      var y = 0;

      // Encabezado
      const imagePath = path.join(storageUtils.pathApp(), "assets", "images", "cotizacion", "LogoFinanzaTech.png");
      doc.image(imagePath, 50, 40, { width: 160 });

      const addText = (size, font, text, yOffset, options = {}) => {
        doc
          .fontSize(size)
          .font(font)
          .text(text, 50, (y += yOffset), { ...options });
      };

      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("Liquidación de Operación de Factoring", 50, (y += 107), { align: "center" });
      addText(11, "Helvetica", `Fecha: ${df.formatDateLocale(factoringliquidacion.fecha_liquidacion)}`, 50);
      addText(11, "Helvetica", `Código de liquidación: ${factoringliquidacion.code}`, 17);
      addText(5, "Helvetica", ``, 5);

      const datas: any[] = [
        // Datos de la Operación
        { concepto: "bold:DATOS DE LA OPERACIÓN", descripcion: "" },
        { concepto: "Cedente", descripcion: factoring.empresa_cedente.razon_social + " (" + factoring.empresa_cedente.ruc + ")" },
        { concepto: "Pagador", descripcion: factoring.empresa_aceptante.razon_social + " (" + factoring.empresa_aceptante.ruc + ")" },
        { concepto: "Factura", descripcion: factoring.factoring_facturas.map((f) => `${f.factura.serie}-${f.factura.numero_comprobante}`).join(", ") },
        { concepto: "Moneda", descripcion: factoring.moneda.nombre },
        { concepto: "Código de operación de factoring", descripcion: factoring.code },
        { concepto: "Código de propuesta aceptada", descripcion: factoring.factoring_propuesta_aceptada?.code || "" },

        // Plazos y Fechas
        { concepto: "bold:PLAZOS Y FECHAS", descripcion: "" },
        { concepto: "Fecha operación (inicio)", descripcion: factoring.fecha_operacion ? df.formatDateLocale(factoring.fecha_operacion) : "" },
        { concepto: "Fecha proyectada de cobro", descripcion: factoring.factoring_propuesta_aceptada?.fecha_pago_estimado ? df.formatDateUTC(factoring.factoring_propuesta_aceptada.fecha_pago_estimado) : "" },
        { concepto: "Fecha efectiva de cobro (fin)", descripcion: factoringliquidacion.fecha_pago_efectivo ? df.formatDateUTC(factoringliquidacion.fecha_pago_efectivo) : "" },
        { concepto: "Días proyectados", descripcion: factoring.factoring_propuesta_aceptada ? nf.formatNumber(factoring.factoring_propuesta_aceptada.dias_pago_estimado, 0) : "" },
        { concepto: "Días reales", descripcion: nf.formatNumber(factoringliquidacion.dias_pago_efectivo, 0) },
      ];

      if (Number(factoringliquidacion.dias_mora_efectivo || 0) > 0) {
        datas.push({ concepto: "Días adicionales (mora)", descripcion: nf.formatNumber(factoringliquidacion.dias_mora_efectivo, 0) });
      }

      datas.push(
        // Desglose de Importes
        { concepto: "bold:DESGLOSE DE IMPORTES", descripcion: "" },
        { concepto: "Valor neto", descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(factoring.factoring_propuesta_aceptada?.monto_neto, 2) },
        { concepto: "Valor financiado", descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(factoring.factoring_propuesta_aceptada?.monto_financiado, 2) },
        { concepto: "Valor garantía", descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(factoring.factoring_propuesta_aceptada?.monto_garantia, 2) },
        { concepto: "Valor descuento (propuesta)", descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(factoring.factoring_propuesta_aceptada?.monto_descuento, 2) },
        { concepto: "Valor descuento (real)", descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(factoringliquidacion.monto_descuento_efectivo, 2) },
      );

      if (Number(factoringliquidacion.monto_descuento_a_favor || 0) > 0) {
        datas.push({
          concepto: "Reintegro de descuento por pago anticipado",
          descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(factoringliquidacion.monto_descuento_a_favor, 2),
        });
      }
      if (Number(factoringliquidacion.monto_descuento_mora || 0) > 0) {
        datas.push({
          concepto: "Interés por días adicionales de financiamiento",
          descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(factoringliquidacion.monto_descuento_mora, 2),
        });
      }

      datas.push({ concepto: "bold:DETALLE DE LIQUIDACIÓN", descripcion: "" });

      factoringliquidacion.factoring_liquidacion_financieros.forEach((financiero) => {
        const factorText = financiero.financiero_concepto.factor === 1 ? "(+)" : financiero.financiero_concepto.factor === -1 ? "(-)" : "(NE)";
        let descText = `${factorText} ${financiero.financiero_concepto.nombre}`;
        if (factoring.factoring_propuesta_aceptada && Number(factoring.factoring_propuesta_aceptada.porcentaje_comision_descuento || 0) > 0) {
          descText += ` (${nf.formatPercentage(factoring.factoring_propuesta_aceptada.porcentaje_comision_descuento)} de descuento)`;
        }
        datas.push({
          concepto: descText,
          descripcion: factoring.moneda.simbolo + " " + nf.formatNumber(financiero.monto, 2),
        });
      });

      if (Number(factoringliquidacion.monto_total_a_favor || 0) > 0) {
        datas.push({
          concepto: "bold:TOTAL A FAVOR DEL CEDENTE",
          descripcion: "bold:" + factoring.moneda.simbolo + " " + nf.formatNumber(factoringliquidacion.monto_total_a_favor, 2),
        });
      }
      if (Number(factoringliquidacion.monto_total_por_cobrar || 0) > 0) {
        datas.push({
          concepto: "bold:TOTAL A CARGO DEL CEDENTE",
          descripcion: "bold:" + factoring.moneda.simbolo + " " + nf.formatNumber(factoringliquidacion.monto_total_por_cobrar, 2),
        });
      }

      const tableWidth = 495;
      const col1Width = Math.round(tableWidth * 0.5);
      const col2Width = tableWidth - col1Width;
      const table = {
        headers: [
          { label: "Concepto", property: "concepto", width: col1Width, columnColor: "#e0e0e0", renderer: null },
          { label: "Descripción", property: "descripcion", width: col2Width, align: "right", renderer: null },
        ],
        datas,
      };

      const table_center_x = (doc.page.width - tableWidth) / 2;

      doc.table(table, {
        x: table_center_x,
        y: (y += 20),
        width: tableWidth,
        hideHeader: true,
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(11),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => doc.font("Helvetica").fontSize(10),
      });

      // Pie de página: datos de pago si hay monto por cobrar
      if (Number(factoringliquidacion.monto_total_por_cobrar || 0) > 0 && factorcuentasbancarias.length > 0) {
        doc.moveDown(1.5);
        doc.fontSize(8.5).font("Helvetica-Bold").text("Agradeceremos cancelar este documento en la(s) siguiente(s) cuenta(s) bancaria(s) a nombre de Finanza Tech S.A.C:", 50, undefined, { align: "left" });

        factorcuentasbancarias.forEach((fcb) => {
          const cb = fcb.cuenta_bancaria;
          const bancNombre = cb?.banco?.nombre ?? "";
          const cuentaTipo = cb?.cuenta_tipo?.nombre ?? "";
          const monedaCod = cb?.moneda?.codigo ?? "";
          const numero = cb?.numero ?? "";
          const cci = cb?.cci ?? "";
          const lineText = `${bancNombre}: ${cuentaTipo} ${monedaCod} ${numero}${cci ? ` (CCI ${cci})` : ""}`;
          doc.fontSize(8.5).font("Helvetica").text(lineText, 50, undefined, { align: "left" });
        });

        doc.moveDown(0.5);
        doc.fontSize(8.5).font("Helvetica").text("Sírvanse enviar sus constancias de pago al siguiente buzón: contacto@finanzatech.com", 50, undefined, { align: "left" });
      }

      doc.end();
      stream.on("finish", () => resolve(this.filePath));
      stream.on("error", (err) => reject(err));
    });
  }
}

export default PDFGenerator;
