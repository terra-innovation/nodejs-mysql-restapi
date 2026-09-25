import { Request, Response } from "express";
import { line, log } from "#root/src/utils/logger.pino.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as yup from "yup";
import {
  getSunatTipoCambioHoyService,
  getSunatTipoCambioPorFechaService,
  getSunatTipoCambioExactoPorFechaService,
  getSunatTipoCambioHistorialService,
  sincronizarSunatTipoCambioService,
  sincronizarSunatMesTipoCambioService,
  getSunatTipoCambiosListOrPaginatedService,
  getSunatTipoCambiosPaginadoService,
  createSunatTipoCambioService,
  updateSunatTipoCambioService,
  deleteSunatTipoCambioService,
  activateSunatTipoCambioService,
  getSunatTipoCambioMasterService,
  CreateSunatTipoCambioDto,
  UpdateSunatTipoCambioDto,
} from "#root/src/services/financiero/sunattipocambio.Service.js";

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

  const data = await sincronizarSunatTipoCambioService(
    fecha,
    mes ? Number(mes) : undefined,
    anio ? Number(anio) : undefined,
    serviciotipocambioid,
  );
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
  const sunatCreateSchema = yup
    .object()
    .shape({
      fecha: yup
        .string()
        .trim()
        .required("La fecha es requerida (YYYY-MM-DD)")
        .matches(/^\d{4}-\d{2}-\d{2}/, "El formato de fecha debe ser YYYY-MM-DD o ISO"),
      precio_compra: yup.number().required("El precio de compra es requerido").positive(),
      precio_venta: yup.number().required("El precio de venta es requerido").positive(),
      monedabaseid: yup.string().trim().optional(),
      monedacotizadaid: yup.string().trim().optional(),
      codigomonedabase: yup.string().trim().optional().default("USD"),
      codigomonedacotizada: yup.string().trim().optional().default("PEN"),
    })
    .required();

  const validated = sunatCreateSchema.validateSync(req.body, {
    abortEarly: false,
    stripUnknown: true,
  }) as CreateSunatTipoCambioDto;
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

  const sunatUpdateSchema = yup
    .object()
    .shape({
      sunattipocambioid: yup.string().trim().required().min(36).max(36),
      precio_compra: yup.number().optional().positive(),
      precio_venta: yup.number().optional().positive(),
      fecha: yup
        .string()
        .trim()
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}/, "El formato de fecha debe ser YYYY-MM-DD o ISO"),
    })
    .required();

  const validated = sunatUpdateSchema.validateSync(
    { sunattipocambioid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as UpdateSunatTipoCambioDto;
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

  const schema = yup
    .object()
    .shape({
      sunattipocambioid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const validated = schema.validateSync({ sunattipocambioid: id }, { abortEarly: false, stripUnknown: true });

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

  const schema = yup
    .object()
    .shape({
      sunattipocambioid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const validated = schema.validateSync({ sunattipocambioid: id }, { abortEarly: false, stripUnknown: true });

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
