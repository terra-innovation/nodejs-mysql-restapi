import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { BancoTransaccion, BancoTransaccionId } from './BancoTransaccion.js';
import type { FactoringInversion, FactoringInversionId } from './FactoringInversion.js';

export interface BancoTransaccionFactoringInversionAttributes {
  _idbancotransaccion: number;
  _idfactoringinversion: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type BancoTransaccionFactoringInversionPk = "_idbancotransaccion" | "_idfactoringinversion";
export type BancoTransaccionFactoringInversionId = BancoTransaccionFactoringInversion[BancoTransaccionFactoringInversionPk];
export type BancoTransaccionFactoringInversionOptionalAttributes = "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type BancoTransaccionFactoringInversionCreationAttributes = Optional<BancoTransaccionFactoringInversionAttributes, BancoTransaccionFactoringInversionOptionalAttributes>;

export class BancoTransaccionFactoringInversion extends Model<BancoTransaccionFactoringInversionAttributes, BancoTransaccionFactoringInversionCreationAttributes> implements BancoTransaccionFactoringInversionAttributes {
  _idbancotransaccion!: number;
  _idfactoringinversion!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // BancoTransaccionFactoringInversion belongsTo BancoTransaccion via _idbancotransaccion
  bancotransaccion_banco_transaccion!: BancoTransaccion;
  get_idbancotransaccion_banco_transaccion!: Sequelize.BelongsToGetAssociationMixin<BancoTransaccion>;
  set_idbancotransaccion_banco_transaccion!: Sequelize.BelongsToSetAssociationMixin<BancoTransaccion, BancoTransaccionId>;
  create_idbancotransaccion_banco_transaccion!: Sequelize.BelongsToCreateAssociationMixin<BancoTransaccion>;
  // BancoTransaccionFactoringInversion belongsTo FactoringInversion via _idfactoringinversion
  factoringinversion_factoring_inversion!: FactoringInversion;
  get_idfactoringinversion_factoring_inversion!: Sequelize.BelongsToGetAssociationMixin<FactoringInversion>;
  set_idfactoringinversion_factoring_inversion!: Sequelize.BelongsToSetAssociationMixin<FactoringInversion, FactoringInversionId>;
  create_idfactoringinversion_factoring_inversion!: Sequelize.BelongsToCreateAssociationMixin<FactoringInversion>;

  static initModel(sequelize: Sequelize.Sequelize): typeof BancoTransaccionFactoringInversion {
    return BancoTransaccionFactoringInversion.init({
    _idbancotransaccion: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'banco_transaccion',
        key: '_idbancotransaccion'
      }
    },
    _idfactoringinversion: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'factoring_inversion',
        key: '_idfactoringinversion'
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
    tableName: 'banco_transaccion_factoring_inversion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idbancotransaccion" },
          { name: "_idfactoringinversion" },
        ]
      },
      {
        name: "_idbancodeposito",
        using: "BTREE",
        fields: [
          { name: "_idfactoringinversion" },
        ]
      },
    ]
  });
  }
}
