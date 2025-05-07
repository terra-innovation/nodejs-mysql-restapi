import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { CuentaBancaria, CuentaBancariaId } from './CuentaBancaria.js';

export interface BancoAttributes {
  _idbanco: number;
  bancoid: string;
  tipo: string;
  nombre: string;
  alias: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type BancoPk = "_idbanco";
export type BancoId = Banco[BancoPk];
export type BancoOptionalAttributes = "_idbanco" | "bancoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type BancoCreationAttributes = Optional<BancoAttributes, BancoOptionalAttributes>;

export class Banco extends Model<BancoAttributes, BancoCreationAttributes> implements BancoAttributes {
  _idbanco!: number;
  bancoid!: string;
  tipo!: string;
  nombre!: string;
  alias!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // Banco hasMany CuentaBancaria via _idbanco
  cuenta_bancaria!: CuentaBancaria[];
  getCuenta_bancaria!: Sequelize.HasManyGetAssociationsMixin<CuentaBancaria>;
  setCuenta_bancaria!: Sequelize.HasManySetAssociationsMixin<CuentaBancaria, CuentaBancariaId>;
  addCuenta_bancarium!: Sequelize.HasManyAddAssociationMixin<CuentaBancaria, CuentaBancariaId>;
  addCuenta_bancaria!: Sequelize.HasManyAddAssociationsMixin<CuentaBancaria, CuentaBancariaId>;
  createCuenta_bancarium!: Sequelize.HasManyCreateAssociationMixin<CuentaBancaria>;
  removeCuenta_bancarium!: Sequelize.HasManyRemoveAssociationMixin<CuentaBancaria, CuentaBancariaId>;
  removeCuenta_bancaria!: Sequelize.HasManyRemoveAssociationsMixin<CuentaBancaria, CuentaBancariaId>;
  hasCuenta_bancarium!: Sequelize.HasManyHasAssociationMixin<CuentaBancaria, CuentaBancariaId>;
  hasCuenta_bancaria!: Sequelize.HasManyHasAssociationsMixin<CuentaBancaria, CuentaBancariaId>;
  countCuenta_bancaria!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Banco {
    return Banco.init({
    _idbanco: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    bancoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_banco_bancoid"
    },
    tipo: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    alias: {
      type: DataTypes.STRING(100),
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
    tableName: 'banco',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idbanco" },
        ]
      },
      {
        name: "UQ_banco_bancoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bancoid" },
        ]
      },
    ]
  });
  }
}
