import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as archivoDao from "#root/src/daos/archivo.Dao.js";
import * as archivocuentabancariaDao from "#root/src/daos/archivocuentabancaria.Dao.js";
import * as bancoDao from "#root/src/daos/banco.Dao.js";
import * as cuentabancariaDao from "#root/src/daos/cuentabancaria.Dao.js";
import * as cuentatipoDao from "#root/src/daos/cuentatipo.Dao.js";
import * as empresaDao from "#root/src/daos/empresa.Dao.js";
import * as empresacuentabancariaDao from "#root/src/daos/empresacuentabancaria.Dao.js";
import * as monedaDao from "#root/src/daos/moneda.Dao.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { ARCHIVO_TIPO } from "#root/src/daos/archivotipo.Dao.js";
import { isProduction } from "#src/config.js";
import { v4 as uuidv4 } from "uuid";

export interface CreateEmpresacuentabancariaDto {
  encabezado_cuenta_bancaria: string;
  empresaid: string;
  bancoid: string;
  cuentatipoid: string;
  monedaid: string;
  numero: string;
  cci: string;
  alias: string;
}

export interface UpdateEmpresacuentabancariaOnlyAliasDto {
  empresacuentabancariaid: string;
  alias: string;
}

export interface GetEmpresacuentabancariasForFactoringDto {
  empresaid: string;
  monedaid: string;
}

const vincularArchivoEncabezadoCuentaBancaria = async (
  tx: Parameters<Parameters<typeof prismaFT.client.$transaction>[0]>[0],
  idusuario: number,
  archivo: any,
  cuentabancariaCreated: any,
) => {
  const archivocuentabancariaToCreate: Prisma.archivo_cuenta_bancariaCreateInput = {
    archivo: { connect: { idarchivo: archivo.idarchivo } },
    cuenta_bancaria: { connect: { idcuentabancaria: cuentabancariaCreated.idcuentabancaria } },
    idusuariocrea: idusuario,
    fechacrea: new Date(),
    idusuariomod: idusuario,
    fechamod: new Date(),
    estado: 1,
  };

  await archivocuentabancariaDao.insertArchivoCuentaBancaria(tx, archivocuentabancariaToCreate);
  return archivo;
};

export const createEmpresacuentabancariaService = async (
  session_idusuario: number,
  payload: CreateEmpresacuentabancariaDto,
) => {
  log.debug(line(), "service::createEmpresacuentabancariaService");
  const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

  return await prismaFT.client.$transaction(
    async (tx) => {
      const empresa = await empresaDao.getEmpresaByEmpresaid(tx, payload.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa no existe: [" + payload.empresaid + "]");
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

      const empresa_por_idusuario = await empresaDao.getEmpresaByIdusuarioAndEmpresaid(
        tx,
        session_idusuario,
        payload.empresaid,
        filter_estado,
      );
      if (!empresa_por_idusuario) {
        log.warn(line(), "Empresa no asociada al usuario: [" + session_idusuario + ", " + payload.monedaid + "]");
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

      const cuentasbancarias_por_alias = await empresacuentabancariaDao.getEmpresacuentabancariasByIdempresaAndAlias(
        tx,
        empresa_por_idusuario.idempresa,
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

      const filter_estado_archivo = isProduction ? [ESTADO.ACTIVO] : [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const encabezadocuentabancaria = await archivoDao.getArchivoByArchivoidAndIdarchivotipo(
        tx,
        payload.encabezado_cuenta_bancaria,
        ARCHIVO_TIPO.ENCABEZADO_DEL_EECC_DE_LA_CUENTA_BANCARIA,
        filter_estado_archivo,
      );
      if (!encabezadocuentabancaria) {
        log.warn(line(), "Encabezado de cuenta bancaria no existe o tipo no coincide: [" + payload.encabezado_cuenta_bancaria + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const encabezadocuentabancariaCreated = await vincularArchivoEncabezadoCuentaBancaria(
        tx,
        session_idusuario,
        encabezadocuentabancaria,
        cuentabancariaCreated,
      );
      log.debug(line(), "encabezadocuentabancariaCreated:", encabezadocuentabancariaCreated);

      const empresacuentabancariaToCreate: Prisma.empresa_cuenta_bancariaCreateInput = {
        empresa: { connect: { idempresa: empresa.idempresa } },
        cuenta_bancaria: { connect: { idcuentabancaria: cuentabancariaCreated.idcuentabancaria } },
        empresacuentabancariaid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
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

export const getEmpresacuentabancariaMasterService = async (session_idusuario: number) => {
  log.debug(line(), "service::getEmpresacuentabancariaMasterService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];

      const empresas = await empresaDao.getEmpresasByIdusuario(tx, session_idusuario, filter_estados);
      const bancos = await bancoDao.getBancos(tx, filter_estados);
      const monedas = await monedaDao.getMonedas(tx, filter_estados);
      const cuentatipos = await cuentatipoDao.getCuentatipos(tx, filter_estados);

      const cuentasbancariasMaster: Record<string, any> = {
        empresas,
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

export const updateEmpresacuentabancariaOnlyAliasService = async (
  session_idusuario: number,
  payload: UpdateEmpresacuentabancariaOnlyAliasDto,
) => {
  log.debug(line(), "service::updateEmpresacuentabancariaOnlyAliasService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const empresacuentabancaria = await empresacuentabancariaDao.getEmpresacuentabancariaByEmpresacuentabancariaid(
        tx,
        payload.empresacuentabancariaid,
      );
      if (!empresacuentabancaria) {
        log.warn(line(), "Empresa cuenta bancaria no existe: [" + payload.empresacuentabancariaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const empresacuentabancariaAllowed = await empresacuentabancariaDao.getEmpresacuentabancariaByIdempresaAndIdusuario(
        tx,
        empresacuentabancaria.idempresa,
        session_idusuario,
        filter_estado,
      );
      if (!empresacuentabancariaAllowed) {
        log.warn(line(), "Empresa no asociada al usuario: [" + empresacuentabancaria.idempresa + ", " + session_idusuario + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentasbancarias_por_alias = await empresacuentabancariaDao.getEmpresacuentabancariasByIdempresaAndAlias(
        tx,
        empresacuentabancariaAllowed.idempresa,
        payload.alias,
        filter_estado,
      );
      if (cuentasbancarias_por_alias && cuentasbancarias_por_alias.length > 0) {
        log.warn(line(), "El alias [" + payload.alias + "] se encuentra registrado. Ingrese un alias diferente.");
        throw new ClientError("El alias [" + payload.alias + "] se encuentra registrado. Ingrese un alias diferente.", 404);
      }

      const cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(
        tx,
        empresacuentabancaria.idcuentabancaria,
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

export const getEmpresacuentabancariasService = async (session_idusuario: number) => {
  log.debug(line(), "service::getEmpresacuentabancariasService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO];
      const empresacuentabancarias = await empresacuentabancariaDao.getEmpresacuentabancariasByIdusuario(
        tx,
        session_idusuario,
        filter_estado,
      );

      let empresacuentabancariasFiltered = jsonUtils.removeAttributes(empresacuentabancarias, ["score"]);
      empresacuentabancariasFiltered = jsonUtils.removeAttributesPrivates(empresacuentabancariasFiltered);
      return empresacuentabancariasFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getEmpresacuentabancariasForFactoringService = async (
  session_idusuario: number,
  payload: GetEmpresacuentabancariasForFactoringDto,
) => {
  log.debug(line(), "service::getEmpresacuentabancariasForFactoringService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO];
      const empresa_por_idusuario = await empresaDao.getEmpresaByIdusuarioAndEmpresaid(
        tx,
        session_idusuario,
        payload.empresaid,
        filter_estado,
      );
      if (!empresa_por_idusuario) {
        log.warn(line(), "Empresa no asociada al usuario: [" + session_idusuario + ", " + payload.monedaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const moneda = await monedaDao.getMonedaByMonedaid(tx, payload.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + payload.monedaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const _idcuentabancariaestado = [2, 1]; // Verificado y Pendiente

      const empresacuentabancarias = await empresacuentabancariaDao.getEmpresacuentabancariasForFactoring(
        tx,
        empresa_por_idusuario.idempresa,
        moneda.idmoneda,
        _idcuentabancariaestado,
        filter_estado,
      );

      let empresacuentabancariasFiltered = jsonUtils.removeAttributes(empresacuentabancarias, ["score"]);
      empresacuentabancariasFiltered = jsonUtils.ofuscarAtributosDefault(empresacuentabancariasFiltered);
      empresacuentabancariasFiltered = jsonUtils.removeAttributesPrivates(empresacuentabancariasFiltered);
      return empresacuentabancariasFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
