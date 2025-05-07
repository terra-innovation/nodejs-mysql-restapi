import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { BancoTransaccion, BancoTransaccionId } from './BancoTransaccion.js';

export interface BancoTransaccionTipoAttributes {
  _idbancotransacciontipo: number;
  bancotransacciontipoid: string;
  code: string;
  nombre: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type BancoTransaccionTipoPk = "_idbancotransacciontipo";
export type BancoTransaccionTipoId = BancoTransaccionTipo[BancoTransaccionTipoPk];
export type BancoTransaccionTipoOptionalAttributes = "bancotransacciontipoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type BancoTransaccionTipoCreationAttributes = Optional<BancoTransaccionTipoAttributes, BancoTransaccionTipoOptionalAttributes>;

export class BancoTransaccionTipo extends Model<BancoTransaccionTipoAttributes, BancoTransaccionTipoCreationAttributes> implements BancoTransaccionTipoAttributes {
  _idbancotransacciontipo!: number;
  bancotransacciontipoid!: string;
  code!: string;
  nombre!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // BancoTransaccionTipo hasMany BancoTransaccion via _idbancotransaciontipo
  banco_transaccions!: BancoTransaccion[];
  getBanco_transaccions!: Sequelize.HasManyGetAssociationsMixin<BancoTransaccion>;
  setBanco_transaccions!: Sequelize.HasManySetAssociationsMixin<BancoTransaccion, BancoTransaccionId>;
  addBanco_transaccion!: Sequelize.HasManyAddAssociationMixin<BancoTransaccion, BancoTransaccionId>;
  addBanco_transaccions!: Sequelize.HasManyAddAssociationsMixin<BancoTransaccion, BancoTransaccionId>;
  createBanco_transaccion!: Sequelize.HasManyCreateAssociationMixin<BancoTransaccion>;
  removeBanco_transaccion!: Sequelize.HasManyRemoveAssociationMixin<BancoTransaccion, BancoTransaccionId>;
  removeBanco_transaccions!: Sequelize.HasManyRemoveAssociationsMixin<BancoTransaccion, BancoTransaccionId>;
  hasBanco_transaccion!: Sequelize.HasManyHasAssociationMixin<BancoTransaccion, BancoTransaccionId>;
  hasBanco_transaccions!: Sequelize.HasManyHasAssociationsMixin<BancoTransaccion, BancoTransaccionId>;
  countBanco_transaccions!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof BancoTransaccionTipo {
    return BancoTransaccionTipo.init({
    _idbancotransacciontipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    bancotransacciontipoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_bancotransacciontipo_bancotransacciontipoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_bancotransacciontipo_code"
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
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
    tableName: 'banco_transaccion_tipo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idbancotransacciontipo" },
        ]
      },
      {
        name: "UQ_bancotransacciontipo_bancotransacciontipoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bancotransacciontipoid" },
        ]
      },
      {
        name: "UQ_bancotransacciontipo_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
    ]
  });
  }
}
