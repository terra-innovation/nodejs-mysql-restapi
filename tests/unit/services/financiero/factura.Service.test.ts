jest.mock("#src/services/factura.Service.js", () => ({
  subirFacturaFactorService: jest.fn(),
  getFacturasByFactoringidService: jest.fn(),
  activateFacturaService: jest.fn(),
  deleteFacturaService: jest.fn(),
  getFacturaMasterService: jest.fn(),
  getFacturasService: jest.fn(),
}));

import * as facturaCore from "#src/services/factura.Service.js";
import {
  activateFacturaService,
  deleteFacturaService,
  getFacturaMasterService,
  getFacturasByFactoringidService,
  getFacturasService,
  subirFacturaFactorService,
} from "#root/src/services/financiero/factura.Service.js";

describe("financiero/factura.Service - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("subirFacturaFactorService debe delegar correctamente al core", async () => {
    const dto = {
      factura_xml: "uuid-xml-1",
      factura_pdf: "uuid-pdf-1",
    };
    (facturaCore.subirFacturaFactorService as jest.Mock).mockResolvedValue({ idfactura: 100 });

    const result = await subirFacturaFactorService(dto, 15);
    expect(result).toEqual({ idfactura: 100 });
    expect(facturaCore.subirFacturaFactorService).toHaveBeenCalledWith(dto, 15);
  });

  it("getFacturasByFactoringidService debe delegar la búsqueda por factoringid", async () => {
    const mockList = [{ idfactura: 1, code: "F001" }, { idfactura: 2, code: "F002" }];
    (facturaCore.getFacturasByFactoringidService as jest.Mock).mockResolvedValue(mockList);

    const result = await getFacturasByFactoringidService({ factoringid: "factoring-uuid-123" });
    expect(result).toEqual(mockList);
    expect(facturaCore.getFacturasByFactoringidService).toHaveBeenCalledWith("factoring-uuid-123");
  });

  it("activateFacturaService debe delegar con facturaid e idusuario", async () => {
    (facturaCore.activateFacturaService as jest.Mock).mockResolvedValue([1]);

    const result = await activateFacturaService({
      facturaid: "factura-uuid-123",
      idusuario: 5,
    });
    expect(result).toEqual([1]);
    expect(facturaCore.activateFacturaService).toHaveBeenCalledWith("factura-uuid-123", 5);
  });

  it("deleteFacturaService debe delegar con facturaid e idusuario", async () => {
    (facturaCore.deleteFacturaService as jest.Mock).mockResolvedValue([1]);

    const result = await deleteFacturaService({
      facturaid: "factura-uuid-123",
      idusuario: 5,
    });
    expect(result).toEqual([1]);
    expect(facturaCore.deleteFacturaService).toHaveBeenCalledWith("factura-uuid-123", 5);
  });

  it("getFacturaMasterService debe retornar datos maestros", async () => {
    const master = { riesgos: [{ idriesgo: 1 }] };
    (facturaCore.getFacturaMasterService as jest.Mock).mockResolvedValue(master);

    const result = await getFacturaMasterService();
    expect(result).toEqual(master);
    expect(facturaCore.getFacturaMasterService).toHaveBeenCalled();
  });

  it("getFacturasService debe retornar lista general", async () => {
    const facturas = [{ idfactura: 1 }];
    (facturaCore.getFacturasService as jest.Mock).mockResolvedValue(facturas);

    const result = await getFacturasService();
    expect(result).toEqual(facturas);
    expect(facturaCore.getFacturasService).toHaveBeenCalled();
  });
});
