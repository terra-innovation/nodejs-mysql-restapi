export interface FacturaXML {
  facturaid: string;
  code: string;
  serie: string;
  numero_comprobante: string;
  fecha_emision: string;
  hora_emision: string;
  fecha_vencimiento?: string | null;
  codigo_tipo_documento: string;
  UBLVersionID?: string | null;
  CustomizationID?: string | null;
  codigo_tipo_moneda?: string | null;
  cantidad_items?: string | null;
  proveedor: ProveedorFactura;
  cliente: ClienteFactura;
  notas: NotaFactura[];
  medios_pago: MedioPago[];
  terminos_pago: TerminoPago[];
  items: ItemFactura[];
  impuesto: ImpuestoFactura;
  fecha_registro_para_calculos: string;
  fecha_registro: string;
  detraccion_cantidad: number;
  detraccion_monto: number;
  pago_cantidad_cuotas: number;
  fecha_pago_mayor_estimado: string | null;
  dias_desde_emision: number;
  dias_estimados_para_pago: number;
  importe_bruto: number;
  importe_neto: number;
  codigo_archivo: string;
  monedaid?: string;
  moneda_alias?: string;
  moneda_simbolo?: string;
}

export interface ProveedorFactura {
  empresaid?: string | null;
  ruc: string | null;
  razon_social: string | null;
  direccion?: string | null;
  codigo_pais?: string | null;
  ubigeo?: string | null;
  provincia?: string | null;
  departamento?: string | null;
  urbanizacion?: string | null;
  distrito?: string | null;
}

export interface ClienteFactura {
  empresaid?: string | null;
  ruc?: string | null;
  razon_social?: string | null;
}

export interface NotaFactura {
  facturanotaid: string;
  id: string | null;
  descripcion: string | null;
}

export interface MedioPago {
  facturamediopagoid: string;
  id: string | null;
  medio_pago_codigo: string | null;
  cuenta_bancaria: string | null;
}

export interface TerminoPago {
  facturaterminopagoid: string;
  id: string | null;
  forma_pago: string | null;
  monto: string | null;
  porcentaje?: string | null;
  fecha_pago: string | null;
}

export interface ItemFactura {
  facturaitemid: string;
  id: string | null;
  codigo_producto_sunat: string | null;
  codigo_producto_vendedor: string | null;
  unidad_medida: string | null;
  cantidad: string | null;
  descripcion: string | null;
  valor_unitario: string | null;
  precio_venta: string | null;
  impuesto_codigo_sunat: string | null;
  impuesto_nombre: string | null;
  impuesto_porcentaje: string | null;
  impuesto_codigo_afectacion_sunat: string | null;
  impuesto_base_imponible: string | null;
  impuesto_monto: string | null;
  moneda: string | null;
}

export interface ImpuestoFactura {
  monto: string | null;
  impuestos: ImpuestoDetalle[];
  valor_venta: ValorVenta;
}

export interface ImpuestoDetalle {
  facturaimpuestoid: string;
  id: string | null;
  codigo_sunat: string | null;
  nombre: string | null;
  porcentaje: string | null;
  base_imponible: string | null;
  monto: string | null;
}

export interface ValorVenta {
  monto_venta: string | null;
  monto_venta_mas_impuesto?: string | null;
  monto_pago: string | null;
}
