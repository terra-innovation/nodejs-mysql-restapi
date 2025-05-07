import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { CuentaBancaria, CuentaBancariaId } from './CuentaBancaria.js';

export interface CuentaBancariaEstadoAttributes {
  _idcuentabancariaestado: number;
  cuentabancariaestadoid: string;
  nombre: string;
  alias: string;
  color?: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type CuentaBancariaEstadoPk = "_idcuentabancariaestado";
export type CuentaBancariaEstadoId = CuentaBancariaEstado[CuentaBancariaEstadoPk];
export type CuentaBancariaEstadoOptionalAttributes = "_idcuentabancariaestado" | "cuentabancariaestadoid" | "color" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type CuentaBancariaEstadoCreationAttributes = Optional<CuentaBancariaEstadoAttributes, CuentaBancariaEstadoOptionalAttributes>;

export class CuentaBancariaEstado extends Model<CuentaBancariaEstadoAttributes, CuentaBancariaEstadoCreationAttributes> implements CuentaBancariaEstadoAttributes {
  _idcuentabancariaestado!: number;
  cuentabancariaestadoid!: string;
  nombre!: string;
  alias!: string;
  color?: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // CuentaBancariaEstado hasMany CuentaBancaria via _idcuentabancariaestado
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

  static initModel(sequelize: Sequelize.Sequelize): typeof CuentaBancariaEstado {
    return CuentaBancariaEstado.init({
    _idcuentabancariaestado: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cuentabancariaestadoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_bancoid"
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    alias: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(50),
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
    tableName: 'cuenta_bancaria_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idcuentabancariaestado" },
        ]
      },
      {
        name: "UQ_bancoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "cuentabancariaestadoid" },
        ]
      },
    ]
  });
  }
}
