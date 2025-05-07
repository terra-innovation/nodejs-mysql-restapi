import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { BancoTransaccion, BancoTransaccionId } from './BancoTransaccion.js';
import type { BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId } from './BancoTransaccionEstadoHistorial.js';

export interface BancoTransaccionEstadoAttributes {
  _idbancotransaccionestado: number;
  bancotransaccionestadoid: string;
  code: string;
  nombre: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type BancoTransaccionEstadoPk = "_idbancotransaccionestado";
export type BancoTransaccionEstadoId = BancoTransaccionEstado[BancoTransaccionEstadoPk];
export type BancoTransaccionEstadoOptionalAttributes = "bancotransaccionestadoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type BancoTransaccionEstadoCreationAttributes = Optional<BancoTransaccionEstadoAttributes, BancoTransaccionEstadoOptionalAttributes>;

export class BancoTransaccionEstado extends Model<BancoTransaccionEstadoAttributes, BancoTransaccionEstadoCreationAttributes> implements BancoTransaccionEstadoAttributes {
  _idbancotransaccionestado!: number;
  bancotransaccionestadoid!: string;
  code!: string;
  nombre!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // BancoTransaccionEstado hasMany BancoTransaccion via _idbancotransaccionestado
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
  // BancoTransaccionEstado hasMany BancoTransaccionEstadoHistorial via _idbancotransaccionestado
  banco_transaccion_estado_historials!: BancoTransaccionEstadoHistorial[];
  getBanco_transaccion_estado_historials!: Sequelize.HasManyGetAssociationsMixin<BancoTransaccionEstadoHistorial>;
  setBanco_transaccion_estado_historials!: Sequelize.HasManySetAssociationsMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  addBanco_transaccion_estado_historial!: Sequelize.HasManyAddAssociationMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  addBanco_transaccion_estado_historials!: Sequelize.HasManyAddAssociationsMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  createBanco_transaccion_estado_historial!: Sequelize.HasManyCreateAssociationMixin<BancoTransaccionEstadoHistorial>;
  removeBanco_transaccion_estado_historial!: Sequelize.HasManyRemoveAssociationMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  removeBanco_transaccion_estado_historials!: Sequelize.HasManyRemoveAssociationsMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  hasBanco_transaccion_estado_historial!: Sequelize.HasManyHasAssociationMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  hasBanco_transaccion_estado_historials!: Sequelize.HasManyHasAssociationsMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  countBanco_transaccion_estado_historials!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof BancoTransaccionEstado {
    return BancoTransaccionEstado.init({
    _idbancotransaccionestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    bancotransaccionestadoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_bancotransaccionestado_bancotransaccionestadoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_bancotransaccionestado_code"
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
    tableName: 'banco_transaccion_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idbancotransaccionestado" },
        ]
      },
      {
        name: "UQ_bancotransaccionestado_bancotransaccionestadoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bancotransaccionestadoid" },
        ]
      },
      {
        name: "UQ_bancotransaccionestado_code",
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
