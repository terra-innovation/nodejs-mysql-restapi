import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as bancoDao from "#root/src/daos/banco.Dao.js";
import * as cuentabancariaDao from "#root/src/daos/cuentabancaria.Dao.js";
import * as cuentabancariaestadoDao from "#root/src/daos/cuentabancariaestado.Dao.js";
import * as cuentatipoDao from "#root/src/daos/cuentatipo.Dao.js";
import * as inversionistaDao from "#root/src/daos/inversionista.Dao.js";
import * as inversionistacuentabancariaDao from "#root/src/daos/inversionistacuentabancaria.Dao.js";
import * as monedaDao from "#root/src/daos/moneda.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { v4 as uuidv4 } from "uuid";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface UpdateInversionistacuentabancariaAliasAndEstadoDto {
  inversionistacuentabancariaid: string;
  cuentabancariaestadoid: string;
  alias: string;
  idusuario: number;
}

export interface ActivateInversionistacuentabancariaDto {
  inversionistacuentabancariaid: string;
  idusuario: number;
}

export interface DeleteInversionistacuentabancariaDto {
  inversionistacuentabancariaid: string;
  idusuario: number;
}

export interface CreateInversionistacuentabancariaDto {
  inversionistaid: string;
  bancoid: string;
  cuentatipoid: string;
  monedaid: string;
  numero: string;
  cci: string;
  alias: string;
  idusuario: number;
}

// ─── Services ────────────────────────────────────────────────────────────────

export const updateInversionistacuentabancariaOnlyAliasAndCuentaBancariaEstadoService = async (
  dto: UpdateInversionistacuentabancariaAliasAndEstadoDto,
) => {
  log.debug(line(), "service::updateInversionistacuentabancariaOnlyAliasAndCuentaBancariaEstadoService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const inversionistacuentabancariaestado =
        await cuentabancariaestadoDao.getCuentabancariaestadoByCuentabancariaestadoid(
          tx,
          dto.cuentabancariaestadoid,
        );
      if (!inversionistacuentabancariaestado) {
        log.warn(line(), "Cuenta bancaria estado no existe: [" + dto.cuentabancariaestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const inversionistacuentabancaria =
        await inversionistacuentabancariaDao.getInversionistacuentabancariaByInversionistacuentabancariaid(
          tx,
          dto.inversionistacuentabancariaid,
        );
      if (!inversionistacuentabancaria) {
        log.warn(
          line(),
          "Inversionista cuenta bancaria no existe: [" + dto.inversionistacuentabancariaid + "]",
        );
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(
        tx,
        inversionistacuentabancaria.idcuentabancaria,
      );
      if (!cuentabancaria) {
        log.warn(line(), "Cuenta bancaria no existe: [" + inversionistacuentabancaria.idcuentabancaria + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentabancariaToUpdate: Prisma.cuenta_bancariaUpdateInput = {
        cuenta_bancaria_estado: {
          connect: { idcuentabancariaestado: inversionistacuentabancariaestado.idcuentabancariaestado },
        },
        alias: dto.alias,
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
      };

      const cuentabancariaUpdated = await cuentabancariaDao.updateCuentabancaria(
        tx,
        cuentabancaria.cuentabancariaid,
        cuentabancariaToUpdate,
      );
      log.debug(line(), "cuentabancariaUpdated", cuentabancariaUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getInversionistacuentabancariasService = async () => {
  log.debug(line(), "service::getInversionistacuentabancariasService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const cuentasbancarias = await inversionistacuentabancariaDao.getInversionistacuentabancarias(
        tx,
        filter_estado,
      );
      return cuentasbancarias;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const activateInversionistacuentabancariaService = async (dto: ActivateInversionistacuentabancariaDto) => {
  log.debug(line(), "service::activateInversionistacuentabancariaService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const inversionistacuentabancaria =
        await inversionistacuentabancariaDao.getInversionistacuentabancariaByInversionistacuentabancariaid(
          tx,
          dto.inversionistacuentabancariaid,
        );
      if (!inversionistacuentabancaria) {
        log.warn(
          line(),
          "Inversionista cuenta bancaria no existe: [" + dto.inversionistacuentabancariaid + "]",
        );
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(
        tx,
        inversionistacuentabancaria.idcuentabancaria,
      );
      if (!cuentabancaria) {
        log.warn(line(), "Cuenta bancaria no existe: [" + inversionistacuentabancaria.idcuentabancaria + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const camposCuentaBancariaActivated = await cuentabancariaDao.activateCuentabancaria(
        tx,
        cuentabancaria.cuentabancariaid,
        dto.idusuario,
      );
      log.debug(line(), "camposCuentaBancariaActivated:", camposCuentaBancariaActivated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const deleteInversionistacuentabancariaService = async (dto: DeleteInversionistacuentabancariaDto) => {
  log.debug(line(), "service::deleteInversionistacuentabancariaService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const inversionistacuentabancaria =
        await inversionistacuentabancariaDao.getInversionistacuentabancariaByInversionistacuentabancariaid(
          tx,
          dto.inversionistacuentabancariaid,
        );
      if (!inversionistacuentabancaria) {
        log.warn(
          line(),
          "Inversionista cuenta bancaria no existe: [" + dto.inversionistacuentabancariaid + "]",
        );
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(
        tx,
        inversionistacuentabancaria.idcuentabancaria,
      );
      if (!cuentabancaria) {
        log.warn(line(), "Cuenta bancaria no existe: [" + inversionistacuentabancaria.idcuentabancaria + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentabancariaDeleted = await cuentabancariaDao.deleteCuentabancaria(
        tx,
        cuentabancaria.cuentabancariaid,
        dto.idusuario,
      );
      log.debug(line(), "cuentabancariaDeleted:", cuentabancariaDeleted);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getInversionistacuentabancariaMasterService = async () => {
  log.debug(line(), "service::getInversionistacuentabancariaMasterService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const inversionistas = await inversionistaDao.getInversionistas(tx, filter_estados);
      const bancos = await bancoDao.getBancos(tx, filter_estados);
      const monedas = await monedaDao.getMonedas(tx, filter_estados);
      const cuentatipos = await cuentatipoDao.getCuentatipos(tx, filter_estados);
      const cuentabancariaestados = await cuentabancariaestadoDao.getCuentabancariaestados(tx, filter_estados);

      const cuentasbancariasMaster: Record<string, any> = {
        inversionistas,
        bancos,
        monedas,
        cuentatipos,
        cuentabancariaestados,
      };

      return cuentasbancariasMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const createInversionistacuentabancariaService = async (dto: CreateInversionistacuentabancariaDto) => {
  log.debug(line(), "service::createInversionistacuentabancariaService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      const inversionista = await inversionistaDao.getInversionistaByInversionistaid(tx, dto.inversionistaid);
      if (!inversionista) {
        log.warn(line(), "Inversionista no existe: [" + dto.inversionistaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const banco = await bancoDao.findBancoPk(tx, dto.bancoid);
      if (!banco) {
        log.warn(line(), "Banco no existe: [" + dto.bancoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentatipo = await cuentatipoDao.findCuentatipoPk(tx, dto.cuentatipoid);
      if (!cuentatipo) {
        log.warn(line(), "Cuenta tipo no existe: [" + dto.cuentatipoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const moneda = await monedaDao.findMonedaPk(tx, dto.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + dto.monedaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentasbancarias_por_numero = await cuentabancariaDao.getCuentasbancariasByIdbancoAndNumero(
        tx,
        banco.idbanco,
        dto.numero,
        filter_estado,
      );
      if (cuentasbancarias_por_numero && cuentasbancarias_por_numero.length > 0) {
        log.warn(
          line(),
          "El número de cuenta [" + dto.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.",
        );
        throw new ClientError(
          "El número de cuenta [" + dto.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.",
          404,
        );
      }

      const cuentasbancarias_por_alias =
        await inversionistacuentabancariaDao.getInversionistacuentabancariasByIdinversionistaAndAlias(
          tx,
          inversionista.idinversionista,
          dto.alias,
          filter_estado,
        );
      if (cuentasbancarias_por_alias && cuentasbancarias_por_alias.length > 0) {
        log.warn(line(), "El alias [" + dto.alias + "] se encuentra registrado. Ingrese un alias diferente.");
        throw new ClientError(
          "El alias [" + dto.alias + "] se encuentra registrado. Ingrese un alias diferente.",
          404,
        );
      }

      const cuentabancariaToCreate: Prisma.cuenta_bancariaCreateInput = {
        banco: {
          connect: { idbanco: banco.idbanco },
        },
        cuenta_tipo: {
          connect: { idcuentatipo: cuentatipo.idcuentatipo },
        },
        moneda: {
          connect: { idmoneda: moneda.idmoneda },
        },
        cuenta_bancaria_estado: {
          connect: {
            idcuentabancariaestado: 1, // Por defecto
          },
        },
        cuentabancariaid: uuidv4(),
        code: uuidv4().split("-")[0],
        numero: dto.numero,
        cci: dto.cci,
        alias: dto.alias,
        idusuariocrea: dto.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const cuentabancariaCreated = await cuentabancariaDao.insertCuentabancaria(tx, cuentabancariaToCreate);
      log.debug(line(), "cuentabancariaCreated:", cuentabancariaCreated);

      const inversionistacuentabancariaToCreate: Prisma.inversionista_cuenta_bancariaCreateInput = {
        inversionista: {
          connect: { idinversionista: inversionista.idinversionista },
        },
        cuenta_bancaria: {
          connect: { idcuentabancaria: cuentabancariaCreated.idcuentabancaria },
        },
        inversionistacuentabancariaid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: dto.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const inversionistacuentabancariaCreated =
        await inversionistacuentabancariaDao.insertInversionistacuentabancaria(
          tx,
          inversionistacuentabancariaToCreate,
        );
      log.debug(line(), "inversionistacuentabancariaCreated:", inversionistacuentabancariaCreated);

      const inversionistacuentabancariaFiltered = jsonUtils.removeAttributesPrivates(
        inversionistacuentabancariaToCreate,
      );
      return inversionistacuentabancariaFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
