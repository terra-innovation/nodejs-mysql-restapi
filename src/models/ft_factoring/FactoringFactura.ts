import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Factoring, FactoringId } from './Factoring.js';
import type { Factura, FacturaId } from './Factura.js';

export interface FactoringFacturaAttributes {
  _idfactoring: number;
  _idfactura: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FactoringFacturaPk = "_idfactoring" | "_idfactura";
export type FactoringFacturaId = FactoringFactura[FactoringFacturaPk];
export type FactoringFacturaOptionalAttributes = "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FactoringFacturaCreationAttributes = Optional<FactoringFacturaAttributes, FactoringFacturaOptionalAttributes>;

export class FactoringFactura extends Model<FactoringFacturaAttributes, FactoringFacturaCreationAttributes> implements FactoringFacturaAttributes {
  _idfactoring!: number;
  _idfactura!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FactoringFactura belongsTo Factoring via _idfactoring
  factoring_factoring!: Factoring;
  get_idfactoring_factoring!: Sequelize.BelongsToGetAssociationMixin<Factoring>;
  set_idfactoring_factoring!: Sequelize.BelongsToSetAssociationMixin<Factoring, FactoringId>;
  create_idfactoring_factoring!: Sequelize.BelongsToCreateAssociationMixin<Factoring>;
  // FactoringFactura belongsTo Factura via _idfactura
  factura_factura!: Factura;
  get_idfactura_factura!: Sequelize.BelongsToGetAssociationMixin<Factura>;
  set_idfactura_factura!: Sequelize.BelongsToSetAssociationMixin<Factura, FacturaId>;
  create_idfactura_factura!: Sequelize.BelongsToCreateAssociationMixin<Factura>;

  static initModel(sequelize: Sequelize.Sequelize): typeof FactoringFactura {
    return FactoringFactura.init({
    _idfactoring: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'factoring',
        key: '_idfactoring'
      }
    },
    _idfactura: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'factura',
        key: '_idfactura'
      }
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
    tableName: 'factoring_factura',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoring" },
          { name: "_idfactura" },
        ]
      },
      {
        name: "FK_factoring_factura_idfactura",
        using: "BTREE",
        fields: [
          { name: "_idfactura" },
        ]
      },
    ]
  });
  }
}
