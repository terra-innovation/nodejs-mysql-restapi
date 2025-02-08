import { Sequelize } from "sequelize";
import { modelsFT } from "../config/bd/sequelize_db_factoring.js";
import { ClientError } from "../utils/CustomErrors.js";
import logger, { line } from "../utils/logger.js";

export const getFactoringempresasByVerificacion = async (transaction, estadologico, _idservicio, _idarchivotipos) => {
  try {
    const personas = await modelsFT.ServicioEmpresa.findAll({
      include: [
        {
          model: modelsFT.Servicio,
          required: true,
          as: "servicio_servicio",
        },
        {
          model: modelsFT.Empresa,
          required: true,
          as: "empresa_empresa",
          include: [
            {
              model: modelsFT.Archivo,
              required: true,
              as: "archivo_archivo_archivo_empresas",
              include: [
                {
                  model: modelsFT.ArchivoTipo,
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
              model: modelsFT.CuentaBancaria,
              required: true,
              as: "cuentabancaria_cuenta_bancaria_empresa_cuenta_bancaria",
              include: [
                {
                  model: modelsFT.Banco,
                  required: true,
                  as: "banco_banco",
                },
                {
                  model: modelsFT.Moneda,
                  required: true,
                  as: "moneda_moneda",
                },
                {
                  model: modelsFT.CuentaTipo,
                  required: true,
                  as: "cuentatipo_cuenta_tipo",
                },
                {
                  model: modelsFT.CuentaBancariaEstado,
                  required: true,
                  as: "cuentabancariaestado_cuenta_bancaria_estado",
                },
                {
                  model: modelsFT.Archivo,
                  required: true,
                  as: "archivo_archivo_archivo_cuenta_bancaria",
                  include: [
                    {
                      model: modelsFT.ArchivoTipo,
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
              model: modelsFT.Colaborador,
              required: true,
              as: "colaboradors",
              include: [
                {
                  model: modelsFT.ColaboradorTipo,
                  required: true,
                  as: "colaboradortipo_colaborador_tipo",
                },
                {
                  model: modelsFT.DocumentoTipo,
                  required: true,
                  as: "documentotipo_documento_tipo",
                },
                {
                  model: modelsFT.Archivo,
                  required: true,
                  as: "archivo_archivos",
                  include: [
                    {
                      model: modelsFT.ArchivoTipo,
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
              model: modelsFT.Pais,
              required: true,
              as: "paissede_pai",
            },
            {
              model: modelsFT.Distrito,
              required: true,
              as: "distritosede_distrito",
              include: [
                {
                  model: modelsFT.Provincia,
                  requerid: true,
                  as: "provincia_provincium",
                  include: [
                    {
                      model: modelsFT.Departamento,
                      requerid: true,
                      as: "departamento_departamento",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: modelsFT.Usuario,
          required: true,
          as: "usuariosuscriptor_usuario",
        },
        {
          model: modelsFT.ServicioEmpresaEstado,
          required: true,
          as: "servicioempresaestado_servicio_empresa_estado",
        },
        {
          model: modelsFT.ServicioEmpresaVerificacion,
          required: true,
          as: "servicio_empresa_verificacions",
          include: [
            {
              model: modelsFT.ServicioEmpresaEstado,
              required: true,
              as: "servicioempresaestado_servicio_empresa_estado",
            },
            {
              model: modelsFT.Usuario,
              required: true,
              as: "usuarioverifica_usuario",
            },
          ],
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
      transaction,
    });
    //logger.info(line(),personas);
    return personas;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresas = async (transaction, estados) => {
  try {
    const servicioempresas = await modelsFT.ServicioEmpresa.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),servicioempresas);
    return servicioempresas;
  } catch (error) {
    logger.error(line(), error.original.code);
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaByIdservicioempresa = async (transaction, idservicioempresa) => {
  try {
    const servicioempresa = await modelsFT.ServicioEmpresa.findByPk(idservicioempresa, { transaction });
    logger.info(line(), servicioempresa);

    //const servicioempresas = await servicioempresa.getServicioempresas();
    //logger.info(line(),servicioempresas);

    return servicioempresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaByServicioempresaid = async (transaction, servicioempresaid) => {
  try {
    const servicioempresa = await modelsFT.ServicioEmpresa.findOne({
      where: {
        servicioempresaid: servicioempresaid,
      },
      transaction,
    });
    //logger.info(line(),servicioempresa);
    return servicioempresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findServicioempresaPk = async (transaction, servicioempresaid) => {
  try {
    const servicioempresa = await modelsFT.ServicioEmpresa.findOne({
      attributes: ["_idservicioempresa"],
      where: {
        servicioempresaid: servicioempresaid,
      },
      transaction,
    });
    //logger.info(line(),servicioempresa);
    return servicioempresa;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertServicioempresa = async (transaction, servicioempresa) => {
  try {
    const servicioempresa_nuevo = await modelsFT.ServicioEmpresa.create(servicioempresa, { transaction });
    // logger.info(line(),servicioempresa_nuevo);
    return servicioempresa_nuevo;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateServicioempresa = async (transaction, servicioempresa) => {
  try {
    const result = await modelsFT.ServicioEmpresa.update(servicioempresa, {
      where: {
        servicioempresaid: servicioempresa.servicioempresaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteServicioempresa = async (transaction, servicioempresa) => {
  try {
    const result = await modelsFT.ServicioEmpresa.update(servicioempresa, {
      where: {
        servicioempresaid: servicioempresa.servicioempresaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
