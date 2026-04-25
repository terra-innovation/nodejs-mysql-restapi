import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as usuarioDao from "#src/daos/usuario.prisma.Dao.js";
import * as rolDao from "#src/daos/rol.prisma.Dao.js";
import * as servicioDao from "#src/daos/servicio.prisma.Dao.js";
import * as usuarioServicioEstadoDao from "#src/daos/usuarioservicioestado.prisma.Dao.js";
import * as usuarioServicioEmpresaRolDao from "#src/daos/usuarioservicioempresarol.prisma.Dao.js";
import * as usuarioServicioEmpresaEstadoDao from "#src/daos/usuarioservicioempresaestado.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import * as yup from "yup";
import { log, line } from "#src/utils/logger.pino.js";

export const getUsuarios = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuarios");
  const usuariosJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const usuarios = await usuarioDao.getUsuarios(tx, filter_estado);
      var usuariosJson = jsonUtils.sequelizeToJSON(usuarios);
      return usuariosJson;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, usuariosJson);
};

export const getUsuarioMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuarioMaster");
  const usuarioMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const roles = await rolDao.getRoles(tx, filter_estados);
      const servicios = await servicioDao.getServicios(tx, filter_estados);
      const usuario_servicio_estados = await usuarioServicioEstadoDao.getUsuarioservicioestados(tx, filter_estados);
      const usuario_servicio_empresa_roles = await usuarioServicioEmpresaRolDao.getUsuarioservicioempresarols(tx, filter_estados);
      const usuario_servicio_empresa_estados = await usuarioServicioEmpresaEstadoDao.getUsuarioservicioempresaestados(tx, filter_estados);

      let usuarioMaster: Record<string, any> = {};
      usuarioMaster.roles = roles;
      usuarioMaster.servicios = servicios;
      usuarioMaster.usuario_servicio_estados = usuario_servicio_estados;
      usuarioMaster.usuario_servicio_empresa_roles = usuario_servicio_empresa_roles;
      usuarioMaster.usuario_servicio_empresa_estados = usuario_servicio_empresa_estados;

      let usuarioMasterJSON = jsonUtils.sequelizeToJSON(usuarioMaster);
      let usuarioMasterObfuscated = jsonUtils.ofuscarAtributosDefault(usuarioMasterJSON);
      let usuarioMasterFiltered = jsonUtils.removeAttributesPrivates(usuarioMasterObfuscated);
      return usuarioMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, usuarioMasterFiltered);
};

export const activateUsuario = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateUsuario");
  const { id } = req.params;
  const usuarioSchema = yup
    .object()
    .shape({
      usuarioid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const usuarioValidated = usuarioSchema.validateSync({ usuarioid: id }, { abortEarly: false, stripUnknown: true });

  const usuarioActivated = await prismaFT.client.$transaction(
    async (tx) => {
      const usuarioActivated = await usuarioDao.activateUsuario(tx, usuarioValidated.usuarioid, req.session_user.usuario.idusuario);
      return usuarioActivated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 204, usuarioActivated);
};

export const deleteUsuario = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteUsuario");
  const { id } = req.params;
  const usuarioSchema = yup
    .object()
    .shape({
      usuarioid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const usuarioValidated = usuarioSchema.validateSync({ usuarioid: id }, { abortEarly: false, stripUnknown: true });

  const usuarioDeleted = await prismaFT.client.$transaction(
    async (tx) => {
      const usuarioDeleted = await usuarioDao.deleteUsuario(tx, usuarioValidated.usuarioid, req.session_user.usuario.idusuario);
      return usuarioDeleted;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 204, usuarioDeleted);
};
