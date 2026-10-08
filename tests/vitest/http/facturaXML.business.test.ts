import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { invoiceBoundary as b, invoiceDto, resetInvoiceBoundary } from "../support/invoiceBoundary.js";
import { invoiceXml } from "../support/invoiceFixture.js";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import routes from "#src/routes/admin/factura.routes.js";
import { errorHandlerMiddleware } from "#src/middlewares/errorHandlerMiddleware.js";

const app = express();
app.use(express.json());
app.use("/api/v1", routes);
app.use(errorHandlerMiddleware);
const url = "/api/v1/admin/factura/factor/subir";
const token = (role = 3) => jwt.sign({ usuario: { idusuario: 42, usuario_roles: [{ idrol: role }] } }, "vitest-factoring-key", { expiresIn: "1h" });
let workspace: ReturnType<typeof resetInvoiceBoundary>;
beforeEach(() => { workspace = resetInvoiceBoundary(); });
afterEach(() => { workspace.cleanup(); });
describe("XML: endpoint de registro con parser y servicio reales", () => {
  it("devuelve factura y moneda y usa actor de sesión", async () => {
    const response = await request(app).post(url).set("Authorization", `Bearer ${token()}`).send({ ...invoiceDto(), idusuario: 999 }).expect(200);
    expect(response.body).toMatchObject({ error: false, data: { serie: "F001", importe_neto: 1180, fecha_vencimiento: "2026-12-01", moneda_alias: "PEN" } });
    expect(b.factura.insertFactura.mock.calls[0][1].idusuariocrea).toBe(42);
  });
  it("sin sesión no lee archivos ni abre transacción", async () => {
    await request(app).post(url).send(invoiceDto()).expect(403);
    expect(b.archivo.getArchivoByArchivoidAndIdarchivotipo).not.toHaveBeenCalled();
    expect(b.transaction).not.toHaveBeenCalled();
  });
  // El router actual requiere rol 3 incluso bajo /admin; no se cambia ese contrato.
  it.each([2, 4, 5, 6])("rol %s no registra por este endpoint", async role => {
    await request(app).post(url).set("Authorization", `Bearer ${token(role)}`).send(invoiceDto()).expect(403);
    expect(b.archivo.getArchivoByArchivoidAndIdarchivotipo).not.toHaveBeenCalled();
  });
  it.each([{}, { factura_xml: "incorrecto" }, { factura_pdf: "incorrecto" }])("identificadores inválidos %j responden 400 antes del DAO", async invalid => {
    const payload = Object.keys(invalid).length ? { ...invoiceDto(), ...invalid } : invalid;
    await request(app).post(url).set("Authorization", `Bearer ${token()}`).send(payload).expect(400);
    expect(b.archivo.getArchivoByArchivoidAndIdarchivotipo).not.toHaveBeenCalled();
  });
  it("archivo ausente responde 404", async () => {
    b.archivo.getArchivoByArchivoidAndIdarchivotipo.mockResolvedValueOnce(null);
    await request(app).post(url).set("Authorization", `Bearer ${token()}`).send(invoiceDto()).expect(404);
    expect(b.transaction).not.toHaveBeenCalled();
  });
  it("documento de otro tipo responde 400 sin registrar factura", async () => {
    workspace.write(invoiceXml({ type: "07" }));
    await request(app).post(url).set("Authorization", `Bearer ${token()}`).send(invoiceDto()).expect(400);
    expect(b.factura.insertFactura).not.toHaveBeenCalled();
  });
  it("XML sin estructura Invoice responde 404 sin escrituras", async () => {
    workspace.write("<CreditNote/>");
    await request(app).post(url).set("Authorization", `Bearer ${token()}`).send(invoiceDto()).expect(404);
    expect(b.factura.insertFactura).not.toHaveBeenCalled();
  });
  it("fallo de detalle responde 500 sin vincular archivos ni devolver éxito", async () => {
    b.item.insertFacturaitem.mockRejectedValueOnce(new Error("detail unavailable"));
    await request(app).post(url).set("Authorization", `Bearer ${token()}`).send(invoiceDto()).expect(500);
    expect(b.vinculo.insertArchivoFactura).not.toHaveBeenCalled();
  });
});
