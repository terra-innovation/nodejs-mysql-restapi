/** Contrato compartido de clasificación; no infiere categoría desde XML/SUNAT. */
export const CATEGORIAS_INSTRUMENTO = ["FACTURA_COMERCIAL", "FACTURA_NEGOCIABLE", "FACTURA_CONFORMADA", "LETRA_CAMBIO", "OTROS"] as const;
export interface InstrumentoSaldo {
  instrumento: string;
  categoria: (typeof CATEGORIAS_INSTRUMENTO)[number];
  sustento: string;
}
