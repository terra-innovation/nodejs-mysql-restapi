import { Request, Response } from "express";
import { line, log } from "#root/src/utils/logger.pino.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { z } from "zod";
import { objectInput, stringInput, numberInput } from "#src/utils/validationInputs.js";
import { getSunatTipoCambioHoyService, getSunatTipoCambioPorFechaService, getSunatTipoCambioExactoPorFechaService, getSunatTipoCambioHistorialService, sincronizarSunatTipoCambioService, sincronizarSunatMesTipoCambioService, getSunatTipoCambiosListOrPaginatedService, getSunatTipoCambiosPaginadoService, createSunatTipoCambioService, updateSunatTipoCambioService, deleteSunatTipoCambioService, activateSunatTipoCambioService, getSunatTipoCambioMasterService, CreateSunatTipoCambioDto, UpdateSunatTipoCambioDto } from "#root/src/services/financiero/sunattipocambio.Service.js";

/**
 * Obtiene el tipo de cambio SUNAT del día de hoy (o más reciente) con estrategia Fallback en cascada.
 * GET /api/v1/financiero/sunat/tipo-cambio/hoy
 */
export const getSunatTipoCambioHoy = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getSunatTipoCambioHoy");
  const data = await getSunatTipoCambioHoyService();
  response(res, 200, data);
};

/**
 * Obtiene el tipo de cambio SUNAT para una fecha específica (YYYY-MM-DD).
 * GET /api/v1/financiero/sunat/tipo-cambio/fecha/:fecha
 */
export const getSunatTipoCambioPorFecha = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getSunatTipoCambioPorFecha");
  const { fecha } = req.params;
  const serviciotipocambioid = (req.query.serviciotipocambioid || req.body.serviciotipocambioid) as string | undefined;
  const data = await getSunatTipoCambioPorFechaService(fecha, serviciotipocambioid);
  response(res, 200, data);
};

/**
 * Obtiene el tipo de cambio SUNAT exacto para una fecha específica (YYYY-MM-DD) consultando únicamente la BBDD sin fallback ni APIs externas.
 * GET /api/v1/financiero/sunat/tipo-cambio/exacto/:fecha
 */
export const getSunatTipoCambioExactoPorFecha = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getSunatTipoCambioExactoPorFecha");
  const { fecha } = req.params;
  const data = await getSunatTipoCambioExactoPorFechaService(fecha);
  response(res, 200, data);
};

/**
 * Obtiene el historial de tipos de cambio SUNAT en un rango de fechas.
 * GET /api/v1/financiero/sunat/tipo-cambio/historial
 */
export const getSunatTipoCambioHistorial = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getSunatTipoCambioHistorial");
  const fechaInicio = req.query.fechaInicio as string | undefined;
  const fechaFin = req.query.fechaFin as string | undefined;
  const data = await getSunatTipoCambioHistorialService(fechaInicio, fechaFin);
  response(res, 200, data);
};

/**
 * Fuerza la sincronización con la API externa Decolecta y actualiza la BD.
 * POST /api/v1/financiero/sunat/tipo-cambio/sincronizar
 */
export const sincronizarSunatTipoCambio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sincronizarSunatTipoCambio");
  const mes = req.body.mes || req.body.month || req.query.mes || req.query.month;
  const anio = req.body.anio || req.body.year || req.query.anio || req.query.year;
  const serviciotipocambioid = (req.body.serviciotipocambioid || req.query.serviciotipocambioid) as string | undefined;
  const fecha = (req.body.fecha || req.query.fecha) as string | undefined;

  const data = await sincronizarSunatTipoCambioService(fecha, mes ? Number(mes) : undefined, anio ? Number(anio) : undefined, serviciotipocambioid);
  response(res, 201, data);
};

/**
 * Fuerza la sincronización de un mes completo de SUNAT con la API seleccionada y actualiza la BD.
 * POST /api/v1/financiero/sunat/tipo-cambio/sincronizar-mes
 */
export const sincronizarSunatMesTipoCambio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sincronizarSunatMesTipoCambio");
  const mes = Number(req.body.mes || req.body.month || req.query.mes || req.query.month);
  const anio = Number(req.body.anio || req.body.year || req.query.anio || req.query.year);
  const serviciotipocambioid = (req.body.serviciotipocambioid || req.query.serviciotipocambioid) as string | undefined;
  const data = await sincronizarSunatMesTipoCambioService(mes, anio, serviciotipocambioid);
  response(res, 201, data);
};

/**
 * Lista los tipos de cambio SUNAT (activos y eliminados o paginados).
 * GET /api/v1/financiero/sunat/tipo-cambio/listar
 */
export const getSunatTipoCambios = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getSunatTipoCambios");
  const data = await getSunatTipoCambiosListOrPaginatedService({
    ...req.query,
    ...req.body,
  });
  response(res, 200, data);
};

/**
 * Obtiene la lista paginada de tipos de cambio SUNAT por opciones (Offset-based).
 * GET /api/v1/financiero/sunat/tipo-cambio/paginado
 * POST /api/v1/financiero/sunat/tipo-cambio/paginado
 */
export const getSunatTipoCambiosPaginado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getSunatTipoCambiosPaginado");
  const options = {
    ...req.query,
    ...req.body,
  };

  const data = await getSunatTipoCambiosPaginadoService(options);
  response(res, 200, data);
};

/**
 * Crea manualmente un tipo de cambio SUNAT.
 * POST /api/v1/financiero/sunat/tipo-cambio/crear
 */
export const createSunatTipoCambio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createSunatTipoCambio");
  const sunatCreateSchema = objectInput(
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
      monedabaseid: stringInput(z.string().optional(), { trim: true }),
      monedacotizadaid: stringInput(z.string().optional(), { trim: true }),
      codigomonedabase: stringInput(z.string().optional().prefault("USD"), { trim: true }),
      codigomonedacotizada: stringInput(z.string().optional().prefault("PEN"), { trim: true }),
    }),
  );

  const validated = sunatCreateSchema.parse(req.body) as CreateSunatTipoCambioDto;
  log.debug(line(), "sunatValidated:", validated);

  const idUsuario = req.session_user?.usuario?.idusuario ?? 1;
  const created = await createSunatTipoCambioService(idUsuario, validated);
  response(res, 201, created);
};

/**
 * Actualiza un tipo de cambio SUNAT existente por UUID.
 * PATCH /api/v1/financiero/sunat/tipo-cambio/actualizar/:id
 */
export const updateSunatTipoCambio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateSunatTipoCambio");
  const { id } = req.params;

  const sunatUpdateSchema = objectInput(
    z.object({
      sunattipocambioid: stringInput(
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
      fecha: stringInput(
        z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}/, "El formato de fecha debe ser YYYY-MM-DD o ISO")
          .optional(),
        { trim: true },
      ),
    }),
  );

  const validated = sunatUpdateSchema.parse({ sunattipocambioid: id, ...req.body }) as UpdateSunatTipoCambioDto;
  log.debug(line(), "sunatUpdateValidated:", validated);

  const idUsuario = req.session_user?.usuario?.idusuario ?? 1;
  const result = await updateSunatTipoCambioService(idUsuario, validated);
  response(res, 200, result);
};

/**
 * Elimina lógicamente un tipo de cambio SUNAT (estado = ESTADO.ELIMINADO).
 * DELETE /api/v1/financiero/sunat/tipo-cambio/eliminar/:id
 */
export const deleteSunatTipoCambio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteSunatTipoCambio");
  const { id } = req.params;

  const schema = objectInput(
    z.object({
      sunattipocambioid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const validated = schema.parse({ sunattipocambioid: id });

  const idUsuario = req.session_user?.usuario?.idusuario ?? 1;
  const result = await deleteSunatTipoCambioService(idUsuario, validated.sunattipocambioid);
  response(res, 204, result);
};

/**
 * Activa un tipo de cambio SUNAT previamente eliminado.
 * PATCH /api/v1/financiero/sunat/tipo-cambio/activar/:id
 */
export const activateSunatTipoCambio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateSunatTipoCambio");
  const { id } = req.params;

  const schema = objectInput(
    z.object({
      sunattipocambioid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const validated = schema.parse({ sunattipocambioid: id });

  const idUsuario = req.session_user?.usuario?.idusuario ?? 1;
  const result = await activateSunatTipoCambioService(idUsuario, validated.sunattipocambioid);
  response(res, 204, result);
};

/**
 * Obtiene los catálogos maestros necesarios para Tipo de Cambio SUNAT (monedas activas).
 * GET /api/v1/financiero/sunat/tipo-cambio/master
 */
export const getSunatTipoCambioMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getSunatTipoCambioMaster");
  const master = await getSunatTipoCambioMasterService();
  response(res, 201, master);
};
