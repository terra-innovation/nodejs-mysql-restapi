import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { CuentaBancaria, CuentaBancariaId } from './CuentaBancaria.js';
import type { Persona, PersonaId } from './Persona.js';

export interface PersonaCuentaBancariaAttributes {
  _idpersonacuentabancaria: number;
  personacuentabancariaid: string;
  code: string;
  _idpersona: number;
  _idcuentabancaria: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type PersonaCuentaBancariaPk = "_idpersonacuentabancaria";
export type PersonaCuentaBancariaId = PersonaCuentaBancaria[PersonaCuentaBancariaPk];
export type PersonaCuentaBancariaOptionalAttributes = "_idpersonacuentabancaria" | "personacuentabancariaid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type PersonaCuentaBancariaCreationAttributes = Optional<PersonaCuentaBancariaAttributes, PersonaCuentaBancariaOptionalAttributes>;

export class PersonaCuentaBancaria extends Model<PersonaCuentaBancariaAttributes, PersonaCuentaBancariaCreationAttributes> implements PersonaCuentaBancariaAttributes {
  _idpersonacuentabancaria!: number;
  personacuentabancariaid!: string;
  code!: string;
  _idpersona!: number;
  _idcuentabancaria!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // PersonaCuentaBancaria belongsTo CuentaBancaria via _idcuentabancaria
  cuentabancaria_cuenta_bancarium!: CuentaBancaria;
  get_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToGetAssociationMixin<CuentaBancaria>;
  set_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToSetAssociationMixin<CuentaBancaria, CuentaBancariaId>;
  create_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToCreateAssociationMixin<CuentaBancaria>;
  // PersonaCuentaBancaria belongsTo Persona via _idpersona
  persona_persona!: Persona;
  get_idpersona_persona!: Sequelize.BelongsToGetAssociationMixin<Persona>;
  set_idpersona_persona!: Sequelize.BelongsToSetAssociationMixin<Persona, PersonaId>;
  create_idpersona_persona!: Sequelize.BelongsToCreateAssociationMixin<Persona>;

  static initModel(sequelize: Sequelize.Sequelize): typeof PersonaCuentaBancaria {
    return PersonaCuentaBancaria.init({
    _idpersonacuentabancaria: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    personacuentabancariaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_persona_cuenta_bancaria_personacuentabancariaid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_persona_cuenta_bancaria_code"
    },
    _idpersona: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'persona',
        key: '_idpersona'
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
    tableName: 'persona_cuenta_bancaria',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idpersonacuentabancaria" },
        ]
      },
      {
        name: "UQ_persona_cuenta_bancaria_personacuentabancariaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "personacuentabancariaid" },
        ]
      },
      {
        name: "UQ_persona_cuenta_bancaria_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "UQ_persona_cuenta_bancaria_idpersona__idcuentabancaria",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idpersona" },
          { name: "_idcuentabancaria" },
        ]
      },
      {
        name: "FK_persona_cuenta_bancaria_idcuentabancaria",
        using: "BTREE",
        fields: [
          { name: "_idcuentabancaria" },
        ]
      },
    ]
  });
  }
}
