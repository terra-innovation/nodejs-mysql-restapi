import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import * as distritoDao from "#src/daos/distrito.prisma.Dao.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import * as paisDao from "#src/daos/pais.prisma.Dao.js";
import * as provinciaDao from "#src/daos/provincia.prisma.Dao.js";
import * as riesgoDao from "#src/daos/riesgo.prisma.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const activateEmpresa = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateEmpresa");
  const { id } = req.params;
  const empresaSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const empresaValidated = empresaSchema.validateSync({ empresaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "empresaValidated:", empresaValidated);

  const empresaActivated = await prismaFT.client.$transaction(
    async (tx) => {
      const empresaActivated = await empresaDao.activateEmpresa(tx, empresaValidated.empresaid, req.session_user.usuario.idusuario);

      log.debug(line(), "empresaActivated:", empresaActivated);
      return empresaActivated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  {
    response(res, 204, {});
  }
};

export const deleteEmpresa = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteEmpresa");
  const { id } = req.params;
  const empresaSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const empresaValidated = empresaSchema.validateSync({ empresaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "empresaValidated:", empresaValidated);

  const empresaDeleted = await prismaFT.client.$transaction(
    async (tx) => {
      const empresaDeleted = await empresaDao.deleteEmpresa(tx, empresaValidated.empresaid, req.session_user.usuario.idusuario);
      if (empresaDeleted[0] === 0) {
        throw new ClientError("Empresa no existe", 404);
      }
      log.debug(line(), "empresaDeleted:", empresaDeleted);
      return empresaDeleted;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 204, empresaDeleted);
};

export const getEmpresaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getEmpresaMaster");
  const empresasMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const riesgos = await riesgoDao.getRiesgos(tx, filter_estados);
      const paises = await paisDao.getPaises(tx, filter_estados);
      // getDistritos ya incluye provincia y departamento anidados
      const distritos = await distritoDao.getDistritos(tx, filter_estados);

      var empresasMaster: Record<string, any> = {};
      empresasMaster.riesgos = riesgos;
      empresasMaster.paises = paises;
      empresasMaster.distritos = distritos;

      return empresasMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, empresasMasterFiltered);
};

export const updateEmpresa = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateEmpresa");
  const { id } = req.params;
  const empresaUpdateSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      riesgoid: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(36)
        .max(36),
      paisid: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(36)
        .max(36),
      distritoid: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(36)
        .max(36),
      ruc: yup
        .string()
        .trim()
        .matches(/^\d{11}$/, "RUC debe ser un numero de exactamente 11 digitos")
        .required(),
      razon_social: yup.string().trim().required().min(2).max(200),
      nombre_comercial: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(2)
        .max(200),
      fecha_inscripcion: yup
        .date()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .typeError("fecha_inscripcion debe ser una fecha valida (YYYY-MM-DD)"),
      domicilio_fiscal: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(2)
        .max(200),
      direccion_sede: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(2)
        .max(200),
      direccion_sede_referencia: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(2)
        .max(200),
    })
    .required();
  const empresaValidated = empresaUpdateSchema.validateSync({ empresaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "empresaValidated:", empresaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var empresa = await empresaDao.getEmpresaByEmpresaid(tx, empresaValidated.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa no existe: [" + empresaValidated.empresaid + "]");
        throw new ClientError("Datos no validos", 404);
      }

      let idRiesgo: number | null | undefined = undefined;
      if (empresaValidated.riesgoid !== undefined) {
        if (empresaValidated.riesgoid === null) {
          idRiesgo = null;
        } else {
          var riesgo = await riesgoDao.getRiesgoByRiesgoid(tx, empresaValidated.riesgoid);
          if (!riesgo) {
            log.warn(line(), "Riesgo no existe: [" + empresaValidated.riesgoid + "]");
            throw new ClientError("Datos no validos", 404);
          }
          idRiesgo = riesgo.idriesgo;
        }
      }

      let idPais: number | null | undefined = undefined;
      if (empresaValidated.paisid !== undefined) {
        if (empresaValidated.paisid === null) {
          idPais = null;
        } else {
          var paisPk = await paisDao.findPaisPk(tx, empresaValidated.paisid);
          if (!paisPk) {
            log.warn(line(), "Pais no existe: [" + empresaValidated.paisid + "]");
            throw new ClientError("Datos no validos", 404);
          }
          idPais = paisPk.idpais;
        }
      }

      // distritoid -> deriva automaticamente provincia y departamento
      let idDistrito: number | null | undefined = undefined;
      let idProvincia: number | null | undefined = undefined;
      let idDepartamento: number | null | undefined = undefined;
      if (empresaValidated.distritoid !== undefined) {
        if (empresaValidated.distritoid === null) {
          idDistrito = null;
          idProvincia = null;
          idDepartamento = null;
        } else {
          var distritoSede = await distritoDao.getDistritoByDistritoid(tx, empresaValidated.distritoid);
          if (!distritoSede) {
            log.warn(line(), "Distrito no existe: [" + empresaValidated.distritoid + "]");
            throw new ClientError("Datos no validos", 404);
          }
          const provinciaSede = await provinciaDao.getProvinciaByIdprovincia(tx, distritoSede.idprovincia);
          if (!provinciaSede) {
            log.warn(line(), "Provincia no existe para el distrito: [" + empresaValidated.distritoid + "]");
            throw new ClientError("Datos no validos", 404);
          }
          idDistrito = distritoSede.iddistrito;
          idProvincia = distritoSede.idprovincia;
          idDepartamento = provinciaSede.iddepartamento;
        }
      }

      const empresaToUpdate: Prisma.empresaUpdateInput = {
        ...(idRiesgo !== undefined && {
          riesgo: idRiesgo === null ? { disconnect: true } : { connect: { idriesgo: idRiesgo } },
        }),
        ...(idPais !== undefined && {
          pais_sede: idPais === null ? { disconnect: true } : { connect: { idpais: idPais } },
        }),
        ...(idDepartamento !== undefined && {
          departamento_sede: idDepartamento === null ? { disconnect: true } : { connect: { iddepartamento: idDepartamento } },
        }),
        ...(idProvincia !== undefined && {
          provincia_sede: idProvincia === null ? { disconnect: true } : { connect: { idprovincia: idProvincia } },
        }),
        ...(idDistrito !== undefined && {
          distrito_sede: idDistrito === null ? { disconnect: true } : { connect: { iddistrito: idDistrito } },
        }),

        razon_social: empresaValidated.razon_social,
        nombre_comercial: empresaValidated.nombre_comercial ?? null,
        fecha_inscripcion: empresaValidated.fecha_inscripcion ?? null,
        domicilio_fiscal: empresaValidated.domicilio_fiscal ?? null,
        direccion_sede: empresaValidated.direccion_sede ?? null,
        direccion_sede_referencia: empresaValidated.direccion_sede_referencia ?? null,

        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const empresaUpdated = await empresaDao.updateEmpresa(tx, empresaValidated.empresaid, empresaToUpdate);
      log.debug(line(), "empresaUpdated:", empresaUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 200, { ...empresaValidated });
};

export const getEmpresas = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getEmpresas");

  const empresas = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const empresas = await empresaDao.getEmpresas(tx, filter_estado);
      return empresas;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, empresas);
};

export const createEmpresa = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createEmpresa");
  const session_idusuario = req.session_user.usuario.idusuario;
  const empresaCreateSchema = yup
    .object()
    .shape({
      riesgoid: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(36)
        .max(36),
      paisid: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(36)
        .max(36),
      distritoid: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(36)
        .max(36),
      ruc: yup
        .string()
        .trim()
        .matches(/^\d{11}$/, "RUC debe ser un numero de exactamente 11 digitos")
        .required(),
      razon_social: yup.string().trim().required().min(2).max(200),
      nombre_comercial: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(2)
        .max(200),
      fecha_inscripcion: yup.date().nullable().optional().typeError("fecha_inscripcion debe ser una fecha valida (YYYY-MM-DD)"),
      domicilio_fiscal: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(2)
        .max(200),
      direccion_sede: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(2)
        .max(200),
      direccion_sede_referencia: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(2)
        .max(200),
    })
    .required();
  var empresaValidated = empresaCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "empresaValidated:", empresaValidated);

  const empresaCreated = await prismaFT.client.$transaction(
    async (tx) => {
      // Verificar unicidad del RUC
      var empresas_por_ruc = await empresaDao.getEmpresaByRuc(tx, empresaValidated.ruc);
      if (empresas_por_ruc) {
        log.warn(line(), "La empresa [" + empresaValidated.ruc + "] se encuentra registrada. Ingrese un ruc diferente.");
        throw new ClientError("La empresa [" + empresaValidated.ruc + "] se encuentra registrada. Ingrese un ruc diferente.", 409);
      }

      let idRiesgo: number | null = null;
      if (empresaValidated.riesgoid) {
        var riesgo = await riesgoDao.getRiesgoByRiesgoid(tx, empresaValidated.riesgoid);
        if (!riesgo) {
          log.warn(line(), "Riesgo no existe: [" + empresaValidated.riesgoid + "]");
          throw new ClientError("Datos no validos", 404);
        }
        idRiesgo = riesgo.idriesgo;
      }

      let idPais: number | null = null;
      if (empresaValidated.paisid) {
        var paisPk = await paisDao.findPaisPk(tx, empresaValidated.paisid);
        if (!paisPk) {
          log.warn(line(), "Pais no existe: [" + empresaValidated.paisid + "]");
          throw new ClientError("Datos no validos", 404);
        }
        idPais = paisPk.idpais;
      }

      // distritoid -> deriva automaticamente provincia y departamento
      let idDistrito: number | null = null;
      let idProvincia: number | null = null;
      let idDepartamento: number | null = null;
      if (empresaValidated.distritoid) {
        var distritoSede = await distritoDao.getDistritoByDistritoid(tx, empresaValidated.distritoid);
        if (!distritoSede) {
          log.warn(line(), "Distrito no existe: [" + empresaValidated.distritoid + "]");
          throw new ClientError("Datos no validos", 404);
        }
        const provinciaSede = await provinciaDao.getProvinciaByIdprovincia(tx, distritoSede.idprovincia);
        if (!provinciaSede) {
          log.warn(line(), "Provincia no existe para el distrito: [" + empresaValidated.distritoid + "]");
          throw new ClientError("Datos no validos", 404);
        }
        idDistrito = distritoSede.iddistrito;
        idProvincia = distritoSede.idprovincia;
        idDepartamento = provinciaSede.iddepartamento;
      }

      const empresaCreate: Prisma.empresaCreateInput = {
        empresaid: uuidv4(),
        code: uuidv4().split("-")[0],
        ruc: empresaValidated.ruc,
        razon_social: empresaValidated.razon_social,
        nombre_comercial: empresaValidated.nombre_comercial ?? null,
        fecha_inscripcion: empresaValidated.fecha_inscripcion ?? null,
        domicilio_fiscal: empresaValidated.domicilio_fiscal ?? null,
        direccion_sede: empresaValidated.direccion_sede ?? null,
        direccion_sede_referencia: empresaValidated.direccion_sede_referencia ?? null,

        ...(idRiesgo && { riesgo: { connect: { idriesgo: idRiesgo } } }),
        ...(idPais && { pais_sede: { connect: { idpais: idPais } } }),
        ...(idDepartamento && { departamento_sede: { connect: { iddepartamento: idDepartamento } } }),
        ...(idProvincia && { provincia_sede: { connect: { idprovincia: idProvincia } } }),
        ...(idDistrito && { distrito_sede: { connect: { iddistrito: idDistrito } } }),

        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
        fechamod: new Date(),
        estado: ESTADO.ACTIVO,
      };

      const empresaCreated = await empresaDao.insertEmpresa(tx, empresaCreate);
      return empresaCreated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, empresaCreated);
};
