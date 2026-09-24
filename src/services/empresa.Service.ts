import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { line, log } from "#src/utils/logger.pino.js";
import { v4 as uuidv4 } from "uuid";

import * as distritoDao from "#root/src/daos/distrito.Dao.js";
import * as empresaDao from "#root/src/daos/empresa.Dao.js";
import * as paisDao from "#root/src/daos/pais.Dao.js";
import * as provinciaDao from "#root/src/daos/provincia.Dao.js";
import * as riesgoDao from "#root/src/daos/riesgo.Dao.js";

export interface EmpresaCreateDto {
  riesgoid?: string | null;
  paisid?: string | null;
  distritoid?: string | null;
  ruc: string;
  razon_social: string;
  nombre_comercial?: string | null;
  fecha_inscripcion?: Date | null;
  domicilio_fiscal?: string | null;
  direccion_sede?: string | null;
  direccion_sede_referencia?: string | null;
}

export interface EmpresaUpdateDto {
  empresaid: string;
  riesgoid?: string | null;
  paisid?: string | null;
  distritoid?: string | null;
  ruc: string;
  razon_social: string;
  nombre_comercial?: string | null;
  fecha_inscripcion?: Date | null;
  domicilio_fiscal?: string | null;
  direccion_sede?: string | null;
  direccion_sede_referencia?: string | null;
}

/**
 * Activa una empresa existente.
 */
export const activateEmpresaService = async (empresaid: string, idusuario: number) => {
  log.debug(line(), "service::activateEmpresaService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const empresaActivated = await empresaDao.activateEmpresa(tx, empresaid, idusuario);
      log.debug(line(), "empresaActivated:", empresaActivated);
      return empresaActivated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Elimina (lógicamente) una empresa.
 */
export const deleteEmpresaService = async (empresaid: string, idusuario: number) => {
  log.debug(line(), "service::deleteEmpresaService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const empresaDeleted = await empresaDao.deleteEmpresa(tx, empresaid, idusuario);
      if (empresaDeleted[0] === 0) {
        throw new ClientError("Empresa no existe", 404);
      }
      log.debug(line(), "empresaDeleted:", empresaDeleted);
      return empresaDeleted;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Obtiene los maestros de empresa (riesgos, países, distritos).
 */
export const getEmpresaMasterService = async () => {
  log.debug(line(), "service::getEmpresaMasterService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const riesgos = await riesgoDao.getRiesgos(tx, filter_estados);
      const paises = await paisDao.getPaises(tx, filter_estados);
      const distritos = await distritoDao.getDistritos(tx, filter_estados);

      return {
        riesgos,
        paises,
        distritos,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Actualiza los datos de una empresa existente.
 */
export const updateEmpresaService = async (dto: EmpresaUpdateDto, idusuario: number) => {
  log.debug(line(), "service::updateEmpresaService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const empresa = await empresaDao.getEmpresaByEmpresaid(tx, dto.empresaid);
      if (!empresa) {
        log.warn(line(), `Empresa no existe: [${dto.empresaid}]`);
        throw new ClientError("Datos no validos", 404);
      }

      let idRiesgo: number | null | undefined = undefined;
      if (dto.riesgoid !== undefined) {
        if (dto.riesgoid === null) {
          idRiesgo = null;
        } else {
          const riesgo = await riesgoDao.getRiesgoByRiesgoid(tx, dto.riesgoid);
          if (!riesgo) {
            log.warn(line(), `Riesgo no existe: [${dto.riesgoid}]`);
            throw new ClientError("Datos no validos", 404);
          }
          idRiesgo = riesgo.idriesgo;
        }
      }

      let idPais: number | null | undefined = undefined;
      if (dto.paisid !== undefined) {
        if (dto.paisid === null) {
          idPais = null;
        } else {
          const paisPk = await paisDao.findPaisPk(tx, dto.paisid);
          if (!paisPk) {
            log.warn(line(), `Pais no existe: [${dto.paisid}]`);
            throw new ClientError("Datos no validos", 404);
          }
          idPais = paisPk.idpais;
        }
      }

      // distritoid -> deriva automaticamente provincia y departamento
      let idDistrito: number | null | undefined = undefined;
      let idProvincia: number | null | undefined = undefined;
      let idDepartamento: number | null | undefined = undefined;
      if (dto.distritoid !== undefined) {
        if (dto.distritoid === null) {
          idDistrito = null;
          idProvincia = null;
          idDepartamento = null;
        } else {
          const distritoSede = await distritoDao.getDistritoByDistritoid(tx, dto.distritoid);
          if (!distritoSede) {
            log.warn(line(), `Distrito no existe: [${dto.distritoid}]`);
            throw new ClientError("Datos no validos", 404);
          }
          const provinciaSede = await provinciaDao.getProvinciaByIdprovincia(tx, distritoSede.idprovincia);
          if (!provinciaSede) {
            log.warn(line(), `Provincia no existe para el distrito: [${dto.distritoid}]`);
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

        razon_social: dto.razon_social,
        nombre_comercial: dto.nombre_comercial ?? null,
        fecha_inscripcion: dto.fecha_inscripcion ?? null,
        domicilio_fiscal: dto.domicilio_fiscal ?? null,
        direccion_sede: dto.direccion_sede ?? null,
        direccion_sede_referencia: dto.direccion_sede_referencia ?? null,

        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
      };

      const empresaUpdated = await empresaDao.updateEmpresa(tx, dto.empresaid, empresaToUpdate);
      log.debug(line(), "empresaUpdated:", empresaUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta todas las empresas activas y eliminadas.
 */
export const getEmpresasService = async () => {
  log.debug(line(), "service::getEmpresasService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      return await empresaDao.getEmpresas(tx, filter_estado);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Registra una nueva empresa verificando unicidad de RUC y resolviendo jerarquía geográfica.
 */
export const createEmpresaService = async (dto: EmpresaCreateDto, idusuario: number) => {
  log.debug(line(), "service::createEmpresaService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const empresas_por_ruc = await empresaDao.getEmpresaByRuc(tx, dto.ruc);
      if (empresas_por_ruc) {
        log.warn(line(), `La empresa [${dto.ruc}] se encuentra registrada. Ingrese un ruc diferente.`);
        throw new ClientError(`La empresa [${dto.ruc}] se encuentra registrada. Ingrese un ruc diferente.`, 409);
      }

      let idRiesgo: number | null = null;
      if (dto.riesgoid) {
        const riesgo = await riesgoDao.getRiesgoByRiesgoid(tx, dto.riesgoid);
        if (!riesgo) {
          log.warn(line(), `Riesgo no existe: [${dto.riesgoid}]`);
          throw new ClientError("Datos no validos", 404);
        }
        idRiesgo = riesgo.idriesgo;
      }

      let idPais: number | null = null;
      if (dto.paisid) {
        const paisPk = await paisDao.findPaisPk(tx, dto.paisid);
        if (!paisPk) {
          log.warn(line(), `Pais no existe: [${dto.paisid}]`);
          throw new ClientError("Datos no validos", 404);
        }
        idPais = paisPk.idpais;
      }

      // distritoid -> deriva automaticamente provincia y departamento
      let idDistrito: number | null = null;
      let idProvincia: number | null = null;
      let idDepartamento: number | null = null;
      if (dto.distritoid) {
        const distritoSede = await distritoDao.getDistritoByDistritoid(tx, dto.distritoid);
        if (!distritoSede) {
          log.warn(line(), `Distrito no existe: [${dto.distritoid}]`);
          throw new ClientError("Datos no validos", 404);
        }
        const provinciaSede = await provinciaDao.getProvinciaByIdprovincia(tx, distritoSede.idprovincia);
        if (!provinciaSede) {
          log.warn(line(), `Provincia no existe para el distrito: [${dto.distritoid}]`);
          throw new ClientError("Datos no validos", 404);
        }
        idDistrito = distritoSede.iddistrito;
        idProvincia = distritoSede.idprovincia;
        idDepartamento = provinciaSede.iddepartamento;
      }

      const empresaCreate: Prisma.empresaCreateInput = {
        empresaid: uuidv4(),
        code: uuidv4().split("-")[0],
        ruc: dto.ruc,
        razon_social: dto.razon_social,
        nombre_comercial: dto.nombre_comercial ?? null,
        fecha_inscripcion: dto.fecha_inscripcion ?? null,
        domicilio_fiscal: dto.domicilio_fiscal ?? null,
        direccion_sede: dto.direccion_sede ?? null,
        direccion_sede_referencia: dto.direccion_sede_referencia ?? null,

        ...(idRiesgo && { riesgo: { connect: { idriesgo: idRiesgo } } }),
        ...(idPais && { pais_sede: { connect: { idpais: idPais } } }),
        ...(idDepartamento && { departamento_sede: { connect: { iddepartamento: idDepartamento } } }),
        ...(idProvincia && { provincia_sede: { connect: { idprovincia: idProvincia } } }),
        ...(idDistrito && { distrito_sede: { connect: { iddistrito: idDistrito } } }),

        idusuariocrea: idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
        estado: ESTADO.ACTIVO,
      };

      const empresaCreated = await empresaDao.insertEmpresa(tx, empresaCreate);
      return empresaCreated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
