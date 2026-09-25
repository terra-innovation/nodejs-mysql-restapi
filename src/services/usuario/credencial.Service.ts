import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as credencialDao from "#root/src/daos/credencial.Dao.js";
import * as usuarioDao from "#root/src/daos/usuario.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { line, log } from "#src/utils/logger.pino.js";
import bcrypt from "bcryptjs";

export interface UpdateCredencialDto {
  usuarioid: string;
  old: string;
  password: string;
}

export const updateCredencialService = async (
  idUsuarioSession: number,
  payload: UpdateCredencialDto,
) => {
  log.debug(line(), "service::updateCredencialService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const usuario = await usuarioDao.getUsuarioByUsuarioid(tx, payload.usuarioid);
      if (!usuario) {
        log.warn(line(), "Usuario no existe: [" + payload.usuarioid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      if (usuario.idusuario !== idUsuarioSession) {
        log.warn(line(), "Intento de suplantacion de Usuario: [" + usuario.idusuario + "; " + idUsuarioSession + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const credencial = await credencialDao.getCredencialByIdusuario(tx, usuario.idusuario);
      if (!credencial) {
        log.warn(line(), "Credencial no existe: [" + usuario.idusuario + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      if (!bcrypt.compareSync(payload.old, credencial.password)) {
        log.warn(line(), "La contraseña anterior no es correcta: [" + usuario.idusuario + "]");
        throw new ClientError("La contraseña anterior no es correcta", 404);
      }

      // Encrypt user password. Cumple estándares PCI-DSS o la GDPR: hashing y salting
      const salt = bcrypt.genSaltSync(12);
      const encryptedPassword = bcrypt.hashSync(payload.password, salt);

      const credencialToUpdate: Prisma.credencialUpdateInput = {
        password: encryptedPassword,
        idusuariomod: idUsuarioSession ?? 1,
        fechamod: new Date(),
      };

      await credencialDao.updateCredencial(tx, credencial.credencialid, credencialToUpdate);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
