import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Factura, FacturaId } from './Factura.js';

export interface FacturaItemAttributes {
  _idfacturaitem: number;
  facturaitemid: string;
  _idfactura: number;
  id?: string;
  codigo_producto_sunat?: string;
  codigo_producto_vendedor?: string;
  unidad_medida?: string;
  cantidad?: number;
  descripcion?: string;
  valor_unitario?: number;
  precio_venta?: number;
  impuesto_codigo_sunat?: string;
  impuesto_nombre?: string;
  impuesto_porcentaje?: number;
  impuesto_codigo_afectacion_sunat?: string;
  impuesto_base_imponible?: number;
  impuesto_monto?: number;
  moneda?: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FacturaItemPk = "_idfacturaitem";
export type FacturaItemId = FacturaItem[FacturaItemPk];
export type FacturaItemOptionalAttributes = "_idfacturaitem" | "facturaitemid" | "id" | "codigo_producto_sunat" | "codigo_producto_vendedor" | "unidad_medida" | "cantidad" | "descripcion" | "valor_unitario" | "precio_venta" | "impuesto_codigo_sunat" | "impuesto_nombre" | "impuesto_porcentaje" | "impuesto_codigo_afectacion_sunat" | "impuesto_base_imponible" | "impuesto_monto" | "moneda" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FacturaItemCreationAttributes = Optional<FacturaItemAttributes, FacturaItemOptionalAttributes>;

export class FacturaItem extends Model<FacturaItemAttributes, FacturaItemCreationAttributes> implements FacturaItemAttributes {
  _idfacturaitem!: number;
  facturaitemid!: string;
  _idfactura!: number;
  id?: string;
  codigo_producto_sunat?: string;
  codigo_producto_vendedor?: string;
  unidad_medida?: string;
  cantidad?: number;
  descripcion?: string;
  valor_unitario?: number;
  precio_venta?: number;
  impuesto_codigo_sunat?: string;
  impuesto_nombre?: string;
  impuesto_porcentaje?: number;
  impuesto_codigo_afectacion_sunat?: string;
  impuesto_base_imponible?: number;
  impuesto_monto?: number;
  moneda?: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FacturaItem belongsTo Factura via _idfactura
  factura_factura!: Factura;
  get_idfactura_factura!: Sequelize.BelongsToGetAssociationMixin<Factura>;
  set_idfactura_factura!: Sequelize.BelongsToSetAssociationMixin<Factura, FacturaId>;
  create_idfactura_factura!: Sequelize.BelongsToCreateAssociationMixin<Factura>;

  static initModel(sequelize: Sequelize.Sequelize): typeof FacturaItem {
    return FacturaItem.init({
    _idfacturaitem: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    facturaitemid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid')
    },
    _idfactura: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'factura',
        key: '_idfactura'
      }
    },
    id: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    codigo_producto_sunat: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    codigo_producto_vendedor: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    unidad_medida: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cantidad: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    valor_unitario: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    precio_venta: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    impuesto_codigo_sunat: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    impuesto_nombre: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    impuesto_porcentaje: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    impuesto_codigo_afectacion_sunat: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    impuesto_base_imponible: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    impuesto_monto: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    moneda: {
      type: DataTypes.STRING(50),
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
    tableName: 'factura_item',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfacturaitem" },
        ]
      },
      {
        name: "FK_factura_item_idfactura",
        using: "BTREE",
        fields: [
          { name: "_idfactura" },
        ]
      },
    ]
  });
  }
}
