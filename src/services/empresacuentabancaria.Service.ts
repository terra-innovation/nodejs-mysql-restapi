import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as bancoDao from "#root/src/daos/banco.Dao.js";
import * as cuentabancariaDao from "#root/src/daos/cuentabancaria.Dao.js";
import * as cuentabancariaestadoDao from "#root/src/daos/cuentabancariaestado.Dao.js";
import * as cuentatipoDao from "#root/src/daos/cuentatipo.Dao.js";
import * as empresaDao from "#root/src/daos/empresa.Dao.js";
import * as empresacuentabancariaDao from "#root/src/daos/empresacuentabancaria.Dao.js";
import * as monedaDao from "#root/src/daos/moneda.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { v4 as uuidv4 } from "uuid";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface ActivateEmpresacuentabancariaDto {
  empresacuentabancariaid: string;
  idusuario: number;
}

export interface DeleteEmpresacuentabancariaDto {
  empresacuentabancariaid: string;
  idusuario: number;
}

export interface UpdateEmpresacuentabancariaAliasAndEstadoDto {
  empresacuentabancariaid: string;
  cuentabancariaestadoid: string;
  alias: string;
  idusuario: number;
}

export interface CreateEmpresacuentabancariaDto {
  empresaid: string;
  bancoid: string;
  cuentatipoid: string;
  monedaid: string;
  numero: string;
  cci: string;
  alias: string;
  idusuario: number;
}

// ─── Services ────────────────────────────────────────────────────────────────

export const activateEmpresacuentabancariaService = async (dto: ActivateEmpresacuentabancariaDto) => {
  log.debug(line(), "service::activateEmpresacuentabancariaService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const empresacuentabancaria = await empresacuentabancariaDao.getEmpresacuentabancariaByEmpresacuentabancariaid(
        tx,
        dto.empresacuentabancariaid,
      );
      if (!empresacuentabancaria) {
        log.warn(line(), "Empresa cuenta bancaria no existe: [" + dto.empresacuentabancariaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(
        tx,
        empresacuentabancaria.idcuentabancaria,
      );
      if (!cuentabancaria) {
        log.warn(line(), "Cuenta bancaria no existe: [" + empresacuentabancaria.idcuentabancaria + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentabancariaActivated = await cuentabancariaDao.activateCuentabancaria(
        tx,
        cuentabancaria.cuentabancariaid,
        dto.idusuario,
      );
      log.debug(line(), "cuentabancariaActivated:", cuentabancariaActivated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const deleteEmpresacuentabancariaService = async (dto: DeleteEmpresacuentabancariaDto) => {
  log.debug(line(), "service::deleteEmpresacuentabancariaService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const empresacuentabancaria = await empresacuentabancariaDao.getEmpresacuentabancariaByEmpresacuentabancariaid(
        tx,
        dto.empresacuentabancariaid,
      );
      if (!empresacuentabancaria) {
        log.warn(line(), "Empresa cuenta bancaria no existe: [" + dto.empresacuentabancariaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(
        tx,
        empresacuentabancaria.idcuentabancaria,
      );
      if (!cuentabancaria) {
        log.warn(line(), "Cuenta bancaria no existe: [" + empresacuentabancaria.idcuentabancaria + "]");
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

export const getEmpresacuentabancariaMasterService = async () => {
  log.debug(line(), "service::getEmpresacuentabancariaMasterService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const empresas = await empresaDao.getEmpresas(tx, filter_estados);
      const bancos = await bancoDao.getBancos(tx, filter_estados);
      const monedas = await monedaDao.getMonedas(tx, filter_estados);
      const cuentatipos = await cuentatipoDao.getCuentatipos(tx, filter_estados);
      const cuentabancariaestados = await cuentabancariaestadoDao.getCuentabancariaestados(tx, filter_estados);

      const cuentasbancariasMaster: Record<string, any> = {
        empresas,
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

export const updateEmpresacuentabancariaOnlyAliasAndCuentaBancariaEstadoService = async (
  dto: UpdateEmpresacuentabancariaAliasAndEstadoDto,
) => {
  log.debug(line(), "service::updateEmpresacuentabancariaOnlyAliasAndCuentaBancariaEstadoService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const empresacuentabancariaestado = await cuentabancariaestadoDao.getCuentabancariaestadoByCuentabancariaestadoid(
        tx,
        dto.cuentabancariaestadoid,
      );
      if (!empresacuentabancariaestado) {
        log.warn(line(), "Cuenta bancaria estado no existe: [" + dto.cuentabancariaestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const empresacuentabancaria = await empresacuentabancariaDao.getEmpresacuentabancariaByEmpresacuentabancariaid(
        tx,
        dto.empresacuentabancariaid,
      );
      if (!empresacuentabancaria) {
        log.warn(line(), "Empresa cuenta bancaria no existe: [" + dto.empresacuentabancariaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(
        tx,
        empresacuentabancaria.idcuentabancaria,
      );
      if (!cuentabancaria) {
        log.warn(line(), "Cuenta bancaria no existe: [" + empresacuentabancaria.idcuentabancaria + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentabancariaToUpdate: Prisma.cuenta_bancariaUpdateInput = {
        cuenta_bancaria_estado: {
          connect: { idcuentabancariaestado: empresacuentabancariaestado.idcuentabancariaestado },
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

export const getEmpresacuentabancariasService = async () => {
  log.debug(line(), "service::getEmpresacuentabancariasService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const cuentasbancarias = await empresacuentabancariaDao.getEmpresacuentabancarias(tx, filter_estado);
      return cuentasbancarias;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const createEmpresacuentabancariaService = async (dto: CreateEmpresacuentabancariaDto) => {
  log.debug(line(), "service::createEmpresacuentabancariaService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      const empresa = await empresaDao.findEmpresaPk(tx, dto.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa no existe: [" + dto.empresaid + "]");
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
        await empresacuentabancariaDao.getEmpresacuentabancariasByIdempresaAndAlias(
          tx,
          empresa.idempresa,
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

      const idcuentabancariaestado = 1; // Por defecto

      const cuentabancariaToCreate: Prisma.cuenta_bancariaCreateInput = {
        banco: { connect: { idbanco: banco.idbanco } },
        cuenta_tipo: { connect: { idcuentatipo: cuentatipo.idcuentatipo } },
        moneda: { connect: { idmoneda: moneda.idmoneda } },
        cuenta_bancaria_estado: { connect: { idcuentabancariaestado: idcuentabancariaestado } },
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

      const empresacuentabancariaToCreate: Prisma.empresa_cuenta_bancariaCreateInput = {
        empresa: { connect: { idempresa: empresa.idempresa } },
        cuenta_bancaria: { connect: { idcuentabancaria: cuentabancariaCreated.idcuentabancaria } },
        empresacuentabancariaid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: dto.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const empresacuentabancariaCreated = await empresacuentabancariaDao.insertEmpresacuentabancaria(
        tx,
        empresacuentabancariaToCreate,
      );
      log.debug(line(), "empresacuentabancariaCreated:", empresacuentabancariaCreated);

      const empresacuentabancariaFiltered = jsonUtils.removeAttributesPrivates(empresacuentabancariaToCreate);
      return empresacuentabancariaFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
