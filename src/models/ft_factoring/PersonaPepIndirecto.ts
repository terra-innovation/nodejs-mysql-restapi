import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { PepVinculo, PepVinculoId } from './PepVinculo.js';
import type { Persona, PersonaId } from './Persona.js';

export interface PersonaPepIndirectoAttributes {
  _idpersonapepindirecto: number;
  personapepindirectoid: string;
  _idpersona?: number;
  _idpepevinculo?: number;
  identificacionpep: string;
  nombrescompletospep: string;
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

export type PersonaPepIndirectoPk = "_idpersonapepindirecto";
export type PersonaPepIndirectoId = PersonaPepIndirecto[PersonaPepIndirectoPk];
export type PersonaPepIndirectoOptionalAttributes = "_idpersonapepindirecto" | "personapepindirectoid" | "_idpersona" | "_idpepevinculo" | "hasta" | "actualmente" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type PersonaPepIndirectoCreationAttributes = Optional<PersonaPepIndirectoAttributes, PersonaPepIndirectoOptionalAttributes>;

export class PersonaPepIndirecto extends Model<PersonaPepIndirectoAttributes, PersonaPepIndirectoCreationAttributes> implements PersonaPepIndirectoAttributes {
  _idpersonapepindirecto!: number;
  personapepindirectoid!: string;
  _idpersona?: number;
  _idpepevinculo?: number;
  identificacionpep!: string;
  nombrescompletospep!: string;
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

  // PersonaPepIndirecto belongsTo PepVinculo via _idpepevinculo
  pepevinculo_pep_vinculo!: PepVinculo;
  get_idpepevinculo_pep_vinculo!: Sequelize.BelongsToGetAssociationMixin<PepVinculo>;
  set_idpepevinculo_pep_vinculo!: Sequelize.BelongsToSetAssociationMixin<PepVinculo, PepVinculoId>;
  create_idpepevinculo_pep_vinculo!: Sequelize.BelongsToCreateAssociationMixin<PepVinculo>;
  // PersonaPepIndirecto belongsTo Persona via _idpersona
  persona_persona!: Persona;
  get_idpersona_persona!: Sequelize.BelongsToGetAssociationMixin<Persona>;
  set_idpersona_persona!: Sequelize.BelongsToSetAssociationMixin<Persona, PersonaId>;
  create_idpersona_persona!: Sequelize.BelongsToCreateAssociationMixin<Persona>;

  static initModel(sequelize: Sequelize.Sequelize): typeof PersonaPepIndirecto {
    return PersonaPepIndirecto.init({
    _idpersonapepindirecto: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    personapepindirectoid: {
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
    _idpepevinculo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'pep_vinculo',
        key: '_idpepvinculo'
      }
    },
    identificacionpep: {
      type: DataTypes.STRING(12),
      allowNull: false
    },
    nombrescompletospep: {
      type: DataTypes.STRING(300),
      allowNull: false
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
    tableName: 'persona_pep_indirecto',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idpersonapepindirecto" },
        ]
      },
      {
        name: "UQ_personapepdirectoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "personapepindirectoid" },
        ]
      },
      {
        name: "FK_persona_pep_directo_idpersona",
        using: "BTREE",
        fields: [
          { name: "_idpersona" },
        ]
      },
      {
        name: "FK_persona_pep_indirecto_idpepevinculo",
        using: "BTREE",
        fields: [
          { name: "_idpepevinculo" },
        ]
      },
    ]
  });
  }
}
