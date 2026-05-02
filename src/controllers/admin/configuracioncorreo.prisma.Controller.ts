import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as configuracioncorreoDao from "#src/daos/configuracioncorreo.prisma.Dao.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#root/src/utils/logger.pino.js";
import { env } from "#src/config.js";
import { encryptText } from "#src/utils/cryptoUtils.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import EmailSender from "#src/utils/email/emailSender.js";

export const getConfiguracioncorreos = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getConfiguracioncorreos");
  const configuracioncorreos = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const configuracioncorreos = await configuracioncorreoDao.getConfiguracioncorreos(tx, filter_estado);

      return configuracioncorreos;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, configuracioncorreos);
};

export const createConfiguracioncorreo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createConfiguracioncorreo");
  const schema = yup
    .object()
    .shape({
      alias: yup.string().trim().required().max(200),
      smtp_host: yup.string().trim().required().max(200),
      smtp_port: yup.number().required(),
      smtp_secure: yup.boolean().required(),
      smtp_user: yup.string().trim().required().max(200),
      smtp_pass: yup.string().trim().required().max(200),
      smtp_name: yup.string().trim().required().max(200),
      mail_backup: yup.string().trim().email().max(200).nullable(),
      is_enabled: yup.boolean().required(),
    })
    .required();

  const validated = schema.validateSync({ ...req.body }, { abortEarly: false, stripUnknown: true });

  const created = await prismaFT.client.$transaction(
    async (tx) => {
      const encryptedFull = encryptText(validated.smtp_pass, env.MAIL_ENCRYPTION_KEY_COFIG);
      const [ivHex, encryptedPass] = encryptedFull.split("|");

      const toCreate: Prisma.configuracion_correoCreateInput = {
        configuracioncorreoid: uuidv4(),
        code: uuidv4().split("-")[0],
        alias: validated.alias,
        smtp_host: validated.smtp_host,
        smtp_port: validated.smtp_port,
        smtp_secure: validated.smtp_secure,
        smtp_user: validated.smtp_user,
        smtp_pass: encryptedPass,
        smtp_name: validated.smtp_name,
        mail_backup: validated.mail_backup,
        is_enabled: validated.is_enabled,
        encryption_iv: ivHex,
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: ESTADO.ACTIVO,
      };

      const result = await configuracioncorreoDao.insertConfiguracioncorreo(tx, toCreate);
      return jsonUtils.removeAttributesPrivates(result);
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, created);
};

export const updateConfiguracioncorreo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateConfiguracioncorreo");
  const { id } = req.params;
  const schema = yup
    .object()
    .shape({
      configuracioncorreoid: yup.string().trim().required().min(36).max(36),
      alias: yup.string().trim().required().max(200),
      smtp_host: yup.string().trim().required().max(200),
      smtp_port: yup.number().required(),
      smtp_secure: yup.boolean().required(),
      smtp_user: yup.string().trim().required().max(200),
      smtp_pass: yup.string().trim().max(200).nullable(),
      smtp_name: yup.string().trim().required().max(200),
      mail_backup: yup.string().trim().email().max(200).nullable(),
      is_enabled: yup.boolean().required(),
    })
    .required();

  const validated = schema.validateSync({ configuracioncorreoid: id, ...req.body }, { abortEarly: false, stripUnknown: true });

  await prismaFT.client.$transaction(
    async (tx) => {
      const existing = await configuracioncorreoDao.getConfiguracioncorreoByConfiguracioncorreoid(tx, validated.configuracioncorreoid);
      if (!existing) {
        throw new ClientError("Configuración no encontrada", 404);
      }

      const toUpdate: Prisma.configuracion_correoUpdateInput = {
        alias: validated.alias,
        smtp_host: validated.smtp_host,
        smtp_port: validated.smtp_port,
        smtp_secure: validated.smtp_secure,
        smtp_user: validated.smtp_user,
        smtp_name: validated.smtp_name,
        mail_backup: validated.mail_backup,
        is_enabled: validated.is_enabled,
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      if (validated.smtp_pass) {
        const encryptedFull = encryptText(validated.smtp_pass, env.MAIL_ENCRYPTION_KEY_COFIG);
        const [ivHex, encryptedPass] = encryptedFull.split("|");
        toUpdate.smtp_pass = encryptedPass;
        toUpdate.encryption_iv = ivHex;
      }

      await configuracioncorreoDao.updateConfiguracioncorreo(tx, existing.configuracioncorreoid, toUpdate);
      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 200, {});
};

export const deleteConfiguracioncorreo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteConfiguracioncorreo");
  const { id } = req.params;
  await prismaFT.client.$transaction(
    async (tx) => {
      await configuracioncorreoDao.deleteConfiguracioncorreo(tx, id, req.session_user.usuario.idusuario);
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 204, {});
};

export const activateConfiguracioncorreo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateConfiguracioncorreo");
  const { id } = req.params;
  await prismaFT.client.$transaction(
    async (tx) => {
      await configuracioncorreoDao.activateConfiguracioncorreo(tx, id, req.session_user.usuario.idusuario);
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 204, {});
};

export const getConfiguracioncorreoMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getConfiguracioncorreoMaster");
  const contactoMasterFiltered = {};
  response(res, 201, contactoMasterFiltered);
};

export const testConfiguracioncorreo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::testConfiguracioncorreo");
  const { id } = req.params;
  const schema = yup
    .object()
    .shape({
      configuracioncorreoid: yup.string().trim().required().min(36).max(36),
      email_destinatario: yup.string().email().required().max(200),
    })
    .required();

  const validated = schema.validateSync({ configuracioncorreoid: id, ...req.body }, { abortEarly: false, stripUnknown: true });

  const emailSender = new EmailSender();
  const result = await emailSender.testConnection(validated.configuracioncorreoid, validated.email_destinatario);

  response(res, 200, result);
};
