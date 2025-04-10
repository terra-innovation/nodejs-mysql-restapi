import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";
import * as usuarioDao from "#src/daos/usuarioDao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import logger, { line } from "#src/utils/logger.js";
import { safeRollback } from "#src/utils/transactionUtils.js";

export const getUsuario = async (req, res) => {
  logger.debug(line(), "controller::getUsuario");

  const transaction = await sequelizeFT.transaction();
  try {
    const filter_idusuario = req.session_user.usuario._idusuario;
    const filter_estado = [1, 2];
    const usuario = await usuarioDao.getUsuarioDatosContactoByIdusuario(transaction, filter_idusuario, filter_estado);
    var usuarioObfuscated = jsonUtils.ofuscarAtributos(usuario, ["email"], jsonUtils.PATRON_OFUSCAR_EMAIL);
    usuarioObfuscated = jsonUtils.ofuscarAtributos(usuarioObfuscated, ["celular"], jsonUtils.PATRON_OFUSCAR_TELEFONO);
    //logger.info(line(),empresaObfuscated);
    var usuarioFiltered = jsonUtils.removeAttributesPrivates(usuarioObfuscated);
    await transaction.commit();
    response(res, 201, usuarioFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
