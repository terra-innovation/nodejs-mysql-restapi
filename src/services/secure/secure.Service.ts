import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as configuracionappDao from "#root/src/daos/configuracionapp.Dao.js";
import * as credencialDao from "#root/src/daos/credencial.Dao.js";
import * as documentotipoDao from "#root/src/daos/documentotipo.Dao.js";
import * as personaverificacionestadoDao from "#root/src/daos/personaverificacionestado.Dao.js";
import * as usuarioDao from "#root/src/daos/usuario.Dao.js";
import * as usuariorolDao from "#root/src/daos/usuariorol.Dao.js";
import * as validacionDao from "#root/src/daos/validacion.Dao.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import * as emailService from "#src/providers/email/email.Provider.js";
import * as telegramService from "#src/providers/telegram/telegram.Provider.js";
import { newLoginMessage, newUsuarioRegistradoMessage } from "#src/templates/telegram/usuario.Template.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { env } from "#src/config.js";
import * as cryptoUtils from "#src/utils/cryptoUtils.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import * as df from "#src/utils/dateUtils.js";
import EmailSender from "#src/providers/email/emailSender.js";
import TemplateManager from "#src/providers/email/TemplateManager.js";
import { UsuarioSession } from "#root/src/types/UsuarioSession.types.js";

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface ResetPasswordDto {
  hash: string;
  codigo: string;
  token: string;
  password: string;
}

export interface ValidateRestorePasswordDto {
  hash: string;
  codigo: string;
  token: string;
}

export interface SendVerificationCodeDto {
  hash: string;
  codigo: string;
}

export interface RegisterUsuarioDto {
  documentotipoid: string;
  documentonumero: string;
  usuarionombres: string;
  apellidopaterno: string;
  apellidomaterno: string;
  email: string;
  celular: string;
  password?: string;
}

export interface ValidateEmailDto {
  hash: string;
  codigo: string;
  otp: string;
}

export const loginUserService = async (payload: LoginUserDto) => {
  log.debug(line(), "service::loginUserService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const usuario_login = await usuarioDao.autenticarUsuario(tx, payload.email);
      if (!usuario_login) {
        log.warn(line(), "Usuario no existe: [" + payload.email + "]");
        throw new ClientError("Usuario y/o contraseña no válida.", 404);
      }

      if (
        usuario_login.email &&
        usuario_login.credencial.password &&
        bcrypt.compareSync(payload.password, usuario_login.credencial.password)
      ) {
        const usuario_autenticado = await usuarioDao.getUsuarioAndRolesByEmail(tx, payload.email);
        const jwtPayload: UsuarioSession = {
          usuario: usuario_autenticado,
        };

        const token = jwt.sign(jwtPayload, env.TOKEN_KEY_JWT, {
          expiresIn: "200000h",
        });
        log.info(line(), "Usuario autenticado", {
          idusuario: usuario_autenticado.idusuario,
          usuarioid: usuario_autenticado.usuarioid,
          code: usuario_autenticado.code,
          email: payload.email,
        });

        const msnTelegram = newLoginMessage(usuario_autenticado.email);
        telegramService.sendMessageImportant(msnTelegram);

        return { token, usuarioid: usuario_login.usuarioid };
      } else {
        log.warn(line(), "Credenciales no válidas: [" + payload.email + "]");
        throw new ClientError("Usuario y/o contraseña no válida.", 404);
      }
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const resetPasswordService = async (idUsuarioSession: number, payload: ResetPasswordDto) => {
  log.debug(line(), "service::resetPasswordService");
  const filter_estado = [ESTADO.ACTIVO];

  return await prismaFT.client.$transaction(
    async (tx) => {
      const usuario = await usuarioDao.getUsuarioByHash(tx, payload.hash);
      if (!usuario) {
        log.warn(line(), "Usuario no existe: ", payload);
        throw new ClientError("El código de verificación no es válido o ha expidado", 404);
      }

      const validacion = await validacionDao.getValidacionByIdusuarioAndCodigo(
        tx,
        usuario.idusuario,
        payload.codigo,
        filter_estado,
      );
      if (!validacion) {
        log.warn(line(), "Validación no existe: ", payload);
        throw new ClientError("El código de verificación no es válido o ha expidado", 404);
      }

      const otp_desencriptado = cryptoUtils.decryptText(payload.token, env.TOKEN_KEY_OTP);
      log.info(line(), "OTP Desencriptado", otp_desencriptado);

      if (otp_desencriptado === validacion.otp) {
        if (validacion.verificado === 0) {
          const fechaConAjustes = new Date(validacion.tiempo_marca);
          fechaConAjustes.setMinutes(fechaConAjustes.getMinutes() + validacion.tiempo_expiracion);
          fechaConAjustes.setSeconds(fechaConAjustes.getSeconds() + 10);
          const fechaActual = new Date();
          if (fechaActual <= fechaConAjustes) {
            const salt = bcrypt.genSaltSync(12);
            const encryptedPassword = bcrypt.hashSync(payload.password, salt);

            const credencial = await credencialDao.getCredencialByIdusuario(tx, usuario.idusuario);
            if (!credencial) {
              log.warn(line(), "Credencial no existe por idusuario: ", usuario.idusuario);
              throw new ClientError("El código de verificación no es válido o ha expidado", 404);
            }

            const credencialToUpdate: Prisma.credencialUpdateInput = {
              password: encryptedPassword,
              idusuariomod: idUsuarioSession ?? 1,
              fechamod: new Date(),
            };

            const credencialUpdated = await credencialDao.updateCredencial(
              tx,
              credencial.credencialid,
              credencialToUpdate,
            );
            if (credencialUpdated[0] === 0) {
              log.warn(line(), "No fue posible actualizar el usuario: ", credencialUpdated);
              throw new ClientError("El código de verificación no es válido o ha expidado", 404);
            }

            const validacionToUpdate: Prisma.validacionUpdateInput = {
              verificado: 1,
              fecha_verificado: new Date(),
              idusuariomod: idUsuarioSession ?? 1,
              fechamod: new Date(),
            };
            await validacionDao.updateValidacion(tx, validacion.validacionid, validacionToUpdate);
          } else {
            log.warn(line(), "El código de verificación ha expirado: ", payload);
            throw new ClientError("El código de verificación no es válido o ha expidado", 404);
          }
        } else {
          log.warn(line(), "El código de verificación ha sido validado anteriormente: ", payload);
          throw new ClientError("El código de verificación no es válido o ha expidado", 404);
        }
      } else {
        log.warn(line(), "El código de verificación no es válido: ", payload);
        throw new ClientError("El código de verificación no es válido o ha expidado", 404);
      }

      return { hash: payload.hash };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const validateRestorePasswordService = async (payload: ValidateRestorePasswordDto) => {
  log.debug(line(), "service::validateRestorePasswordService");
  const filter_estado = [ESTADO.ACTIVO];

  return await prismaFT.client.$transaction(
    async (tx) => {
      const usuario = await usuarioDao.getUsuarioByHash(tx, payload.hash);
      if (!usuario) {
        log.warn(line(), "Usuario no existe: ", payload);
        throw new ClientError("El código de verificación no es válido o ha expidado", 404);
      }

      const validacion = await validacionDao.getValidacionByIdusuarioAndCodigo(
        tx,
        usuario.idusuario,
        payload.codigo,
        filter_estado,
      );
      if (!validacion) {
        log.warn(line(), "Validación no existe: ", payload);
        throw new ClientError("El código de verificación no es válido o ha expidado", 404);
      }

      const otp_desencriptado = cryptoUtils.decryptText(payload.token, env.TOKEN_KEY_OTP);
      log.info(line(), "OTP Desencriptado", otp_desencriptado);

      if (otp_desencriptado === validacion.otp) {
        if (validacion.verificado === 0) {
          const fechaConAjustes = new Date(validacion.tiempo_marca);
          fechaConAjustes.setMinutes(fechaConAjustes.getMinutes() + validacion.tiempo_expiracion);
          fechaConAjustes.setSeconds(fechaConAjustes.getSeconds() + 10);
          const fechaActual = new Date();
          if (fechaActual <= fechaConAjustes) {
            // Validación conforme
          } else {
            log.warn(line(), "El código de verificación ha expirado: ", payload);
            throw new ClientError("El código de verificación no es válido o ha expidado", 404);
          }
        } else {
          log.warn(line(), "El código de verificación ha sido validado anteriormente: ", payload);
          throw new ClientError("El código de verificación no es válido o ha expidado", 404);
        }
      } else {
        log.warn(line(), "El código de verificación no es válido: ", payload);
        throw new ClientError("El código de verificación no es válido o ha expidado", 404);
      }

      return { hash: payload.hash };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const sendTokenPasswordService = async (idUsuarioSession: number, email: string) => {
  log.debug(line(), "service::sendTokenPasswordService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO];
      const usuario = await usuarioDao.getUsuarioByEmail(tx, email);
      if (!usuario) {
        log.warn(line(), "Usuario no existe para recuperación de contraseña:", email);
      } else {
        const constante_url_expira = await configuracionappDao.getRecuperarClaveExpiraURL(tx);
        const idvalidaciontipo = 3;
        const resetpasswordvalidationcode = String(Math.floor(100000 + Math.random() * 900000));
        const validacionPrev = await validacionDao.getValidacionByIdusuarioAndIdvalidaciontipo(
          tx,
          usuario.idusuario,
          idvalidaciontipo,
          filter_estado,
        );

        if (!validacionPrev) {
          const validacionToCreate: Prisma.validacionCreateInput = {
            usuario: { connect: { idusuario: usuario.idusuario } },
            validacion_tipo: { connect: { idvalidaciontipo } },
            valor: email,
            otp: resetpasswordvalidationcode,
            tiempo_marca: new Date(),
            tiempo_expiracion: Number(constante_url_expira.valor),
            codigo: crypto.randomBytes(77).toString("hex").slice(0, 77),
            idusuariocrea: idUsuarioSession ?? 1,
            fechacrea: new Date(),
            idusuariomod: idUsuarioSession ?? 1,
            fechamod: new Date(),
            estado: 1,
          };

          await validacionDao.insertValidacion(tx, validacionToCreate);
        } else {
          const validacionToUpdate: Prisma.validacionUpdateInput = {
            otp: resetpasswordvalidationcode,
            tiempo_marca: new Date(),
            tiempo_expiracion: Number(constante_url_expira.valor),
            verificado: 0,
            fecha_verificado: null,
            idusuariomod: idUsuarioSession ?? 1,
            fechamod: new Date(),
          };

          await validacionDao.updateValidacion(tx, validacionPrev.validacionid, validacionToUpdate);
        }

        const validacionNext = await validacionDao.getValidacionByIdusuarioAndIdvalidaciontipo(
          tx,
          usuario.idusuario,
          idvalidaciontipo,
          filter_estado,
        );
        if (validacionNext) {
          const otp_encriptado = cryptoUtils.encryptText(resetpasswordvalidationcode, env.TOKEN_KEY_OTP);
          const port = env.WEB_SITE_PORT > 0 ? ":" + env.WEB_SITE_PORT : "";
          const url =
            env.WEB_SITE +
            port +
            "/token-verification-password?hash=" +
            usuario.hash +
            "&codigo=" +
            validacionNext.codigo +
            "&token=" +
            otp_encriptado;
          log.debug(line(), "url", url);

          await emailService.sendRecuperarContrasena(email, {
            url,
            duracion_minutos: Number(constante_url_expira.valor),
          });
          log.debug(line(), "Correo de recuperación de contraseña enviado a:", email);
        }
      }

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const sendVerificactionCodeService = async (
  idUsuarioSession: number,
  payload: SendVerificationCodeDto,
) => {
  log.debug(line(), "service::sendVerificactionCodeService");
  const filter_estado = [ESTADO.ACTIVO];

  return await prismaFT.client.$transaction(
    async (tx) => {
      const usuario = await usuarioDao.getUsuarioByHash(tx, payload.hash);
      if (!usuario) {
        log.warn(line(), "Usuario no existe: ", payload);
        throw new ClientError("Información no válida", 404);
      }

      const validacion = await validacionDao.getValidacionByIdusuarioAndCodigo(
        tx,
        usuario.idusuario,
        payload.codigo,
        filter_estado,
      );
      if (!validacion) {
        log.warn(line(), "Validación no existe: ", payload);
        throw new ClientError("Información no válida", 404);
      }

      if (validacion.verificado !== 0) {
        log.warn(line(), "Valor ya se encuentra verificado: ", payload);
        throw new ClientError("Información no válida", 404);
      }

      const emailvalidationcode = String(Math.floor(100000 + Math.random() * 900000));

      const validacionToUpdate: Prisma.validacionUpdateInput = {
        otp: emailvalidationcode,
        tiempo_marca: new Date(),
        tiempo_expiracion: 5,
        idusuariomod: idUsuarioSession ?? 1,
        fechamod: new Date(),
      };

      await validacionDao.updateValidacion(tx, validacion.validacionid, validacionToUpdate);
      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const registerUsuarioService = async (
  idUsuarioSession: number,
  payload: RegisterUsuarioDto,
) => {
  log.debug(line(), "service::registerUsuarioService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const documentotipo = await documentotipoDao.findDocumentotipoPk(tx, payload.documentotipoid);
      if (!documentotipo) {
        throw new ClientError("Documento tipo no existe", 404);
      }

      const usuariobynumerodocumento = await usuarioDao.getUsuarioByNumerodocumento(
        tx,
        payload.documentonumero,
      );
      if (usuariobynumerodocumento) {
        throw new ClientError("El número de documento ya se encuentra registrado. ", 404);
      }

      const usuariobyemail = await usuarioDao.getUsuarioByEmail(tx, payload.email);
      if (usuariobyemail) {
        throw new ClientError("El correo electrónico ya se encuentra registrado. ", 404);
      }

      const personaverificacionestado_no_solicitado = 1;
      const personaverificacionestado =
        await personaverificacionestadoDao.getPersonaverificacionestadoByIdpersonaverificacionestado(
          tx,
          personaverificacionestado_no_solicitado,
        );
      if (!personaverificacionestado) {
        log.warn(line(), "Persona verificación estado no existe: [" + personaverificacionestado_no_solicitado + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const emailvalidationcode = String(Math.floor(100000 + Math.random() * 900000));
      const hash = crypto
        .createHash("sha1")
        .update(
          payload.email +
            "|" +
            payload.documentotipoid +
            "|" +
            payload.documentonumero +
            "|" +
            new Date().getTime(),
        )
        .digest("hex");

      const salt = bcrypt.genSaltSync(12);
      const encryptedPassword = bcrypt.hashSync(payload.password!, salt);

      const usuarioToCreate: Prisma.usuarioCreateInput = {
        documento_tipo: { connect: { iddocumentotipo: documentotipo.iddocumentotipo } },
        usuarioid: uuidv4(),
        code: uuidv4().split("-")[0],
        documentonumero: payload.documentonumero,
        usuarionombres: payload.usuarionombres,
        apellidopaterno: payload.apellidopaterno,
        apellidomaterno: payload.apellidomaterno,
        email: payload.email,
        celular: payload.celular,
        hash,
        ispersonavalidated: personaverificacionestado.ispersonavalidated,
        idusuariocrea: idUsuarioSession ?? 1,
        fechacrea: new Date(),
        idusuariomod: idUsuarioSession ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const usuarioCreated = await usuarioDao.insertUsuario(tx, usuarioToCreate);
      log.debug(line(), "usuarioCreated", usuarioCreated);

      const credencialToCreate: Prisma.credencialCreateInput = {
        usuario: { connect: { idusuario: usuarioCreated.idusuario } },
        credencialid: uuidv4(),
        code: uuidv4().split("-")[0],
        password: encryptedPassword,
        idusuariocrea: idUsuarioSession ?? 1,
        fechacrea: new Date(),
        idusuariomod: idUsuarioSession ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const credencialCreated = await credencialDao.insertCredencial(tx, credencialToCreate);
      log.debug(line(), "credencialCreated", credencialCreated);

      const idvalidaciontipo = 1;
      const validacionToCreate: Prisma.validacionCreateInput = {
        usuario: { connect: { idusuario: usuarioCreated.idusuario } },
        validacion_tipo: { connect: { idvalidaciontipo } },
        valor: payload.email,
        otp: emailvalidationcode,
        tiempo_marca: new Date(),
        tiempo_expiracion: 5,
        codigo: crypto.randomBytes(77).toString("hex").slice(0, 77),
        idusuariocrea: idUsuarioSession ?? 1,
        fechacrea: new Date(),
        idusuariomod: idUsuarioSession ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const validacionCreated = await validacionDao.insertValidacion(tx, validacionToCreate);
      log.debug(line(), "validacionCreated", validacionCreated);

      const templateManager = new TemplateManager();
      const emailSender = new EmailSender();
      const dataEmail = {
        otp: validacionToCreate.otp,
        duracion_minutos: validacionToCreate.tiempo_expiracion,
        fecha_actual: df.formatDateForEmailLocale(new Date().toISOString()),
      };
      const emailTemplate = await templateManager.templateCodigoVerificacion(dataEmail);

      const mailOptions = {
        to: payload.email,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html,
      };

      await emailSender.sendContactoFinanzatech(mailOptions);
      log.debug(line(), "Correo templateCodigoVerificacion enviado exitosamente.", payload.email);

      const msnTelegram = newUsuarioRegistradoMessage(usuarioToCreate);
      telegramService.sendMessageImportant(msnTelegram);

      const usuarioReturned: Record<string, any> = {
        hash: usuarioToCreate.hash,
        email: payload.email,
        codigo: validacionToCreate.codigo,
      };

      const usuarioObfuscated = jsonUtils.ofuscarAtributos(
        usuarioReturned,
        ["email"],
        jsonUtils.PATRON_OFUSCAR_EMAIL,
      );

      return usuarioObfuscated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const validateEmailService = async (idUsuarioSession: number, payload: ValidateEmailDto) => {
  log.debug(line(), "service::validateEmailService");
  const filter_estado = [ESTADO.ACTIVO];

  return await prismaFT.client.$transaction(
    async (tx) => {
      const usuario = await usuarioDao.getUsuarioByHash(tx, payload.hash);
      if (!usuario) {
        log.warn(line(), "Usuario no existe: ", payload);
        throw new ClientError("El código de verificación no es válido o ha expidado", 404);
      }

      const validacion = await validacionDao.getValidacionByIdusuarioAndCodigo(
        tx,
        usuario.idusuario,
        payload.codigo,
        filter_estado,
      );
      if (!validacion) {
        log.warn(line(), "Validación no existe: ", payload);
        throw new ClientError("El código de verificación no es válido o ha expidado", 404);
      }

      if (payload.otp === validacion.otp) {
        if (validacion.verificado === 0) {
          const fechaConAjustes = new Date(validacion.tiempo_marca);
          fechaConAjustes.setMinutes(fechaConAjustes.getMinutes() + validacion.tiempo_expiracion);
          fechaConAjustes.setSeconds(fechaConAjustes.getSeconds() + 10);
          const fechaActual = new Date();
          if (fechaActual <= fechaConAjustes) {
            const validacionToUpdate: Prisma.validacionUpdateInput = {
              verificado: 1,
              fecha_verificado: new Date(),
              idusuariomod: idUsuarioSession ?? 1,
              fechamod: new Date(),
            };
            await validacionDao.updateValidacion(tx, validacion.validacionid, validacionToUpdate);

            const usuarioToUpdate: Prisma.usuarioUpdateInput = {
              isemailvalidated: true,
            };
            await usuarioDao.updateUsuario(tx, usuario.usuarioid, usuarioToUpdate);

            const idrol_usuariogeneral = 5;
            const usuariorolToCreate: Prisma.usuario_rolCreateInput = {
              usuario: { connect: { idusuario: usuario.idusuario } },
              rol: { connect: { idrol: idrol_usuariogeneral } },
              idusuariocrea: idUsuarioSession ?? 1,
              fechacrea: new Date(),
              idusuariomod: idUsuarioSession ?? 1,
              fechamod: new Date(),
              estado: 1,
            };

            await usuariorolDao.insertUsuariorol(tx, usuariorolToCreate);
          } else {
            log.warn(line(), "El código de verificación ha expirado: ", payload);
            throw new ClientError("El código de verificación no es válido o ha expidado", 404);
          }
        } else {
          log.warn(line(), "El código de verificación ha sido validado anteriormente: ", payload);
          throw new ClientError("El código de verificación no es válido o ha expidado", 404);
        }
      } else {
        log.warn(line(), "El código de verificación no es válido: ", payload);
        throw new ClientError("El código de verificación no es válido o ha expidado", 404);
      }

      return { hash: payload.hash };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
