/**
 * apisperu.types.ts
 * Definición de tipos e interfaces para la API de Apis Perú (Tipo de Cambio SUNAT y SBS)
 * Documentación oficial: https://tipocambio.apisperu.com/doc
 */

/**
 * Códigos de monedas soportadas por Apis Perú (ej. 'USD', 'EUR', 'CAD')
 */
export type ApisPeruCurrency = "USD" | "EUR" | "CAD" | string;

/**
 * Origen de los datos (fuente oficial)
 */
export type ApisPeruSource = "SBS" | "SUNAT" | string;

/**
 * Parámetros para consultas puntuales por fecha
 */
export interface ApisPeruExchangeRateParams {
  /** Fecha exacta a consultar en formato ISO (YYYY-MM-DD). Si no se envía, retorna el último disponible. */
  date?: string;
}

/**
 * Parámetros para consultas históricas por rango de fechas
 */
export interface ApisPeruHistoryParams {
  /** Fecha inicial del rango (YYYY-MM-DD), inclusive. */
  from: string;
  /** Fecha final del rango (YYYY-MM-DD), inclusive. Máximo 366 días desde 'from'. */
  to: string;
}

/**
 * Parámetros para consulta mensual
 */
export interface ApisPeruMonthParams {
  /** Mes del 1 al 12 */
  month: number;
  /** Año de 4 dígitos (ej: 2026) */
  year: number;
}

/**
 * Detalle de tipo de cambio para una moneda específica
 */
export interface ApisPeruRateItem {
  /** Nombre descriptivo de la moneda (ej. "Dólar de N.A.", "Euro") */
  name: string;
  /** Precio de compra */
  buy: string;
  /** Precio de venta */
  sell: string;
}

/**
 * Mapa de tasas indexado por el código de moneda (ej: 'USD', 'EUR', 'CAD')
 */
export type ApisPeruRatesMap = Record<string, ApisPeruRateItem>;

/**
 * Respuesta individual de Tipo de Cambio (SBS o SUNAT)
 */
export interface ApisPeruExchangeResponse {
  /** Indica si la consulta fue exitosa */
  success: boolean;
  /** Mensaje de error o informativo (solo cuando success es false o información adicional) */
  message?: string;
  /** Fecha del tipo de cambio en formato YYYY-MM-DD */
  date?: string;
  /** Fuente oficial (SBS o SUNAT) */
  source?: ApisPeruSource;
  /** Tasas de cambio disponibles por moneda */
  rates?: ApisPeruRatesMap;
}

/**
 * Registro diario dentro del historial de tasas
 */
export interface ApisPeruDailyRate {
  /** Fecha en formato YYYY-MM-DD */
  date: string;
  /** Tasas de cambio registradas en esa fecha */
  rates: ApisPeruRatesMap;
}

/**
 * Respuesta de consultas de Historial (/api/v1/sbs/historial y /api/v1/sunat/historial)
 */
export interface ApisPeruHistoryResponse {
  /** Indica si la consulta fue exitosa */
  success: boolean;
  /** Mensaje explicativo en caso de error o advertencia */
  message?: string;
  /** Fuente oficial consultada (SBS o SUNAT) */
  source?: ApisPeruSource;
  /** Fecha de inicio del rango consultado (YYYY-MM-DD) */
  from?: string;
  /** Fecha de fin del rango consultado (YYYY-MM-DD) */
  to?: string;
  /** Lista de registros diarios encontrados */
  data?: ApisPeruDailyRate[];
}

/**
 * Respuesta combinada SBS + SUNAT (/api/v1/todos)
 */
export interface ApisPeruCombinedResponse {
  /** Indica si la operación global fue exitosa */
  success: boolean;
  /** Resultado para SBS */
  sbs?: ApisPeruExchangeResponse;
  /** Resultado para SUNAT */
  sunat?: ApisPeruExchangeResponse;
}

/**
 * Respuesta de error devuelta por la API de Apis Perú
 */
export interface ApisPeruApiErrorResponse {
  success?: boolean;
  message?: string;
  source?: string;
  from?: string;
  to?: string;
}
