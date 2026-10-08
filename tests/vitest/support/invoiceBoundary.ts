import { vi } from "vitest";
import { invoiceWorkspace, invoiceXml } from "./invoiceFixture.js";

const invoiceBoundary = vi.hoisted(() => ({
  root: "", transaction: vi.fn(), access: vi.fn(),
  archivo: { getArchivoByArchivoidAndIdarchivotipo: vi.fn() },
  factura: { insertFactura: vi.fn() },
  item: { insertFacturaitem: vi.fn() },
  medio: { insertFacturamediopago: vi.fn() },
  termino: { insertFacturaterminopago: vi.fn() },
  impuesto: { insertFacturaimpuesto: vi.fn() },
  nota: { insertFacturanota: vi.fn() },
  vinculo: { insertArchivoFactura: vi.fn() },
  moneda: { getMonedaByCodigo: vi.fn() },
  telegram: { sendMessageException: vi.fn() },
}));
export { invoiceBoundary };
vi.mock("#src/config.js", () => ({ env: { TOKEN_KEY_JWT: "vitest-factoring-key" }, isProduction: true }));
vi.mock("#src/models/prisma/db-factoring.js", () => ({ prismaFT: { client: { $transaction: invoiceBoundary.transaction }, transactionTimeout: 5000 } }));
vi.mock("#src/utils/logger.pino.js", () => ({ line: () => "test", log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("#src/utils/storageUtils.js", () => ({ get STORAGE_PATH_SUCCESS() { return invoiceBoundary.root; } }));
vi.mock("#src/providers/telegram/telegram.Provider.js", () => invoiceBoundary.telegram);
vi.mock("#src/daos/usuario.Dao.js", () => ({ getUsuarioAccesosByIdusuario: invoiceBoundary.access }));
vi.mock("#src/daos/archivo.Dao.js", () => invoiceBoundary.archivo);
vi.mock("#src/daos/factura.Dao.js", () => invoiceBoundary.factura);
vi.mock("#src/daos/facturaitem.Dao.js", () => invoiceBoundary.item);
vi.mock("#src/daos/facturamediopago.Dao.js", () => invoiceBoundary.medio);
vi.mock("#src/daos/facturaterminopago.Dao.js", () => invoiceBoundary.termino);
vi.mock("#src/daos/facturaimpuesto.Dao.js", () => invoiceBoundary.impuesto);
vi.mock("#src/daos/facturanota.Dao.js", () => invoiceBoundary.nota);
vi.mock("#src/daos/archivofactura.Dao.js", () => invoiceBoundary.vinculo);
vi.mock("#src/daos/moneda.Dao.js", () => invoiceBoundary.moneda);

export const xmlId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
export const pdfId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
export const invoiceDto = () => ({ factura_xml: xmlId, factura_pdf: pdfId });
export const invoiceWrites = () => [invoiceBoundary.factura.insertFactura, invoiceBoundary.item.insertFacturaitem, invoiceBoundary.medio.insertFacturamediopago, invoiceBoundary.termino.insertFacturaterminopago, invoiceBoundary.impuesto.insertFacturaimpuesto, invoiceBoundary.nota.insertFacturanota, invoiceBoundary.vinculo.insertArchivoFactura];
export function resetInvoiceBoundary() {
  vi.resetAllMocks();
  invoiceBoundary.access.mockResolvedValue({ idusuario: 42, estado: 1, usuario_roles: [2,3,4,5,6].map(idrol => ({ idrol, estado: 1, rol: { estado: 1 } })) });
  const workspace = invoiceWorkspace();
  workspace.write(invoiceXml());
  invoiceBoundary.root = workspace.root;
  let sequence = 0;
  invoiceBoundary.transaction.mockImplementation(async callback => callback({ testTransaction: ++sequence }));
  invoiceBoundary.archivo.getArchivoByArchivoidAndIdarchivotipo.mockImplementation(async (_client, id) => ({
    idarchivo: id === xmlId ? 50 : 51, ruta: "", nombrealmacenamiento: id === xmlId ? "factura.xml" : "factura.pdf", codigo: "COD-XML",
  }));
  invoiceBoundary.factura.insertFactura.mockResolvedValue({ idfactura: 80 });
  for (const write of invoiceWrites().slice(1)) write.mockResolvedValue({});
  invoiceBoundary.moneda.getMonedaByCodigo.mockResolvedValue({ monedaid: "PEN-ID", alias: "PEN", simbolo: "S/" });
  return workspace;
}
