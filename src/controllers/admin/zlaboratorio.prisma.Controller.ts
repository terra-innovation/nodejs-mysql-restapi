import prismaFT, { transactionTimeout } from "#root/src/models/prisma/db-factoring.js";
import * as zlaboratoriousuarioDao from "#src/daos/zlaboratoriousuario.prisma.Dao.js";
import * as zlaboratoriopedidoDao from "#src/daos/zlaboratoriopedido.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { safeRollback } from "#src/utils/transactionUtils.js";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const validateTransaction = async (req, res) => {
  log.debug(line(), "controller::validateTransaction");
  const session_idusuario = req.session_user.usuario._idusuario;
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

  try {
    const resultado = await prismaFT.$transaction(
      async (tx) => {
        const camposUsuario = {
          nombre: usuariopedidoValidated.nombre,
          idusuariocrea: req.session_user.usuario._idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: req.session_user.usuario._idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };

        const usuarioCreated = await zlaboratoriousuarioDao.insertZlaboratorioUsuario(tx, camposUsuario);
        log.debug(line(), "usuarioCreated", usuarioCreated);

        const camposPedido = {
          zlaboratorio_usuario: {
            connect: { idusuario: usuarioCreated.idusuario },
          },
          //code: uuidv4().split("-")[0],
          code: "c019c569", // Simulamos un error de código duplicado
          nombre: usuariopedidoValidated.pedido,
          idusuariocrea: req.session_user.usuario._idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: req.session_user.usuario._idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };

        const pedidoCreated = await zlaboratoriopedidoDao.insertZlaboratorioPedido(tx, camposPedido);
        log.debug(line(), "pedidoCreated", pedidoCreated);

        const usuarios = await zlaboratoriousuarioDao.getZlaboratorioUsuarios(tx, filter_estado);

        const getZlaboratorioUsuarioByIdzlaboratoriousuario = await zlaboratoriousuarioDao.getZlaboratorioUsuarioByIdzlaboratoriousuario(tx, 10);

        const getZlaboratorioUsuarioByZlaboratorioUsuarioid = await zlaboratoriousuarioDao.getZlaboratorioUsuarioByZlaboratorioUsuarioid(tx, 105);

        const findZlaboratorioUsuarioPk = await zlaboratoriousuarioDao.findZlaboratorioUsuarioPk(tx, 105);

        //const updateZlaboratorioUsuario = await zlaboratoriousuarioDao.updateZlaboratorioUsuario(tx, pedidoCreated);

        //const deleteZlaboratorioUsuario = await zlaboratoriousuarioDao.deleteZlaboratorioUsuario(tx, pedidoCreated);

        return usuarioCreated;
      },
      { timeout: transactionTimeout }
    );
    response(res, 201, { ...resultado });
  } catch (error) {
    throw error;
  }
};
