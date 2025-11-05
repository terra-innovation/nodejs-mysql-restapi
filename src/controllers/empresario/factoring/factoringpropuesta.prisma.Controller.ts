import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";

import * as cuentabancariaDao from "#src/daos/cuentabancaria.prisma.Dao.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import * as personaDao from "#src/daos/persona.prisma.Dao.js";
import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as factoringpropuestaDao from "#src/daos/factoringpropuesta.prisma.Dao.js";
import * as factoringfacturaDao from "#src/daos/factoringfactura.prisma.Dao.js";
import * as factoringhistorialestadoDao from "#src/daos/factoringhistorialestado.prisma.Dao.js";
import * as facturaDao from "#src/daos/factura.prisma.Dao.js";
import * as contactoDao from "#src/daos/contacto.prisma.Dao.js";
import * as colaboradorDao from "#src/daos/colaborador.prisma.Dao.js";
import * as monedaDao from "#src/daos/moneda.prisma.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { log, line } from "#src/utils/logger.pino.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";

import * as luxon from "luxon";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import type { factoring } from "#root/generated/prisma/ft_factoring/client.js";
import type { factoring_factura } from "#root/generated/prisma/ft_factoring/client.js";

export const getFactoringpropuestaVigente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestaByFactoringid");
  const { factoringid } = req.params;
  const factoringpropuestaSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var factoringpropuestaValidated = factoringpropuestaSchema.validateSync({ factoringid: factoringid, ...req.body }, { abortEarly: false, stripUnknown: true });
  //log.debug(line(),"factoringValidated:", factoringValidated);

  const factoringpropuesta = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];
      const _idusuario_session = req.session_user.usuario.idusuario;

      const factoring = await factoringDao.getFactoringByFactoringid(tx, factoringpropuestaValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringpropuestaValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuesta = await factoringpropuestaDao.getFactoringpropuestaVigenteByIdfactoring(tx, factoring.idfactoring, filter_estados);

      var factoringpropuestaFiltered = jsonUtils.removeAttributesPrivates(factoringpropuesta);
      return factoringpropuestaFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringpropuesta);
};
