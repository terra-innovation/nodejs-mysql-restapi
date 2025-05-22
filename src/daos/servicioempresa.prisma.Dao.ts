import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, servicio_empresa } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getFactoringempresasByVerificacion = async (tx: TxClient, estadologico, idservicio, idarchivotipos) => {
  try {
    const personas = await tx.servicio_empresa.findMany({
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
                idarchivotipo: {
                  in: idarchivotipos,
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
                        idarchivotipo: {
                          in: idarchivotipos,
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
                    idarchivotipo: {
                      in: idarchivotipos,
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
        idservicio: {
          in: idservicio,
        },
        estado: {
          in: estadologico,
        },
      },
    });

    return personas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresas = async (tx: TxClient, estados: number[]): Promise<servicio_empresa[]> => {
  try {
    const servicioempresas = await tx.servicio_empresa.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return servicioempresas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaByIdservicioempresa = async (tx: TxClient, idservicioempresa: number): Promise<servicio_empresa> => {
  try {
    const servicioempresa = await tx.servicio_empresa.findUnique({ where: { idservicioempresa: idservicioempresa } });

    //const servicioempresas = await servicioempresa.getServicioempresas();

    return servicioempresa;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaByServicioempresaid = async (tx: TxClient, servicioempresaid: string): Promise<servicio_empresa> => {
  try {
    const servicioempresa = await tx.servicio_empresa.findFirst({
      where: {
        servicioempresaid: servicioempresaid,
      },
    });

    return servicioempresa;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findServicioempresaPk = async (tx: TxClient, servicioempresaid: string): Promise<{ idservicioempresa: number }> => {
  try {
    const servicioempresa = await tx.servicio_empresa.findFirst({
      select: { idservicioempresa: true },
      where: {
        servicioempresaid: servicioempresaid,
      },
    });

    return servicioempresa;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertServicioempresa = async (tx: TxClient, servicioempresa: Prisma.servicio_empresaCreateInput): Promise<servicio_empresa> => {
  try {
    const nuevo = await tx.servicio_empresa.create({ data: servicioempresa });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateServicioempresa = async (tx: TxClient, servicioempresa: Partial<servicio_empresa>): Promise<servicio_empresa> => {
  try {
    const result = await tx.servicio_empresa.update({
      data: servicioempresa,
      where: {
        servicioempresaid: servicioempresa.servicioempresaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteServicioempresa = async (tx: TxClient, servicioempresa: Partial<servicio_empresa>): Promise<servicio_empresa> => {
  try {
    const result = await tx.servicio_empresa.update({
      data: servicioempresa,
      where: {
        servicioempresaid: servicioempresa.servicioempresaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
