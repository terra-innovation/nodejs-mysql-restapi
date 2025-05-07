import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Persona, PersonaId } from './Persona.js';
import type { PersonaVerificacion, PersonaVerificacionId } from './PersonaVerificacion.js';

export interface PersonaVerificacionEstadoAttributes {
  _idpersonaverificacionestado: number;
  personaverificacionestadoid: string;
  code: string;
  nombre: string;
  alias: string;
  color: string;
  ispersonavalidated: number;
  isestadofinal: number;
  isusuarioedit: number;
  isenabledcomentariousuario: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type PersonaVerificacionEstadoPk = "_idpersonaverificacionestado";
export type PersonaVerificacionEstadoId = PersonaVerificacionEstado[PersonaVerificacionEstadoPk];
export type PersonaVerificacionEstadoOptionalAttributes = "personaverificacionestadoid" | "ispersonavalidated" | "isestadofinal" | "isusuarioedit" | "isenabledcomentariousuario" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type PersonaVerificacionEstadoCreationAttributes = Optional<PersonaVerificacionEstadoAttributes, PersonaVerificacionEstadoOptionalAttributes>;

export class PersonaVerificacionEstado extends Model<PersonaVerificacionEstadoAttributes, PersonaVerificacionEstadoCreationAttributes> implements PersonaVerificacionEstadoAttributes {
  _idpersonaverificacionestado!: number;
  personaverificacionestadoid!: string;
  code!: string;
  nombre!: string;
  alias!: string;
  color!: string;
  ispersonavalidated!: number;
  isestadofinal!: number;
  isusuarioedit!: number;
  isenabledcomentariousuario!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // PersonaVerificacionEstado hasMany Persona via _idpersonaverificacionestado
  personas!: Persona[];
  getPersonas!: Sequelize.HasManyGetAssociationsMixin<Persona>;
  setPersonas!: Sequelize.HasManySetAssociationsMixin<Persona, PersonaId>;
  addPersona!: Sequelize.HasManyAddAssociationMixin<Persona, PersonaId>;
  addPersonas!: Sequelize.HasManyAddAssociationsMixin<Persona, PersonaId>;
  createPersona!: Sequelize.HasManyCreateAssociationMixin<Persona>;
  removePersona!: Sequelize.HasManyRemoveAssociationMixin<Persona, PersonaId>;
  removePersonas!: Sequelize.HasManyRemoveAssociationsMixin<Persona, PersonaId>;
  hasPersona!: Sequelize.HasManyHasAssociationMixin<Persona, PersonaId>;
  hasPersonas!: Sequelize.HasManyHasAssociationsMixin<Persona, PersonaId>;
  countPersonas!: Sequelize.HasManyCountAssociationsMixin;
  // PersonaVerificacionEstado hasMany PersonaVerificacion via _idpersonaverificacionestado
  persona_verificacions!: PersonaVerificacion[];
  getPersona_verificacions!: Sequelize.HasManyGetAssociationsMixin<PersonaVerificacion>;
  setPersona_verificacions!: Sequelize.HasManySetAssociationsMixin<PersonaVerificacion, PersonaVerificacionId>;
  addPersona_verificacion!: Sequelize.HasManyAddAssociationMixin<PersonaVerificacion, PersonaVerificacionId>;
  addPersona_verificacions!: Sequelize.HasManyAddAssociationsMixin<PersonaVerificacion, PersonaVerificacionId>;
  createPersona_verificacion!: Sequelize.HasManyCreateAssociationMixin<PersonaVerificacion>;
  removePersona_verificacion!: Sequelize.HasManyRemoveAssociationMixin<PersonaVerificacion, PersonaVerificacionId>;
  removePersona_verificacions!: Sequelize.HasManyRemoveAssociationsMixin<PersonaVerificacion, PersonaVerificacionId>;
  hasPersona_verificacion!: Sequelize.HasManyHasAssociationMixin<PersonaVerificacion, PersonaVerificacionId>;
  hasPersona_verificacions!: Sequelize.HasManyHasAssociationsMixin<PersonaVerificacion, PersonaVerificacionId>;
  countPersona_verificacions!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof PersonaVerificacionEstado {
    return PersonaVerificacionEstado.init({
    _idpersonaverificacionestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    personaverificacionestadoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_personaverificacionestadoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false
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
      allowNull: false
    },
    ispersonavalidated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
      comment: "True si la persona ha sido validada correctamente"
    },
    isestadofinal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
      comment: "True si es estado final y el usuario ya no puede editar"
    },
    isusuarioedit: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
      comment: "True si el usuario puede editar su solicitud de verificación"
    },
    isenabledcomentariousuario: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
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
    tableName: 'persona_verificacion_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idpersonaverificacionestado" },
        ]
      },
      {
        name: "UQ_personaverificacionestadoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "personaverificacionestadoid" },
        ]
      },
    ]
  });
  }
}
