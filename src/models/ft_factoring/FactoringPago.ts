import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { EmpresaCuentaBancaria, EmpresaCuentaBancariaId } from './EmpresaCuentaBancaria.js';
import type { FactorCuentaBancaria, FactorCuentaBancariaId } from './FactorCuentaBancaria.js';
import type { Factoring, FactoringId } from './Factoring.js';

export interface FactoringPagoAttributes {
  _idfactoringpago: number;
  factoringpagoid: string;
  code: string;
  _idfactoring: number;
  _idempresacuentabancaria: number;
  _idfactorcuentabancaria: number;
  numero_operacion: string;
  fecha_pago: Date | Sequelize.Utils.Fn;
  monto_pagado: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FactoringPagoPk = "_idfactoringpago";
export type FactoringPagoId = FactoringPago[FactoringPagoPk];
export type FactoringPagoOptionalAttributes = "_idfactoringpago" | "factoringpagoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FactoringPagoCreationAttributes = Optional<FactoringPagoAttributes, FactoringPagoOptionalAttributes>;

export class FactoringPago extends Model<FactoringPagoAttributes, FactoringPagoCreationAttributes> implements FactoringPagoAttributes {
  _idfactoringpago!: number;
  factoringpagoid!: string;
  code!: string;
  _idfactoring!: number;
  _idempresacuentabancaria!: number;
  _idfactorcuentabancaria!: number;
  numero_operacion!: string;
  fecha_pago!: Date;
  monto_pagado!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FactoringPago belongsTo EmpresaCuentaBancaria via _idempresacuentabancaria
  empresacuentabancaria_empresa_cuenta_bancarium!: EmpresaCuentaBancaria;
  get_idempresacuentabancaria_empresa_cuenta_bancarium!: Sequelize.BelongsToGetAssociationMixin<EmpresaCuentaBancaria>;
  set_idempresacuentabancaria_empresa_cuenta_bancarium!: Sequelize.BelongsToSetAssociationMixin<EmpresaCuentaBancaria, EmpresaCuentaBancariaId>;
  create_idempresacuentabancaria_empresa_cuenta_bancarium!: Sequelize.BelongsToCreateAssociationMixin<EmpresaCuentaBancaria>;
  // FactoringPago belongsTo FactorCuentaBancaria via _idfactorcuentabancaria
  factorcuentabancaria_factor_cuenta_bancarium!: FactorCuentaBancaria;
  get_idfactorcuentabancaria_factor_cuenta_bancarium!: Sequelize.BelongsToGetAssociationMixin<FactorCuentaBancaria>;
  set_idfactorcuentabancaria_factor_cuenta_bancarium!: Sequelize.BelongsToSetAssociationMixin<FactorCuentaBancaria, FactorCuentaBancariaId>;
  create_idfactorcuentabancaria_factor_cuenta_bancarium!: Sequelize.BelongsToCreateAssociationMixin<FactorCuentaBancaria>;
  // FactoringPago belongsTo Factoring via _idfactoring
  factoring_factoring!: Factoring;
  get_idfactoring_factoring!: Sequelize.BelongsToGetAssociationMixin<Factoring>;
  set_idfactoring_factoring!: Sequelize.BelongsToSetAssociationMixin<Factoring, FactoringId>;
  create_idfactoring_factoring!: Sequelize.BelongsToCreateAssociationMixin<Factoring>;

  static initModel(sequelize: Sequelize.Sequelize): typeof FactoringPago {
    return FactoringPago.init({
    _idfactoringpago: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    factoringpagoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoringpago_factoringpagoid"
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "UQ_factoringpago_code"
    },
    _idfactoring: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'factoring',
        key: '_idfactoring'
      }
    },
    _idempresacuentabancaria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresa_cuenta_bancaria',
        key: '_idempresacuentabancaria'
      }
    },
    _idfactorcuentabancaria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'factor_cuenta_bancaria',
        key: '_idfactorcuentabancaria'
      }
    },
    numero_operacion: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    fecha_pago: {
      type: DataTypes.DATE,
      allowNull: false
    },
    monto_pagado: {
      type: DataTypes.DECIMAL(10,2),
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
    tableName: 'factoring_pago',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringpago" },
        ]
      },
      {
        name: "UQ_factoringpago_factoringpagoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringpagoid" },
        ]
      },
      {
        name: "UQ_factoringpago_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "_idaceptante",
        using: "BTREE",
        fields: [
          { name: "_idfactoring" },
        ]
      },
      {
        name: "_idcedente",
        using: "BTREE",
        fields: [
          { name: "_idfactorcuentabancaria" },
        ]
      },
      {
        name: "_idmoneda",
        using: "BTREE",
        fields: [
          { name: "_idempresacuentabancaria" },
        ]
      },
    ]
  });
  }
}
