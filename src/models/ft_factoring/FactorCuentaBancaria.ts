import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { CuentaBancaria, CuentaBancariaId } from './CuentaBancaria.js';
import type { Factor, FactorId } from './Factor.js';
import type { FactoringPago, FactoringPagoId } from './FactoringPago.js';
import type { InversionistaDeposito, InversionistaDepositoId } from './InversionistaDeposito.js';
import type { InversionistaRetiro, InversionistaRetiroId } from './InversionistaRetiro.js';

export interface FactorCuentaBancariaAttributes {
  _idfactorcuentabancaria: number;
  factorcuentabancariaid: string;
  code: string;
  _idfactor: number;
  _idcuentabancaria: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FactorCuentaBancariaPk = "_idfactorcuentabancaria";
export type FactorCuentaBancariaId = FactorCuentaBancaria[FactorCuentaBancariaPk];
export type FactorCuentaBancariaOptionalAttributes = "factorcuentabancariaid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FactorCuentaBancariaCreationAttributes = Optional<FactorCuentaBancariaAttributes, FactorCuentaBancariaOptionalAttributes>;

export class FactorCuentaBancaria extends Model<FactorCuentaBancariaAttributes, FactorCuentaBancariaCreationAttributes> implements FactorCuentaBancariaAttributes {
  _idfactorcuentabancaria!: number;
  factorcuentabancariaid!: string;
  code!: string;
  _idfactor!: number;
  _idcuentabancaria!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FactorCuentaBancaria belongsTo CuentaBancaria via _idcuentabancaria
  cuentabancaria_cuenta_bancarium!: CuentaBancaria;
  get_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToGetAssociationMixin<CuentaBancaria>;
  set_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToSetAssociationMixin<CuentaBancaria, CuentaBancariaId>;
  create_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToCreateAssociationMixin<CuentaBancaria>;
  // FactorCuentaBancaria belongsTo Factor via _idfactor
  factor_factor!: Factor;
  get_idfactor_factor!: Sequelize.BelongsToGetAssociationMixin<Factor>;
  set_idfactor_factor!: Sequelize.BelongsToSetAssociationMixin<Factor, FactorId>;
  create_idfactor_factor!: Sequelize.BelongsToCreateAssociationMixin<Factor>;
  // FactorCuentaBancaria hasMany FactoringPago via _idfactorcuentabancaria
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
  // FactorCuentaBancaria hasMany InversionistaDeposito via _idfactorcuentabancaria
  inversionista_depositos!: InversionistaDeposito[];
  getInversionista_depositos!: Sequelize.HasManyGetAssociationsMixin<InversionistaDeposito>;
  setInversionista_depositos!: Sequelize.HasManySetAssociationsMixin<InversionistaDeposito, InversionistaDepositoId>;
  addInversionista_deposito!: Sequelize.HasManyAddAssociationMixin<InversionistaDeposito, InversionistaDepositoId>;
  addInversionista_depositos!: Sequelize.HasManyAddAssociationsMixin<InversionistaDeposito, InversionistaDepositoId>;
  createInversionista_deposito!: Sequelize.HasManyCreateAssociationMixin<InversionistaDeposito>;
  removeInversionista_deposito!: Sequelize.HasManyRemoveAssociationMixin<InversionistaDeposito, InversionistaDepositoId>;
  removeInversionista_depositos!: Sequelize.HasManyRemoveAssociationsMixin<InversionistaDeposito, InversionistaDepositoId>;
  hasInversionista_deposito!: Sequelize.HasManyHasAssociationMixin<InversionistaDeposito, InversionistaDepositoId>;
  hasInversionista_depositos!: Sequelize.HasManyHasAssociationsMixin<InversionistaDeposito, InversionistaDepositoId>;
  countInversionista_depositos!: Sequelize.HasManyCountAssociationsMixin;
  // FactorCuentaBancaria hasMany InversionistaRetiro via _idfactorcuentabancaria
  inversionista_retiros!: InversionistaRetiro[];
  getInversionista_retiros!: Sequelize.HasManyGetAssociationsMixin<InversionistaRetiro>;
  setInversionista_retiros!: Sequelize.HasManySetAssociationsMixin<InversionistaRetiro, InversionistaRetiroId>;
  addInversionista_retiro!: Sequelize.HasManyAddAssociationMixin<InversionistaRetiro, InversionistaRetiroId>;
  addInversionista_retiros!: Sequelize.HasManyAddAssociationsMixin<InversionistaRetiro, InversionistaRetiroId>;
  createInversionista_retiro!: Sequelize.HasManyCreateAssociationMixin<InversionistaRetiro>;
  removeInversionista_retiro!: Sequelize.HasManyRemoveAssociationMixin<InversionistaRetiro, InversionistaRetiroId>;
  removeInversionista_retiros!: Sequelize.HasManyRemoveAssociationsMixin<InversionistaRetiro, InversionistaRetiroId>;
  hasInversionista_retiro!: Sequelize.HasManyHasAssociationMixin<InversionistaRetiro, InversionistaRetiroId>;
  hasInversionista_retiros!: Sequelize.HasManyHasAssociationsMixin<InversionistaRetiro, InversionistaRetiroId>;
  countInversionista_retiros!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof FactorCuentaBancaria {
    return FactorCuentaBancaria.init({
    _idfactorcuentabancaria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    factorcuentabancariaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factorcuentabancaria_factorcuentabancariaid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_factorcuentabancaria_code"
    },
    _idfactor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'factor',
        key: '_idfactor'
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
    tableName: 'factor_cuenta_bancaria',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactorcuentabancaria" },
        ]
      },
      {
        name: "UQ_factorcuentabancaria_factorcuentabancariaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factorcuentabancariaid" },
        ]
      },
      {
        name: "UQ_factorcuentabancaria_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_factorcuentabancaria_idfactor",
        using: "BTREE",
        fields: [
          { name: "_idfactor" },
        ]
      },
      {
        name: "FK_factorcuentabancaria_idcuentabancaria",
        using: "BTREE",
        fields: [
          { name: "_idcuentabancaria" },
        ]
      },
    ]
  });
  }
}
