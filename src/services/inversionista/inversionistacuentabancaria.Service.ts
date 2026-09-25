import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as bancoDao from "#root/src/daos/banco.Dao.js";
import * as cuentabancariaDao from "#root/src/daos/cuentabancaria.Dao.js";
import * as cuentatipoDao from "#root/src/daos/cuentatipo.Dao.js";
import * as inversionistaDao from "#root/src/daos/inversionista.Dao.js";
import * as inversionistacuentabancariaDao from "#root/src/daos/inversionistacuentabancaria.Dao.js";
import * as monedaDao from "#root/src/daos/moneda.Dao.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { v4 as uuidv4 } from "uuid";

export interface CreateInversionistacuentabancariaDto {
  inversionistaid: string;
  bancoid: string;
  cuentatipoid: string;
  monedaid: string;
  numero: string;
  cci: string;
  alias: string;
}

export interface UpdateInversionistacuentabancariaOnlyAliasDto {
  inversionistacuentabancariaid: string;
  alias: string;
}

export const createInversionistacuentabancariaService = async (
  session_idusuario: number,
  payload: CreateInversionistacuentabancariaDto,
) => {
  log.debug(line(), "service::createInversionistacuentabancariaService");
  const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

  return await prismaFT.client.$transaction(
    async (tx) => {
      const inversionista = await inversionistaDao.getInversionistaByInversionistaid(
        tx,
        payload.inversionistaid,
      );
      if (!inversionista) {
        log.warn(line(), "Inversionista no existe: [" + payload.inversionistaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const banco = await bancoDao.getBancoByBancoid(tx, payload.bancoid);
      if (!banco) {
        log.warn(line(), "Banco no existe: [" + payload.bancoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentatipo = await cuentatipoDao.getCuentatipoByCuentatipoid(tx, payload.cuentatipoid);
      if (!cuentatipo) {
        log.warn(line(), "Cuenta tipo no existe: [" + payload.cuentatipoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const moneda = await monedaDao.getMonedaByMonedaid(tx, payload.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + payload.monedaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const inversionistacuentabancariaAllowed =
        await inversionistacuentabancariaDao.getInversionistacuentabancariaByIdinversionistaAndIdusuario(
          tx,
          inversionista.idinversionista,
          session_idusuario,
          filter_estado,
        );
      if (!inversionistacuentabancariaAllowed) {
        log.warn(line(), "Inversionista no asociado al usuario: [" + inversionista.idinversionista + ", " + session_idusuario + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentasbancarias_por_numero = await cuentabancariaDao.getCuentasbancariasByIdbancoAndNumero(
        tx,
        banco.idbanco,
        payload.numero,
        filter_estado,
      );
      if (cuentasbancarias_por_numero && cuentasbancarias_por_numero.length > 0) {
        log.warn(line(), "El número de cuenta [" + payload.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.");
        throw new ClientError(
          "El número de cuenta [" + payload.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.",
          404,
        );
      }

      const cuentasbancarias_por_alias =
        await inversionistacuentabancariaDao.getInversionistacuentabancariasByIdinversionistaAndAlias(
          tx,
          inversionista.idinversionista,
          payload.alias,
          filter_estado,
        );
      if (cuentasbancarias_por_alias && cuentasbancarias_por_alias.length > 0) {
        log.warn(line(), "El alias [" + payload.alias + "] se encuentra registrado. Ingrese un alias diferente.");
        throw new ClientError("El alias [" + payload.alias + "] se encuentra registrado. Ingrese un alias diferente.", 404);
      }

      const idcuentabancariaestado = 1; // Por defecto

      const cuentabancariaToCreate: Prisma.cuenta_bancariaCreateInput = {
        banco: { connect: { idbanco: banco.idbanco } },
        cuenta_tipo: { connect: { idcuentatipo: cuentatipo.idcuentatipo } },
        moneda: { connect: { idmoneda: moneda.idmoneda } },
        cuenta_bancaria_estado: { connect: { idcuentabancariaestado: idcuentabancariaestado } },
        cuentabancariaid: uuidv4(),
        code: uuidv4().split("-")[0],
        numero: payload.numero,
        cci: payload.cci,
        alias: payload.alias,
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const cuentabancariaCreated = await cuentabancariaDao.insertCuentabancaria(tx, cuentabancariaToCreate);
      log.debug(line(), "cuentabancariaCreated:", cuentabancariaCreated);

      const inversionistacuentabancariaToCreate: Prisma.inversionista_cuenta_bancariaCreateInput = {
        inversionista: { connect: { idinversionista: inversionista.idinversionista } },
        cuenta_bancaria: { connect: { idcuentabancaria: cuentabancariaCreated.idcuentabancaria } },
        inversionistacuentabancariaid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
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

export const updateInversionistacuentabancariaOnlyAliasService = async (
  session_idusuario: number,
  payload: UpdateInversionistacuentabancariaOnlyAliasDto,
) => {
  log.debug(line(), "service::updateInversionistacuentabancariaOnlyAliasService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const inversionistacuentabancaria =
        await inversionistacuentabancariaDao.getInversionistacuentabancariaByInversionistacuentabancariaid(
          tx,
          payload.inversionistacuentabancariaid,
        );
      if (!inversionistacuentabancaria) {
        log.warn(line(), "Inversionista cuenta bancaria no existe: [" + payload.inversionistacuentabancariaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const inversionistacuentabancariaAllowed =
        await inversionistacuentabancariaDao.getInversionistacuentabancariaByIdinversionistaAndIdusuario(
          tx,
          inversionistacuentabancaria.idinversionista,
          session_idusuario,
          filter_estado,
        );
      if (!inversionistacuentabancariaAllowed) {
        log.warn(line(), "Inversionista no asociado al usuario: [" + inversionistacuentabancaria.idinversionista + ", " + session_idusuario + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentasbancarias_por_alias =
        await inversionistacuentabancariaDao.getInversionistacuentabancariasByIdinversionistaAndAlias(
          tx,
          inversionistacuentabancaria.idinversionista,
          payload.alias,
          filter_estado,
        );
      if (cuentasbancarias_por_alias && cuentasbancarias_por_alias.length > 0) {
        log.warn(line(), "El alias [" + payload.alias + "] se encuentra registrado. Ingrese un alias diferente.");
        throw new ClientError("El alias [" + payload.alias + "] se encuentra registrado. Ingrese un alias diferente.", 404);
      }

      const cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(
        tx,
        inversionistacuentabancaria.idcuentabancaria,
      );

      const cuentabancariaToUpdate: Prisma.cuenta_bancariaUpdateInput = {
        alias: payload.alias,
        idusuariomod: session_idusuario ?? 1,
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

export const getInversionistacuentabancariasService = async (session_idusuario: number) => {
  log.debug(line(), "service::getInversionistacuentabancariasService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO];
      const inversionistacuentabancarias =
        await inversionistacuentabancariaDao.getInversionistacuentabancariasByIdusuario(
          tx,
          session_idusuario,
          filter_estado,
        );

      let inversionistacuentabancariasFiltered = jsonUtils.removeAttributes(inversionistacuentabancarias, ["score"]);
      inversionistacuentabancariasFiltered = jsonUtils.removeAttributesPrivates(inversionistacuentabancariasFiltered);
      return inversionistacuentabancariasFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getInversionistacuentabancariaMasterService = async (session_idusuario: number) => {
  log.debug(line(), "service::getInversionistacuentabancariaMasterService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];

      const inversionista = await inversionistaDao.getInversionistaByIdusuario(tx, session_idusuario, filter_estados);
      const bancos = await bancoDao.getBancos(tx, filter_estados);
      const monedas = await monedaDao.getMonedas(tx, filter_estados);
      const cuentatipos = await cuentatipoDao.getCuentatipos(tx, filter_estados);

      const cuentasbancariasMaster = {
        inversionista,
        bancos,
        monedas,
        cuentatipos,
      };

      const cuentasbancariasMasterFiltered = jsonUtils.removeAttributesPrivates(cuentasbancariasMaster);
      return cuentasbancariasMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
