import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as zlaboratoriopedidoDao from "#root/src/daos/zlaboratoriopedido.Dao.js";
import * as zlaboratoriousuarioDao from "#root/src/daos/zlaboratoriousuario.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { line, log } from "#src/utils/logger.pino.js";
import { v4 as uuidv4 } from "uuid";

export interface ValidateTransactionPayload {
  nombre: string;
  pedido: string;
}

export const validateTransactionService = async (session_idusuario: number, usuariopedidoValidated: ValidateTransactionPayload) => {
  log.debug(line(), "service::validateTransactionService");
  const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

  return await prismaFT.client.$transaction(
    async (tx) => {
      const usuarioToCreate: Prisma.zlaboratorio_usuarioCreateInput = {
        nombre: usuariopedidoValidated.nombre,
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
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
        nombre: usuariopedidoValidated.pedido,
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const pedidoCreated = await zlaboratoriopedidoDao.insertZlaboratorioPedido(tx, pedidoToCreate);
      log.debug(line(), "pedidoCreated", pedidoCreated);

      await zlaboratoriousuarioDao.getZlaboratorioUsuarios(tx, filter_estado);

      const usuariosConPedidos = await zlaboratoriousuarioDao.getZlaboratorioUsuariosConPedidos(tx, filter_estado);
      log.debug(line(), "usuariosConPedidos", usuariosConPedidos);

      await zlaboratoriousuarioDao.getZlaboratorioUsuarioByIdzlaboratoriousuario(tx, 10);
      await zlaboratoriousuarioDao.getZlaboratorioUsuarioByZlaboratorioUsuarioid(tx, 105);
      await zlaboratoriousuarioDao.findZlaboratorioUsuarioPk(tx, 105);
      await zlaboratoriousuarioDao.updateZlaboratorioUsuario(tx, usuarioCreated.idusuario, usuarioCreated);
      await zlaboratoriopedidoDao.deleteZlaboratorioPedido(tx, pedidoCreated.idpedido, pedidoCreated.idusuario);

      return usuarioCreated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
