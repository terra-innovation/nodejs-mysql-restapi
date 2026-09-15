/**
 * apisperu.service.ts
 * Servicio para consultar las APIs de Apis Perú (Tipo de Cambio SUNAT y SBS).
 */
import { apisPeruClient } from "./apisperu.client.js";
import type {
  ApisPeruCombinedResponse,
  ApisPeruExchangeRateParams,
  ApisPeruExchangeResponse,
  ApisPeruHistoryParams,
  ApisPeruHistoryResponse,
} from "./apisperu.types.js";

/**
 * Función auxiliar para formatear mes y año en un rango de fechas ISO (from y to)
 */
function getMonthDateRange(month: number, year: number): { from: string; to: string } {
  const mm = String(month).padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();
  const dd = String(lastDay).padStart(2, "0");
  return {
    from: `${year}-${mm}-01`,
    to: `${year}-${mm}-${dd}`,
  };
}

export class ApisPeruService {
  // ============================================================================
  // SUNAT
  // ============================================================================

  /**
   * Consulta el tipo de cambio de la SUNAT.
   * Permite consultar sin parámetros (último disponible) o por fecha (date=YYYY-MM-DD).
   */
  public async getTipoCambioSunat(
    params?: ApisPeruExchangeRateParams
  ): Promise<ApisPeruExchangeResponse> {
    const response = await apisPeruClient.get<ApisPeruExchangeResponse>("/sunat", { params });
    return response.data;
  }

  /**
   * Obtiene el tipo de cambio de la SUNAT más reciente disponible.
   */
  public async getTipoCambioSunatHoy(): Promise<ApisPeruExchangeResponse> {
    return await this.getTipoCambioSunat();
  }

  /**
   * Obtiene el tipo de cambio de la SUNAT para una fecha específica.
   * @param date Fecha en formato YYYY-MM-DD
   */
  public async getTipoCambioSunatPorFecha(date: string): Promise<ApisPeruExchangeResponse> {
    return await this.getTipoCambioSunat({ date });
  }

  /**
   * Consulta el historial de tipo de cambio SUNAT en un rango de fechas.
   * @param from Fecha inicial (YYYY-MM-DD)
   * @param to Fecha final (YYYY-MM-DD)
   */
  public async getTipoCambioSunatHistorial(
    from: string,
    to: string
  ): Promise<ApisPeruHistoryResponse> {
    const params: ApisPeruHistoryParams = { from, to };
    const response = await apisPeruClient.get<ApisPeruHistoryResponse>("/sunat/historial", {
      params,
    });
    return response.data;
  }

  /**
   * Obtiene los tipos de cambio de la SUNAT correspondientes a un mes completo.
   * @param month Mes del 1 al 12
   * @param year Año de 4 dígitos (ej. 2026)
   */
  public async getTipoCambioSunatPorMes(
    month: number,
    year: number
  ): Promise<ApisPeruHistoryResponse> {
    const { from, to } = getMonthDateRange(month, year);
    return await this.getTipoCambioSunatHistorial(from, to);
  }

  // ============================================================================
  // SBS
  // ============================================================================

  /**
   * Consulta el tipo de cambio de la SBS.
   * Permite consultar sin parámetros (último disponible) o por fecha (date=YYYY-MM-DD).
   */
  public async getTipoCambioSbs(
    params?: ApisPeruExchangeRateParams
  ): Promise<ApisPeruExchangeResponse> {
    const response = await apisPeruClient.get<ApisPeruExchangeResponse>("/sbs", { params });
    return response.data;
  }

  /**
   * Obtiene el tipo de cambio de la SBS más reciente disponible.
   */
  public async getTipoCambioSbsHoy(): Promise<ApisPeruExchangeResponse> {
    return await this.getTipoCambioSbs();
  }

  /**
   * Obtiene el tipo de cambio de la SBS para una fecha específica.
   * @param date Fecha en formato YYYY-MM-DD
   */
  public async getTipoCambioSbsPorFecha(date: string): Promise<ApisPeruExchangeResponse> {
    return await this.getTipoCambioSbs({ date });
  }

  /**
   * Consulta el historial de tipo de cambio SBS en un rango de fechas.
   * @param from Fecha inicial (YYYY-MM-DD)
   * @param to Fecha final (YYYY-MM-DD)
   */
  public async getTipoCambioSbsHistorial(
    from: string,
    to: string
  ): Promise<ApisPeruHistoryResponse> {
    const params: ApisPeruHistoryParams = { from, to };
    const response = await apisPeruClient.get<ApisPeruHistoryResponse>("/sbs/historial", {
      params,
    });
    return response.data;
  }

  /**
   * Obtiene los tipos de cambio de la SBS correspondientes a un mes completo.
   * @param month Mes del 1 al 12
   * @param year Año de 4 dígitos (ej. 2026)
   */
  public async getTipoCambioSbsPorMes(
    month: number,
    year: number
  ): Promise<ApisPeruHistoryResponse> {
    const { from, to } = getMonthDateRange(month, year);
    return await this.getTipoCambioSbsHistorial(from, to);
  }

  // ============================================================================
  // COMBINADO (SBS + SUNAT)
  // ============================================================================

  /**
   * Consulta SBS y SUNAT de forma combinada en una sola petición.
   * @param date Fecha en formato YYYY-MM-DD (opcional)
   */
  public async getTipoCambioTodos(date?: string): Promise<ApisPeruCombinedResponse> {
    const params: ApisPeruExchangeRateParams | undefined = date ? { date } : undefined;
    const response = await apisPeruClient.get<ApisPeruCombinedResponse>("/todos", { params });
    return response.data;
  }
}

// Instancia singleton para importación directa
export const apisPeruService = new ApisPeruService();

// Exportación de funciones independientes para mayor flexibilidad
export const getTipoCambioSunat = (params?: ApisPeruExchangeRateParams) =>
  apisPeruService.getTipoCambioSunat(params);

export const getTipoCambioSunatHoy = () =>
  apisPeruService.getTipoCambioSunatHoy();

export const getTipoCambioSunatPorFecha = (date: string) =>
  apisPeruService.getTipoCambioSunatPorFecha(date);

export const getTipoCambioSunatHistorial = (from: string, to: string) =>
  apisPeruService.getTipoCambioSunatHistorial(from, to);

export const getTipoCambioSunatPorMes = (month: number, year: number) =>
  apisPeruService.getTipoCambioSunatPorMes(month, year);

export const getTipoCambioSbs = (params?: ApisPeruExchangeRateParams) =>
  apisPeruService.getTipoCambioSbs(params);

export const getTipoCambioSbsHoy = () =>
  apisPeruService.getTipoCambioSbsHoy();

export const getTipoCambioSbsPorFecha = (date: string) =>
  apisPeruService.getTipoCambioSbsPorFecha(date);

export const getTipoCambioSbsHistorial = (from: string, to: string) =>
  apisPeruService.getTipoCambioSbsHistorial(from, to);

export const getTipoCambioSbsPorMes = (month: number, year: number) =>
  apisPeruService.getTipoCambioSbsPorMes(month, year);

export const getTipoCambioTodos = (date?: string) =>
  apisPeruService.getTipoCambioTodos(date);
