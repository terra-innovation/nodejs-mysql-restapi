import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as archivoDao from "#root/src/daos/archivo.Dao.js";
import * as archivofactoringhistorialestadoDao from "#root/src/daos/archivofactoringhistorialestado.Dao.js";
import * as configuracionappDao from "#root/src/daos/configuracionapp.Dao.js";
import * as factorcuentabancariaDao from "#root/src/daos/factorcuentabancaria.Dao.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringestadoDao from "#root/src/daos/factoringestado.Dao.js";
import * as factoringhistorialestadoDao from "#root/src/daos/factoringhistorialestado.Dao.js";
import * as factoringpropuestaDao from "#root/src/daos/factoringpropuesta.Dao.js";
import * as usuarioDao from "#root/src/daos/usuario.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as emailService from "#root/src/providers/email/email.Provider.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { line, log } from "#src/utils/logger.pino.js";
import { v4 as uuidv4 } from "uuid";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface UpdateFactoringhistorialestadoDto {
  factoringhistorialestadoid: string;
  factoringestadoid: string;
  comentario: string;
  archivos?: string[];
}

export interface CreateFactoringhistorialestadoDto {
  factoringid: string;
  factoringestadoid: string;
  archivos?: string[];
  comentario: string;
}

export interface GetFactoringhistorialestadosByFactoringidDto {
  factoringid: string;
}

export interface FactoringhistorialestadoIdDto {
  factoringhistorialestadoid: string;
}

// ─── Services ────────────────────────────────────────────────────────────────

/**
 * Actualiza un registro del historial de estados de factoring y asocia nuevos archivos.
 */
export const updateFactoringhistorialestadoService = async (
  dto: UpdateFactoringhistorialestadoDto,
  idusuario: number,
) => {
  log.debug(line(), "service::admin::updateFactoringhistorialestadoService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringhistorialestado =
        await factoringhistorialestadoDao.getFactoringhistorialestadoByFactoringhistorialestadoid(
          tx,
          dto.factoringhistorialestadoid,
        );
      if (!factoringhistorialestado) {
        log.warn(line(), `Factoringhistorialestado no existe: [${dto.factoringhistorialestadoid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringestado = await factoringestadoDao.getFactoringestadoByFactoringestadoid(
        tx,
        dto.factoringestadoid,
      );
      if (!factoringestado) {
        log.warn(line(), `Factoringestado no existe: [${dto.factoringestadoid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const archivos = [];
      if (dto.archivos) {
        for (const archivoid of dto.archivos) {
          const archivo = await archivoDao.getArchivoByArchivoid(tx, archivoid);
          if (!archivo) {
            log.warn(line(), `Archivo no existe: [${archivoid}]`);
            throw new ClientError("Datos no válidos", 404);
          }
          archivos.push(archivo);
        }
      }

      const factoringhistorialestadoToUpdate: Prisma.factoring_historial_estadoUpdateInput = {
        factoring_estado: { connect: { idfactoringestado: factoringestado.idfactoringestado } },
        comentario: dto.comentario,
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
      };

      const factoringhistorialestadoUpdated =
        await factoringhistorialestadoDao.updateFactoringhistorialestado(
          tx,
          dto.factoringhistorialestadoid,
          factoringhistorialestadoToUpdate,
        );
      log.debug(line(), "factoringhistorialestadoUpdated:", factoringhistorialestadoUpdated);

      for (const archivo of archivos) {
        const archivofactoringhistorialestadoToCreate: Prisma.archivo_factoring_historial_estadoCreateInput = {
          archivo: { connect: { idarchivo: archivo.idarchivo } },
          factoring_historial_estado: {
            connect: { idfactoringhistorialestado: factoringhistorialestadoUpdated.idfactoringhistorialestado },
          },
          idusuariocrea: idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };

        const archivofactoringhistorialestadoCreated =
          await archivofactoringhistorialestadoDao.insertArchivofactoringhistorialestado(
            tx,
            archivofactoringhistorialestadoToCreate,
          );
        log.debug(line(), "archivofactoringhistorialestadoCreated:", archivofactoringhistorialestadoCreated);
      }

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta el historial de estados de una operación de factoring.
 */
export const getFactoringhistorialestadosByFactoringidService = async (
  dto: GetFactoringhistorialestadosByFactoringidDto,
) => {
  log.debug(line(), "service::admin::getFactoringhistorialestadosByFactoringidService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${dto.factoringid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      return await factoringhistorialestadoDao.getFactoringhistorialestadosByIdfactoring(
        tx,
        factoring.idfactoring,
        filter_estado,
      );
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta catálogos maestros para el historial de estados de factoring en admin.
 */
export const getFactoringhistorialestadoMasterService = async () => {
  log.debug(line(), "service::admin::getFactoringhistorialestadoMasterService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const factoringestados = await factoringestadoDao.getFactoringestados(tx, filter_estados);

      return {
        factoringestados,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Crea un nuevo registro en el historial de estados, actualiza el estado de la operación y dispara notificaciones por correo.
 */
export const createFactoringhistorialestadoService = async (
  dto: CreateFactoringhistorialestadoDto,
  idusuario: number,
) => {
  log.debug(line(), "service::admin::createFactoringhistorialestadoService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoring = await factoringDao.getFactoringByFactoringid(tx, dto.factoringid);
      if (!factoring) {
        log.warn(line(), `Factoring no existe: [${dto.factoringid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringestado = await factoringestadoDao.getFactoringestadoByFactoringestadoid(
        tx,
        dto.factoringestadoid,
      );
      if (!factoringestado) {
        log.warn(line(), `Factoring estado no existe: [${dto.factoringestadoid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const archivos = [];
      if (dto.archivos) {
        for (const archivoid of dto.archivos) {
          const archivo = await archivoDao.getArchivoByArchivoid(tx, archivoid);
          if (!archivo) {
            log.warn(line(), `Archivo no existe: [${archivoid}]`);
            throw new ClientError("Datos no válidos", 404);
          }
          archivos.push(archivo);
        }
      }

      const factoringhistorialestadoToCreate: Prisma.factoring_historial_estadoCreateInput = {
        factoring: { connect: { idfactoring: factoring.idfactoring } },
        factoring_estado: { connect: { idfactoringestado: factoringestado.idfactoringestado } },
        usuario_modifica: { connect: { idusuario } },
        factoringhistorialestadoid: uuidv4(),
        code: uuidv4().split("-")[0],
        comentario: dto.comentario,
        idusuariocrea: idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const factoringhistorialestadoCreated =
        await factoringhistorialestadoDao.insertFactoringhistorialestado(
          tx,
          factoringhistorialestadoToCreate,
        );
      log.debug(line(), "factoringhistorialestadoCreated:", factoringhistorialestadoCreated);

      const factoringToUpdate: Prisma.factoringUpdateInput = {
        factoring_estado: { connect: { idfactoringestado: factoringestado.idfactoringestado } },
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
      };

      const factoringUpdated = await factoringDao.updateFactoring(
        tx,
        dto.factoringid,
        factoringToUpdate,
      );
      log.debug(line(), "factoringUpdated:", factoringUpdated);

      for (const archivo of archivos) {
        const archivofactoringhistorialestadoToCreate: Prisma.archivo_factoring_historial_estadoCreateInput = {
          archivo: { connect: { idarchivo: archivo.idarchivo } },
          factoring_historial_estado: {
            connect: { idfactoringhistorialestado: factoringhistorialestadoCreated.idfactoringhistorialestado },
          },
          idusuariocrea: idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };

        const archivofactoringhistorialestadoCreated =
          await archivofactoringhistorialestadoDao.insertArchivofactoringhistorialestado(
            tx,
            archivofactoringhistorialestadoToCreate,
          );
        log.debug(line(), "archivofactoringhistorialestadoCreated:", archivofactoringhistorialestadoCreated);
      }

      // Notificaciones por correo según nuevo estado
      if (factoringUpdated.idfactoringestado === 29) {
        // Deudor notificado sobre la operación
        const factoring_for_email = await factoringDao.getFactoringByIdfactoring(tx, factoringUpdated.idfactoring);
        const emails_cc_deudor_solicita_confirmacion = await configuracionappDao.getEmailsCCDeudorSolicitaConfirmacion(tx);
        const ccEmails: string[] = JSON.parse(emails_cc_deudor_solicita_confirmacion?.valor || "[]");
        ccEmails.push(factoring_for_email.contacto_cedente.email);
        const paramsEmail = {
          factoring: factoring_for_email,
        };
        await emailService.sendFactoringEmpresaServicioFactoringDeudorSolicitudConfirmacion(
          factoring_for_email.contacto_aceptante.email,
          ccEmails,
          paramsEmail,
        );
      }

      if (factoringUpdated.idfactoringestado === 10) {
        // Deudor notificado de la transferencia
        const idbanco = 1;
        const estados = [ESTADO.ACTIVO];
        const factoring_for_email = await factoringDao.getFactoringByIdfactoring(tx, factoringUpdated.idfactoring);
        const factoringpropuesta_for_email = await factoringpropuestaDao.getFactoringpropuestaAceptadaByIdfactoringpropuesta(
          tx,
          factoring_for_email?.idfactoringpropuestaaceptada ?? 0,
          estados,
        );
        const factorcuentabancaria_for_email = await factorcuentabancariaDao.getFactorcuentabancariasByIdfactorIdmonedaIdbanco(
          tx,
          factoring_for_email?.idfactor ?? 0,
          factoring_for_email?.idmoneda ?? 0,
          idbanco,
          estados,
        );

        const emails_cc_deudor_solicita_confirmacion = await configuracionappDao.getEmailsCCDeudorSolicitaConfirmacion(tx);
        const ccEmails: string[] = JSON.parse(emails_cc_deudor_solicita_confirmacion?.valor || "[]");
        ccEmails.push(factoring_for_email.contacto_cedente.email);
        const paramsEmail_10 = {
          factoring: factoring_for_email,
          factoringpropuesta: factoringpropuesta_for_email,
          factorcuentabancaria: factorcuentabancaria_for_email,
        };
        await emailService.sendFactoringEmpresaServicioFactoringDeudorNotificacionTransferencia(
          factoring_for_email.contacto_aceptante.email,
          ccEmails,
          paramsEmail_10,
        );
      }

      if (factoringUpdated.idfactoringestado === 36) {
        // Inicio de Operación de Factoring
        const factoringToUpdate_2: Prisma.factoringUpdateInput = {
          fecha_operacion: new Date(),
          idusuariomod: idusuario ?? 1,
          fechamod: new Date(),
        };

        const factoringUpdated_2 = await factoringDao.updateFactoring(
          tx,
          dto.factoringid,
          factoringToUpdate_2,
        );
        log.debug(line(), "factoringUpdated_2:", factoringUpdated_2);

        const estados = [ESTADO.ACTIVO];
        const factoring_for_email = await factoringDao.getFactoringByIdfactoring(tx, factoringUpdated.idfactoring);
        const factoringpropuesta_for_email = await factoringpropuestaDao.getFactoringpropuestaAceptadaByIdfactoringpropuesta(
          tx,
          factoring_for_email?.idfactoringpropuestaaceptada ?? 0,
          estados,
        );
        const usuario_for_email = await usuarioDao.getUsuarioByIdusuario(
          tx,
          factoring_for_email.contacto_cedente.persona.idusuario,
        );

        const paramsEmail_36 = {
          factoring: factoring_for_email,
          factoringpropuesta: factoringpropuesta_for_email,
          usuario: usuario_for_email,
        };
        await emailService.sendFactoringEmpresaServicioFactoringCedenteNotificacionInicioOperacion(
          factoring_for_email.contacto_cedente.email,
          paramsEmail_36,
        );
      }

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Activa un registro del historial de estados de factoring.
 */
export const activateFactoringhistorialestadoService = async (
  dto: FactoringhistorialestadoIdDto,
  idusuario: number,
) => {
  log.debug(line(), "service::admin::activateFactoringhistorialestadoService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringhistorialestado =
        await factoringhistorialestadoDao.getFactoringhistorialestadoByFactoringhistorialestadoid(
          tx,
          dto.factoringhistorialestadoid,
        );
      if (!factoringhistorialestado) {
        log.warn(line(), `Factoringhistorialestado no existe: [${dto.factoringhistorialestadoid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringhistorialestadoActivated =
        await factoringhistorialestadoDao.activateFactoringhistorialestado(
          tx,
          dto.factoringhistorialestadoid,
          idusuario,
        );
      log.debug(line(), "factoringhistorialestadoActivated:", factoringhistorialestadoActivated);

      return factoringhistorialestadoActivated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Elimina lógicamente un registro del historial de estados de factoring.
 */
export const deleteFactoringhistorialestadoService = async (
  dto: FactoringhistorialestadoIdDto,
  idusuario: number,
) => {
  log.debug(line(), "service::admin::deleteFactoringhistorialestadoService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const factoringhistorialestado =
        await factoringhistorialestadoDao.getFactoringhistorialestadoByFactoringhistorialestadoid(
          tx,
          dto.factoringhistorialestadoid,
        );
      if (!factoringhistorialestado) {
        log.warn(line(), `Factoringhistorialestado no existe: [${dto.factoringhistorialestadoid}]`);
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringhistorialestadoDeleted =
        await factoringhistorialestadoDao.deleteFactoringhistorialestado(
          tx,
          dto.factoringhistorialestadoid,
          idusuario,
        );
      log.debug(line(), "factoringhistorialestadoDeleted:", factoringhistorialestadoDeleted);

      return factoringhistorialestadoDeleted;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta el listado general de historiales de estados de factoring para admin.
 */
export const getFactoringhistorialestadosService = async () => {
  log.debug(line(), "service::admin::getFactoringhistorialestadosService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      return await factoringhistorialestadoDao.getFactoringhistorialestados(tx, filter_estado);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
