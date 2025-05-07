import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { BancoTransaccion, BancoTransaccionId } from './BancoTransaccion.js';
import type { InversionistaDeposito, InversionistaDepositoId } from './InversionistaDeposito.js';

export interface BancoTransaccionInversionistaDepositoAttributes {
  _idbancotransaccion: number;
  _idinversionistadeposito: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type BancoTransaccionInversionistaDepositoPk = "_idbancotransaccion" | "_idinversionistadeposito";
export type BancoTransaccionInversionistaDepositoId = BancoTransaccionInversionistaDeposito[BancoTransaccionInversionistaDepositoPk];
export type BancoTransaccionInversionistaDepositoOptionalAttributes = "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type BancoTransaccionInversionistaDepositoCreationAttributes = Optional<BancoTransaccionInversionistaDepositoAttributes, BancoTransaccionInversionistaDepositoOptionalAttributes>;

export class BancoTransaccionInversionistaDeposito extends Model<BancoTransaccionInversionistaDepositoAttributes, BancoTransaccionInversionistaDepositoCreationAttributes> implements BancoTransaccionInversionistaDepositoAttributes {
  _idbancotransaccion!: number;
  _idinversionistadeposito!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // BancoTransaccionInversionistaDeposito belongsTo BancoTransaccion via _idbancotransaccion
  bancotransaccion_banco_transaccion!: BancoTransaccion;
  get_idbancotransaccion_banco_transaccion!: Sequelize.BelongsToGetAssociationMixin<BancoTransaccion>;
  set_idbancotransaccion_banco_transaccion!: Sequelize.BelongsToSetAssociationMixin<BancoTransaccion, BancoTransaccionId>;
  create_idbancotransaccion_banco_transaccion!: Sequelize.BelongsToCreateAssociationMixin<BancoTransaccion>;
  // BancoTransaccionInversionistaDeposito belongsTo InversionistaDeposito via _idinversionistadeposito
  inversionistadeposito_inversionista_deposito!: InversionistaDeposito;
  get_idinversionistadeposito_inversionista_deposito!: Sequelize.BelongsToGetAssociationMixin<InversionistaDeposito>;
  set_idinversionistadeposito_inversionista_deposito!: Sequelize.BelongsToSetAssociationMixin<InversionistaDeposito, InversionistaDepositoId>;
  create_idinversionistadeposito_inversionista_deposito!: Sequelize.BelongsToCreateAssociationMixin<InversionistaDeposito>;

  static initModel(sequelize: Sequelize.Sequelize): typeof BancoTransaccionInversionistaDeposito {
    return BancoTransaccionInversionistaDeposito.init({
    _idbancotransaccion: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'banco_transaccion',
        key: '_idbancotransaccion'
      }
    },
    _idinversionistadeposito: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'inversionista_deposito',
        key: '_idinversionistadeposito'
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
    tableName: 'banco_transaccion_inversionista_deposito',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idbancotransaccion" },
          { name: "_idinversionistadeposito" },
        ]
      },
      {
        name: "FK_bancotransacciondeposito_idbancodeposito",
        using: "BTREE",
        fields: [
          { name: "_idinversionistadeposito" },
        ]
      },
    ]
  });
  }
}
