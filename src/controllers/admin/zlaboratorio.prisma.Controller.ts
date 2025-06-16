import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as zlaboratoriousuarioDao from "#src/daos/zlaboratoriousuario.prisma.Dao.js";
import * as zlaboratoriopedidoDao from "#src/daos/zlaboratoriopedido.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const validateTransaction = async (req: Request, res: Response) => {
  log.debug(line(), "controller::validateTransaction");
  const session_idusuario = req.session_user.usuario.idusuario;
  const filter_estado = [1, 2];
  const usuariopedidoCreateSchema = yup
    .object()
    .shape({
      nombre: yup.string().trim().required().min(2).max(200),
      pedido: yup.string().trim().required().min(2).max(200),
    })
    .required();
  var usuariopedidoValidated = usuariopedidoCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "empresaValidated:", usuariopedidoValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const usuarioToCreate: Prisma.zlaboratorio_usuarioCreateInput = {
        //idusuario: 67,// Simulamos un error de código duplicado
        nombre: usuariopedidoValidated.nombre,
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const usuarioCreated = await zlaboratoriousuarioDao.insertZlaboratorioUsuario(tx, usuarioToCreate);
      log.debug(line(), "usuarioCreated", usuarioCreated);

      const pedidoToCreate: Prisma.zlaboratorio_pedidoCreateInput = {
        usuario: {
          connect: { idusuario: usuarioCreated.idusuario },
        },
        code: uuidv4().split("-")[0],
        //code: "c019c569", // Simulamos un error de código duplicado
        nombre: usuariopedidoValidated.pedido,
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const pedidoCreated = await zlaboratoriopedidoDao.insertZlaboratorioPedido(tx, pedidoToCreate);
      log.debug(line(), "pedidoCreated", pedidoCreated);

      const usuarios = await zlaboratoriousuarioDao.getZlaboratorioUsuarios(tx, filter_estado);

      const usuariosConPedidos = await zlaboratoriousuarioDao.getZlaboratorioUsuariosConPedidos(tx, filter_estado);
      log.debug(line(), "usuariosConPedidos", usuariosConPedidos);

      const getZlaboratorioUsuarioByIdzlaboratoriousuario = await zlaboratoriousuarioDao.getZlaboratorioUsuarioByIdzlaboratoriousuario(tx, 10);

      const getZlaboratorioUsuarioByZlaboratorioUsuarioid = await zlaboratoriousuarioDao.getZlaboratorioUsuarioByZlaboratorioUsuarioid(tx, 105);

      const findZlaboratorioUsuarioPk = await zlaboratoriousuarioDao.findZlaboratorioUsuarioPk(tx, 105);

      const updateZlaboratorioUsuario = await zlaboratoriousuarioDao.updateZlaboratorioUsuario(tx, usuarioCreated.idusuario, usuarioCreated);

      const deleteZlaboratorioUsuario = await zlaboratoriopedidoDao.deleteZlaboratorioPedido(tx, pedidoCreated.idpedido, pedidoCreated.idusuario);

      const pedidoToUpdate = {
        idpedido: 3,
        nombre: "una computadora actualizada",
        fechamod: new Date(),
      };

      /*const updateZlaboratorioPedido = await zlaboratoriopedidoDao.updateZlaboratorioPedido(tx, pedidoToUpdate.idpedido, pedidoToUpdate);

      const pedidoEncontrado = await zlaboratoriopedidoDao.findZlaboratorioPedidoPk(tx, "c019c569pppp");
      log.debug(line(), "pedidoEncontrado", pedidoEncontrado);
*/
      return usuarioCreated;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, { ...resultado });
};
