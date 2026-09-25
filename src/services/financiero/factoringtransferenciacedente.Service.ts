import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as empresacuentabancariaDao from "#root/src/daos/empresacuentabancaria.Dao.js";
import * as factorcuentabancariaDao from "#root/src/daos/factorcuentabancaria.Dao.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringtransferenciacedenteDao from "#root/src/daos/factoringtransferenciacedente.Dao.js";
import * as factoringtransferenciaestadoDao from "#root/src/daos/factoringtransferenciaestado.Dao.js";
import * as factoringtransferenciatipoDao from "#root/src/daos/factoringtransferenciatipo.Dao.js";
import * as monedaDao from "#root/src/daos/moneda.Dao.js";
import * as usuarioDao from "#root/src/daos/usuario.Dao.js";
import * as emailService from "#root/src/providers/email/email.Provider.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";

export const sendCorreoFactoringtransferenciacedenteService = async (factoringtransferenciacedenteid: string) => {
  log.debug(line(), "service::sendCorreoFactoringtransferenciacedenteService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringtransferenciacedenteExisted =
        await factoringtransferenciacedenteDao.getFactoringtransferenciacedenteByFactoringtransferenciacedenteid(
          tx,
          factoringtransferenciacedenteid,
        );
      if (!factoringtransferenciacedenteExisted) {
        log.warn(line(), "Factoringtransferenciacedente no existe: [" + factoringtransferenciacedenteid + "]");
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
      const usuario_for_email = await usuarioDao.getUsuarioByEmail(tx, factoring_for_email.contacto_cedente.email);

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

export const getFactoringtransferenciacedentesByFactoringidService = async (factoringid: string) => {
  log.debug(line(), "service::getFactoringtransferenciacedentesByFactoringidService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringtransferenciacedentes =
        await factoringtransferenciacedenteDao.getFactoringtransferenciacedentesByIdfactoring(
          tx,
          factoring.idfactoring,
          filter_estado,
        );

      return factoringtransferenciacedentes;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getFactoringtransferenciacedenteMasterByFactoringidService = async (factoringid: string) => {
  log.debug(line(), "service::getFactoringtransferenciacedenteMasterByFactoringidService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringtransferenciatipos = await factoringtransferenciatipoDao.getFactoringtransferenciatipos(
        tx,
        filter_estados,
      );
      const factoringtransferenciaestados = await factoringtransferenciaestadoDao.getFactoringtransferenciaestados(
        tx,
        filter_estados,
      );

      const factorcuentasbancarias = await factorcuentabancariaDao.getFactorcuentabancariasByIdfactorIdmoneda(
        tx,
        factoring.idfactor,
        factoring.idmoneda,
        filter_estados,
      );
      const cedentecuentasbancarias = await empresacuentabancariaDao.getEmpresacuentabancariasByIdempresaIdmoneda(
        tx,
        factoring.idcedente,
        factoring.idmoneda,
        filter_estados,
      );
      const monedas = await monedaDao.getMonedas(tx, filter_estados);

      const factoringtransferenciacedentesMaster: Record<string, any> = {
        factoringtransferenciatipos,
        factoringtransferenciaestados,
        factorcuentasbancarias,
        cedentecuentasbancarias,
        monedas,
      };

      return factoringtransferenciacedentesMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
