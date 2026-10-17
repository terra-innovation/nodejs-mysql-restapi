export const DETRACCION_CODES = { PENDIENTE: "DE00001", PAGADA: "DE00002" } as const;
export type DetraccionEstado = keyof typeof DETRACCION_CODES;
export type DetraccionOrden = "fechaEmision" | "operacion" | "cedente" | "comprobante" | "importeTotal" | "detraccionMonto" | "fechaPagoDetraccion";
export interface ListarDetraccionesDto {
  estado: DetraccionEstado;
  pagina: number;
  tamanio: number;
  busqueda: string;
  ordenarPor: DetraccionOrden;
  direccion: "asc" | "desc";
}
export interface ActualizarDetraccionDto {
  id: string;
  detraccionestadoid: string;
  fecha_pago_detraccion: string | null;
  detraccionarchivoid?: string;
  version: string;
  idusuario: number;
}
