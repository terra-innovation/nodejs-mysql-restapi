import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import * as detraccionestadoDao from "#src/daos/detraccionestado.prisma.Dao.js";
import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as factoringfacturafactorDao from "#src/daos/factoringfacturafactor.prisma.Dao.js";
import * as facturaDao from "#src/daos/factura.prisma.Dao.js";
import * as facturaestadoDao from "#src/daos/facturaestado.prisma.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";

import { isProduction } from "#src/config.js";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

import * as archivoDao from "#src/daos/archivo.prisma.Dao.js";
import * as archivofacturaDao from "#src/daos/archivofactura.prisma.Dao.js";

import { ARCHIVO_TIPO } from "#src/daos/archivotipo.prisma.Dao.js";

export const activateFactoringfacturafactor = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoringfacturafactor");
  const { id } = req.params;
  const factoringfacturafactorSchema = yup
    .object()
    .shape({
      factoringfacturafactorid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = factoringfacturafactorSchema.validateSync({ factoringfacturafactorid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "validated:", validated);

  const activated = await prismaFT.client.$transaction(
    async (tx) => {
      const existed = await factoringfacturafactorDao.getFactoringfacturafactorByFactoringfacturafactorid(tx, validated.factoringfacturafactorid);
      if (!existed) {
        log.warn(line(), "Factoringfacturafactor no existe: [" + validated.factoringfacturafactorid + "]");
        throw new ClientError("Factoringfacturafactor no existe", 404);
      }
      return await factoringfacturafactorDao.activateFactoringfacturafactor(tx, validated.factoringfacturafactorid, req.session_user.usuario.idusuario);
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 204, activated);
};

export const deleteFactoringfacturafactor = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoringfacturafactor");
  const { id } = req.params;
  const factoringfacturafactorSchema = yup
    .object()
    .shape({
      factoringfacturafactorid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = factoringfacturafactorSchema.validateSync({ factoringfacturafactorid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "validated:", validated);

  const deleted = await prismaFT.client.$transaction(
    async (tx) => {
      const existed = await factoringfacturafactorDao.getFactoringfacturafactorByFactoringfacturafactorid(tx, validated.factoringfacturafactorid);
      if (!existed) {
        log.warn(line(), "Factoringfacturafactor no existe: [" + validated.factoringfacturafactorid + "]");
        throw new ClientError("Factoringfacturafactor no existe", 404);
      }
      return await factoringfacturafactorDao.deleteFactoringfacturafactor(tx, validated.factoringfacturafactorid, req.session_user.usuario.idusuario);
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 204, deleted);
};

export const updateFactoringfacturafactor = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringfacturafactor");
  const { id } = req.params;
  const factoringfacturafactorUpdateSchema = yup
    .object()
    .shape({
      factoringfacturafactorid: yup.string().trim().required().min(36).max(36),
      facturaestadoid: yup.string().trim().required().min(36).max(36),
      detraccionestadoid: yup.string().trim().required().min(36).max(36),
      detraccionarchivoid: yup.string().trim().min(36).max(36),
      fecha_pago_factura: yup
        .string()
        .nullable()
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "Formato inválido: debe ser ISO UTC (YYYY-MM-DDTHH:mm:ssZ)")
        .test("is-valid-date", "Fecha inválida", (value) => {
          if (!value) return true;
          const date = new Date(value);
          return !isNaN(date.getTime());
        }),
      fecha_pago_detraccion: yup
        .string()
        .nullable()
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "Formato inválido: debe ser ISO UTC (YYYY-MM-DDTHH:mm:ssZ)")
        .test("is-valid-date", "Fecha inválida", (value) => {
          if (!value) return true;
          const date = new Date(value);
          return !isNaN(date.getTime());
        }),
    })
    .required();
  const validated = factoringfacturafactorUpdateSchema.validateSync({ factoringfacturafactorid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "validated:", validated);

  const updated = await prismaFT.client.$transaction(
    async (tx) => {
      const factoringfacturafactor = await factoringfacturafactorDao.getFactoringfacturafactorByFactoringfacturafactorid(tx, validated.factoringfacturafactorid);
      if (!factoringfacturafactor) {
        log.warn(line(), "Factoringfacturafactor no existe: [" + validated.factoringfacturafactorid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factura_estado = await facturaestadoDao.getFacturaestadoByFacturaestadoid(tx, validated.facturaestadoid);
      if (!factura_estado) {
        log.warn(line(), "Factura estado no existe: [" + validated.facturaestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const detraccion_estado = await detraccionestadoDao.getDetraccionestadoByDetraccionestadoid(tx, validated.detraccionestadoid);
      if (!detraccion_estado) {
        log.warn(line(), "Detraccion estado no existe: [" + validated.detraccionestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      if (validated.detraccionarchivoid) {
        const filter_estado_archivo = isProduction ? [ESTADO.ACTIVO] : [ESTADO.ACTIVO, ESTADO.ELIMINADO];
        const detraccionarchivo = await archivoDao.getArchivoByArchivoidAndIdarchivotipo(prismaFT.client, validated.detraccionarchivoid, ARCHIVO_TIPO.CONSTANCIA_PAGO_DETRACCION, filter_estado_archivo);
        if (!detraccionarchivo) {
          log.warn(line(), "Factura Detraccion no existe o tipo no coincide: [" + validated.detraccionarchivoid + "]");
          throw new ClientError("Datos no válidos", 404);
        }

        const facturaDetraccionCreated = await vincularFacturaDetraccion(req, tx, detraccionarchivo.idarchivo, factoringfacturafactor.idfactura);
        log.debug(line(), "facturaDetraccionCreated:", facturaDetraccionCreated);
      }

      const factoringfacturafactorToUpdate: Prisma.factoring_factura_factorUpdateInput = {
        factura_estado: { connect: { idfacturaestado: factura_estado.idfacturaestado } },
        detraccion_estado: { connect: { iddetraccionestado: detraccion_estado.iddetraccionestado } },
        fecha_pago_factura: validated.fecha_pago_factura ? new Date(validated.fecha_pago_factura) : null,
        fecha_pago_detraccion: validated.fecha_pago_detraccion ? new Date(validated.fecha_pago_detraccion) : null,
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const result = await factoringfacturafactorDao.updateFactoringfacturafactor(tx, validated.factoringfacturafactorid, factoringfacturafactorToUpdate);
      log.debug(line(), "updated:", result);

      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );

  response(res, 200, updated);
};

export const createFactoringfacturafactor = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringfacturafactor");
  const factoringfacturafactorSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
      facturaid: yup.string().trim().required().min(36).max(36),
      facturaestadoid: yup.string().trim().required().min(36).max(36),
      detraccionestadoid: yup.string().trim().required().min(36).max(36),
      detraccionarchivoid: yup.string().trim().min(36).max(36),
      fecha_pago_factura: yup
        .string()
        .nullable()
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "Formato inválido: debe ser ISO UTC (YYYY-MM-DDTHH:mm:ssZ)")
        .test("is-valid-date", "Fecha inválida", (value) => {
          if (!value) return true;
          const date = new Date(value);
          return !isNaN(date.getTime());
        }),
      fecha_pago_detraccion: yup
        .string()
        .nullable()
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "Formato inválido: debe ser ISO UTC (YYYY-MM-DDTHH:mm:ssZ)")
        .test("is-valid-date", "Fecha inválida", (value) => {
          if (!value) return true;
          const date = new Date(value);
          return !isNaN(date.getTime());
        }),
    })
    .required();

  const validated = factoringfacturafactorSchema.validateSync({ ...req.body }, { abortEarly: false, stripUnknown: true });

  const created = await prismaFT.client.$transaction(
    async (tx) => {
      const factoring = await factoringDao.getFactoringByFactoringid(tx, validated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + validated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factura = await facturaDao.getFacturaByFacturaid(tx, validated.facturaid);
      if (!factura) {
        log.warn(line(), "Factura no existe: [" + validated.facturaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factura_estado = await facturaestadoDao.getFacturaestadoByFacturaestadoid(tx, validated.facturaestadoid);
      if (!factura_estado) {
        log.warn(line(), "Factura estado no existe: [" + validated.facturaestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const detraccion_estado = await detraccionestadoDao.getDetraccionestadoByDetraccionestadoid(tx, validated.detraccionestadoid);
      if (!detraccion_estado) {
        log.warn(line(), "Detraccion estado no existe: [" + validated.detraccionestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      if (validated.detraccionarchivoid) {
        const filter_estado_archivo = isProduction ? [ESTADO.ACTIVO] : [ESTADO.ACTIVO, ESTADO.ELIMINADO];
        const detraccionarchivo = await archivoDao.getArchivoByArchivoidAndIdarchivotipo(prismaFT.client, validated.detraccionarchivoid, ARCHIVO_TIPO.CONSTANCIA_PAGO_DETRACCION, filter_estado_archivo);
        if (!detraccionarchivo) {
          log.warn(line(), "Factura Detraccion no existe o tipo no coincide: [" + validated.detraccionarchivoid + "]");
          throw new ClientError("Datos no válidos", 404);
        }

        const facturaDetraccionCreated = await vincularFacturaDetraccion(req, tx, detraccionarchivo.idarchivo, factura.idfactura);
        log.debug(line(), "facturaDetraccionCreated:", facturaDetraccionCreated);
      }

      const factoringfacturafactorToCreate: Prisma.factoring_factura_factorCreateInput = {
        factoring: { connect: { idfactoring: factoring.idfactoring } },
        factura: { connect: { idfactura: factura.idfactura } },
        factura_estado: { connect: { idfacturaestado: factura_estado.idfacturaestado } },
        detraccion_estado: { connect: { iddetraccionestado: detraccion_estado.iddetraccionestado } },

        factoringfacturafactorid: uuidv4(),
        code: uuidv4().split("-")[0],

        fecha_pago_factura: validated.fecha_pago_factura ? new Date(validated.fecha_pago_factura) : null,
        fecha_pago_detraccion: validated.fecha_pago_detraccion ? new Date(validated.fecha_pago_detraccion) : null,

        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const result = await factoringfacturafactorDao.insertFactoringfacturafactor(tx, factoringfacturafactorToCreate);
      log.debug(line(), "created:", result);

      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );

  response(res, 201, created);
};

export const getFactoringfacturafactoresByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringfacturafactoresByFactoringid");
  const { id } = req.params;
  const factoringfacturafactorSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = factoringfacturafactorSearchSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "validated:", validated);

  const list = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, validated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + validated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringfacturafactores = await factoringfacturafactorDao.getFactoringfacturafactorsByIdfactoring(tx, factoring.idfactoring, filter_estado);

      return factoringfacturafactores;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, list);
};

export const getFactoringfacturafactorMasterByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringfacturafactorMasterByFactoringid");
  const { factoringid } = req.params;
  const factoringfacturafactorSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = factoringfacturafactorSchema.validateSync({ factoringid: factoringid }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "validated:", validated);

  const master = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, validated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + validated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const facturaestados = await facturaestadoDao.getFacturaestados(tx, filter_estados);
      const detraccionestados = await detraccionestadoDao.getDetraccionestados(tx, filter_estados);

      const factoringfacturafactorMaster: Record<string, any> = {
        facturaestados: facturaestados,
        detraccionestados: detraccionestados,
      };

      return factoringfacturafactorMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, master);
};

const vincularFacturaDetraccion = async (req, tx, idarchivo, idfactura) => {
  const idusuario = req.session_user?.usuario?.idusuario ?? 1;

  const archivofacturaToCreate: Prisma.archivo_facturaCreateInput = {
    archivo: { connect: { idarchivo: idarchivo } },
    factura: { connect: { idfactura: idfactura } },
    idusuariocrea: idusuario,
    fechacrea: new Date(),
    idusuariomod: idusuario,
    fechamod: new Date(),
    estado: 1,
  };

  const archivofacturaCreated = await archivofacturaDao.insertArchivoFactura(tx, archivofacturaToCreate);
  return archivofacturaCreated;
};
