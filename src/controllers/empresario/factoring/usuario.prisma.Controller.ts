import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";

import * as usuarioDao from "#src/daos/usuarioDao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getUsuario = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuario");

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_idusuario = req.session_user.usuario._idusuario;
      const filter_estado = [1, 2];
      const usuario = await usuarioDao.getUsuarioDatosContactoByIdusuario(tx, filter_idusuario, filter_estado);
      var usuarioObfuscated = jsonUtils.ofuscarAtributos(usuario, ["email"], jsonUtils.PATRON_OFUSCAR_EMAIL);
      usuarioObfuscated = jsonUtils.ofuscarAtributos(usuarioObfuscated, ["celular"], jsonUtils.PATRON_OFUSCAR_TELEFONO);
      //log.info(line(),empresaObfuscated);
      var usuarioFiltered = jsonUtils.removeAttributesPrivates(usuarioObfuscated);
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, usuarioFiltered);
};
