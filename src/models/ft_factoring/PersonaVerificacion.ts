import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Persona, PersonaId } from './Persona.js';
import type { PersonaVerificacionEstado, PersonaVerificacionEstadoId } from './PersonaVerificacionEstado.js';
import type { Usuario, UsuarioId } from './Usuario.js';

export interface PersonaVerificacionAttributes {
  _idpersonaverificacion: number;
  personaverificacionid: string;
  _idpersona: number;
  _idpersonaverificacionestado: number;
  _idusuarioverifica: number;
  comentariousuario: string;
  comentariointerno: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type PersonaVerificacionPk = "_idpersonaverificacion";
export type PersonaVerificacionId = PersonaVerificacion[PersonaVerificacionPk];
export type PersonaVerificacionOptionalAttributes = "_idpersonaverificacion" | "personaverificacionid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type PersonaVerificacionCreationAttributes = Optional<PersonaVerificacionAttributes, PersonaVerificacionOptionalAttributes>;

export class PersonaVerificacion extends Model<PersonaVerificacionAttributes, PersonaVerificacionCreationAttributes> implements PersonaVerificacionAttributes {
  _idpersonaverificacion!: number;
  personaverificacionid!: string;
  _idpersona!: number;
  _idpersonaverificacionestado!: number;
  _idusuarioverifica!: number;
  comentariousuario!: string;
  comentariointerno!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // PersonaVerificacion belongsTo Persona via _idpersona
  persona_persona!: Persona;
  get_idpersona_persona!: Sequelize.BelongsToGetAssociationMixin<Persona>;
  set_idpersona_persona!: Sequelize.BelongsToSetAssociationMixin<Persona, PersonaId>;
  create_idpersona_persona!: Sequelize.BelongsToCreateAssociationMixin<Persona>;
  // PersonaVerificacion belongsTo PersonaVerificacionEstado via _idpersonaverificacionestado
  personaverificacionestado_persona_verificacion_estado!: PersonaVerificacionEstado;
  get_idpersonaverificacionestado_persona_verificacion_estado!: Sequelize.BelongsToGetAssociationMixin<PersonaVerificacionEstado>;
  set_idpersonaverificacionestado_persona_verificacion_estado!: Sequelize.BelongsToSetAssociationMixin<PersonaVerificacionEstado, PersonaVerificacionEstadoId>;
  create_idpersonaverificacionestado_persona_verificacion_estado!: Sequelize.BelongsToCreateAssociationMixin<PersonaVerificacionEstado>;
  // PersonaVerificacion belongsTo Usuario via _idusuarioverifica
  usuarioverifica_usuario!: Usuario;
  get_idusuarioverifica_usuario!: Sequelize.BelongsToGetAssociationMixin<Usuario>;
  set_idusuarioverifica_usuario!: Sequelize.BelongsToSetAssociationMixin<Usuario, UsuarioId>;
  create_idusuarioverifica_usuario!: Sequelize.BelongsToCreateAssociationMixin<Usuario>;

  static initModel(sequelize: Sequelize.Sequelize): typeof PersonaVerificacion {
    return PersonaVerificacion.init({
    _idpersonaverificacion: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    personaverificacionid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_personaid"
    },
    _idpersona: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'persona',
        key: '_idpersona'
      }
    },
    _idpersonaverificacionestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'persona_verificacion_estado',
        key: '_idpersonaverificacionestado'
      }
    },
    _idusuarioverifica: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'usuario',
        key: '_idusuario'
      }
    },
    comentariousuario: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    comentariointerno: {
      type: DataTypes.TEXT,
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
    tableName: 'persona_verificacion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idpersonaverificacion" },
        ]
      },
      {
        name: "UQ_personaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "personaverificacionid" },
        ]
      },
      {
        name: "FK_persona_verificacion_idpersona",
        using: "BTREE",
        fields: [
          { name: "_idpersona" },
        ]
      },
      {
        name: "FK_persona_verificacion_idpersonaverificacionestado",
        using: "BTREE",
        fields: [
          { name: "_idpersonaverificacionestado" },
        ]
      },
      {
        name: "FK_persona_verificacion_idusuarioverifica",
        using: "BTREE",
        fields: [
          { name: "_idusuarioverifica" },
        ]
      },
    ]
  });
  }
}
