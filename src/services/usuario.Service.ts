import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { line, log } from "#root/src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

import * as rolDao from "#root/src/daos/rol.Dao.js";
import * as servicioDao from "#root/src/daos/servicio.Dao.js";
import * as usuarioDao from "#root/src/daos/usuario.Dao.js";
import * as usuarioServicioEmpresaEstadoDao from "#root/src/daos/usuarioservicioempresaestado.Dao.js";
import * as usuarioServicioEmpresaRolDao from "#root/src/daos/usuarioservicioempresarol.Dao.js";
import * as usuarioServicioEstadoDao from "#root/src/daos/usuarioservicioestado.Dao.js";

/**
 * Consulta la lista de usuarios con estado activo o eliminado.
 */
export const getUsuariosService = async () => {
  log.debug(line(), "service::getUsuariosService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      return await usuarioDao.getUsuarios(tx, filter_estado);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta maestros para la gestión de usuarios (roles, servicios, estados de servicio).
 */
export const getUsuarioMasterService = async () => {
  log.debug(line(), "service::getUsuarioMasterService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const roles = await rolDao.getRoles(tx, filter_estados);
      const servicios = await servicioDao.getServicios(tx, filter_estados);
      const usuario_servicio_estados = await usuarioServicioEstadoDao.getUsuarioservicioestados(tx, filter_estados);
      const usuario_servicio_empresa_roles = await usuarioServicioEmpresaRolDao.getUsuarioservicioempresarols(tx, filter_estados);
      const usuario_servicio_empresa_estados = await usuarioServicioEmpresaEstadoDao.getUsuarioservicioempresaestados(tx, filter_estados);

      return {
        roles,
        servicios,
        usuario_servicio_estados,
        usuario_servicio_empresa_roles,
        usuario_servicio_empresa_estados,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Activa un usuario existente.
 */
export const activateUsuarioService = async (usuarioid: string, idusuario: number) => {
  log.debug(line(), "service::activateUsuarioService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      return await usuarioDao.activateUsuario(tx, usuarioid, idusuario);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Elimina lógicamente un usuario.
 */
export const deleteUsuarioService = async (usuarioid: string, idusuario: number) => {
  log.debug(line(), "service::deleteUsuarioService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      return await usuarioDao.deleteUsuario(tx, usuarioid, idusuario);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
