import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

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
                  [Op.in]: _idarchivotipos,
                },
              },
            },
            {
              model: modelsFT.EmpresaCuentaBancaria,
              required: true,
              as: "empresa_cuenta_bancaria",
              include: [
                {
                  model: modelsFT.CuentaBancaria,
                  required: true,
                  as: "cuentabancaria_cuenta_bancarium",
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
                          [Op.in]: _idarchivotipos,
                        },
                      },
                    },
                  ],
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
                      [Op.in]: _idarchivotipos,
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
                  required: true,
                  as: "provincia_provincium",
                  include: [
                    {
                      model: modelsFT.Departamento,
                      required: true,
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
          [Op.in]: _idservicio,
        },
        estado: {
          [Op.in]: estadologico,
        },
      },
      transaction,
    });

    return personas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresas = async (transaction, estados) => {
  try {
    const servicioempresas = await modelsFT.ServicioEmpresa.findAll({
      where: {
        estado: {
          [Op.in]: estados,
        },
      },
      transaction,
    });

    return servicioempresas;
  } catch (error) {
    log.error(line(), error.original.code);
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaByIdservicioempresa = async (transaction, idservicioempresa) => {
  try {
    const servicioempresa = await modelsFT.ServicioEmpresa.findByPk(idservicioempresa, { transaction });

    //const servicioempresas = await servicioempresa.getServicioempresas();

    return servicioempresa;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return servicioempresa;
  } catch (error) {
    log.error(line(), "", formatError(error));
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

    return servicioempresa;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertServicioempresa = async (transaction, servicioempresa) => {
  try {
    const servicioempresa_nuevo = await modelsFT.ServicioEmpresa.create(servicioempresa, { transaction });

    return servicioempresa_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
