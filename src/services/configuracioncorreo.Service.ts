import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { line, log } from "#root/src/utils/logger.pino.js";
import { env } from "#src/config.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import EmailSender from "#src/providers/email/emailSender.js";
import { encryptText } from "#src/utils/cryptoUtils.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { v4 as uuidv4 } from "uuid";

import * as configuracioncorreoDao from "#root/src/daos/configuracioncorreo.Dao.js";

const emailSender = new EmailSender();

export interface ConfiguracionCorreoCreateDto {
  alias: string;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string;
  smtp_pass: string;
  smtp_name: string;
  mail_backup?: string | null;
  is_enabled: boolean;
}

export interface ConfiguracionCorreoUpdateDto {
  configuracioncorreoid: string;
  alias: string;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string;
  smtp_pass?: string | null;
  smtp_name: string;
  mail_backup?: string | null;
  is_enabled: boolean;
}

export interface TestConfiguracionCorreoDto {
  configuracioncorreoid: string;
  email_destinatario: string;
}

/**
 * Consulta la lista de configuraciones de correo activas y eliminadas.
 */
export const getConfiguracioncorreosService = async () => {
  log.debug(line(), "service::getConfiguracioncorreosService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      return await configuracioncorreoDao.getConfiguracioncorreos(tx, filter_estado);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Crea una nueva configuración de correo encriptando las credenciales SMTP.
 */
export const createConfiguracioncorreoService = async (dto: ConfiguracionCorreoCreateDto, idusuario: number) => {
  log.debug(line(), "service::createConfiguracioncorreoService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const encryptedFull = encryptText(dto.smtp_pass, env.MAIL_ENCRYPTION_KEY_COFIG);
      const [ivHex, encryptedPass] = encryptedFull.split("|");

      const toCreate: Prisma.configuracion_correoCreateInput = {
        configuracioncorreoid: uuidv4(),
        code: uuidv4().split("-")[0],
        alias: dto.alias,
        smtp_host: dto.smtp_host,
        smtp_port: dto.smtp_port,
        smtp_secure: dto.smtp_secure,
        smtp_user: dto.smtp_user,
        smtp_pass: encryptedPass,
        smtp_name: dto.smtp_name,
        mail_backup: dto.mail_backup,
        is_enabled: dto.is_enabled,
        encryption_iv: ivHex,
        idusuariocrea: idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
        estado: ESTADO.ACTIVO,
      };

      const result = await configuracioncorreoDao.insertConfiguracioncorreo(tx, toCreate);
      return jsonUtils.removeAttributesPrivates(result);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Actualiza una configuración de correo existente.
 */
export const updateConfiguracioncorreoService = async (dto: ConfiguracionCorreoUpdateDto, idusuario: number) => {
  log.debug(line(), "service::updateConfiguracioncorreoService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const existing = await configuracioncorreoDao.getConfiguracioncorreoByConfiguracioncorreoid(tx, dto.configuracioncorreoid);
      if (!existing) {
        throw new ClientError("Configuración no encontrada", 404);
      }

      const toUpdate: Prisma.configuracion_correoUpdateInput = {
        alias: dto.alias,
        smtp_host: dto.smtp_host,
        smtp_port: dto.smtp_port,
        smtp_secure: dto.smtp_secure,
        smtp_user: dto.smtp_user,
        smtp_name: dto.smtp_name,
        mail_backup: dto.mail_backup,
        is_enabled: dto.is_enabled,
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
      };

      if (dto.smtp_pass) {
        const encryptedFull = encryptText(dto.smtp_pass, env.MAIL_ENCRYPTION_KEY_COFIG);
        const [ivHex, encryptedPass] = encryptedFull.split("|");
        toUpdate.smtp_pass = encryptedPass;
        toUpdate.encryption_iv = ivHex;
      }

      await configuracioncorreoDao.updateConfiguracioncorreo(tx, existing.configuracioncorreoid, toUpdate);
      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Elimina una configuración de correo.
 */
export const deleteConfiguracioncorreoService = async (id: string, idusuario: number) => {
  log.debug(line(), "service::deleteConfiguracioncorreoService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      await configuracioncorreoDao.deleteConfiguracioncorreo(tx, id, idusuario);
      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Activa una configuración de correo.
 */
export const activateConfiguracioncorreoService = async (id: string, idusuario: number) => {
  log.debug(line(), "service::activateConfiguracioncorreoService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      await configuracioncorreoDao.activateConfiguracioncorreo(tx, id, idusuario);
      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Obtiene los maestros de configuración de correo.
 */
export const getConfiguracioncorreoMasterService = async () => {
  log.debug(line(), "service::getConfiguracioncorreoMasterService");
  return {};
};

/**
 * Prueba la conectividad SMTP de una configuración de correo.
 */
export const testConfiguracioncorreoService = async (dto: TestConfiguracionCorreoDto) => {
  log.debug(line(), "service::testConfiguracioncorreoService");
  return await emailSender.testConnection(dto.configuracioncorreoid, dto.email_destinatario);
};
