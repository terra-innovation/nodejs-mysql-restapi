import * as zlaboratoriousuarioDao from "#src/daos/zlaboratoriousuarioDao.js";
import * as zlaboratoriopedidoDao from "#src/daos/zlaboratoriopedidoDao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { safeRollback } from "#src/utils/transactionUtils.js";
import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize, Op } from "sequelize";
import { ZlaboratorioUsuarioAttributes } from "#root/src/models/ft_factoring/ZlaboratorioUsuario";

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

  const transaction = await sequelizeFT.transaction();
  try {
    var camposUsuarioFk: Partial<ZlaboratorioUsuarioAttributes> = {};
    var camposUsuarioAdicionales: Partial<ZlaboratorioUsuarioAttributes> = {};
    camposUsuarioAdicionales.nombre = usuariopedidoValidated.nombre;

    var camposUsuarioAuditoria: Partial<ZlaboratorioUsuarioAttributes> = {};
    camposUsuarioAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposUsuarioAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposUsuarioAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposUsuarioAuditoria.fechamod = Sequelize.fn("now", 3);
    camposUsuarioAuditoria.estado = 1;

    const usuarioCreated = await zlaboratoriousuarioDao.insertZlaboratorioUsuario(transaction, {
      ...camposUsuarioFk,
      ...camposUsuarioAdicionales,
      ...camposUsuarioAuditoria,
    });
    log.debug(line(), "usuarioCreated", usuarioCreated);

    var camposPedidoFk: Partial<ZlaboratorioUsuarioAttributes> = {};
    var camposPedidoAdicionales: Partial<ZlaboratorioUsuarioAttributes> = {};
    camposPedidoAdicionales._idusuario = usuarioCreated._idusuario;
    //camposPedidoAdicionales._idusuario = 2000; // Genera un error
    camposPedidoAdicionales.nombre = usuariopedidoValidated.pedido;
    var camposPedidoAuditoria: Partial<ZlaboratorioUsuarioAttributes> = {};
    camposPedidoAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposPedidoAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposPedidoAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposPedidoAuditoria.fechamod = Sequelize.fn("now", 3);
    camposPedidoAuditoria.estado = 1;

    const pedidoCreated = await zlaboratoriopedidoDao.insertZlaboratorioPedido(transaction, {
      ...camposPedidoFk,
      ...camposPedidoAdicionales,
      ...camposPedidoAuditoria,
    });
    log.debug(line(), "pedidoCreated", pedidoCreated);

    const usuarios = await zlaboratoriousuarioDao.getZlaboratorioUsuarios(transaction, filter_estado);

    const getZlaboratorioUsuarioByIdzlaboratoriousuario = await zlaboratoriousuarioDao.getZlaboratorioUsuarioByIdzlaboratoriousuario(transaction, 10);

    const getZlaboratorioUsuarioByZlaboratorioUsuarioid = await zlaboratoriousuarioDao.getZlaboratorioUsuarioByZlaboratorioUsuarioid(transaction, 105);

    const findZlaboratorioUsuarioPk = await zlaboratoriousuarioDao.findZlaboratorioUsuarioPk(transaction, 105);

    const updateZlaboratorioUsuario = await zlaboratoriousuarioDao.updateZlaboratorioUsuario(transaction, pedidoCreated);

    const deleteZlaboratorioUsuario = await zlaboratoriousuarioDao.deleteZlaboratorioUsuario(transaction, pedidoCreated);

    await transaction.commit();
    response(res, 201, { ...deleteZlaboratorioUsuario });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
