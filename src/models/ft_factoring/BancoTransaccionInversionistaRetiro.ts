import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { BancoTransaccion, BancoTransaccionId } from './BancoTransaccion.js';
import type { InversionistaRetiro, InversionistaRetiroId } from './InversionistaRetiro.js';

export interface BancoTransaccionInversionistaRetiroAttributes {
  _idbancotransaccion: number;
  _idinversionistaretiro: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type BancoTransaccionInversionistaRetiroPk = "_idbancotransaccion" | "_idinversionistaretiro";
export type BancoTransaccionInversionistaRetiroId = BancoTransaccionInversionistaRetiro[BancoTransaccionInversionistaRetiroPk];
export type BancoTransaccionInversionistaRetiroOptionalAttributes = "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type BancoTransaccionInversionistaRetiroCreationAttributes = Optional<BancoTransaccionInversionistaRetiroAttributes, BancoTransaccionInversionistaRetiroOptionalAttributes>;

export class BancoTransaccionInversionistaRetiro extends Model<BancoTransaccionInversionistaRetiroAttributes, BancoTransaccionInversionistaRetiroCreationAttributes> implements BancoTransaccionInversionistaRetiroAttributes {
  _idbancotransaccion!: number;
  _idinversionistaretiro!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // BancoTransaccionInversionistaRetiro belongsTo BancoTransaccion via _idbancotransaccion
  bancotransaccion_banco_transaccion!: BancoTransaccion;
  get_idbancotransaccion_banco_transaccion!: Sequelize.BelongsToGetAssociationMixin<BancoTransaccion>;
  set_idbancotransaccion_banco_transaccion!: Sequelize.BelongsToSetAssociationMixin<BancoTransaccion, BancoTransaccionId>;
  create_idbancotransaccion_banco_transaccion!: Sequelize.BelongsToCreateAssociationMixin<BancoTransaccion>;
  // BancoTransaccionInversionistaRetiro belongsTo InversionistaRetiro via _idinversionistaretiro
  inversionistaretiro_inversionista_retiro!: InversionistaRetiro;
  get_idinversionistaretiro_inversionista_retiro!: Sequelize.BelongsToGetAssociationMixin<InversionistaRetiro>;
  set_idinversionistaretiro_inversionista_retiro!: Sequelize.BelongsToSetAssociationMixin<InversionistaRetiro, InversionistaRetiroId>;
  create_idinversionistaretiro_inversionista_retiro!: Sequelize.BelongsToCreateAssociationMixin<InversionistaRetiro>;

  static initModel(sequelize: Sequelize.Sequelize): typeof BancoTransaccionInversionistaRetiro {
    return BancoTransaccionInversionistaRetiro.init({
    _idbancotransaccion: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'banco_transaccion',
        key: '_idbancotransaccion'
      }
    },
    _idinversionistaretiro: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'inversionista_retiro',
        key: '_idinversionistaretiro'
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
    tableName: 'banco_transaccion_inversionista_retiro',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idbancotransaccion" },
          { name: "_idinversionistaretiro" },
        ]
      },
      {
        name: "FK_btir_idbancoretiro",
        using: "BTREE",
        fields: [
          { name: "_idinversionistaretiro" },
        ]
      },
    ]
  });
  }
}
