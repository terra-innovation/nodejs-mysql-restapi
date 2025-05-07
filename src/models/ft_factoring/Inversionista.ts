import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { BancoCuenta, BancoCuentaId } from './BancoCuenta.js';
import type { InversionistaBancoCuenta, InversionistaBancoCuentaId } from './InversionistaBancoCuenta.js';
import type { InversionistaCuentaBancaria, InversionistaCuentaBancariaId } from './InversionistaCuentaBancaria.js';
import type { Persona, PersonaId } from './Persona.js';

export interface InversionistaAttributes {
  _idinversionista: number;
  inversionistaid: string;
  code: string;
  _idpersona: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type InversionistaPk = "_idinversionista";
export type InversionistaId = Inversionista[InversionistaPk];
export type InversionistaOptionalAttributes = "_idinversionista" | "inversionistaid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type InversionistaCreationAttributes = Optional<InversionistaAttributes, InversionistaOptionalAttributes>;

export class Inversionista extends Model<InversionistaAttributes, InversionistaCreationAttributes> implements InversionistaAttributes {
  _idinversionista!: number;
  inversionistaid!: string;
  code!: string;
  _idpersona!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // Inversionista belongsToMany BancoCuenta via _idinversionista and _idbancocuenta
  bancocuenta_banco_cuenta!: BancoCuenta[];
  get_idbancocuenta_banco_cuenta!: Sequelize.BelongsToManyGetAssociationsMixin<BancoCuenta>;
  set_idbancocuenta_banco_cuenta!: Sequelize.BelongsToManySetAssociationsMixin<BancoCuenta, BancoCuentaId>;
  add_idbancocuenta_banco_cuentum!: Sequelize.BelongsToManyAddAssociationMixin<BancoCuenta, BancoCuentaId>;
  add_idbancocuenta_banco_cuenta!: Sequelize.BelongsToManyAddAssociationsMixin<BancoCuenta, BancoCuentaId>;
  create_idbancocuenta_banco_cuentum!: Sequelize.BelongsToManyCreateAssociationMixin<BancoCuenta>;
  remove_idbancocuenta_banco_cuentum!: Sequelize.BelongsToManyRemoveAssociationMixin<BancoCuenta, BancoCuentaId>;
  remove_idbancocuenta_banco_cuenta!: Sequelize.BelongsToManyRemoveAssociationsMixin<BancoCuenta, BancoCuentaId>;
  has_idbancocuenta_banco_cuentum!: Sequelize.BelongsToManyHasAssociationMixin<BancoCuenta, BancoCuentaId>;
  has_idbancocuenta_banco_cuenta!: Sequelize.BelongsToManyHasAssociationsMixin<BancoCuenta, BancoCuentaId>;
  count_idbancocuenta_banco_cuenta!: Sequelize.BelongsToManyCountAssociationsMixin;
  // Inversionista hasMany InversionistaBancoCuenta via _idinversionista
  inversionista_banco_cuenta!: InversionistaBancoCuenta[];
  getInversionista_banco_cuenta!: Sequelize.HasManyGetAssociationsMixin<InversionistaBancoCuenta>;
  setInversionista_banco_cuenta!: Sequelize.HasManySetAssociationsMixin<InversionistaBancoCuenta, InversionistaBancoCuentaId>;
  addInversionista_banco_cuentum!: Sequelize.HasManyAddAssociationMixin<InversionistaBancoCuenta, InversionistaBancoCuentaId>;
  addInversionista_banco_cuenta!: Sequelize.HasManyAddAssociationsMixin<InversionistaBancoCuenta, InversionistaBancoCuentaId>;
  createInversionista_banco_cuentum!: Sequelize.HasManyCreateAssociationMixin<InversionistaBancoCuenta>;
  removeInversionista_banco_cuentum!: Sequelize.HasManyRemoveAssociationMixin<InversionistaBancoCuenta, InversionistaBancoCuentaId>;
  removeInversionista_banco_cuenta!: Sequelize.HasManyRemoveAssociationsMixin<InversionistaBancoCuenta, InversionistaBancoCuentaId>;
  hasInversionista_banco_cuentum!: Sequelize.HasManyHasAssociationMixin<InversionistaBancoCuenta, InversionistaBancoCuentaId>;
  hasInversionista_banco_cuenta!: Sequelize.HasManyHasAssociationsMixin<InversionistaBancoCuenta, InversionistaBancoCuentaId>;
  countInversionista_banco_cuenta!: Sequelize.HasManyCountAssociationsMixin;
  // Inversionista hasMany InversionistaCuentaBancaria via _idinversionista
  inversionista_cuenta_bancaria!: InversionistaCuentaBancaria[];
  getInversionista_cuenta_bancaria!: Sequelize.HasManyGetAssociationsMixin<InversionistaCuentaBancaria>;
  setInversionista_cuenta_bancaria!: Sequelize.HasManySetAssociationsMixin<InversionistaCuentaBancaria, InversionistaCuentaBancariaId>;
  addInversionista_cuenta_bancarium!: Sequelize.HasManyAddAssociationMixin<InversionistaCuentaBancaria, InversionistaCuentaBancariaId>;
  addInversionista_cuenta_bancaria!: Sequelize.HasManyAddAssociationsMixin<InversionistaCuentaBancaria, InversionistaCuentaBancariaId>;
  createInversionista_cuenta_bancarium!: Sequelize.HasManyCreateAssociationMixin<InversionistaCuentaBancaria>;
  removeInversionista_cuenta_bancarium!: Sequelize.HasManyRemoveAssociationMixin<InversionistaCuentaBancaria, InversionistaCuentaBancariaId>;
  removeInversionista_cuenta_bancaria!: Sequelize.HasManyRemoveAssociationsMixin<InversionistaCuentaBancaria, InversionistaCuentaBancariaId>;
  hasInversionista_cuenta_bancarium!: Sequelize.HasManyHasAssociationMixin<InversionistaCuentaBancaria, InversionistaCuentaBancariaId>;
  hasInversionista_cuenta_bancaria!: Sequelize.HasManyHasAssociationsMixin<InversionistaCuentaBancaria, InversionistaCuentaBancariaId>;
  countInversionista_cuenta_bancaria!: Sequelize.HasManyCountAssociationsMixin;
  // Inversionista belongsTo Persona via _idpersona
  persona_persona!: Persona;
  get_idpersona_persona!: Sequelize.BelongsToGetAssociationMixin<Persona>;
  set_idpersona_persona!: Sequelize.BelongsToSetAssociationMixin<Persona, PersonaId>;
  create_idpersona_persona!: Sequelize.BelongsToCreateAssociationMixin<Persona>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Inversionista {
    return Inversionista.init({
    _idinversionista: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    inversionistaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_inversionista_inversionistaid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_inversionista_code"
    },
    _idpersona: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'persona',
        key: '_idpersona'
      },
      unique: "FK_inversionista_idpersona"
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
    tableName: 'inversionista',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idinversionista" },
        ]
      },
      {
        name: "UQ_inversionista_inversionistaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "inversionistaid" },
        ]
      },
      {
        name: "UQ_inversionista_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "UQ_inversionista_idpersona",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idpersona" },
        ]
      },
    ]
  });
  }
}
