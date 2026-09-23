import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { TxClient } from "#src/types/Prisma.types.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import * as configuracionappDao from "#root/src/daos/configuracionapp.Dao.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getFactoringByIdfactoringIdempresario = async (tx: TxClient, idfactoring: number, idempresario: number, estados: number[]) => {
  try {
    const factoring = await tx.factoring.findFirst({
      include: {
        empresa_cedente: true,
        factoring_facturas: {
          include: {
            factura: true,
          },
        },
      },
      where: {
        idfactoring: idfactoring,
        empresa_cedente: {
          usuario_servicio_empresas: {
            some: {
              idusuario: idempresario,
            },
          },
        },

        estado: {
          in: estados,
        },
      },
    });
    return factoring;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsOportunidades = async (tx: TxClient, idfactoringestados, estados: number[]) => {
  try {
    const factorings = await tx.factoring.findMany({
      include: {
        empresa_aceptante: true,
        factoring_propuesta_aceptada: {
          include: {
            factoring_tipo: true,
            riesgo_operacion: true,
          },
        },

        moneda: true,
      },
      where: {
        idfactoringestado: {
          in: idfactoringestados,
        },
        estado: {
          in: estados,
        },
      },
    });

    return factorings;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsByIdfactoringestado = async (tx: TxClient, idfactoringestados, estados: number[]) => {
  try {
    const factorings = await tx.factoring.findMany({
      include: {
        contacto_aceptante: true,
        contacto_cedente: true,
        cuenta_bancaria: {
          include: {
            banco: true,
            cuenta_bancaria_estado: true,
            cuenta_tipo: true,
            moneda: true,
          },
        },
        empresa_aceptante: true,
        empresa_cedente: true,
        factoring_ejecutado: true,
        factoring_ejecutado_factoringes: true,
        factoring_estado: true,
        factoring_facturas: true,
        factoring_historial_estados: true,
        factoring_pagos: true,
        factoring_propuesta_aceptada: {
          include: {
            factoring_tipo: true,
          },
        },
        factoring_propuesta_factoringes: {
          include: {
            factoring_propuesta_estado: true,
          },
        },
        moneda: true,
      },
      where: {
        idfactoringestado: {
          in: idfactoringestados,
        },
        estado: {
          in: estados,
        },
      },
    });

    return factorings;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsByIdcedentes = async (tx: TxClient, idcedentes: number[], estados: number[]) => {
  try {
    const factorings = await tx.factoring.findMany({
      include: {
        contacto_aceptante: true,
        contacto_cedente: true,
        cuenta_bancaria: {
          include: {
            banco: true,
            cuenta_bancaria_estado: true,
            cuenta_tipo: true,
            moneda: true,
          },
        },
        empresa_aceptante: true,
        empresa_cedente: true,
        factoring_ejecutado: true,
        factoring_ejecutado_factoringes: true,
        factoring_estado: true,
        factoring_facturas: {
          include: {
            factura: true,
          },
        },
        factoring_historial_estados: true,
        factoring_pagos: true,
        factoring_propuesta_aceptada: {
          include: {
            factoring_tipo: true,
            factoring_propuesta_financieros: {
              include: {
                financiero_concepto: true,
                financiero_tipo: true,
              },
            },
          },
        },
        factoring_propuesta_factoringes: {
          include: {
            factoring_propuesta_estado: true,
          },
        },
        moneda: true,
      },
      where: {
        idcedente: {
          in: idcedentes,
        },
        estado: {
          in: estados,
        },
      },
    });

    const factoringsExtendido = factorings.map((factoring) => {
      if (!factoring.factoring_propuesta_aceptada) {
        return factoring;
      }

      const financieros = factoring.factoring_propuesta_aceptada.factoring_propuesta_financieros;

      // Creamos la versión extendida de la propuesta
      const propuestaExtendida = {
        ...factoring.factoring_propuesta_aceptada,
        comisiones: financieros.filter((f) => f.financiero_tipo.idfinancierotipo === 1),
        costos: financieros.filter((f) => f.financiero_tipo.idfinancierotipo === 2),
        gastos: financieros.filter((f) => f.financiero_tipo.idfinancierotipo === 3),
        gastos_excento_igv: financieros.filter((f) => f.financiero_tipo.idfinancierotipo === 4),
      };

      // Retornamos el factoring con la propuesta modificada
      return {
        ...factoring,
        factoring_propuesta_aceptada: propuestaExtendida,
      };
    });

    return factoringsExtendido;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringByRucCedenteAndCodigoFactura = async (tx: TxClient, ruc_cedente, factura_serie, factura_numero, estados: number[]) => {
  try {
    const factoring = await tx.factoring.findFirst({
      include: {
        empresa_cedente: true,
        factoring_facturas: {
          include: {
            factura: true,
          },
        },
      },
      where: {
        empresa_cedente: {
          ruc: ruc_cedente,
        },
        factoring_facturas: {
          some: {
            factura: {
              serie: factura_serie,
              numero_comprobante: factura_numero,
            },
          },
        },
        estado: {
          in: estados,
        },
      },
    });
    return factoring;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringByFactoringidAndIdcontactocedente = async (tx: TxClient, factoringid, idcontactocedete, estados: number[]) => {
  try {
    const factoring = await tx.factoring.findFirst({
      include: {
        contacto_aceptante: true,
        contacto_cedente: true,
        cuenta_bancaria: true,
        empresa_aceptante: true,
        empresa_cedente: true,
        factoring_ejecutado: true,
        factoring_ejecutado_factoringes: true,
        factoring_estado: true,
        factoring_facturas: true,
        factoring_historial_estados: true,
        factoring_pagos: true,
        factoring_propuesta_aceptada: true,
        factoring_propuesta_factoringes: true,
        moneda: true,
      },
      where: {
        idcontactocedente: idcontactocedete,
        factoringid: factoringid,
        estado: {
          in: estados,
        },
      },
    });
    //log.debug(line(),"factoring: ", factoring);
    return factoring;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsCotizacionesByIdcontactocedente = async (tx: TxClient, idcontactocedete, estados: number[]) => {
  try {
    const factorings = await tx.factoring.findMany({
      include: {
        contacto_aceptante: true,
        contacto_cedente: true,
        cuenta_bancaria: true,
        empresa_aceptante: true,
        empresa_cedente: true,
        factoring_ejecutado: true,
        factoring_ejecutado_factoringes: true,
        factoring_estado: true,
        factoring_facturas: true,
        factoring_historial_estados: true,
        factoring_pagos: true,
        factoring_propuesta_aceptada: true,
        factoring_propuesta_factoringes: true,
        moneda: true,
      },
      where: {
        estado: {
          in: estados,
        },
        idcontactocedente: idcontactocedete,
      },
    });

    return factorings;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringsByEstados = async (tx: TxClient, estados: number[]) => {
  try {
    const factorings = await tx.factoring.findMany({
      include: {
        contacto_aceptante: true,
        contacto_cedente: true,
        cuenta_bancaria: {
          include: {
            banco: true,
            cuenta_bancaria_estado: true,
            cuenta_tipo: true,
            moneda: true,
          },
        },
        empresa_aceptante: { include: { riesgo: true } },
        empresa_cedente: { include: { riesgo: true } },
        factoring_ejecutado: true,
        factoring_ejecutado_factoringes: true,
        factoring_estado: true,
        factoring_facturas: {
          include: {
            factura: true,
          },
        },
        factoring_historial_estados: true,
        factoring_pagos: true,
        factoring_propuesta_aceptada: {
          include: {
            factoring_tipo: true,
            factoring_propuesta_financieros: {
              include: {
                financiero_concepto: true,
                financiero_tipo: true,
              },
            },
          },
        },
        factoring_propuesta_factoringes: {
          include: {
            factoring_propuesta_estado: true,
          },
        },
        moneda: true,
      },
      where: {
        estado: {
          in: estados,
        },
      },
    });

    const factoringsExtendido = factorings.map((factoring) => {
      if (!factoring.factoring_propuesta_aceptada) {
        return factoring;
      }

      const financieros = factoring.factoring_propuesta_aceptada.factoring_propuesta_financieros;

      // Creamos la versión extendida de la propuesta
      const propuestaExtendida = {
        ...factoring.factoring_propuesta_aceptada,
        comisiones: financieros.filter((f) => f.financiero_tipo.idfinancierotipo === 1),
        costos: financieros.filter((f) => f.financiero_tipo.idfinancierotipo === 2),
        gastos: financieros.filter((f) => f.financiero_tipo.idfinancierotipo === 3),
        gastos_excento_igv: financieros.filter((f) => f.financiero_tipo.idfinancierotipo === 4),
      };

      // Retornamos el factoring con la propuesta modificada
      return {
        ...factoring,
        factoring_propuesta_aceptada: propuestaExtendida,
      };
    });

    return factoringsExtendido;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

/**
 * Operaciones aceptadas que todavía no tienen una factura activa del factor
 * asociada. Se usa como bandeja de trabajo para la facturación al cedente.
 */
export const getFactoringsPendientesFacturaCedente = async (tx: TxClient) => {
  try {
    return await tx.factoring.findMany({
      include: {
        empresa_cedente: true,
        factoring_facturas: {
          include: {
            factura: true,
          },
        },
        factoring_estado: true,
        factoring_propuesta_aceptada: true,
        moneda: true,
      },
      where: {
        estado: ESTADO.ACTIVO,
        idfactoringpropuestaaceptada: {
          not: null,
        },
        factoring_factura_factores: {
          none: {
            estado: ESTADO.ACTIVO,
          },
        },
      },
      orderBy: {
        fecha_operacion: "asc",
      },
    });
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringByIdfactoring = async (tx: TxClient, idfactoring: number) => {
  try {
    const factoring = await tx.factoring.findUnique({
      include: {
        contacto_aceptante: true,
        contacto_cedente: {
          include: {
            persona: true,
          },
        },
        cuenta_bancaria: {
          include: {
            banco: true,
            cuenta_bancaria_estado: true,
            cuenta_tipo: true,
            moneda: true,
          },
        },
        empresa_aceptante: true,
        empresa_cedente: true,
        factoring_ejecutado: true,
        factoring_ejecutado_factoringes: true,
        factoring_estado: true,
        factoring_facturas: {
          include: {
            factura: true,
          },
        },
        factoring_historial_estados: true,
        factoring_pagos: true,
        factoring_propuesta_aceptada: true,
        factoring_propuesta_factoringes: {
          include: {
            factoring_propuesta_estado: true,
          },
        },
        moneda: true,
      },
      where: {
        idfactoring: idfactoring,
      },
    });

    return factoring;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringByFactoringid = async (tx: TxClient, factoringid: string) => {
  try {
    const factoring = await tx.factoring.findFirst({
      include: {
        contacto_aceptante: true,
        contacto_cedente: true,
        cuenta_bancaria: true,
        empresa_aceptante: true,
        empresa_cedente: true,
        factoring_ejecutado: true,
        factoring_ejecutado_factoringes: true,
        factoring_estado: true,
        factoring_facturas: true,
        factoring_historial_estados: true,
        factoring_pagos: true,
        factoring_propuesta_aceptada: true,
        factoring_propuesta_factoringes: true,
        moneda: true,
      },
      where: {
        factoringid: factoringid,
      },
    });
    return factoring;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringPk = async (tx: TxClient, factoringid: string) => {
  try {
    const factoring = await tx.factoring.findFirst({
      select: { idfactoring: true },
      where: {
        factoringid: factoringid,
      },
    });

    return factoring;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoring = async (tx: TxClient, factoring: Prisma.factoringCreateInput) => {
  try {
    const nuevo = await tx.factoring.create({ data: factoring });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoring = async (tx: TxClient, factoringid: string, factoring: Prisma.factoringUpdateInput) => {
  try {
    const result = await tx.factoring.update({
      data: factoring,
      where: {
        factoringid: factoringid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoring = async (tx: TxClient, factoringid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factoringid: factoringid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateFactoring = async (tx: TxClient, factoringid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        factoringid: factoringid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getSplaftRegistroOperaciones = async (tx: TxClient, montoMinimo?: number) => {
  try {
    let minMonto = montoMinimo;
    if (minMonto === undefined) {
      const config = await configuracionappDao.getSplaftRegistroOperacionesMontoMinimo(tx);
      minMonto = config?.valor && !isNaN(Number(config.valor)) ? Number(config.valor) : 10000;
    }

    await tx.$executeRawUnsafe(`SET time_zone = '-05:00';`);
    const result = await tx.$queryRaw<any[]>`
SELECT 
  DATE(f.fecha_operacion) AS fecha, 
  f.code AS codigo_interno, 
  "Única" AS modalidad,
  ft.nombre AS tipo_de_operacion,
  fa.importe_bruto AS monto_total_de_la_operacion_en_la_moneda_original,
  m.codigo AS moneda_original,
  1 AS tipo_de_cambio_a_usd,
  fa.importe_bruto AS monto_total_de_la_operacion_en_usd,
  "Digital" AS lugar_donde_se_realiza_la_operacion,
  DATE(fp.fecha_pago_estimado) AS fecha_de_pago_pactada,
  "Transferencia bancaria" AS forma_de_pago,
  "Monto retenido" AS tipo_de_garantia,
  fp.monto_garantia AS monto_de_garantia,

  "Jurídica" AS ejecutante_tipo_de_persona,
  ec.razon_social AS ejecutante_razon_social,
  "RUC" AS ejecutante_tipo_de_documento,
  ec.ruc AS ejecutante_numero_de_documento,
  pc.nombrepais AS ejecutante_nacionalidad,
  CONCAT_WS(", ",ec.domicilio_fiscal, dc.nombredepartamento, prc.nombreprovincia, dic.nombredistrito) AS ejecutante_domicilio_fiscal,
  CONCAT_WS(", ",ec.domicilio_fiscal, dc.nombredepartamento, prc.nombreprovincia, dic.nombredistrito) AS ejecutante_domicilio_legal,
  "" AS ejecutante_profesion_u_ocupacion, 
  "" AS ejecutante_estado_civil_y_nombre_del_conyuge_o_conviviente,
  coc.poderpartidanumero AS ejecutante_numero_de_partida_registral_sunarp,
  dtc.nombre AS ejecutante_tipo_de_documento_de_identidad_del_representante_legal,
  coc.documentonumero AS ejecutante_numero_de_documento_de_identidad_del_representante_legal,
  CONCAT_WS(" ",coc.nombrecolaborador, coc.apellidocolaborador) AS ejecutante_nombre_del_representante_legal,
  "Sí" AS ejecutante_poder_de_representacion,

  "Jurídica" AS ordenante_tipo_de_persona,
  ec.razon_social AS ordenante_razon_social,
  "RUC" AS ordenante_tipo_de_documento,
  ec.ruc AS ordenante_numero_de_documento,
  pc.nombrepais AS ordenante_nacionalidad,
  CONCAT_WS(", ",ec.domicilio_fiscal, dc.nombredepartamento, prc.nombreprovincia, dic.nombredistrito) AS ordenante_domicilio_fiscal,
  CONCAT_WS(", ",ec.domicilio_fiscal, dc.nombredepartamento, prc.nombreprovincia, dic.nombredistrito) AS ordenante_domicilio_legal,
  "" AS ordenante_profesion_u_ocupacion, 
  "" AS ordenante_estado_civil_y_nombre_del_conyuge_o_conviviente,
  coc.poderpartidanumero AS ordenante_numero_de_partida_registral_sunarp,
  dtc.nombre AS ordenante_tipo_de_documento_de_identidad_del_representante_legal,
  coc.documentonumero AS ordenante_numero_de_documento_de_identidad_del_representante_legal,
  CONCAT_WS(" ",coc.nombrecolaborador, coc.apellidocolaborador) AS ordenante_nombre_del_representante_legal,
  "Sí" AS ordenante_poder_de_representacion,

  "Jurídica" AS beneficiario_tipo_de_persona,
  ec.razon_social AS beneficiario_razon_social,
  "RUC" AS beneficiario_tipo_de_documento,
  ec.ruc AS beneficiario_numero_de_documento,
  pc.nombrepais AS beneficiario_nacionalidad,
  CONCAT_WS(", ",ec.domicilio_fiscal, dc.nombredepartamento, prc.nombreprovincia, dic.nombredistrito) AS beneficiario_domicilio_fiscal,
  CONCAT_WS(", ",ec.domicilio_fiscal, dc.nombredepartamento, prc.nombreprovincia, dic.nombredistrito) AS beneficiario_domicilio_legal,
  "" AS beneficiario_profesion_u_ocupacion, 
  "" AS beneficiario_estado_civil_y_nombre_del_conyuge_o_conviviente,
  coc.poderpartidanumero AS beneficiario_numero_de_partida_registral_sunarp,
  dtc.nombre AS beneficiario_tipo_de_documento_de_identidad_del_representante_legal,
  coc.documentonumero AS beneficiario_numero_de_documento_de_identidad_del_representante_legal,
  CONCAT_WS(" ",coc.nombrecolaborador, coc.apellidocolaborador) AS beneficiario_nombre_del_representante_legal,
  "Sí" AS beneficiario_poder_de_representacion,

  "Jurídica" AS deudor_tipo_de_persona,
  ea.razon_social AS deudor_razon_social,
  "RUC" AS deudor_tipo_de_documento,
  ea.ruc AS deudor_numero_de_documento,
  pa.nombrepais AS deudor_nacionalidad,
  CONCAT_WS(", ",ea.domicilio_fiscal, da.nombredepartamento, pra.nombreprovincia, dia.nombredistrito) AS deudor_domicilio_fiscal,
  CONCAT_WS(", ",ea.domicilio_fiscal, da.nombredepartamento, pra.nombreprovincia, dia.nombredistrito) AS deudor_domicilio_legal,
  "" AS deudor_profesion_u_ocupacion, 
  "" AS deudor_estado_civil_y_nombre_del_conyuge_o_conviviente,
  coa.poderpartidanumero AS deudor_numero_de_partida_registral_sunarp,
  dta.nombre AS deudor_tipo_de_documento_de_identidad_del_representante_legal,
  coa.documentonumero AS deudor_numero_de_documento_de_identidad_del_representante_legal,
  CONCAT_WS(" ",coa.nombrecolaborador, coa.apellidocolaborador) AS deudor_nombre_del_representante_legal,
  "Sí" AS deudor_poder_de_representacion,
  CONCAT_WS("- ",fa.serie, fa.numero_comprobante) AS numero_factura,
  fa.fecha_emision AS fecha_de_emision,
  fa.fecha_pago_mayor_estimado AS fecha_de_vencimiento,
  fa.importe_bruto AS monto_de_la_factura

FROM factoring f
INNER JOIN empresa ea ON ea._idempresa= f._idaceptante
  LEFT JOIN pais pa ON ea._idpaissede = pa._idpais
  LEFT JOIN departamento da ON ea._iddepartamentosede = da._iddepartamento
  LEFT JOIN provincia pra ON ea._idprovinciasede = pra._idprovincia
  LEFT JOIN distrito dia ON ea._iddistritosede = dia._iddistrito
    LEFT JOIN colaborador coa ON coa._idcolaboradortipo=1 AND coa._idempresa = ea._idempresa
    LEFT JOIN documento_tipo dta ON dta._iddocumentotipo = coa._iddocumentotipo
INNER JOIN empresa ec ON ec._idempresa= f._idcedente
  LEFT JOIN pais pc ON ec._idpaissede = pc._idpais
  LEFT JOIN departamento dc ON ec._iddepartamentosede = dc._iddepartamento
  LEFT JOIN provincia prc ON ec._idprovinciasede = prc._idprovincia
  LEFT JOIN distrito dic ON ec._iddistritosede = dic._iddistrito
    LEFT JOIN colaborador coc ON coc._idcolaboradortipo=1 AND coc._idempresa = ec._idempresa
    LEFT JOIN documento_tipo dtc ON dtc._iddocumentotipo = coc._iddocumentotipo
INNER JOIN moneda m ON m._idmoneda = f._idmoneda
INNER JOIN factoring_estado fe ON fe._idfactoringestado = f._idfactoringestado
INNER JOIN factoring_propuesta fp ON fp._idfactoringpropuesta = f._idfactoringpropuestaaceptada
INNER JOIN factoring_factura ff ON ff._idfactoring = f._idfactoring
INNER JOIN factura fa ON fa._idfactura = ff._idfactura
INNER JOIN factoring_tipo ft ON ft._idfactoringtipo = fp._idfactoringtipo
INNER JOIN factoring_liquidacion fl ON fl._idfactoring = f._idfactoring
INNER JOIN factoring_liquidacion_estado fle ON fle._idfactoringliquidacionestado = fl._idfactoringliquidacionestado
LEFT JOIN factoring_factura_factor fff ON fff._idfactoring = f._idfactoring
LEFT JOIN factura faf ON faf._idfactura = fff._idfactura
LEFT JOIN factura_estado fae ON fae._idfacturaestado = fff._idfacturaestado
LEFT JOIN detraccion_estado dee ON dee._iddetraccionestado = fff._iddetraccionestado
WHERE fa.importe_bruto >= ${minMonto}
ORDER BY f.fecha_operacion
    `;

    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
