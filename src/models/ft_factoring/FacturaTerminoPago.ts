import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Factura, FacturaId } from './Factura.js';

export interface FacturaTerminoPagoAttributes {
  _idfacturaterminopago: number;
  facturaterminopagoid: string;
  _idfactura: number;
  id?: string;
  forma_pago?: string;
  monto?: number;
  porcentaje?: number;
  fecha_pago?: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FacturaTerminoPagoPk = "_idfacturaterminopago";
export type FacturaTerminoPagoId = FacturaTerminoPago[FacturaTerminoPagoPk];
export type FacturaTerminoPagoOptionalAttributes = "_idfacturaterminopago" | "facturaterminopagoid" | "id" | "forma_pago" | "monto" | "porcentaje" | "fecha_pago" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FacturaTerminoPagoCreationAttributes = Optional<FacturaTerminoPagoAttributes, FacturaTerminoPagoOptionalAttributes>;

export class FacturaTerminoPago extends Model<FacturaTerminoPagoAttributes, FacturaTerminoPagoCreationAttributes> implements FacturaTerminoPagoAttributes {
  _idfacturaterminopago!: number;
  facturaterminopagoid!: string;
  _idfactura!: number;
  id?: string;
  forma_pago?: string;
  monto?: number;
  porcentaje?: number;
  fecha_pago?: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FacturaTerminoPago belongsTo Factura via _idfactura
  factura_factura!: Factura;
  get_idfactura_factura!: Sequelize.BelongsToGetAssociationMixin<Factura>;
  set_idfactura_factura!: Sequelize.BelongsToSetAssociationMixin<Factura, FacturaId>;
  create_idfactura_factura!: Sequelize.BelongsToCreateAssociationMixin<Factura>;

  static initModel(sequelize: Sequelize.Sequelize): typeof FacturaTerminoPago {
    return FacturaTerminoPago.init({
    _idfacturaterminopago: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    facturaterminopagoid: {
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
    forma_pago: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    monto: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    porcentaje: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    fecha_pago: {
      type: DataTypes.DATEONLY,
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
    tableName: 'factura_termino_pago',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfacturaterminopago" },
        ]
      },
      {
        name: "FK_factura_termino_pago_idfactura",
        using: "BTREE",
        fields: [
          { name: "_idfactura" },
        ]
      },
    ]
  });
  }
}
