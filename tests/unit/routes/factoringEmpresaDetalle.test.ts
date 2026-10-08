import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";

jest.mock("#src/config.js", () => ({ env: { TOKEN_KEY_JWT: "empresa-detalle-test-key" }, isProduction: false }));
jest.mock("#src/utils/logger.pino.js", () => ({ line: () => "test", log: { debug: jest.fn(), warn: jest.fn(), error: jest.fn(), info: jest.fn() } }));
jest.mock("#root/src/models/prisma/db-factoring.js", () => ({
  prismaFT: {
    client: { $transaction: jest.fn(), usuario: { findFirst: jest.fn() } },
    transactionTimeout: 5000,
  },
}));
jest.mock("#src/providers/telegram/telegram.Provider.js", () => ({ sendMessageException: jest.fn() }));
jest.mock("#root/src/services/admin/tipocambio.Service.js", () => ({}));

import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import adminRoutes from "#root/src/routes/admin/servicio/factoring/factoring.routes.js";
import financieroRoutes from "#root/src/routes/financiero/servicio/factoring/factoring.routes.js";
import { errorHandlerMiddleware } from "#src/middlewares/errorHandlerMiddleware.js";

const empresaid = "9fa953df-0f65-4387-bedb-2132c59e2612";
const pagadorid = "3bb053ee-ad14-4111-86a9-2de464ed51f5";
const unrelatedid = "66c3965f-aa37-4d2e-b0e0-8a07f58e1063";
const empresa = {
  idempresa: 146,
  empresaid,
  code: "55b720dc",
  ruc: "20603554907",
  razon_social: "EMPRESA CEDENTE SAC",
  nombre_comercial: "CEDENTE",
  domicilio_fiscal: "AV. PAZ SOLDAN NRO. 170 INT. 702",
  fecha_inscripcion: new Date("2018-09-03T00:00:00.000Z"),
  direccion_sede: "AV. PAZ SOLDAN 170 INT. 702",
  direccion_sede_referencia: "EDIFICIO EMPRESARIAL",
  riesgo: { alias: "C-", detalle_interno: "No devolver" },
  pais_sede: { nombrepais: "Perú" },
  distrito_sede: { nombredistrito: "San Isidro" },
  provincia_sede: { nombreprovincia: "Lima" },
  departamento_sede: { nombredepartamento: "Lima" },
  idusuariocrea: 162,
  fechacrea: new Date("2026-03-17T15:05:02.459Z"),
  idusuariomod: 105,
  fechamod: new Date("2026-06-28T02:00:24.756Z"),
  estado: 1,
  factoring_cedentes: [{ estado: 1 }],
  factoring_aceptantes: [],
  contactos: [{ email: "dato-no-solicitado" }],
  archivo_empresas: [{ archivo: "dato-no-solicitado" }],
};

const records = [
  empresa,
  { ...empresa, empresaid: pagadorid, razon_social: "EMPRESA PAGADORA SAC", factoring_cedentes: [], factoring_aceptantes: [{ estado: 2 }] },
  { ...empresa, empresaid: unrelatedid, factoring_cedentes: [], factoring_aceptantes: [] },
];
const project = (record: any, select: any): any =>
  Object.fromEntries(Object.entries(select).map(([key, selection]: [string, any]) => [key, selection === true ? record[key] : record[key] ? project(record[key], selection.select) : null]));

const findFirst = jest.fn(async ({ where, select }) => {
  const record = records.find((item) => item.empresaid === where.empresaid && where.OR.some((condition) => {
    const [relation, filter] = Object.entries(condition)[0] as [string, any];
    return item[relation].some((operation) => filter.some.estado.in.includes(operation.estado));
  }));
  return record ? project(record, select) : null;
});

const app = express();
app.use(express.json());
app.use("/api/v1", adminRoutes, financieroRoutes);
app.use(errorHandlerMiddleware);

const token = (role: number) => jwt.sign({ usuario: { idusuario: 10, usuario_roles: [{ idrol: role }] } }, "empresa-detalle-test-key");

beforeEach(() => {
  (prismaFT.client.usuario.findFirst as jest.Mock).mockResolvedValue({ idusuario: 10, estado: 1, usuario_roles: [2,6].map(idrol => ({ idrol, estado: 1, rol: { estado: 1 } })) });
  jest.clearAllMocks();
  (prismaFT.client.$transaction as jest.Mock).mockImplementation(async (callback) => callback({ empresa: { findFirst } }));
});

describe.each([["admin", 2, 6], ["financiero", 6, 2]])("Ficha empresa en operaciones: %s", (rolePath, role, wrongRole) => {
  const url = (id = empresaid) => `/api/v1/${rolePath}/servicio/factoring/factoring/empresa/${id}`;

  it("rechaza consultas sin autenticación", async () => {
    expect((await request(app).get(url())).status).toBe(403);
    expect(findFirst).not.toHaveBeenCalled();
  });

  it.each([3, 4])("no permite el acceso al rol %i", async (otherRole) => {
    expect((await request(app).get(url()).set("Authorization", `Bearer ${token(otherRole)}`)).status).toBe(403);
    expect(findFirst).not.toHaveBeenCalled();
  });

  it("respeta la separación de administrador y financiero", async () => {
    expect((await request(app).get(url()).set("Authorization", `Bearer ${token(Number(wrongRole))}`)).status).toBe(403);
    expect(findFirst).not.toHaveBeenCalled();
  });

  it.each([empresaid, pagadorid])("devuelve la ficha de cedente/pagador %s sin colecciones ni catálogos completos", async (id) => {
    const result = await request(app).get(url(id)).set("Authorization", `Bearer ${token(Number(role))}`);
    expect(result.status).toBe(200);
    expect(result.body.data).toMatchObject({
      empresaid: id, domicilio_fiscal: empresa.domicilio_fiscal, direccion_sede: empresa.direccion_sede,
      fecha_inscripcion: "2018-09-03T00:00:00.000Z", riesgo: { alias: "C-" },
      pais_sede: { nombrepais: "Perú" }, distrito_sede: { nombredistrito: "San Isidro" },
      provincia_sede: { nombreprovincia: "Lima" }, departamento_sede: { nombredepartamento: "Lima" },
      idusuariocrea: 162, idusuariomod: 105,
    });
    expect(result.body.data.riesgo).toEqual({ alias: "C-" });
    for (const key of ["contactos", "archivo_empresas", "factoring_cedentes", "factoring_aceptantes"]) {
      expect(result.body.data).not.toHaveProperty(key);
    }
    expect(findFirst).toHaveBeenCalledTimes(1);
  });

  it.each([unrelatedid, "44444444-4444-4444-8444-444444444444"])("responde 404 para empresa ajena a las operaciones o inexistente %s", async (id) => {
    const result = await request(app).get(url(id)).set("Authorization", `Bearer ${token(Number(role))}`);
    expect(result.status).toBe(404);
  });

  it("valida el identificador antes de consultar", async () => {
    expect((await request(app).get(url("no-valido")).set("Authorization", `Bearer ${token(Number(role))}`)).status).toBe(400);
    expect(findFirst).not.toHaveBeenCalled();
  });

  it("devuelve un error controlado si falla la consulta", async () => {
    findFirst.mockRejectedValueOnce(new Error("Database unavailable"));
    expect((await request(app).get(url()).set("Authorization", `Bearer ${token(Number(role))}`)).status).toBe(500);
  });
});
