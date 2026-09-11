/**
 * decolecta.service.ts
 * Servicio para consultar las APIs de Decolecta (Tipo de Cambio SUNAT, SBS y consultas RUC).
 */
import { decolectaClient } from "./decolecta.client.js";
import type {
  DecolectaSbsAccountingExchangeRate,
  DecolectaSbsAccountingParams,
  DecolectaSbsAverageExchangeRate,
  DecolectaSbsAverageParams,
  DecolectaSbsCurrency,
  DecolectaSunatExchangeRate,
  DecolectaSunatExchangeRateParams,
  DecolectaSunatRucBasic,
  DecolectaSunatRucFull,
} from "./decolecta.types.js";

export class DecolectaService {
  /**
   * Consulta el tipo de cambio de la SUNAT.
   * Permite consultar sin parámetros (último/hoy), por fecha (date=YYYY-MM-DD), o mensual (month y year).
   */
  public async getTipoCambioSunat(
    params?: DecolectaSunatExchangeRateParams
  ): Promise<DecolectaSunatExchangeRate | DecolectaSunatExchangeRate[]> {
    const response = await decolectaClient.get<
      DecolectaSunatExchangeRate | DecolectaSunatExchangeRate[]
    >("/tipo-cambio/sunat", { params });
    return response.data;
  }

  /**
   * Obtiene el tipo de cambio de la SUNAT más reciente o del día de hoy.
   */
  public async getTipoCambioSunatHoy(): Promise<DecolectaSunatExchangeRate> {
    const data = await this.getTipoCambioSunat();
    return Array.isArray(data) ? data[0] : data;
  }

  /**
   * Obtiene el tipo de cambio de la SUNAT para una fecha específica (YYYY-MM-DD).
   * @param date Fecha en formato YYYY-MM-DD
   */
  public async getTipoCambioSunatPorFecha(date: string): Promise<DecolectaSunatExchangeRate> {
    const data = await this.getTipoCambioSunat({ date });
    return Array.isArray(data) ? data[0] : data;
  }

  /**
   * Obtiene los tipos de cambio de la SUNAT correspondientes a un mes completo.
   * @param month Mes del 1 al 12
   * @param year Año de 4 dígitos (ej. 2025)
   */
  public async getTipoCambioSunatPorMes(
    month: number,
    year: number
  ): Promise<DecolectaSunatExchangeRate[]> {
    const data = await this.getTipoCambioSunat({ month, year });
    return Array.isArray(data) ? data : [data];
  }

  /**
   * Consulta el tipo de cambio PROMEDIO publicado por la SBS.
   * Permite filtrar por moneda (USD, EUR, etc.), fecha o mes.
   */
  public async getTipoCambioSbsPromedio(
    params: DecolectaSbsAverageParams
  ): Promise<DecolectaSbsAverageExchangeRate | DecolectaSbsAverageExchangeRate[]> {
    const response = await decolectaClient.get<
      DecolectaSbsAverageExchangeRate | DecolectaSbsAverageExchangeRate[]
    >("/tipo-cambio/sbs/average", { params });
    return response.data;
  }

  /**
   * Obtiene el tipo de cambio SBS Promedio para una moneda y fecha específica (o más reciente si no se pasa fecha).
   * @param currency Moneda base (por defecto 'USD')
   * @param date Fecha en formato YYYY-MM-DD (opcional)
   */
  public async getTipoCambioSbsPromedioPorFecha(
    currency: DecolectaSbsCurrency = "USD",
    date?: string
  ): Promise<DecolectaSbsAverageExchangeRate> {
    const data = await this.getTipoCambioSbsPromedio({ currency, date });
    return Array.isArray(data) ? data[0] : data;
  }

  /**
   * Obtiene el tipo de cambio SBS Promedio para una moneda durante un mes determinado.
   * @param currency Moneda base (ej. 'USD', 'EUR')
   * @param month Mes del 1 al 12
   * @param year Año de 4 dígitos
   */
  public async getTipoCambioSbsPromedioPorMes(
    currency: DecolectaSbsCurrency = "USD",
    month: number,
    year: number
  ): Promise<DecolectaSbsAverageExchangeRate[]> {
    const data = await this.getTipoCambioSbsPromedio({ currency, month, year });
    return Array.isArray(data) ? data : [data];
  }

  /**
   * Consulta el tipo de cambio CONTABLE publicado por la SBS.
   * @param currency Moneda base (por defecto 'USD')
   * @param date Fecha en formato YYYY-MM-DD (opcional)
   */
  public async getTipoCambioSbsContable(
    currency: DecolectaSbsCurrency = "USD",
    date?: string
  ): Promise<DecolectaSbsAccountingExchangeRate> {
    const params: DecolectaSbsAccountingParams = { currency, date };
    const response = await decolectaClient.get<DecolectaSbsAccountingExchangeRate>(
      "/tipo-cambio/sbs/accounting",
      { params }
    );
    return response.data;
  }

  /**
   * Consulta la información básica de un RUC ante SUNAT.
   * @param numero Número de RUC de 11 dígitos
   */
  public async getSunatRuc(numero: string): Promise<DecolectaSunatRucBasic> {
    const response = await decolectaClient.get<DecolectaSunatRucBasic>("/sunat/ruc", {
      params: { numero },
    });
    return response.data;
  }

  /**
   * Consulta la información avanzada/completa de un RUC ante SUNAT.
   * @param numero Número de RUC de 11 dígitos
   */
  public async getSunatRucFull(numero: string): Promise<DecolectaSunatRucFull> {
    const response = await decolectaClient.get<DecolectaSunatRucFull>("/sunat/ruc/full", {
      params: { numero },
    });
    return response.data;
  }
}

// Instancia singleton para importación directa
export const decolectaService = new DecolectaService();

// Exportación de funciones independientes para mayor flexibilidad
export const getTipoCambioSunat = (params?: DecolectaSunatExchangeRateParams) =>
  decolectaService.getTipoCambioSunat(params);

export const getTipoCambioSunatHoy = () =>
  decolectaService.getTipoCambioSunatHoy();

export const getTipoCambioSunatPorFecha = (date: string) =>
  decolectaService.getTipoCambioSunatPorFecha(date);

export const getTipoCambioSunatPorMes = (month: number, year: number) =>
  decolectaService.getTipoCambioSunatPorMes(month, year);

export const getTipoCambioSbsPromedio = (params: DecolectaSbsAverageParams) =>
  decolectaService.getTipoCambioSbsPromedio(params);

export const getTipoCambioSbsPromedioPorFecha = (currency: DecolectaSbsCurrency = "USD", date?: string) =>
  decolectaService.getTipoCambioSbsPromedioPorFecha(currency, date);

export const getTipoCambioSbsPromedioPorMes = (
  currency: DecolectaSbsCurrency = "USD",
  month: number,
  year: number
) => decolectaService.getTipoCambioSbsPromedioPorMes(currency, month, year);

export const getTipoCambioSbsContable = (currency: DecolectaSbsCurrency = "USD", date?: string) =>
  decolectaService.getTipoCambioSbsContable(currency, date);

export const getSunatRuc = (numero: string) =>
  decolectaService.getSunatRuc(numero);

export const getSunatRucFull = (numero: string) =>
  decolectaService.getSunatRucFull(numero);
