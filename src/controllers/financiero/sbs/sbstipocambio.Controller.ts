import { Request, Response } from "express";
import { line, log } from "#root/src/utils/logger.pino.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { z } from "zod";
import { objectInput, stringInput, numberInput } from "#src/utils/validationInputs.js";
import { getSbsTipoCambioHoyService, getSbsTipoCambioPorFechaService, getSbsTipoCambioHistorialService, sincronizarSbsTipoCambioService, sincronizarSbsMesTipoCambioService, getSbsTipoCambiosListOrPaginatedService, getSbsTipoCambiosPaginadoService, createSbsTipoCambioService, updateSbsTipoCambioService, deleteSbsTipoCambioService, activateSbsTipoCambioService, getSbsTipoCambioMasterService, CreateSbsTipoCambioDto, UpdateSbsTipoCambioDto } from "#root/src/services/financiero/sbstipocambio.Service.js";

/**
 * Obtiene el tipo de cambio SBS del día de hoy (o más reciente) con estrategia Fallback en cascada.
 * GET /api/v1/financiero/sbs/tipo-cambio/hoy
 */
export const getSbsTipoCambioHoy = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getSbsTipoCambioHoy");
  const moneda = (req.query.moneda as string) || "USD";
  const data = await getSbsTipoCambioHoyService(moneda);
  response(res, 200, data);
};

/**
 * Obtiene el tipo de cambio SBS para una fecha específica (YYYY-MM-DD).
 * GET /api/v1/financiero/sbs/tipo-cambio/fecha/:fecha
 */
export const getSbsTipoCambioPorFecha = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getSbsTipoCambioPorFecha");
  const { fecha } = req.params;
  const moneda = (req.query.moneda as string) || "USD";
  const serviciotipocambioid = (req.query.serviciotipocambioid || req.body.serviciotipocambioid) as string | undefined;
  const data = await getSbsTipoCambioPorFechaService(moneda, fecha, serviciotipocambioid);
  response(res, 200, data);
};

/**
 * Obtiene el historial de tipos de cambio SBS en un rango de fechas.
 * GET /api/v1/financiero/sbs/tipo-cambio/historial
 */
export const getSbsTipoCambioHistorial = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getSbsTipoCambioHistorial");
  const moneda = (req.query.moneda as string) || "USD";
  const fechaInicio = req.query.fechaInicio as string | undefined;
  const fechaFin = req.query.fechaFin as string | undefined;
  const data = await getSbsTipoCambioHistorialService(moneda, fechaInicio, fechaFin);
  response(res, 200, data);
};

/**
 * Fuerza la sincronización con la API externa Decolecta y actualiza la BD.
 * POST /api/v1/financiero/sbs/tipo-cambio/sincronizar
 */
export const sincronizarSbsTipoCambio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sincronizarSbsTipoCambio");
  const moneda = (req.body.moneda || req.query.moneda || "USD") as string;
  const mes = req.body.mes || req.body.month || req.query.mes || req.query.month;
  const anio = req.body.anio || req.body.year || req.query.anio || req.query.year;
  const serviciotipocambioid = (req.body.serviciotipocambioid || req.query.serviciotipocambioid) as string | undefined;
  const fecha = (req.body.fecha || req.query.fecha) as string | undefined;

  const data = await sincronizarSbsTipoCambioService(moneda, fecha, mes ? Number(mes) : undefined, anio ? Number(anio) : undefined, serviciotipocambioid);
  response(res, 201, data);
};

/**
 * Fuerza la sincronización de un mes completo de SBS con la API seleccionada y actualiza la BD.
 * POST /api/v1/financiero/sbs/tipo-cambio/sincronizar-mes
 */
export const sincronizarSbsMesTipoCambio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sincronizarSbsMesTipoCambio");
  const moneda = (req.body.moneda || req.query.moneda || "USD") as string;
  const mes = Number(req.body.mes || req.body.month || req.query.mes || req.query.month);
  const anio = Number(req.body.anio || req.body.year || req.query.anio || req.query.year);
  const serviciotipocambioid = (req.body.serviciotipocambioid || req.query.serviciotipocambioid) as string | undefined;

  const data = await sincronizarSbsMesTipoCambioService(moneda, mes, anio, serviciotipocambioid);
  response(res, 201, data);
};

/**
 * Lista los tipos de cambio SBS (activos y eliminados o paginados).
 * GET /api/v1/financiero/sbs/tipo-cambio/listar
 */
export const getSbsTipoCambios = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getSbsTipoCambios");
  const data = await getSbsTipoCambiosListOrPaginatedService({
    ...req.query,
    ...req.body,
  });
  response(res, 200, data);
};

/**
 * Obtiene la lista paginada de tipos de cambio SBS por opciones (Offset-based).
 * GET /api/v1/financiero/sbs/tipo-cambio/paginado
 * POST /api/v1/financiero/sbs/tipo-cambio/paginado
 */
export const getSbsTipoCambiosPaginado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getSbsTipoCambiosPaginado");
  const options = {
    ...req.query,
    ...req.body,
  };

  const data = await getSbsTipoCambiosPaginadoService(options);
  response(res, 200, data);
};

/**
 * Crea manualmente un tipo de cambio SBS.
 * POST /api/v1/financiero/sbs/tipo-cambio/crear
 */
export const createSbsTipoCambio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createSbsTipoCambio");
  const sbsCreateSchema = objectInput(
    z.object({
      fecha: stringInput(
        z
          .string({ error: "La fecha es requerida (YYYY-MM-DD)" })
          .refine((value) => value.length > 0, "La fecha es requerida (YYYY-MM-DD)")
          .regex(/^\d{4}-\d{2}-\d{2}/, "El formato de fecha debe ser YYYY-MM-DD o ISO"),
        { trim: true },
      ),
      precio_compra: numberInput(z.custom<number>((value) => typeof value === "number" && !Number.isNaN(value), { error: "El precio de compra es requerido" }).refine((value) => value > 0, "Debe ser un número positivo")),
      precio_venta: numberInput(z.custom<number>((value) => typeof value === "number" && !Number.isNaN(value), { error: "El precio de venta es requerido" }).refine((value) => value > 0, "Debe ser un número positivo")),
      precio_contable: numberInput(
        z
          .custom<number>((value) => typeof value === "number" && !Number.isNaN(value))
          .refine((value) => value > 0, "Debe ser un número positivo")
          .optional(),
      ),
      monedabaseid: stringInput(z.string().optional(), { trim: true }),
      monedacotizadaid: stringInput(z.string().optional(), { trim: true }),
      codigomonedabase: stringInput(z.string().optional().prefault("USD"), { trim: true }),
      codigomonedacotizada: stringInput(z.string().optional().prefault("PEN"), { trim: true }),
    }),
  );

  const validated = sbsCreateSchema.parse(req.body) as CreateSbsTipoCambioDto;
  log.debug(line(), "sbsValidated:", validated);

  const idUsuario = req.session_user?.usuario?.idusuario ?? 1;
  const created = await createSbsTipoCambioService(idUsuario, validated);
  response(res, 201, created);
};

/**
 * Actualiza un tipo de cambio SBS existente por UUID.
 * PATCH /api/v1/financiero/sbs/tipo-cambio/actualizar/:id
 */
export const updateSbsTipoCambio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateSbsTipoCambio");
  const { id } = req.params;

  const sbsUpdateSchema = objectInput(
    z.object({
      sbstipocambioid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      precio_compra: numberInput(
        z
          .custom<number>((value) => typeof value === "number" && !Number.isNaN(value))
          .refine((value) => value > 0, "Debe ser un número positivo")
          .optional(),
      ),
      precio_venta: numberInput(
        z
          .custom<number>((value) => typeof value === "number" && !Number.isNaN(value))
          .refine((value) => value > 0, "Debe ser un número positivo")
          .optional(),
      ),
      precio_contable: numberInput(
        z
          .custom<number>((value) => typeof value === "number" && !Number.isNaN(value))
          .refine((value) => value > 0, "Debe ser un número positivo")
          .optional(),
      ),
      fecha: stringInput(
        z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}/, "El formato de fecha debe ser YYYY-MM-DD o ISO")
          .optional(),
        { trim: true },
      ),
    }),
  );

  const validated = sbsUpdateSchema.parse({ sbstipocambioid: id, ...req.body }) as UpdateSbsTipoCambioDto;
  log.debug(line(), "sbsUpdateValidated:", validated);

  const idUsuario = req.session_user?.usuario?.idusuario ?? 1;
  const result = await updateSbsTipoCambioService(idUsuario, validated);
  response(res, 200, result);
};

/**
 * Elimina lógicamente un tipo de cambio SBS (estado = ESTADO.ELIMINADO).
 * DELETE /api/v1/financiero/sbs/tipo-cambio/eliminar/:id
 */
export const deleteSbsTipoCambio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteSbsTipoCambio");
  const { id } = req.params;

  const schema = objectInput(
    z.object({
      sbstipocambioid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const validated = schema.parse({ sbstipocambioid: id });

  const idUsuario = req.session_user?.usuario?.idusuario ?? 1;
  const result = await deleteSbsTipoCambioService(idUsuario, validated.sbstipocambioid);
  response(res, 204, result);
};

/**
 * Activa un tipo de cambio SBS previamente eliminado.
 * PATCH /api/v1/financiero/sbs/tipo-cambio/activar/:id
 */
export const activateSbsTipoCambio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateSbsTipoCambio");
  const { id } = req.params;

  const schema = objectInput(
    z.object({
      sbstipocambioid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const validated = schema.parse({ sbstipocambioid: id });

  const idUsuario = req.session_user?.usuario?.idusuario ?? 1;
  const result = await activateSbsTipoCambioService(idUsuario, validated.sbstipocambioid);
  response(res, 204, result);
};

/**
 * Obtiene los catálogos maestros necesarios para Tipo de Cambio SBS (monedas activas).
 * GET /api/v1/financiero/sbs/tipo-cambio/master
 */
export const getSbsTipoCambioMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getSbsTipoCambioMaster");
  const master = await getSbsTipoCambioMasterService();
  response(res, 201, master);
};
