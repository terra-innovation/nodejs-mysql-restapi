import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Factura, FacturaId } from './Factura.js';

export interface FacturaMedioPagoAttributes {
  _idfacturamediopago: number;
  facturamediopagoid: string;
  _idfactura: number;
  id?: string;
  medio_pago_codigo?: string;
  cuenta_bancaria?: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FacturaMedioPagoPk = "_idfacturamediopago";
export type FacturaMedioPagoId = FacturaMedioPago[FacturaMedioPagoPk];
export type FacturaMedioPagoOptionalAttributes = "_idfacturamediopago" | "facturamediopagoid" | "id" | "medio_pago_codigo" | "cuenta_bancaria" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FacturaMedioPagoCreationAttributes = Optional<FacturaMedioPagoAttributes, FacturaMedioPagoOptionalAttributes>;

export class FacturaMedioPago extends Model<FacturaMedioPagoAttributes, FacturaMedioPagoCreationAttributes> implements FacturaMedioPagoAttributes {
  _idfacturamediopago!: number;
  facturamediopagoid!: string;
  _idfactura!: number;
  id?: string;
  medio_pago_codigo?: string;
  cuenta_bancaria?: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FacturaMedioPago belongsTo Factura via _idfactura
  factura_factura!: Factura;
  get_idfactura_factura!: Sequelize.BelongsToGetAssociationMixin<Factura>;
  set_idfactura_factura!: Sequelize.BelongsToSetAssociationMixin<Factura, FacturaId>;
  create_idfactura_factura!: Sequelize.BelongsToCreateAssociationMixin<Factura>;

  static initModel(sequelize: Sequelize.Sequelize): typeof FacturaMedioPago {
    return FacturaMedioPago.init({
    _idfacturamediopago: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    facturamediopagoid: {
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
    medio_pago_codigo: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cuenta_bancaria: {
      type: DataTypes.STRING(100),
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
    tableName: 'factura_medio_pago',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfacturamediopago" },
        ]
      },
      {
        name: "FK_factura_medio_pago_idfactura",
        using: "BTREE",
        fields: [
          { name: "_idfactura" },
        ]
      },
    ]
  });
  }
}
