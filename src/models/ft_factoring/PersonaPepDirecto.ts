import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Persona, PersonaId } from './Persona.js';

export interface PersonaPepDirectoAttributes {
  _idpersonapepdirecto: number;
  personapepdirectoid: string;
  _idpersona?: number;
  rucentidad: string;
  nombreentidad: string;
  cargoentidad: string;
  desde: string;
  hasta?: string;
  actualmente?: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type PersonaPepDirectoPk = "_idpersonapepdirecto";
export type PersonaPepDirectoId = PersonaPepDirecto[PersonaPepDirectoPk];
export type PersonaPepDirectoOptionalAttributes = "_idpersonapepdirecto" | "personapepdirectoid" | "_idpersona" | "hasta" | "actualmente" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type PersonaPepDirectoCreationAttributes = Optional<PersonaPepDirectoAttributes, PersonaPepDirectoOptionalAttributes>;

export class PersonaPepDirecto extends Model<PersonaPepDirectoAttributes, PersonaPepDirectoCreationAttributes> implements PersonaPepDirectoAttributes {
  _idpersonapepdirecto!: number;
  personapepdirectoid!: string;
  _idpersona?: number;
  rucentidad!: string;
  nombreentidad!: string;
  cargoentidad!: string;
  desde!: string;
  hasta?: string;
  actualmente?: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // PersonaPepDirecto belongsTo Persona via _idpersona
  persona_persona!: Persona;
  get_idpersona_persona!: Sequelize.BelongsToGetAssociationMixin<Persona>;
  set_idpersona_persona!: Sequelize.BelongsToSetAssociationMixin<Persona, PersonaId>;
  create_idpersona_persona!: Sequelize.BelongsToCreateAssociationMixin<Persona>;

  static initModel(sequelize: Sequelize.Sequelize): typeof PersonaPepDirecto {
    return PersonaPepDirecto.init({
    _idpersonapepdirecto: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    personapepdirectoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_personapepdirectoid"
    },
    _idpersona: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'persona',
        key: '_idpersona'
      }
    },
    rucentidad: {
      type: DataTypes.STRING(11),
      allowNull: false
    },
    nombreentidad: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    cargoentidad: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    desde: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    hasta: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    actualmente: {
      type: DataTypes.TINYINT,
      allowNull: true,
      comment: "1:si, 0:no"
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
    tableName: 'persona_pep_directo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idpersonapepdirecto" },
        ]
      },
      {
        name: "UQ_personapepdirectoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "personapepdirectoid" },
        ]
      },
      {
        name: "FK_persona_pep_directo_idpersona",
        using: "BTREE",
        fields: [
          { name: "_idpersona" },
        ]
      },
    ]
  });
  }
}
