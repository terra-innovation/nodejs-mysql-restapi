import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as archivoDao from "#root/src/daos/archivo.Dao.js";
import * as archivofactoringtransferenciacedenteDao from "#root/src/daos/archivofactoringtransferenciacedente.Dao.js";
import * as empresacuentabancariaDao from "#root/src/daos/empresacuentabancaria.Dao.js";
import * as factorcuentabancariaDao from "#root/src/daos/factorcuentabancaria.Dao.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringtransferenciacedenteDao from "#root/src/daos/factoringtransferenciacedente.Dao.js";
import * as factoringtransferenciaestadoDao from "#root/src/daos/factoringtransferenciaestado.Dao.js";
import * as factoringtransferenciatipoDao from "#root/src/daos/factoringtransferenciatipo.Dao.js";
import * as monedaDao from "#root/src/daos/moneda.Dao.js";
import * as usuarioDao from "#root/src/daos/usuario.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as emailService from "#root/src/providers/email/email.Provider.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { v4 as uuidv4 } from "uuid";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface FactoringtransferenciacedenteIdDto {
  factoringtransferenciacedenteid: string;
}

export interface UpdateFactoringtransferenciacedenteDto {
  factoringtransferenciacedenteid: string;
  factoringtransferenciaestadoid: string;
}

export interface CreateFactoringtransferenciacedenteDto {
  factoringid: string;
  factoringtransferenciatipoid: string;
  factoringtransferenciaestadoid: string;
  factorcuentabancariaid: string;
  empresacuentabancariaid: string;
  monedaid: string;
  numero_operacion: string;
  monto: number;
  fecha: string;
  archivo_constancia_transferencia: string;
}

export interface GetFactoringtransferenciacedentesByFactoringidDto {
  factoringid: string;
}

export interface GetFactoringtransferenciacedenteMasterByFactoringidDto {
  factoringid: string;
}

// ─── Services ────────────────────────────────────────────────────────────────

/**
 * Envía la notificación por correo al cedente con la constancia de transferencia bancaria ofuscada.
 */
export const sendCorreoFactoringtransferenciacedenteService = async (
  factoringtransferenciacedenteid: string,
) => {
  log.debug(line(), "service::admin::sendCorreoFactoringtransferenciacedenteService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringtransferenciacedenteExisted =
        await factoringtransferenciacedenteDao.getFactoringtransferenciacedenteByFactoringtransferenciacedenteid(
          tx,
          factoringtransferenciacedenteid,
        );
      if (!factoringtransferenciacedenteExisted) {
        log.warn(line(), `Factoringtransferenciacedente no existe: [${factoringtransferenciacedenteid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factoring_for_email = await factoringDao.getFactoringByIdfactoring(
        tx,
        factoringtransferenciacedenteExisted.idfactoring,
      );
      const factoringtransferenciacedente_for_email =
        await factoringtransferenciacedenteDao.getFactoringtransferenciacedenteByIdfactoringtransferenciacedente(
          tx,
          factoringtransferenciacedenteExisted.idfactoringtransferenciacedente,
        );
      const usuario_for_email = await usuarioDao.getUsuarioByEmail(
        tx,
        factoring_for_email.contacto_cedente.email,
      );

      const factoringtransferenciacedenteObfuscated_for_email = jsonUtils.ofuscarAtributos(
        factoringtransferenciacedente_for_email,
        ["numero", "cci"],
        jsonUtils.PATRON_OFUSCAR_CUENTA,
      );

      const paramsEmail = {
        factoring: factoring_for_email,
        factoringtransferenciacedente: factoringtransferenciacedenteObfuscated_for_email,
        usuario: usuario_for_email,
      };

      await emailService.sendFactoringEmpresaServicioFactoringCedenteConfirmacionTransferencia(
        usuario_for_email.email,
        paramsEmail,
      );

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Activa un registro de transferencia al cedente.
 */
export const activateFactoringtransferenciacedenteService = async (
  dto: FactoringtransferenciacedenteIdDto,
  idusuario: number,
) => {
  log.debug(line(), "service::admin::activateFactoringtransferenciacedenteService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringtransferenciacedenteActivated =
        await factoringtransferenciacedenteDao.activateFactoringtransferenciacedente(
          tx,
          dto.factoringtransferenciacedenteid,
          idusuario,
        );
      if (factoringtransferenciacedenteActivated[0] === 0) {
        throw new ClientError("Factoringtransferenciacedente no existe", 404);
      }
      log.debug(
        line(),
        "factoringtransferenciacedenteActivated:",
        factoringtransferenciacedenteActivated,
      );
      return factoringtransferenciacedenteActivated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Elimina lógicamente un registro de transferencia al cedente.
 */
export const deleteFactoringtransferenciacedenteService = async (
  dto: FactoringtransferenciacedenteIdDto,
  idusuario: number,
) => {
  log.debug(line(), "service::admin::deleteFactoringtransferenciacedenteService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringtransferenciacedenteDeleted =
        await factoringtransferenciacedenteDao.deleteFactoringtransferenciacedente(
          tx,
          dto.factoringtransferenciacedenteid,
          idusuario,
        );
      if (factoringtransferenciacedenteDeleted[0] === 0) {
        throw new ClientError("Factoringtransferenciacedente no existe", 404);
      }
      log.debug(line(), "factoringtransferenciacedenteDeleted:", factoringtransferenciacedenteDeleted);
      return factoringtransferenciacedenteDeleted;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Actualiza el estado de una transferencia al cedente.
 */
export const updateFactoringtransferenciacedenteService = async (
  dto: UpdateFactoringtransferenciacedenteDto,
  idusuario: number,
) => {
  log.debug(line(), "service::admin::updateFactoringtransferenciacedenteService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringtransferenciacedente =
        await factoringtransferenciacedenteDao.getFactoringtransferenciacedenteByFactoringtransferenciacedenteid(
          tx,
          dto.factoringtransferenciacedenteid,
        );
      if (!factoringtransferenciacedente) {
        log.warn(
          line(),
          `Factoringtransferenciacedente no existe: [${dto.factoringtransferenciacedenteid}]`,
        );
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringtransferenciaestado =
        await factoringtransferenciaestadoDao.getFactoringtransferenciaestadoByFactoringtransferenciaestadoid(
          tx,
          dto.factoringtransferenciaestadoid,
        );
      if (!factoringtransferenciaestado) {
        log.warn(
          line(),
          `factoringtransferenciaestado no existe: [${dto.factoringtransferenciaestadoid}]`,
        );
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringtransferenciacedenteToUpdate: Prisma.factoring_transferencia_cedenteUpdateInput = {
        factoring_transferencia_estado: {
          connect: {
            idfactoringtransferenciaestado: factoringtransferenciaestado.idfactoringtransferenciaestado,
          },
        },
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
      };

      const factoringtransferenciacedenteUpdated =
        await factoringtransferenciacedenteDao.updateFactoringtransferenciacedente(
          tx,
          dto.factoringtransferenciacedenteid,
          factoringtransferenciacedenteToUpdate,
        );
      log.debug(line(), "factoringtransferenciacedenteUpdated:", factoringtransferenciacedenteUpdated);

      return factoringtransferenciacedenteUpdated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Registra una transferencia al cedente y vincula el archivo de constancia.
 */
export const createFactoringtransferenciacedenteService = async (
  dto: CreateFactoringtransferenciacedenteDto,
  idusuario: number,
) => {
  log.debug(line(), "service::admin::createFactoringtransferenciacedenteService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${dto.factoringid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringtransferenciatipo =
        await factoringtransferenciatipoDao.getFactoringtransferenciatipoByFactoringtransferenciatipoid(
          tx,
          dto.factoringtransferenciatipoid,
        );
      if (!factoringtransferenciatipo) {
        log.warn(
          line(),
          `Factoring tranferencia tipo no existe: [${dto.factoringtransferenciatipoid}]`,
        );
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringtransferenciaestado =
        await factoringtransferenciaestadoDao.getFactoringtransferenciaestadoByFactoringtransferenciaestadoid(
          tx,
          dto.factoringtransferenciaestadoid,
        );
      if (!factoringtransferenciaestado) {
        log.warn(
          line(),
          `Factoring tranferencia estado no existe: [${dto.factoringtransferenciaestadoid}]`,
        );
        throw new ClientError("Datos no válidos", 404);
      }

      const factorcuentabancaria =
        await factorcuentabancariaDao.getFactorcuentabancariaByFactorcuentabancariaid(
          tx,
          dto.factorcuentabancariaid,
        );
      if (!factorcuentabancaria) {
        log.warn(line(), `factorcuentabancaria no existe: [${dto.factorcuentabancariaid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const empresacuentabancaria =
        await empresacuentabancariaDao.getEmpresacuentabancariaByEmpresacuentabancariaid(
          tx,
          dto.empresacuentabancariaid,
        );
      if (!empresacuentabancaria) {
        log.warn(line(), `empresacuentabancaria no existe: [${dto.empresacuentabancariaid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const moneda = await monedaDao.getMonedaByMonedaid(tx, dto.monedaid);
      if (!moneda) {
        log.warn(line(), `Moneda no existe: [${dto.monedaid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const archivo = await archivoDao.getArchivoByArchivoid(tx, dto.archivo_constancia_transferencia);
      if (!archivo) {
        log.warn(line(), `Archivo no existe: [${dto.archivo_constancia_transferencia}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringtransferenciacedenteToCreate: Prisma.factoring_transferencia_cedenteCreateInput = {
        factoring: { connect: { idfactoring: factoring.idfactoring } },
        factoring_transferencia_tipo: {
          connect: { idfactoringtransferenciatipo: factoringtransferenciatipo.idfactoringtransferenciatipo },
        },
        factoring_transferencia_estado: {
          connect: {
            idfactoringtransferenciaestado: factoringtransferenciaestado.idfactoringtransferenciaestado,
          },
        },
        factor_cuenta_bancaria: {
          connect: { idfactorcuentabancaria: factorcuentabancaria.idfactorcuentabancaria },
        },
        empresa_cuenta_bancaria: {
          connect: { idempresacuentabancaria: empresacuentabancaria.idempresacuentabancaria },
        },
        moneda: { connect: { idmoneda: moneda.idmoneda } },

        factoringtransferenciacedenteid: uuidv4(),
        code: uuidv4().split("-")[0],

        numero_operacion: dto.numero_operacion,
        monto: dto.monto,
        fecha: dto.fecha,

        idusuariocrea: idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const factoringtransferenciacedenteCreated =
        await factoringtransferenciacedenteDao.insertFactoringtransferenciacedente(
          tx,
          jsonUtils.omitNullAndUndefined(factoringtransferenciacedenteToCreate),
        );
      log.debug(line(), "factoringtransferenciacedenteCreated:", factoringtransferenciacedenteCreated);

      const archivofactoringtransferenciacedenteToCreate: Prisma.archivo_factoring_transferencia_cedenteCreateInput =
        {
          archivo: { connect: { idarchivo: archivo.idarchivo } },
          factoring_transferencia_cedente: {
            connect: {
              idfactoringtransferenciacedente:
                factoringtransferenciacedenteCreated.idfactoringtransferenciacedente,
            },
          },
          idusuariocrea: idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };

      const archivofactoringtransferenciacedenteCreated =
        await archivofactoringtransferenciacedenteDao.insertArchivofactoringtransferenciacedente(
          tx,
          archivofactoringtransferenciacedenteToCreate,
        );
      log.debug(
        line(),
        "archivofactoringtransferenciacedenteCreated:",
        archivofactoringtransferenciacedenteCreated,
      );

      return factoringtransferenciacedenteCreated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta las transferencias registradas para una operación de factoring.
 */
export const getFactoringtransferenciacedentesByFactoringidService = async (
  dto: GetFactoringtransferenciacedentesByFactoringidDto,
) => {
  log.debug(line(), "service::admin::getFactoringtransferenciacedentesByFactoringidService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${dto.factoringid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      return await factoringtransferenciacedenteDao.getFactoringtransferenciacedentesByIdfactoring(
        tx,
        factoring.idfactoring,
        filter_estado,
      );
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Obtiene catálogos maestros relacionados para transferencias de una operación de factoring en admin.
 */
export const getFactoringtransferenciacedenteMasterByFactoringidService = async (
  dto: GetFactoringtransferenciacedenteMasterByFactoringidDto,
) => {
  log.debug(line(), "service::admin::getFactoringtransferenciacedenteMasterByFactoringidService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${dto.factoringid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringtransferenciatipos =
        await factoringtransferenciatipoDao.getFactoringtransferenciatipos(tx, filter_estados);
      const factoringtransferenciaestados =
        await factoringtransferenciaestadoDao.getFactoringtransferenciaestados(tx, filter_estados);

      const factorcuentasbancarias =
        await factorcuentabancariaDao.getFactorcuentabancariasByIdfactorIdmoneda(
          tx,
          factoring.idfactor,
          factoring.idmoneda,
          filter_estados,
        );
      const cedentecuentasbancarias =
        await empresacuentabancariaDao.getEmpresacuentabancariasByIdempresaIdmoneda(
          tx,
          factoring.idcedente,
          factoring.idmoneda,
          filter_estados,
        );
      const monedas = await monedaDao.getMonedas(tx, filter_estados);

      return {
        factoringtransferenciatipos,
        factoringtransferenciaestados,
        factorcuentasbancarias,
        cedentecuentasbancarias,
        monedas,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
