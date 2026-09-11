/**
 * decolecta.types.ts
 * Definición de tipos e interfaces para la API de Decolecta (SUNAT, SBS, etc.)
 * Documentación oficial:
 * - SUNAT: https://decolecta.gitbook.io/docs/servicios/integrations
 * - SBS: https://decolecta.gitbook.io/docs/servicios/integrations-1
 */

/**
 * Códigos de monedas soportadas por SBS (ej. 'USD', 'EUR')
 */
export type DecolectaSbsCurrency = "USD" | "EUR" | string;

/**
 * Parámetros de consulta para Tipo de Cambio SUNAT
 */
export interface DecolectaSunatExchangeRateParams {
  /** Fecha en formato ISO (YYYY-MM-DD) */
  date?: string;
  /** Mes del 1 al 12 */
  month?: number;
  /** Año de 4 dígitos (ej: 2025) */
  year?: number;
}

/**
 * Respuesta individual de Tipo de Cambio SUNAT
 */
export interface DecolectaSunatExchangeRate {
  /** Precio de compra */
  buy_price: string;
  /** Precio de venta */
  sell_price: string;
  /** Moneda base (para SUNAT siempre es 'USD') */
  base_currency: string;
  /** Moneda cotizada (siempre es 'PEN') */
  quote_currency: string;
  /** Fecha correspondiente en formato ISO (YYYY-MM-DD) */
  date: string;
}

/**
 * Parámetros de consulta para Tipo de Cambio SBS Promedio
 */
export interface DecolectaSbsAverageParams {
  /** Código de moneda (ej: 'USD', 'EUR') */
  currency: DecolectaSbsCurrency;
  /** Fecha en formato ISO (YYYY-MM-DD) */
  date?: string;
  /** Mes del 1 al 12 */
  month?: number;
  /** Año de 4 dígitos (ej: 2025) */
  year?: number;
}

/**
 * Respuesta individual de Tipo de Cambio SBS Promedio
 */
export interface DecolectaSbsAverageExchangeRate {
  /** Precio de compra */
  buy_price: string;
  /** Precio de venta */
  sell_price: string;
  /** Moneda base */
  base_currency: string;
  /** Moneda cotizada (siempre es 'PEN') */
  quote_currency: string;
  /** Fecha correspondiente en formato ISO (YYYY-MM-DD) */
  date: string;
}

/**
 * Parámetros de consulta para Tipo de Cambio SBS Contable
 */
export interface DecolectaSbsAccountingParams {
  /** Código de moneda (ej: 'USD', 'EUR') */
  currency: DecolectaSbsCurrency;
  /** Fecha en formato ISO (YYYY-MM-DD) */
  date?: string;
}

/**
 * Respuesta individual de Tipo de Cambio SBS Contable
 */
export interface DecolectaSbsAccountingExchangeRate {
  /** Precio contable */
  price: string;
  /** Moneda base */
  base_currency: string;
  /** Moneda cotizada (siempre es 'PEN') */
  quote_currency: string;
  /** Fecha correspondiente en formato ISO (YYYY-MM-DD) */
  date: string;
}

/**
 * Respuesta de error devuelta por la API de Decolecta
 */
export interface DecolectaApiErrorResponse {
  error?: string;
  message?: string;
}

/**
 * Parámetros para consulta de RUC SUNAT
 */
export interface DecolectaSunatRucParams {
  /** Número de RUC de 11 dígitos */
  numero: string;
}

/**
 * Respuesta de Consulta de RUC Básica
 */
export interface DecolectaSunatRucBasic {
  razon_social: string;
  numero_documento: string;
  estado: string;
  condicion: string;
  direccion: string;
  ubigeo: string;
  via_tipo?: string;
  via_nombre?: string;
  zona_codigo?: string;
  zona_tipo?: string;
  numero?: string;
  interior?: string;
  lote?: string;
  dpto?: string;
  manzana?: string;
  kilometro?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  es_agente_retencion?: boolean;
  es_buen_contribuyente?: boolean;
  locales_anexos?: unknown[] | null;
}

/**
 * Respuesta de Consulta de RUC Avanzada / Full
 */
export interface DecolectaSunatRucFull extends DecolectaSunatRucBasic {
  tipo?: string;
  actividad_economica?: string;
  numero_trabajadores?: string;
  tipo_facturacion?: string;
  tipo_contabilidad?: string;
  comercio_exterior?: string;
}
