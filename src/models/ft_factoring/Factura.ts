import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Archivo, ArchivoId } from './Archivo.js';
import type { ArchivoFactura, ArchivoFacturaId } from './ArchivoFactura.js';
import type { Factoring, FactoringId } from './Factoring.js';
import type { FactoringFactura, FactoringFacturaId } from './FactoringFactura.js';
import type { FacturaImpuesto, FacturaImpuestoId } from './FacturaImpuesto.js';
import type { FacturaItem, FacturaItemId } from './FacturaItem.js';
import type { FacturaMedioPago, FacturaMedioPagoId } from './FacturaMedioPago.js';
import type { FacturaNota, FacturaNotaId } from './FacturaNota.js';
import type { FacturaTerminoPago, FacturaTerminoPagoId } from './FacturaTerminoPago.js';
import type { Usuario, UsuarioId } from './Usuario.js';

export interface FacturaAttributes {
  _idfactura: number;
  facturaid: string;
  code: string;
  _idusuarioupload: number;
  UBLVersionID?: string;
  CustomizationID?: string;
  serie: string;
  numero_comprobante: string;
  fecha_emision?: string;
  hora_emision?: string;
  fecha_vencimiento?: string;
  codigo_tipo_documento?: string;
  codigo_tipo_moneda: string;
  cantidad_items?: number;
  fecha_registro?: Date | Sequelize.Utils.Fn;
  detraccion_cantidad?: number;
  detraccion_monto?: number;
  pago_cantidad_cuotas?: number;
  fecha_pago_mayor_estimado?: string;
  dias_desde_emision?: number;
  dias_estimados_para_pago?: number;
  importe_bruto: number;
  importe_neto: number;
  proveedor_ruc: string;
  proveedor_razon_social: string;
  proveedor_direccion?: string;
  proveedor_codigo_pais?: string;
  proveedor_ubigeo?: string;
  proveedor_provincia?: string;
  proveedor_departamento?: string;
  proveedor_urbanizacion?: string;
  proveedor_distrito?: string;
  cliente_ruc: string;
  cliente_razon_social: string;
  impuesto_monto?: number;
  impuesto_valor_venta_monto_venta?: number;
  impuesto_valor_venta_monto_venta_mas_impuesto?: number;
  impuesto_valor_venta_monto_pago?: number;
  codigo_archivo?: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FacturaPk = "_idfactura";
export type FacturaId = Factura[FacturaPk];
export type FacturaOptionalAttributes = "_idfactura" | "facturaid" | "UBLVersionID" | "CustomizationID" | "fecha_emision" | "hora_emision" | "fecha_vencimiento" | "codigo_tipo_documento" | "cantidad_items" | "fecha_registro" | "detraccion_cantidad" | "detraccion_monto" | "pago_cantidad_cuotas" | "fecha_pago_mayor_estimado" | "dias_desde_emision" | "dias_estimados_para_pago" | "proveedor_direccion" | "proveedor_codigo_pais" | "proveedor_ubigeo" | "proveedor_provincia" | "proveedor_departamento" | "proveedor_urbanizacion" | "proveedor_distrito" | "impuesto_monto" | "impuesto_valor_venta_monto_venta" | "impuesto_valor_venta_monto_venta_mas_impuesto" | "impuesto_valor_venta_monto_pago" | "codigo_archivo" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FacturaCreationAttributes = Optional<FacturaAttributes, FacturaOptionalAttributes>;

export class Factura extends Model<FacturaAttributes, FacturaCreationAttributes> implements FacturaAttributes {
  _idfactura!: number;
  facturaid!: string;
  code!: string;
  _idusuarioupload!: number;
  UBLVersionID?: string;
  CustomizationID?: string;
  serie!: string;
  numero_comprobante!: string;
  fecha_emision?: string;
  hora_emision?: string;
  fecha_vencimiento?: string;
  codigo_tipo_documento?: string;
  codigo_tipo_moneda!: string;
  cantidad_items?: number;
  fecha_registro?: Date | Sequelize.Utils.Fn;
  detraccion_cantidad?: number;
  detraccion_monto?: number;
  pago_cantidad_cuotas?: number;
  fecha_pago_mayor_estimado?: string;
  dias_desde_emision?: number;
  dias_estimados_para_pago?: number;
  importe_bruto!: number;
  importe_neto!: number;
  proveedor_ruc!: string;
  proveedor_razon_social!: string;
  proveedor_direccion?: string;
  proveedor_codigo_pais?: string;
  proveedor_ubigeo?: string;
  proveedor_provincia?: string;
  proveedor_departamento?: string;
  proveedor_urbanizacion?: string;
  proveedor_distrito?: string;
  cliente_ruc!: string;
  cliente_razon_social!: string;
  impuesto_monto?: number;
  impuesto_valor_venta_monto_venta?: number;
  impuesto_valor_venta_monto_venta_mas_impuesto?: number;
  impuesto_valor_venta_monto_pago?: number;
  codigo_archivo?: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // Factura belongsToMany Archivo via _idfactura and _idarchivo
  archivo_archivo_archivo_facturas!: Archivo[];
  get_idarchivo_archivo_archivo_facturas!: Sequelize.BelongsToManyGetAssociationsMixin<Archivo>;
  set_idarchivo_archivo_archivo_facturas!: Sequelize.BelongsToManySetAssociationsMixin<Archivo, ArchivoId>;
  add_idarchivo_archivo_archivo_factura!: Sequelize.BelongsToManyAddAssociationMixin<Archivo, ArchivoId>;
  add_idarchivo_archivo_archivo_facturas!: Sequelize.BelongsToManyAddAssociationsMixin<Archivo, ArchivoId>;
  create_idarchivo_archivo_archivo_factura!: Sequelize.BelongsToManyCreateAssociationMixin<Archivo>;
  remove_idarchivo_archivo_archivo_factura!: Sequelize.BelongsToManyRemoveAssociationMixin<Archivo, ArchivoId>;
  remove_idarchivo_archivo_archivo_facturas!: Sequelize.BelongsToManyRemoveAssociationsMixin<Archivo, ArchivoId>;
  has_idarchivo_archivo_archivo_factura!: Sequelize.BelongsToManyHasAssociationMixin<Archivo, ArchivoId>;
  has_idarchivo_archivo_archivo_facturas!: Sequelize.BelongsToManyHasAssociationsMixin<Archivo, ArchivoId>;
  count_idarchivo_archivo_archivo_facturas!: Sequelize.BelongsToManyCountAssociationsMixin;
  // Factura hasMany ArchivoFactura via _idfactura
  archivo_facturas!: ArchivoFactura[];
  getArchivo_facturas!: Sequelize.HasManyGetAssociationsMixin<ArchivoFactura>;
  setArchivo_facturas!: Sequelize.HasManySetAssociationsMixin<ArchivoFactura, ArchivoFacturaId>;
  addArchivo_factura!: Sequelize.HasManyAddAssociationMixin<ArchivoFactura, ArchivoFacturaId>;
  addArchivo_facturas!: Sequelize.HasManyAddAssociationsMixin<ArchivoFactura, ArchivoFacturaId>;
  createArchivo_factura!: Sequelize.HasManyCreateAssociationMixin<ArchivoFactura>;
  removeArchivo_factura!: Sequelize.HasManyRemoveAssociationMixin<ArchivoFactura, ArchivoFacturaId>;
  removeArchivo_facturas!: Sequelize.HasManyRemoveAssociationsMixin<ArchivoFactura, ArchivoFacturaId>;
  hasArchivo_factura!: Sequelize.HasManyHasAssociationMixin<ArchivoFactura, ArchivoFacturaId>;
  hasArchivo_facturas!: Sequelize.HasManyHasAssociationsMixin<ArchivoFactura, ArchivoFacturaId>;
  countArchivo_facturas!: Sequelize.HasManyCountAssociationsMixin;
  // Factura belongsToMany Factoring via _idfactura and _idfactoring
  factoring_factorings!: Factoring[];
  get_idfactoring_factorings!: Sequelize.BelongsToManyGetAssociationsMixin<Factoring>;
  set_idfactoring_factorings!: Sequelize.BelongsToManySetAssociationsMixin<Factoring, FactoringId>;
  add_idfactoring_factoring!: Sequelize.BelongsToManyAddAssociationMixin<Factoring, FactoringId>;
  add_idfactoring_factorings!: Sequelize.BelongsToManyAddAssociationsMixin<Factoring, FactoringId>;
  create_idfactoring_factoring!: Sequelize.BelongsToManyCreateAssociationMixin<Factoring>;
  remove_idfactoring_factoring!: Sequelize.BelongsToManyRemoveAssociationMixin<Factoring, FactoringId>;
  remove_idfactoring_factorings!: Sequelize.BelongsToManyRemoveAssociationsMixin<Factoring, FactoringId>;
  has_idfactoring_factoring!: Sequelize.BelongsToManyHasAssociationMixin<Factoring, FactoringId>;
  has_idfactoring_factorings!: Sequelize.BelongsToManyHasAssociationsMixin<Factoring, FactoringId>;
  count_idfactoring_factorings!: Sequelize.BelongsToManyCountAssociationsMixin;
  // Factura hasMany FactoringFactura via _idfactura
  factoring_facturas!: FactoringFactura[];
  getFactoring_facturas!: Sequelize.HasManyGetAssociationsMixin<FactoringFactura>;
  setFactoring_facturas!: Sequelize.HasManySetAssociationsMixin<FactoringFactura, FactoringFacturaId>;
  addFactoring_factura!: Sequelize.HasManyAddAssociationMixin<FactoringFactura, FactoringFacturaId>;
  addFactoring_facturas!: Sequelize.HasManyAddAssociationsMixin<FactoringFactura, FactoringFacturaId>;
  createFactoring_factura!: Sequelize.HasManyCreateAssociationMixin<FactoringFactura>;
  removeFactoring_factura!: Sequelize.HasManyRemoveAssociationMixin<FactoringFactura, FactoringFacturaId>;
  removeFactoring_facturas!: Sequelize.HasManyRemoveAssociationsMixin<FactoringFactura, FactoringFacturaId>;
  hasFactoring_factura!: Sequelize.HasManyHasAssociationMixin<FactoringFactura, FactoringFacturaId>;
  hasFactoring_facturas!: Sequelize.HasManyHasAssociationsMixin<FactoringFactura, FactoringFacturaId>;
  countFactoring_facturas!: Sequelize.HasManyCountAssociationsMixin;
  // Factura hasMany FacturaImpuesto via _idfactura
  factura_impuestos!: FacturaImpuesto[];
  getFactura_impuestos!: Sequelize.HasManyGetAssociationsMixin<FacturaImpuesto>;
  setFactura_impuestos!: Sequelize.HasManySetAssociationsMixin<FacturaImpuesto, FacturaImpuestoId>;
  addFactura_impuesto!: Sequelize.HasManyAddAssociationMixin<FacturaImpuesto, FacturaImpuestoId>;
  addFactura_impuestos!: Sequelize.HasManyAddAssociationsMixin<FacturaImpuesto, FacturaImpuestoId>;
  createFactura_impuesto!: Sequelize.HasManyCreateAssociationMixin<FacturaImpuesto>;
  removeFactura_impuesto!: Sequelize.HasManyRemoveAssociationMixin<FacturaImpuesto, FacturaImpuestoId>;
  removeFactura_impuestos!: Sequelize.HasManyRemoveAssociationsMixin<FacturaImpuesto, FacturaImpuestoId>;
  hasFactura_impuesto!: Sequelize.HasManyHasAssociationMixin<FacturaImpuesto, FacturaImpuestoId>;
  hasFactura_impuestos!: Sequelize.HasManyHasAssociationsMixin<FacturaImpuesto, FacturaImpuestoId>;
  countFactura_impuestos!: Sequelize.HasManyCountAssociationsMixin;
  // Factura hasMany FacturaItem via _idfactura
  factura_items!: FacturaItem[];
  getFactura_items!: Sequelize.HasManyGetAssociationsMixin<FacturaItem>;
  setFactura_items!: Sequelize.HasManySetAssociationsMixin<FacturaItem, FacturaItemId>;
  addFactura_item!: Sequelize.HasManyAddAssociationMixin<FacturaItem, FacturaItemId>;
  addFactura_items!: Sequelize.HasManyAddAssociationsMixin<FacturaItem, FacturaItemId>;
  createFactura_item!: Sequelize.HasManyCreateAssociationMixin<FacturaItem>;
  removeFactura_item!: Sequelize.HasManyRemoveAssociationMixin<FacturaItem, FacturaItemId>;
  removeFactura_items!: Sequelize.HasManyRemoveAssociationsMixin<FacturaItem, FacturaItemId>;
  hasFactura_item!: Sequelize.HasManyHasAssociationMixin<FacturaItem, FacturaItemId>;
  hasFactura_items!: Sequelize.HasManyHasAssociationsMixin<FacturaItem, FacturaItemId>;
  countFactura_items!: Sequelize.HasManyCountAssociationsMixin;
  // Factura hasMany FacturaMedioPago via _idfactura
  factura_medio_pagos!: FacturaMedioPago[];
  getFactura_medio_pagos!: Sequelize.HasManyGetAssociationsMixin<FacturaMedioPago>;
  setFactura_medio_pagos!: Sequelize.HasManySetAssociationsMixin<FacturaMedioPago, FacturaMedioPagoId>;
  addFactura_medio_pago!: Sequelize.HasManyAddAssociationMixin<FacturaMedioPago, FacturaMedioPagoId>;
  addFactura_medio_pagos!: Sequelize.HasManyAddAssociationsMixin<FacturaMedioPago, FacturaMedioPagoId>;
  createFactura_medio_pago!: Sequelize.HasManyCreateAssociationMixin<FacturaMedioPago>;
  removeFactura_medio_pago!: Sequelize.HasManyRemoveAssociationMixin<FacturaMedioPago, FacturaMedioPagoId>;
  removeFactura_medio_pagos!: Sequelize.HasManyRemoveAssociationsMixin<FacturaMedioPago, FacturaMedioPagoId>;
  hasFactura_medio_pago!: Sequelize.HasManyHasAssociationMixin<FacturaMedioPago, FacturaMedioPagoId>;
  hasFactura_medio_pagos!: Sequelize.HasManyHasAssociationsMixin<FacturaMedioPago, FacturaMedioPagoId>;
  countFactura_medio_pagos!: Sequelize.HasManyCountAssociationsMixin;
  // Factura hasMany FacturaNota via _idfactura
  factura_nota!: FacturaNota[];
  getFactura_nota!: Sequelize.HasManyGetAssociationsMixin<FacturaNota>;
  setFactura_nota!: Sequelize.HasManySetAssociationsMixin<FacturaNota, FacturaNotaId>;
  addFactura_notum!: Sequelize.HasManyAddAssociationMixin<FacturaNota, FacturaNotaId>;
  addFactura_nota!: Sequelize.HasManyAddAssociationsMixin<FacturaNota, FacturaNotaId>;
  createFactura_notum!: Sequelize.HasManyCreateAssociationMixin<FacturaNota>;
  removeFactura_notum!: Sequelize.HasManyRemoveAssociationMixin<FacturaNota, FacturaNotaId>;
  removeFactura_nota!: Sequelize.HasManyRemoveAssociationsMixin<FacturaNota, FacturaNotaId>;
  hasFactura_notum!: Sequelize.HasManyHasAssociationMixin<FacturaNota, FacturaNotaId>;
  hasFactura_nota!: Sequelize.HasManyHasAssociationsMixin<FacturaNota, FacturaNotaId>;
  countFactura_nota!: Sequelize.HasManyCountAssociationsMixin;
  // Factura hasMany FacturaTerminoPago via _idfactura
  factura_termino_pagos!: FacturaTerminoPago[];
  getFactura_termino_pagos!: Sequelize.HasManyGetAssociationsMixin<FacturaTerminoPago>;
  setFactura_termino_pagos!: Sequelize.HasManySetAssociationsMixin<FacturaTerminoPago, FacturaTerminoPagoId>;
  addFactura_termino_pago!: Sequelize.HasManyAddAssociationMixin<FacturaTerminoPago, FacturaTerminoPagoId>;
  addFactura_termino_pagos!: Sequelize.HasManyAddAssociationsMixin<FacturaTerminoPago, FacturaTerminoPagoId>;
  createFactura_termino_pago!: Sequelize.HasManyCreateAssociationMixin<FacturaTerminoPago>;
  removeFactura_termino_pago!: Sequelize.HasManyRemoveAssociationMixin<FacturaTerminoPago, FacturaTerminoPagoId>;
  removeFactura_termino_pagos!: Sequelize.HasManyRemoveAssociationsMixin<FacturaTerminoPago, FacturaTerminoPagoId>;
  hasFactura_termino_pago!: Sequelize.HasManyHasAssociationMixin<FacturaTerminoPago, FacturaTerminoPagoId>;
  hasFactura_termino_pagos!: Sequelize.HasManyHasAssociationsMixin<FacturaTerminoPago, FacturaTerminoPagoId>;
  countFactura_termino_pagos!: Sequelize.HasManyCountAssociationsMixin;
  // Factura belongsTo Usuario via _idusuarioupload
  usuarioupload_usuario!: Usuario;
  get_idusuarioupload_usuario!: Sequelize.BelongsToGetAssociationMixin<Usuario>;
  set_idusuarioupload_usuario!: Sequelize.BelongsToSetAssociationMixin<Usuario, UsuarioId>;
  create_idusuarioupload_usuario!: Sequelize.BelongsToCreateAssociationMixin<Usuario>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Factura {
    return Factura.init({
    _idfactura: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    facturaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factura_facturaid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_factura_code"
    },
    _idusuarioupload: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'usuario',
        key: '_idusuario'
      }
    },
    UBLVersionID: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    CustomizationID: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    serie: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    numero_comprobante: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    fecha_emision: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    hora_emision: {
      type: DataTypes.TIME,
      allowNull: true
    },
    fecha_vencimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    codigo_tipo_documento: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    codigo_tipo_moneda: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    cantidad_items: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: true
    },
    detraccion_cantidad: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    detraccion_monto: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    pago_cantidad_cuotas: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    fecha_pago_mayor_estimado: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    dias_desde_emision: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dias_estimados_para_pago: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    importe_bruto: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    },
    importe_neto: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    },
    proveedor_ruc: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    proveedor_razon_social: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    proveedor_direccion: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    proveedor_codigo_pais: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    proveedor_ubigeo: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    proveedor_provincia: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    proveedor_departamento: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    proveedor_urbanizacion: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    proveedor_distrito: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cliente_ruc: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    cliente_razon_social: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    impuesto_monto: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    impuesto_valor_venta_monto_venta: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    impuesto_valor_venta_monto_venta_mas_impuesto: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    impuesto_valor_venta_monto_pago: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    codigo_archivo: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    idusuariocrea: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    fechacrea: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: "current_timestamp(3)"
    },
    idusuariomod: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    fechamod: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: "current_timestamp(3)"
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'factura',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactura" },
        ]
      },
      {
        name: "UQ_factura_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "UQ_factura_facturaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "facturaid" },
        ]
      },
      {
        name: "FK_factura_idusuarioupload",
        using: "BTREE",
        fields: [
          { name: "_idusuarioupload" },
        ]
      },
    ]
  });
  }
}
