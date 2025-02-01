import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getFactoringempresasByVerificacion = async (req, estadologico, _idservicio, _idarchivotipos) => {
  try {
    const { models } = req.app.locals;
    const personas = await models.ServicioEmpresa.findAll({
      include: [
        {
          model: models.Servicio,
          required: true,
          as: "servicio_servicio",
        },
        {
          model: models.Empresa,
          required: true,
          as: "empresa_empresa",
          include: [
            {
              model: models.Archivo,
              required: true,
              as: "archivo_archivo_archivo_empresas",
              include: [
                {
                  model: models.ArchivoTipo,
                  required: true,
                  as: "archivotipo_archivo_tipo",
                },
              ],
              where: {
                _idarchivotipo: {
                  [Sequelize.Op.in]: _idarchivotipos,
                },
              },
            },
            {
              model: models.CuentaBancaria,
              required: true,
              as: "cuentabancaria_cuenta_bancaria_empresa_cuenta_bancaria",
              include: [
                {
                  model: models.Archivo,
                  required: true,
                  as: "archivo_archivo_archivo_cuenta_bancaria",
                  include: [
                    {
                      model: models.ArchivoTipo,
                      required: true,
                      as: "archivotipo_archivo_tipo",
                    },
                  ],
                  where: {
                    _idarchivotipo: {
                      [Sequelize.Op.in]: _idarchivotipos,
                    },
                  },
                },
              ],
            },
            {
              model: models.Colaborador,
              required: true,
              as: "colaboradors",
              include: [
                {
                  model: models.Archivo,
                  required: true,
                  as: "archivo_archivos",
                  include: [
                    {
                      model: models.ArchivoTipo,
                      required: true,
                      as: "archivotipo_archivo_tipo",
                    },
                  ],
                  where: {
                    _idarchivotipo: {
                      [Sequelize.Op.in]: _idarchivotipos,
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          model: models.Usuario,
          required: true,
          as: "usuariosuscriptor_usuario",
        },
        {
          model: models.ServicioEmpresaEstado,
          required: true,
          as: "servicioempresaestado_servicio_empresa_estado",
        },
      ],
      where: {
        _idservicio: {
          [Sequelize.Op.in]: _idservicio,
        },
        estado: {
          [Sequelize.Op.in]: estadologico,
        },
      },
    });
    //logger.info(line(),personas);
    return personas;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresas = async (req, estados) => {
  try {
    const { models } = req.app.locals;
    const servicioempresas = await models.ServicioEmpresa.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
    });
    //logger.info(line(),servicioempresas);
    return servicioempresas;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaByIdservicioempresa = async (req, idservicioempresa) => {
  try {
    const { models } = req.app.locals;

    const servicioempresa = await models.ServicioEmpresa.findByPk(idservicioempresa, {});
    logger.info(line(), servicioempresa);

    //const servicioempresas = await servicioempresa.getServicioempresas();
    //logger.info(line(),servicioempresas);

    return servicioempresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaByServicioempresaid = async (req, servicioempresaid) => {
  try {
    const { models } = req.app.locals;
    const servicioempresa = await models.ServicioEmpresa.findOne({
      where: {
        servicioempresaid: servicioempresaid,
      },
    });
    //logger.info(line(),servicioempresa);
    return servicioempresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findServicioempresaPk = async (req, servicioempresaid) => {
  try {
    const { models } = req.app.locals;
    const servicioempresa = await models.ServicioEmpresa.findOne({
      attributes: ["_idservicioempresa"],
      where: {
        servicioempresaid: servicioempresaid,
      },
    });
    //logger.info(line(),servicioempresa);
    return servicioempresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertServicioempresa = async (req, servicioempresa) => {
  try {
    const { models } = req.app.locals;
    const servicioempresa_nuevo = await models.ServicioEmpresa.create(servicioempresa);
    // logger.info(line(),servicioempresa_nuevo);
    return servicioempresa_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateServicioempresa = async (req, servicioempresa) => {
  try {
    const { models } = req.app.locals;
    const result = await models.ServicioEmpresa.update(servicioempresa, {
      where: {
        servicioempresaid: servicioempresa.servicioempresaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteServicioempresa = async (req, servicioempresa) => {
  try {
    const { models } = req.app.locals;
    const result = await models.ServicioEmpresa.update(servicioempresa, {
      where: {
        servicioempresaid: servicioempresa.servicioempresaid,
      },
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
