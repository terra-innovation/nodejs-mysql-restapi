import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { CuentaBancaria, CuentaBancariaId } from './CuentaBancaria.js';
import type { Inversionista, InversionistaId } from './Inversionista.js';
import type { InversionistaDeposito, InversionistaDepositoId } from './InversionistaDeposito.js';
import type { InversionistaRetiro, InversionistaRetiroId } from './InversionistaRetiro.js';

export interface InversionistaCuentaBancariaAttributes {
  _idinversionistacuentabancaria: number;
  inversionistacuentabancariaid: string;
  code: string;
  _idinversionista: number;
  _idcuentabancaria: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type InversionistaCuentaBancariaPk = "_idinversionistacuentabancaria";
export type InversionistaCuentaBancariaId = InversionistaCuentaBancaria[InversionistaCuentaBancariaPk];
export type InversionistaCuentaBancariaOptionalAttributes = "_idinversionistacuentabancaria" | "inversionistacuentabancariaid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type InversionistaCuentaBancariaCreationAttributes = Optional<InversionistaCuentaBancariaAttributes, InversionistaCuentaBancariaOptionalAttributes>;

export class InversionistaCuentaBancaria extends Model<InversionistaCuentaBancariaAttributes, InversionistaCuentaBancariaCreationAttributes> implements InversionistaCuentaBancariaAttributes {
  _idinversionistacuentabancaria!: number;
  inversionistacuentabancariaid!: string;
  code!: string;
  _idinversionista!: number;
  _idcuentabancaria!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // InversionistaCuentaBancaria belongsTo CuentaBancaria via _idcuentabancaria
  cuentabancaria_cuenta_bancarium!: CuentaBancaria;
  get_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToGetAssociationMixin<CuentaBancaria>;
  set_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToSetAssociationMixin<CuentaBancaria, CuentaBancariaId>;
  create_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToCreateAssociationMixin<CuentaBancaria>;
  // InversionistaCuentaBancaria belongsTo Inversionista via _idinversionista
  inversionista_inversionistum!: Inversionista;
  get_idinversionista_inversionistum!: Sequelize.BelongsToGetAssociationMixin<Inversionista>;
  set_idinversionista_inversionistum!: Sequelize.BelongsToSetAssociationMixin<Inversionista, InversionistaId>;
  create_idinversionista_inversionistum!: Sequelize.BelongsToCreateAssociationMixin<Inversionista>;
  // InversionistaCuentaBancaria hasMany InversionistaDeposito via _idinversionistacuentabancaria
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
  // InversionistaCuentaBancaria hasMany InversionistaRetiro via _idinversionistacuentabancaria
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

  static initModel(sequelize: Sequelize.Sequelize): typeof InversionistaCuentaBancaria {
    return InversionistaCuentaBancaria.init({
    _idinversionistacuentabancaria: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    inversionistacuentabancariaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_inversionistacuentabancaria_inversionistacuentabancariaid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_inversionistacuentabancaria_code"
    },
    _idinversionista: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'inversionista',
        key: '_idinversionista'
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
    tableName: 'inversionista_cuenta_bancaria',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idinversionistacuentabancaria" },
        ]
      },
      {
        name: "UQ_inversionistacuentabancaria_inversionistacuentabancariaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "inversionistacuentabancariaid" },
        ]
      },
      {
        name: "UQ_inversionistacuentabancaria_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_inversionistacuentabancaria_idinversionista",
        using: "BTREE",
        fields: [
          { name: "_idinversionista" },
        ]
      },
      {
        name: "FK_inversionistacuentabancaria_idcuentabancaria",
        using: "BTREE",
        fields: [
          { name: "_idcuentabancaria" },
        ]
      },
    ]
  });
  }
}
