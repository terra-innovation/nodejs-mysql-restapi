import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Persona, PersonaId } from './Persona.js';

export interface PersonaDeclaracionAttributes {
  _idpersonadeclaracion: number;
  personadeclaracionid: string;
  _idpersona: number;
  espep?: number;
  tienevinculopep?: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type PersonaDeclaracionPk = "_idpersonadeclaracion";
export type PersonaDeclaracionId = PersonaDeclaracion[PersonaDeclaracionPk];
export type PersonaDeclaracionOptionalAttributes = "_idpersonadeclaracion" | "personadeclaracionid" | "espep" | "tienevinculopep" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type PersonaDeclaracionCreationAttributes = Optional<PersonaDeclaracionAttributes, PersonaDeclaracionOptionalAttributes>;

export class PersonaDeclaracion extends Model<PersonaDeclaracionAttributes, PersonaDeclaracionCreationAttributes> implements PersonaDeclaracionAttributes {
  _idpersonadeclaracion!: number;
  personadeclaracionid!: string;
  _idpersona!: number;
  espep?: number;
  tienevinculopep?: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // PersonaDeclaracion belongsTo Persona via _idpersona
  persona_persona!: Persona;
  get_idpersona_persona!: Sequelize.BelongsToGetAssociationMixin<Persona>;
  set_idpersona_persona!: Sequelize.BelongsToSetAssociationMixin<Persona, PersonaId>;
  create_idpersona_persona!: Sequelize.BelongsToCreateAssociationMixin<Persona>;

  static initModel(sequelize: Sequelize.Sequelize): typeof PersonaDeclaracion {
    return PersonaDeclaracion.init({
    _idpersonadeclaracion: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    personadeclaracionid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_personadeclaracionid"
    },
    _idpersona: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'persona',
        key: '_idpersona'
      }
    },
    espep: {
      type: DataTypes.TINYINT,
      allowNull: true,
      comment: "Declaro que soy una Persona Expuesta Políticamente"
    },
    tienevinculopep: {
      type: DataTypes.TINYINT,
      allowNull: true,
      comment: "Declaro que tengo un vínculo con una Persona Expuesta"
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
    tableName: 'persona_declaracion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idpersonadeclaracion" },
        ]
      },
      {
        name: "UQ_personadeclaracionid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "personadeclaracionid" },
        ]
      },
      {
        name: "FK_persona_declaracion_idpersona",
        using: "BTREE",
        fields: [
          { name: "_idpersona" },
        ]
      },
    ]
  });
  }
}
