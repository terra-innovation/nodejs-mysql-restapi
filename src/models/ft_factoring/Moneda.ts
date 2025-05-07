import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { BancoCuenta, BancoCuentaId } from './BancoCuenta.js';
import type { CuentaBancaria, CuentaBancariaId } from './CuentaBancaria.js';
import type { Factoring, FactoringId } from './Factoring.js';

export interface MonedaAttributes {
  _idmoneda: number;
  monedaid: string;
  code: string;
  nombre: string;
  alias: string;
  codigo: string;
  simbolo: string;
  color: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type MonedaPk = "_idmoneda";
export type MonedaId = Moneda[MonedaPk];
export type MonedaOptionalAttributes = "_idmoneda" | "monedaid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type MonedaCreationAttributes = Optional<MonedaAttributes, MonedaOptionalAttributes>;

export class Moneda extends Model<MonedaAttributes, MonedaCreationAttributes> implements MonedaAttributes {
  _idmoneda!: number;
  monedaid!: string;
  code!: string;
  nombre!: string;
  alias!: string;
  codigo!: string;
  simbolo!: string;
  color!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // Moneda hasMany BancoCuenta via _idmoneda
  banco_cuenta!: BancoCuenta[];
  getBanco_cuenta!: Sequelize.HasManyGetAssociationsMixin<BancoCuenta>;
  setBanco_cuenta!: Sequelize.HasManySetAssociationsMixin<BancoCuenta, BancoCuentaId>;
  addBanco_cuentum!: Sequelize.HasManyAddAssociationMixin<BancoCuenta, BancoCuentaId>;
  addBanco_cuenta!: Sequelize.HasManyAddAssociationsMixin<BancoCuenta, BancoCuentaId>;
  createBanco_cuentum!: Sequelize.HasManyCreateAssociationMixin<BancoCuenta>;
  removeBanco_cuentum!: Sequelize.HasManyRemoveAssociationMixin<BancoCuenta, BancoCuentaId>;
  removeBanco_cuenta!: Sequelize.HasManyRemoveAssociationsMixin<BancoCuenta, BancoCuentaId>;
  hasBanco_cuentum!: Sequelize.HasManyHasAssociationMixin<BancoCuenta, BancoCuentaId>;
  hasBanco_cuenta!: Sequelize.HasManyHasAssociationsMixin<BancoCuenta, BancoCuentaId>;
  countBanco_cuenta!: Sequelize.HasManyCountAssociationsMixin;
  // Moneda hasMany CuentaBancaria via _idmoneda
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
  // Moneda hasMany Factoring via _idmoneda
  factorings!: Factoring[];
  getFactorings!: Sequelize.HasManyGetAssociationsMixin<Factoring>;
  setFactorings!: Sequelize.HasManySetAssociationsMixin<Factoring, FactoringId>;
  addFactoring!: Sequelize.HasManyAddAssociationMixin<Factoring, FactoringId>;
  addFactorings!: Sequelize.HasManyAddAssociationsMixin<Factoring, FactoringId>;
  createFactoring!: Sequelize.HasManyCreateAssociationMixin<Factoring>;
  removeFactoring!: Sequelize.HasManyRemoveAssociationMixin<Factoring, FactoringId>;
  removeFactorings!: Sequelize.HasManyRemoveAssociationsMixin<Factoring, FactoringId>;
  hasFactoring!: Sequelize.HasManyHasAssociationMixin<Factoring, FactoringId>;
  hasFactorings!: Sequelize.HasManyHasAssociationsMixin<Factoring, FactoringId>;
  countFactorings!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Moneda {
    return Moneda.init({
    _idmoneda: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    monedaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_moneda_bancoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_moneda_code"
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    alias: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    codigo: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    simbolo: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(20),
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
    tableName: 'moneda',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idmoneda" },
        ]
      },
      {
        name: "UQ_moneda_bancoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "monedaid" },
        ]
      },
      {
        name: "UQ_moneda_code",
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
