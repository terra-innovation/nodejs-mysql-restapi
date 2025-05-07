import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { CuentaBancaria, CuentaBancariaId } from './CuentaBancaria.js';
import type { Empresa, EmpresaId } from './Empresa.js';
import type { FactoringPago, FactoringPagoId } from './FactoringPago.js';

export interface EmpresaCuentaBancariaAttributes {
  _idempresacuentabancaria: number;
  empresacuentabancariaid: string;
  code: string;
  _idempresa: number;
  _idcuentabancaria: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type EmpresaCuentaBancariaPk = "_idempresacuentabancaria";
export type EmpresaCuentaBancariaId = EmpresaCuentaBancaria[EmpresaCuentaBancariaPk];
export type EmpresaCuentaBancariaOptionalAttributes = "_idempresacuentabancaria" | "empresacuentabancariaid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type EmpresaCuentaBancariaCreationAttributes = Optional<EmpresaCuentaBancariaAttributes, EmpresaCuentaBancariaOptionalAttributes>;

export class EmpresaCuentaBancaria extends Model<EmpresaCuentaBancariaAttributes, EmpresaCuentaBancariaCreationAttributes> implements EmpresaCuentaBancariaAttributes {
  _idempresacuentabancaria!: number;
  empresacuentabancariaid!: string;
  code!: string;
  _idempresa!: number;
  _idcuentabancaria!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // EmpresaCuentaBancaria belongsTo CuentaBancaria via _idcuentabancaria
  cuentabancaria_cuenta_bancarium!: CuentaBancaria;
  get_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToGetAssociationMixin<CuentaBancaria>;
  set_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToSetAssociationMixin<CuentaBancaria, CuentaBancariaId>;
  create_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToCreateAssociationMixin<CuentaBancaria>;
  // EmpresaCuentaBancaria belongsTo Empresa via _idempresa
  empresa_empresa!: Empresa;
  get_idempresa_empresa!: Sequelize.BelongsToGetAssociationMixin<Empresa>;
  set_idempresa_empresa!: Sequelize.BelongsToSetAssociationMixin<Empresa, EmpresaId>;
  create_idempresa_empresa!: Sequelize.BelongsToCreateAssociationMixin<Empresa>;
  // EmpresaCuentaBancaria hasMany FactoringPago via _idempresacuentabancaria
  factoring_pagos!: FactoringPago[];
  getFactoring_pagos!: Sequelize.HasManyGetAssociationsMixin<FactoringPago>;
  setFactoring_pagos!: Sequelize.HasManySetAssociationsMixin<FactoringPago, FactoringPagoId>;
  addFactoring_pago!: Sequelize.HasManyAddAssociationMixin<FactoringPago, FactoringPagoId>;
  addFactoring_pagos!: Sequelize.HasManyAddAssociationsMixin<FactoringPago, FactoringPagoId>;
  createFactoring_pago!: Sequelize.HasManyCreateAssociationMixin<FactoringPago>;
  removeFactoring_pago!: Sequelize.HasManyRemoveAssociationMixin<FactoringPago, FactoringPagoId>;
  removeFactoring_pagos!: Sequelize.HasManyRemoveAssociationsMixin<FactoringPago, FactoringPagoId>;
  hasFactoring_pago!: Sequelize.HasManyHasAssociationMixin<FactoringPago, FactoringPagoId>;
  hasFactoring_pagos!: Sequelize.HasManyHasAssociationsMixin<FactoringPago, FactoringPagoId>;
  countFactoring_pagos!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof EmpresaCuentaBancaria {
    return EmpresaCuentaBancaria.init({
    _idempresacuentabancaria: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    empresacuentabancariaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_empresacuentabancaria_empresacuentabancariaid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_empresacuentabancaria_code"
    },
    _idempresa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresa',
        key: '_idempresa'
      }
    },
    _idcuentabancaria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cuenta_bancaria',
        key: '_idcuentabancaria'
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
    tableName: 'empresa_cuenta_bancaria',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idempresacuentabancaria" },
        ]
      },
      {
        name: "UQ_empresacuentabancaria_empresacuentabancariaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "empresacuentabancariaid" },
        ]
      },
      {
        name: "UQ_empresacuentabancaria_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "UQ_empresacuentabancaria_idempresa_idcuentabancaria",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idempresa" },
          { name: "_idcuentabancaria" },
        ]
      },
      {
        name: "FK_empresacuentabancaria_idcuentabancaria",
        using: "BTREE",
        fields: [
          { name: "_idcuentabancaria" },
        ]
      },
    ]
  });
  }
}
