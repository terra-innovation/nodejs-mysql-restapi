import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, empresa_cuenta_bancaria } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getEmpresacuentabancariasForFactoring = async (tx: TxClient, idempresa, idmoneda, idcuentabancariaestado, estados: number[]) => {
  try {
    const empresacuentabancaria = await tx.empresa_cuenta_bancaria.findMany({
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
              where: {
                idmoneda: idmoneda,
              },
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
              where: {
                idcuentabancariaestado: {
                  in: idcuentabancariaestado,
                },
              },
            },
          ],
          where: {
            estado: {
              in: estados,
            },
          },
        },
      ],
      where: {
        idempresa: idempresa,
        estado: {
          in: estados,
        },
      },
    });

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancariasByIdempresaAndAlias = async (tx: TxClient, idempresa, alias, estados: number[]) => {
  try {
    const empresacuentabancaria = await tx.empresa_cuenta_bancaria.findMany({
      include: [
        {
          model: modelsFT.Empresa,
          required: true,
          as: "empresa_empresa",
          where: {
            idempresa: idempresa,
          },
        },
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
          ],
          where: {
            alias: alias,
            estado: {
              in: estados,
            },
          },
        },
      ],
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancariasByIdusuario = async (tx: TxClient, idusuario, estados: number[]) => {
  try {
    const empresacuentabancaria = await tx.empresa_cuenta_bancaria.findMany({
      include: [
        {
          model: modelsFT.Empresa,
          required: true,
          as: "empresa_empresa",
          include: [
            {
              model: modelsFT.UsuarioServicioEmpresa,
              required: true,
              as: "usuario_servicio_empresas",
              where: {
                idusuario: idusuario,
              },
            },
          ],
        },
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
          ],
        },
      ],
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancarias = async (tx: TxClient, estados: number[]): Promise<empresa_cuenta_bancaria[]> => {
  try {
    const empresacuentabancarias = await tx.empresa_cuenta_bancaria.findMany({
      include: [
        {
          model: modelsFT.Empresa,
          required: true,
          as: "empresa_empresa",
          include: [
            {
              model: modelsFT.UsuarioServicioEmpresa,
              required: true,
              as: "usuario_servicio_empresas",
            },
          ],
        },
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
              required: false,
              as: "archivo_archivo_archivo_cuenta_bancaria",
              include: [
                {
                  model: modelsFT.ArchivoTipo,
                  required: true,
                  as: "archivotipo_archivo_tipo",
                },
              ],
            },
          ],
        },
      ],
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return empresacuentabancarias;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancariaByIdempresaAndIdusuario = async (tx: TxClient, idempresa, idusuario, estados: number[]) => {
  try {
    const empresacuentabancaria = await tx.empresa_cuenta_bancaria.findFirst({
      include: [
        {
          model: modelsFT.Empresa,
          required: true,
          as: "empresa_empresa",
          include: [
            {
              model: modelsFT.UsuarioServicioEmpresa,
              required: true,
              as: "usuario_servicio_empresas",
              where: {
                idempresa: idempresa,
                idusuario: idusuario,
              },
            },
          ],
        },
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
          ],
        },
      ],
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancariaByIdempresacuentabancaria = async (tx: TxClient, idempresacuentabancaria: number): Promise<empresa_cuenta_bancaria> => {
  try {
    const empresacuentabancaria = await tx.empresa_cuenta_bancaria.findUnique({ where: { idempresacuentabancaria: idempresacuentabancaria } });

    //const empresacuentabancarias = await empresacuentabancaria.getEmpresacuentabancarias();

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancariaByEmpresacuentabancariaid = async (tx: TxClient, empresacuentabancariaid: string): Promise<empresa_cuenta_bancaria> => {
  try {
    const empresacuentabancaria = await tx.empresa_cuenta_bancaria.findFirst({
      where: {
        empresacuentabancariaid: empresacuentabancariaid,
      },
    });

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findEmpresacuentabancariaPk = async (tx: TxClient, empresacuentabancariaid: string): Promise<{ idempresacuentabancaria: number }> => {
  try {
    const empresacuentabancaria = await tx.empresa_cuenta_bancaria.findFirst({
      select: { idempresacuentabancaria: true },
      where: {
        empresacuentabancariaid: empresacuentabancariaid,
      },
    });

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertEmpresacuentabancaria = async (tx: TxClient, empresacuentabancaria: Prisma.empresa_cuenta_bancariaCreateInput): Promise<empresa_cuenta_bancaria> => {
  try {
    const nuevo = await tx.empresa_cuenta_bancaria.create({ data: empresacuentabancaria });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateEmpresacuentabancaria = async (tx: TxClient, empresacuentabancaria: Partial<empresa_cuenta_bancaria>): Promise<empresa_cuenta_bancaria> => {
  try {
    const result = await tx.empresa_cuenta_bancaria.update({
      data: empresacuentabancaria,
      where: {
        empresacuentabancariaid: empresacuentabancaria.empresacuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteEmpresacuentabancaria = async (tx: TxClient, empresacuentabancaria: Partial<empresa_cuenta_bancaria>): Promise<empresa_cuenta_bancaria> => {
  try {
    const result = await tx.empresa_cuenta_bancaria.update({
      data: empresacuentabancaria,
      where: {
        empresacuentabancariaid: empresacuentabancaria.empresacuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
