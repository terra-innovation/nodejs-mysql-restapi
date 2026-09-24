import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";

import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringestadoDao from "#root/src/daos/factoringestado.Dao.js";
import * as factoringtipoDao from "#root/src/daos/factoringtipo.Dao.js";
import * as riesgoDao from "#root/src/daos/riesgo.Dao.js";
import * as sunattipocambioDao from "#src/daos/sunattipocambio.Dao.js";
import * as tipocambioLogic from "#src/logics/tipocambio.Logic.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as df from "#src/utils/dateUtils.js";

export const getFactoringMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringsMaster");
  const filter_estados = [ESTADO.ACTIVO];

  const factoringsMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const factoringtipos = await factoringtipoDao.getFactoringtipos(tx, filter_estados);
      const factoringestados = await factoringestadoDao.getFactoringestados(tx, filter_estados);
      const riesgos = await riesgoDao.getRiesgos(tx, filter_estados);

      var factoringsMaster: Record<string, any> = {};
      factoringsMaster.factoringtipos = factoringtipos;
      factoringsMaster.factoringestados = factoringestados;
      factoringsMaster.riesgos = riesgos;

      return factoringsMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factoringsMasterFiltered);
};

export const getFactorings = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactorings");
  const factorings = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1, 2];
      const factorings = await factoringDao.getFactoringsByEstados(tx, filter_estados);
      return factorings;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, factorings);
};

export const getFactoringsPendientesFacturaCedente = async (_req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringsPendientesFacturaCedente");

  const factorings = await prismaFT.client.$transaction(
    async (tx) => factoringDao.getFactoringsPendientesFacturaCedente(tx),
    { timeout: prismaFT.transactionTimeout },
  );

  response(res, 200, factorings);
};

/**
 * Obtiene los datos calculados y formateados para la pre-factura SUNAT
 * de una operación de factoring pendiente de facturación al cedente.
 * GET /api/v1/financiero/servicio/factoring/factoring/pre-factura/:factoringid
 */
export const getPreFacturaCedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPreFacturaCedente");
  const { factoringid } = req.params;
  const { fecha_emision } = req.query;

  if (!factoringid || typeof factoringid !== "string" || factoringid.trim() === "") {
    throw new ClientError("El parámetro factoringid es requerido", 400);
  }

  const fechaEmisionStr = fecha_emision ? String(fecha_emision).trim() : df.formatDateToYMD(df.getNowLima());
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaEmisionStr)) {
    throw new ClientError("Formato de fecha de emisión inválido. Formato requerido: YYYY-MM-DD", 400);
  }

  const fechaParsed = df.parseDateUtcMidnight(fechaEmisionStr);

  const preFactura = await prismaFT.client.$transaction(
    async (tx) => {
      // 1. Cargar operación de factoring con sus includes necesarios
      const factoring = await tx.factoring.findFirst({
        where: {
          factoringid: factoringid.trim(),
          estado: ESTADO.ACTIVO,
        },
        include: {
          moneda: true,
          empresa_cedente: true,
          factor: true,
          factoring_propuesta_aceptada: {
            include: {
              factoring_propuesta_financieros: {
                where: {
                  estado: ESTADO.ACTIVO,
                },
                include: {
                  financiero_concepto: true,
                  financiero_tipo: true,
                },
              },
            },
          },
        },
      });

      if (!factoring) {
        throw new ClientError("Operación de factoring no encontrada", 404);
      }

      if (!factoring.factoring_propuesta_aceptada) {
        throw new ClientError("La operación de factoring no tiene una propuesta aceptada registrada", 422);
      }

      // 2. Resolver monedas y consultar T/C SUNAT exacto (sin fallback)
      const { monedaBase, monedaCotizada } = await tipocambioLogic.resolverMonedas(tx, "USD", "PEN");
      const tipoCambio = await sunattipocambioDao.getSunatTipoCambioByFecha(
        tx,
        fechaParsed,
        monedaBase.idmoneda,
        monedaCotizada.idmoneda,
        [ESTADO.ACTIVO],
      );

      if (!tipoCambio) {
        throw new ClientError(
          "No se puede mostrar la pre-factura porque no existe un tipo de cambio de la SUNAT registrado para la fecha seleccionada.",
          422,
        );
      }

      // 3. Extraer ítems gravados con IGV (Tipos 1: Comisión, 2: Costo, 3: Gasto)
      const todosFinancieros = factoring.factoring_propuesta_aceptada.factoring_propuesta_financieros || [];
      const financierosGravados = todosFinancieros.filter((f) => [1, 2, 3].includes(f.financiero_tipo?.idfinancierotipo));

      const items_factura = financierosGravados.map((item) => ({
        descripcion: (item.financiero_concepto?.alias || item.financiero_concepto?.nombre || "Comisión").toUpperCase(),
        monto: new Prisma.Decimal(item.monto),
        porcentaje_monto: item.porcentaje_monto ? new Prisma.Decimal(item.porcentaje_monto) : null,
        tipo: item.financiero_tipo?.nombre || "",
      }));

      // Paso 1: Sub Total (Valor de Venta Neto) = Suma de conceptos gravados
      let valor_venta_neto = items_factura.reduce((acc, it) => acc.add(it.monto), new Prisma.Decimal(0));
      valor_venta_neto = new Prisma.Decimal(valor_venta_neto.toFixed(2));

      // Paso 2: IGV tomado directamente de la propuesta aceptada (NO se recalcula)
      let monto_igv = new Prisma.Decimal(factoring.factoring_propuesta_aceptada.monto_total_igv || 0);
      monto_igv = new Prisma.Decimal(monto_igv.toFixed(2));

      // Paso 3: Importe Total de la Factura = Sub Total + IGV
      let importe_total = valor_venta_neto.add(monto_igv);
      importe_total = new Prisma.Decimal(importe_total.toFixed(2));

      // Paso 4: Homologación a Moneda Nacional para Validación del SPOT
      const tipo_cambio_venta = new Prisma.Decimal(tipoCambio.precio_venta);
      const isUsd = factoring.moneda?.codigo?.toUpperCase() === "USD";
      let importe_total_soles: Prisma.Decimal;

      if (isUsd) {
        importe_total_soles = importe_total.mul(tipo_cambio_venta);
      } else {
        importe_total_soles = importe_total;
      }
      importe_total_soles = new Prisma.Decimal(importe_total_soles.toFixed(2));

      // Paso 5: Evaluación y Cálculo de la Detracción (SPOT)
      const UMBRAL_DETRACCION_SOLES = new Prisma.Decimal("700.00");
      const TASA_DETRACCION = new Prisma.Decimal("0.12");
      let estado_detraccion: "APLICA" | "NO APLICA";
      let monto_detraccion_soles: number;

      if (importe_total_soles.greaterThan(UMBRAL_DETRACCION_SOLES)) {
        estado_detraccion = "APLICA";
        monto_detraccion_soles = Math.round(Number(importe_total_soles.mul(TASA_DETRACCION)));
      } else {
        estado_detraccion = "NO APLICA";
        monto_detraccion_soles = 0;
      }

      // Paso 6: Determinación del Monto Neto Pendiente de Pago
      let neto_pendiente_pago: Prisma.Decimal;
      if (estado_detraccion === "APLICA") {
        if (isUsd) {
          const detraccionUsd = new Prisma.Decimal(monto_detraccion_soles).div(tipo_cambio_venta);
          neto_pendiente_pago = importe_total.sub(detraccionUsd);
        } else {
          neto_pendiente_pago = importe_total.sub(new Prisma.Decimal(monto_detraccion_soles));
        }
      } else {
        neto_pendiente_pago = importe_total;
      }
      neto_pendiente_pago = new Prisma.Decimal(neto_pendiente_pago.toFixed(2));

      const monedaSimbolo = factoring.moneda?.simbolo || (isUsd ? "$" : "S/");

      // Estructura extendida de propuesta para la Sección 1 de la UI
      const propuestaExtendida = {
        ...factoring.factoring_propuesta_aceptada,
        comisiones: todosFinancieros.filter((f) => f.financiero_tipo?.idfinancierotipo === 1),
        costos: todosFinancieros.filter((f) => f.financiero_tipo?.idfinancierotipo === 2),
        gastos: todosFinancieros.filter((f) => f.financiero_tipo?.idfinancierotipo === 3),
        gastos_excento_igv: todosFinancieros.filter((f) => f.financiero_tipo?.idfinancierotipo === 4),
      };

      const fecha_pago_confirmado = factoring.factoring_propuesta_aceptada.fecha_pago_estimado;

      // Objeto de Trazabilidad explicativo paso a paso (Sección 3)
      const trazabilidad = {
        paso1: {
          numero: 1,
          campo_bd: "comisiones + costos + gastos",
          titulo: "Paso 1: Cálculo del Sub Total (Valor de Venta Neto)",
          formula: `Valor Venta Neto = ${items_factura.map((i) => i.descripcion).join(" + ") || "Sin conceptos"}`,
          detalle: `${items_factura.map((i) => `${monedaSimbolo} ${i.monto.toFixed(2)}`).join(" + ") || "0.00"} = ${monedaSimbolo} ${valor_venta_neto.toFixed(2)}`,
          resultado: Number(valor_venta_neto.toFixed(2)),
        },
        paso2: {
          numero: 2,
          campo_bd: "factoring_propuesta_aceptada.monto_total_igv",
          titulo: "Paso 2: Obtención del IGV",
          formula: "Monto IGV = Tomado directamente de la propuesta aceptada",
          detalle: `${monedaSimbolo} ${monto_igv.toFixed(2)}`,
          resultado: Number(monto_igv.toFixed(2)),
        },
        paso3: {
          numero: 3,
          campo_bd: "valor_venta_neto + monto_igv",
          titulo: "Paso 3: Cálculo del Importe Total de la Factura",
          formula: "Importe Total = Valor Venta Neto + Monto IGV",
          detalle: `${monedaSimbolo} ${valor_venta_neto.toFixed(2)} + ${monedaSimbolo} ${monto_igv.toFixed(2)} = ${monedaSimbolo} ${importe_total.toFixed(2)}`,
          resultado: Number(importe_total.toFixed(2)),
        },
        paso4: {
          numero: 4,
          campo_bd: isUsd ? "importe_total * sunat_tipo_cambio.precio_venta" : "importe_total",
          titulo: "Paso 4: Homologación a Moneda Nacional para Validación del SPOT",
          formula: isUsd ? "Importe Total Soles = Importe Total (USD) × Tipo de Cambio Venta SUNAT" : "Importe Total Soles = Importe Total (PEN)",
          detalle: isUsd
            ? `$ ${importe_total.toFixed(2)} × ${tipo_cambio_venta.toFixed(4)} = S/ ${importe_total_soles.toFixed(2)}`
            : `S/ ${importe_total.toFixed(2)} = S/ ${importe_total_soles.toFixed(2)}`,
          resultado: Number(importe_total_soles.toFixed(2)),
        },
        paso5: {
          numero: 5,
          campo_bd: "Redondear_Entero(importe_total_soles * 0.12)",
          titulo: "Paso 5: Evaluación y Cálculo de la Detracción (SPOT)",
          formula: "Umbral: S/ 700.00 | Tasa SPOT: 12% | Rubro: 037 - Demás servicios gravados con el IGV",
          detalle:
            estado_detraccion === "APLICA"
              ? `S/ ${importe_total_soles.toFixed(2)} > S/ 700.00 → APLICA detracción. Redondear_Entero(S/ ${importe_total_soles.toFixed(2)} × 12%) = S/ ${monto_detraccion_soles}`
              : `S/ ${importe_total_soles.toFixed(2)} ≤ S/ 700.00 → NO APLICA detracción. Monto = S/ 0`,
          resultado: monto_detraccion_soles,
          aplica: estado_detraccion === "APLICA",
        },
        paso6: {
          numero: 6,
          campo_bd: isUsd ? "importe_total - (monto_detraccion_soles / precio_venta)" : "importe_total - monto_detraccion_soles",
          titulo: "Paso 6: Determinación del Monto Neto Pendiente de Pago",
          formula:
            estado_detraccion === "APLICA"
              ? isUsd
                ? "Neto = Importe Total (USD) - (Monto Detracción Soles / T/C Venta SUNAT)"
                : "Neto = Importe Total (PEN) - Monto Detracción Soles"
              : "Neto = Importe Total",
          detalle:
            estado_detraccion === "APLICA"
              ? isUsd
                ? `$ ${importe_total.toFixed(2)} - (S/ ${monto_detraccion_soles} / ${tipo_cambio_venta.toFixed(4)}) = $ ${neto_pendiente_pago.toFixed(2)}`
                : `S/ ${importe_total.toFixed(2)} - S/ ${monto_detraccion_soles} = S/ ${neto_pendiente_pago.toFixed(2)}`
              : `${monedaSimbolo} ${importe_total.toFixed(2)} = ${monedaSimbolo} ${neto_pendiente_pago.toFixed(2)}`,
          resultado: Number(neto_pendiente_pago.toFixed(2)),
        },
      };

      return {
        cabecera: {
          factor: {
            idfactor: factoring.factor?.idfactor,
            ruc: factoring.factor?.ruc,
            razon_social: factoring.factor?.razon_social,
            domicilio_fiscal: factoring.factor?.domicilio_fiscal,
            direccion_sede: factoring.factor?.direccion_sede,
          },
          cedente: {
            idempresa: factoring.empresa_cedente?.idempresa,
            ruc: factoring.empresa_cedente?.ruc,
            razon_social: factoring.empresa_cedente?.razon_social,
            domicilio_fiscal: factoring.empresa_cedente?.domicilio_fiscal,
            direccion_sede: factoring.empresa_cedente?.direccion_sede,
          },
          moneda: {
            idmoneda: factoring.moneda?.idmoneda,
            codigo: factoring.moneda?.codigo,
            nombre: factoring.moneda?.nombre,
            simbolo: factoring.moneda?.simbolo,
          },
          operacion_code: factoring.code,
          fecha_emision: fechaEmisionStr,
          tipo_cambio: {
            fecha: df.formatDateToYMD(tipoCambio.fecha),
            precio_compra: Number(tipoCambio.precio_compra),
            precio_venta: Number(tipoCambio.precio_venta),
          },
        },
        factoring: {
          idfactoring: factoring.idfactoring,
          factoringid: factoring.factoringid,
          code: factoring.code,
          fecha_operacion: factoring.fecha_operacion,
          monto_neto: Number(factoring.monto_neto),
          moneda: factoring.moneda,
          empresa_cedente: factoring.empresa_cedente,
          factor: factoring.factor,
          factoring_propuesta_aceptada: propuestaExtendida,
        },
        items_factura: items_factura.map((it) => ({
          descripcion: it.descripcion,
          monto: Number(it.monto.toFixed(2)),
          porcentaje_monto: it.porcentaje_monto ? Number(it.porcentaje_monto) : null,
          tipo: it.tipo,
        })),
        totales: {
          valor_venta_neto: Number(valor_venta_neto.toFixed(2)),
          monto_igv: Number(monto_igv.toFixed(2)),
          importe_total: Number(importe_total.toFixed(2)),
          importe_total_soles: Number(importe_total_soles.toFixed(2)),
        },
        detraccion: {
          estado: estado_detraccion,
          rubro: "037 - Demás servicios gravados con el IGV",
          tasa_porcentaje: 12.0,
          monto_soles: monto_detraccion_soles,
          umbral_soles: 700.0,
          importe_total_soles_referencia: Number(importe_total_soles.toFixed(2)),
        },
        cuota: {
          numero: 1,
          neto_pendiente_pago: Number(neto_pendiente_pago.toFixed(2)),
          fecha_pago: fecha_pago_confirmado,
        },
        trazabilidad,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );

  response(res, 200, preFactura);
};
