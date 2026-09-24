import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringhistorialestadoDao from "#root/src/daos/factoringhistorialestado.Dao.js";
import * as factoringpropuestaDao from "#root/src/daos/factoringpropuesta.Dao.js";
import * as factoringpropuestahistorialestadoDao from "#root/src/daos/factoringpropuestahistorialestado.Dao.js";
import * as usuarioDao from "#root/src/daos/usuario.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as emailService from "#root/src/providers/email/email.Provider.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import * as telegramService from "#src/providers/telegram/telegram.Provider.js";
import { buildFactoringPropuestaAceptadaMessage } from "#src/templates/telegram/factoringpropuesta.Template.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { v4 as uuidv4 } from "uuid";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface AcceptFactoringpropuestaDto {
  factoringid: string;
  factoringpropuestaid: string;
  idusuario: number;
}

export interface GetFactoringpropuestaVigenteDto {
  factoringid: string;
  idusuario: number;
}

// ─── Services ────────────────────────────────────────────────────────────────

export const acceptFactoringpropuestaService = async (dto: AcceptFactoringpropuestaDto) => {
  log.debug(line(), "service::empresario::acceptFactoringpropuestaService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + dto.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoring_is_empresario = await factoringDao.getFactoringByIdfactoringIdempresario(
        tx,
        factoring.idfactoring,
        dto.idusuario,
        filter_estados,
      );
      if (!factoring_is_empresario) {
        log.warn(line(), "Factoring [" + factoring.idfactoring + "] no pertenece al empresario [" + dto.idusuario + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuesta = await factoringpropuestaDao.getFactoringpropuestaByFactoringpropuestaid(
        tx,
        dto.factoringpropuestaid,
      );
      if (!factoringpropuesta) {
        log.warn(line(), "Factoringpropuesta no existe: [" + dto.factoringpropuestaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuesta_is_factoring =
        await factoringpropuestaDao.getFactoringpropuestaVigenteByIdfactoringpropuestaIdfactoring(
          tx,
          factoringpropuesta.idfactoringpropuesta,
          factoring.idfactoring,
          filter_estados,
        );
      if (!factoringpropuesta_is_factoring) {
        log.warn(
          line(),
          "Factoringpropuesta [" +
            factoringpropuesta.idfactoringpropuesta +
            "] no pertenece al factoring [" +
            factoring.idfactoring +
            "]",
        );
        throw new ClientError("Datos no válidos", 404);
      }

      const idfactoringpropuestaestado = 6; // Aprobada

      const factoringpropuestahistorialestadoToCreate: Prisma.factoring_propuesta_historial_estadoCreateInput = {
        factoring_propuesta: { connect: { idfactoringpropuesta: factoringpropuesta.idfactoringpropuesta } },
        factoring_propuesta_estado: { connect: { idfactoringpropuestaestado: idfactoringpropuestaestado } },
        usuario_modifica: { connect: { idusuario: dto.idusuario } },

        factoringpropuestahistorialestadoid: uuidv4(),
        code: uuidv4().split("-")[0],
        comentario: "",
        idusuariocrea: dto.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const factoringpropuestahistorialestadoCreated =
        await factoringpropuestahistorialestadoDao.insertFactoringpropuestahistorialestado(
          tx,
          factoringpropuestahistorialestadoToCreate,
        );
      log.debug(line(), "factoringpropuestahistorialestadoCreated:", factoringpropuestahistorialestadoCreated);

      const factoringpropuestaToUpdate: Prisma.factoring_propuestaUpdateInput = {
        factoring_propuesta_estado: { connect: { idfactoringpropuestaestado: idfactoringpropuestaestado } },
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
      };

      const factoringpropuestaUpdated = await factoringpropuestaDao.updateFactoringpropuesta(
        tx,
        factoringpropuesta.factoringpropuestaid,
        factoringpropuestaToUpdate,
      );
      log.debug(line(), "factoringpropuestaUpdated", factoringpropuestaUpdated);

      const idfactoringestado = 4; // Propuesta aceptada

      const factoringhistorialestadoToCreate: Prisma.factoring_historial_estadoCreateInput = {
        factoring: { connect: { idfactoring: factoring.idfactoring } },
        factoring_estado: { connect: { idfactoringestado: idfactoringestado } },
        usuario_modifica: { connect: { idusuario: dto.idusuario } },

        factoringhistorialestadoid: uuidv4(),
        code: uuidv4().split("-")[0],
        comentario: "",
        idusuariocrea: dto.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const factoringhistorialestadoCreated = await factoringhistorialestadoDao.insertFactoringhistorialestado(
        tx,
        factoringhistorialestadoToCreate,
      );
      log.debug(line(), "factoringhistorialestadoCreated:", factoringhistorialestadoCreated);

      const factoringToUpdate: Prisma.factoringUpdateInput = {
        factoring_estado: { connect: { idfactoringestado: idfactoringestado } },
        factoring_propuesta_aceptada: { connect: { idfactoringpropuesta: factoringpropuesta.idfactoringpropuesta } },
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
      };

      const factoringUpdated = await factoringDao.updateFactoring(tx, factoring.factoringid, factoringToUpdate);
      log.debug(line(), "factoringUpdated", factoringUpdated);

      // Enviamos correo electrónico
      const factoring_for_email = await factoringDao.getFactoringByIdfactoring(
        tx,
        factoringpropuestaUpdated.idfactoring,
      );
      const usuario_for_email = await usuarioDao.getUsuarioByIdusuario(tx, dto.idusuario);
      const factoringpropuesta_for_email =
        await factoringpropuestaDao.getFactoringpropuestaAceptadaByIdfactoringpropuesta(
          tx,
          factoringpropuestaUpdated.idfactoringpropuesta,
          [1],
        );

      const paramsEmail = {
        factoring: factoring_for_email,
        factoringpropuesta: factoringpropuesta_for_email,
        usuario: usuario_for_email,
      };

      if (usuario_for_email?.email) {
        await emailService.sendFactoringEmpresaServicioFactoringPropuestaAceptada(usuario_for_email.email, paramsEmail);
      }

      const msnTelegram = buildFactoringPropuestaAceptadaMessage(factoring, factoringpropuesta);
      telegramService.sendMessageImportant(msnTelegram);

      return factoringpropuestaUpdated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getFactoringpropuestaVigenteService = async (dto: GetFactoringpropuestaVigenteDto) => {
  log.debug(line(), "service::empresario::getFactoringpropuestaVigenteService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + dto.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuesta = await factoringpropuestaDao.getFactoringpropuestaVigenteByIdfactoring(
        tx,
        factoring.idfactoring,
        filter_estados,
      );

      const factoringpropuestaFiltered = jsonUtils.removeAttributesPrivates(factoringpropuesta);
      return factoringpropuestaFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
