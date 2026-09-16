import { Request, Response } from "express";
import { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { line, log } from "#root/src/utils/logger.pino.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as tipocambioLogic from "#src/logics/tipocambio.Logic.js";
import * as sunattipocambioDao from "#src/daos/sunattipocambio.Dao.js";
import * as monedaDao from "#src/daos/moneda.Dao.js";
import * as configuracionappDao from "#src/daos/configuracionapp.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

/**
 * Obtiene el tipo de cambio SUNAT del día de hoy (o más reciente) con estrategia Fallback en cascada.
 * No recibe serviciotipocambioid.
 * GET /api/v1/financiero/sunat/tipo-cambio/hoy
 */
export const getSunatTipoCambioHoy = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getSunatTipoCambioHoy");
  const data = await tipocambioLogic.obtenerSunatLogic(undefined);
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
  const data = await tipocambioLogic.obtenerSunatLogic(fecha, serviciotipocambioid);
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
  const data = await tipocambioLogic.obtenerHistorialSunatLogic(fechaInicio, fechaFin);
  response(res, 200, data);
};

/**
 * Fuerza la sincronización con la API externa Decolecta y actualiza la BD.
 * Puede sincronizar por fecha individual o por mes y año si se proporcionan.
 * POST /api/v1/financiero/sunat/tipo-cambio/sincronizar
 */
export const sincronizarSunatTipoCambio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sincronizarSunatTipoCambio");
  const mes = req.body.mes || req.body.month || req.query.mes || req.query.month;
  const anio = req.body.anio || req.body.year || req.query.anio || req.query.year;
  const serviciotipocambioid = (req.body.serviciotipocambioid || req.query.serviciotipocambioid) as string | undefined;

  if (mes && anio) {
    const data = await tipocambioLogic.sincronizarSunatMesLogic(Number(mes), Number(anio), serviciotipocambioid);
    return response(res, 201, data);
  }

  const fecha = (req.body.fecha || req.query.fecha) as string | undefined;
  const data = await tipocambioLogic.sincronizarSunatLogic(fecha, serviciotipocambioid);
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
  const data = await tipocambioLogic.sincronizarSunatMesLogic(mes, anio, serviciotipocambioid);
  response(res, 201, data);
};

/**
 * Lista los tipos de cambio SUNAT (activos y eliminados).
 * Si se proporcionan parámetros de paginación (page, limit, etc.), responde con paginación por opciones.
 * GET /api/v1/financiero/sunat/tipo-cambio/listar
 */
export const getSunatTipoCambios = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getSunatTipoCambios");
  const hasPaginationParams =
    req.query.page !== undefined ||
    req.query.pageIndex !== undefined ||
    req.query.limit !== undefined ||
    req.query.pageSize !== undefined ||
    req.query.offset !== undefined ||
    req.query.skip !== undefined;

  if (hasPaginationParams) {
    const data = await tipocambioLogic.obtenerSunatPaginadoLogic({
      ...req.query,
      ...req.body,
    });
    return response(res, 200, data);
  }

  const data = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const registros = await sunattipocambioDao.getSunatTipoCambios(tx, filter_estado);
      return registros;
    },
    { timeout: prismaFT.transactionTimeout }
  );
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

  const data = await tipocambioLogic.obtenerSunatPaginadoLogic(options);
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

  const validated = sunatCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "sunatValidated:", validated);

  const created = await prismaFT.client.$transaction(
    async (tx) => {
      const fechaRegistro = tipocambioLogic.parseFechaLima(validated.fecha);

      // Resolver moneda base
      let monedaBase = validated.monedabaseid
        ? await monedaDao.getMonedaByMonedaid(tx, validated.monedabaseid)
        : await monedaDao.getMonedaByCodigo(tx, validated.codigomonedabase || "USD");

      if (!monedaBase) {
        throw new ClientError("Moneda base no encontrada", 404);
      }

      // Resolver moneda cotizada
      let monedaCotizada = validated.monedacotizadaid
        ? await monedaDao.getMonedaByMonedaid(tx, validated.monedacotizadaid)
        : await monedaDao.getMonedaByCodigo(tx, validated.codigomonedacotizada || "PEN");

      if (!monedaCotizada) {
        throw new ClientError("Moneda cotizada no encontrada", 404);
      }

      // Verificar si ya existe para ese par y fecha
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const existente = await sunattipocambioDao.getSunatTipoCambioByFecha(
        tx,
        fechaRegistro,
        monedaBase.idmoneda,
        monedaCotizada.idmoneda,
        filter_estado
      );

      if (existente) {
        throw new ClientError("Ya existe un tipo de cambio SUNAT registrado para esta fecha y par de monedas", 400);
      }

      const idUsuario = req.session_user?.usuario?.idusuario ?? 1;

      const sunatToCreate: Prisma.sunat_tipo_cambioUncheckedCreateInput = {
        sunattipocambioid: uuidv4(),
        code: tipocambioLogic.generateCode(),
        idmonedabase: monedaBase.idmoneda,
        idmonedacotizada: monedaCotizada.idmoneda,
        fecha: fechaRegistro,
        precio_compra: new Prisma.Decimal(validated.precio_compra),
        precio_venta: new Prisma.Decimal(validated.precio_venta),
        idusuariocrea: idUsuario,
        fechacrea: new Date(),
        idusuariomod: idUsuario,
        fechamod: new Date(),
        estado: ESTADO.ACTIVO,
      };

      const result = await sunattipocambioDao.insertSunatTipoCambio(tx, sunatToCreate);
      return jsonUtils.removeAttributesPrivates(result);
    },
    { timeout: prismaFT.transactionTimeout }
  );

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
    { abortEarly: false, stripUnknown: true }
  );
  log.debug(line(), "sunatUpdateValidated:", validated);

  await prismaFT.client.$transaction(
    async (tx) => {
      const registro = await sunattipocambioDao.getSunatTipoCambioBySunattipocambioid(
        tx,
        validated.sunattipocambioid
      );

      if (!registro) {
        log.warn(line(), `Tipo de cambio SUNAT no existe: [${validated.sunattipocambioid}]`);
        throw new ClientError("Tipo de cambio SUNAT no encontrado", 404);
      }

      const idUsuario = req.session_user?.usuario?.idusuario ?? 1;

      const dataToUpdate: Prisma.sunat_tipo_cambioUpdateInput = {
        idusuariomod: idUsuario,
        fechamod: new Date(),
      };

      if (validated.precio_compra !== undefined) {
        dataToUpdate.precio_compra = new Prisma.Decimal(validated.precio_compra);
      }
      if (validated.precio_venta !== undefined) {
        dataToUpdate.precio_venta = new Prisma.Decimal(validated.precio_venta);
      }
      if (validated.fecha) {
        const nuevaFecha = tipocambioLogic.parseFechaLima(validated.fecha);
        const existente = await sunattipocambioDao.getSunatTipoCambioByFecha(
          tx,
          nuevaFecha,
          registro.idmonedabase,
          registro.idmonedacotizada,
          [ESTADO.ACTIVO, ESTADO.ELIMINADO]
        );
        if (existente && existente.sunattipocambioid !== validated.sunattipocambioid) {
          throw new ClientError("Ya existe otro tipo de cambio SUNAT registrado para esta fecha y par de monedas", 400);
        }
        dataToUpdate.fecha = nuevaFecha;
      }

      await sunattipocambioDao.updateSunatTipoCambio(tx, validated.sunattipocambioid, dataToUpdate);
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );

  response(res, 200, {});
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

  const result = await prismaFT.client.$transaction(
    async (tx) => {
      const registro = await sunattipocambioDao.getSunatTipoCambioBySunattipocambioid(
        tx,
        validated.sunattipocambioid
      );

      if (!registro) {
        log.warn(line(), `Tipo de cambio SUNAT no existe: [${validated.sunattipocambioid}]`);
        throw new ClientError("Tipo de cambio SUNAT no encontrado", 404);
      }

      const idUsuario = req.session_user?.usuario?.idusuario ?? 1;
      const resDelete = await sunattipocambioDao.deleteSunatTipoCambio(tx, validated.sunattipocambioid, idUsuario);
      return resDelete;
    },
    { timeout: prismaFT.transactionTimeout }
  );

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

  const result = await prismaFT.client.$transaction(
    async (tx) => {
      const registro = await sunattipocambioDao.getSunatTipoCambioBySunattipocambioid(
        tx,
        validated.sunattipocambioid
      );

      if (!registro) {
        log.warn(line(), `Tipo de cambio SUNAT no existe: [${validated.sunattipocambioid}]`);
        throw new ClientError("Tipo de cambio SUNAT no encontrado", 404);
      }

      const idUsuario = req.session_user?.usuario?.idusuario ?? 1;
      const resActivate = await sunattipocambioDao.activateSunatTipoCambio(tx, validated.sunattipocambioid, idUsuario);
      return resActivate;
    },
    { timeout: prismaFT.transactionTimeout }
  );

  response(res, 204, result);
};

/**
 * Obtiene los catálogos maestros necesarios para Tipo de Cambio SUNAT (monedas activas).
 * GET /api/v1/financiero/sunat/tipo-cambio/master
 */
export const getSunatTipoCambioMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getSunatTipoCambioMaster");
  const master = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const [monedas, servicios_tipo_cambio] = await Promise.all([
        monedaDao.getMonedas(tx, filter_estados),
        configuracionappDao.getServiciosTipoDeCambioParsed(tx),
      ]);

      const sunatMaster: Record<string, any> = {
        monedas,
        servicios_tipo_cambio,
      };

      return sunatMaster;
    },
    { timeout: prismaFT.transactionTimeout }
  );

  response(res, 201, master);
};
