import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// Documentos sintéticos: sin archivos ni datos personales de producción.
export function invoiceXml(options: { currency?: string; terms?: string; extra?: string; type?: string; encoding?: string } = {}) {
  const currency = options.currency ?? "PEN";
  const amount = (name: string, value: string) => `<cbc:${name} currencyID="${currency}">${value}</cbc:${name}>`;
  const tax = `<cac:TaxTotal>${amount("TaxAmount", "180.00")}<cac:TaxSubtotal>${amount("TaxableAmount", "1000.00")}${amount("TaxAmount", "180.00")}<cac:TaxCategory><cbc:ID schemeID="UN/ECE">S</cbc:ID><cbc:Percent>18</cbc:Percent><cbc:TaxExemptionReasonCode listID="SUNAT">10</cbc:TaxExemptionReasonCode><cac:TaxScheme><cbc:ID schemeID="SUNAT">1000</cbc:ID><cbc:Name>IGV</cbc:Name></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal></cac:TaxTotal>`;
  const party = (kind: string, ruc: string, name: string) => `<cac:${kind}><cac:Party><cac:PartyIdentification><cbc:ID schemeID="6">${ruc}</cbc:ID></cac:PartyIdentification><cac:PartyLegalEntity><cbc:RegistrationName>${name}</cbc:RegistrationName></cac:PartyLegalEntity></cac:Party></cac:${kind}>`;
  return `<?xml version="1.0" encoding="${options.encoding ?? "UTF-8"}"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2">
<cbc:UBLVersionID>2.1</cbc:UBLVersionID><cbc:CustomizationID>2.0</cbc:CustomizationID><cbc:ID>F001-123</cbc:ID>
<cbc:IssueDate>2026-10-01</cbc:IssueDate><cbc:IssueTime>10:30:00</cbc:IssueTime><cbc:DueDate>2026-12-01</cbc:DueDate>
<cbc:InvoiceTypeCode listID="SUNAT">${options.type ?? "01"}</cbc:InvoiceTypeCode><cbc:DocumentCurrencyCode listID="ISO4217">${currency}</cbc:DocumentCurrencyCode><cbc:LineCountNumeric>1</cbc:LineCountNumeric>
<cbc:Note languageLocaleID="1000">  Mil ciento\n ochenta  </cbc:Note><cbc:Note>Nota simple</cbc:Note>
${party("AccountingSupplierParty", "20100000001", "PROVEEDOR ÁRBOL &amp; ASOCIADOS")}${party("AccountingCustomerParty", "20600000002", "CLIENTE DE PRUEBA")}
<cac:PaymentMeans><cbc:ID>Pago</cbc:ID><cbc:PaymentMeansCode listID="UN/ECE">001</cbc:PaymentMeansCode><cac:PayeeFinancialAccount><cbc:ID>CUENTA-SINTETICA</cbc:ID></cac:PayeeFinancialAccount></cac:PaymentMeans>
${options.terms ?? paymentTerm("FormaPago", "Credito", "1180") + paymentTerm("FormaPago", "Cuota001", "590", "2026-11-01") + paymentTerm("FormaPago", "Cuota002", "590", "2026-12-01")}
${options.extra ?? ""}
${tax}
<cac:LegalMonetaryTotal>${amount("LineExtensionAmount", "1000.00")}${amount("TaxInclusiveAmount", "1180.00")}${amount("PayableAmount", "1180.00")}</cac:LegalMonetaryTotal>
<cac:InvoiceLine><cbc:ID>1</cbc:ID><cbc:InvoicedQuantity unitCode="NIU">2</cbc:InvoicedQuantity>${amount("LineExtensionAmount", "1000.00")}
<cac:PricingReference><cac:AlternativeConditionPrice>${amount("PriceAmount", "500.00")}</cac:AlternativeConditionPrice></cac:PricingReference>
${tax}<cac:Item><cbc:Description>Servicio de prueba</cbc:Description><cac:SellersItemIdentification><cbc:ID>PRUEBA-1</cbc:ID></cac:SellersItemIdentification><cac:CommodityClassification><cbc:ItemClassificationCode listID="UNSPSC">81111500</cbc:ItemClassificationCode></cac:CommodityClassification></cac:Item></cac:InvoiceLine>
</Invoice>`;
}

export function paymentTerm(id: string, forma: string, monto: string, fecha?: string, porcentaje?: string) {
  return `<cac:PaymentTerms><cbc:ID>${id}</cbc:ID><cbc:PaymentMeansID>${forma}</cbc:PaymentMeansID><cbc:Amount currencyID="PEN">${monto}</cbc:Amount>${fecha ? `<cbc:PaymentDueDate>${fecha}</cbc:PaymentDueDate>` : ""}${porcentaje ? `<cbc:PaymentPercent>${porcentaje}</cbc:PaymentPercent>` : ""}</cac:PaymentTerms>`;
}

export function invoiceWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "ft-vitest-xml-"));
  return {
    root,
    write(xml: string, encoding: BufferEncoding = "utf8") {
      const file = path.join(root, "factura.xml");
      writeFileSync(file, xml, encoding);
      return { path: file };
    },
    cleanup() {
      const resolved = path.resolve(root);
      // Verificar el destino absoluto antes de borrar recursivamente en Windows.
      if (path.dirname(resolved) !== path.resolve(tmpdir()) || !path.basename(resolved).startsWith("ft-vitest-xml-")) throw new Error("Unsafe test cleanup");
      rmSync(resolved, { recursive: true, force: true });
    },
  };
}
