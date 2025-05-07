import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Colaborador, ColaboradorId } from './Colaborador.js';
import type { Persona, PersonaId } from './Persona.js';
import type { Usuario, UsuarioId } from './Usuario.js';

export interface DocumentoTipoAttributes {
  _iddocumentotipo: number;
  documentotipoid: string;
  nombre: string;
  alias: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type DocumentoTipoPk = "_iddocumentotipo";
export type DocumentoTipoId = DocumentoTipo[DocumentoTipoPk];
export type DocumentoTipoOptionalAttributes = "_iddocumentotipo" | "documentotipoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type DocumentoTipoCreationAttributes = Optional<DocumentoTipoAttributes, DocumentoTipoOptionalAttributes>;

export class DocumentoTipo extends Model<DocumentoTipoAttributes, DocumentoTipoCreationAttributes> implements DocumentoTipoAttributes {
  _iddocumentotipo!: number;
  documentotipoid!: string;
  nombre!: string;
  alias!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // DocumentoTipo hasMany Colaborador via _iddocumentotipo
  colaboradors!: Colaborador[];
  getColaboradors!: Sequelize.HasManyGetAssociationsMixin<Colaborador>;
  setColaboradors!: Sequelize.HasManySetAssociationsMixin<Colaborador, ColaboradorId>;
  addColaborador!: Sequelize.HasManyAddAssociationMixin<Colaborador, ColaboradorId>;
  addColaboradors!: Sequelize.HasManyAddAssociationsMixin<Colaborador, ColaboradorId>;
  createColaborador!: Sequelize.HasManyCreateAssociationMixin<Colaborador>;
  removeColaborador!: Sequelize.HasManyRemoveAssociationMixin<Colaborador, ColaboradorId>;
  removeColaboradors!: Sequelize.HasManyRemoveAssociationsMixin<Colaborador, ColaboradorId>;
  hasColaborador!: Sequelize.HasManyHasAssociationMixin<Colaborador, ColaboradorId>;
  hasColaboradors!: Sequelize.HasManyHasAssociationsMixin<Colaborador, ColaboradorId>;
  countColaboradors!: Sequelize.HasManyCountAssociationsMixin;
  // DocumentoTipo hasMany Persona via _iddocumentotipo
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
  // DocumentoTipo hasMany Usuario via _iddocumentotipo
  usuarios!: Usuario[];
  getUsuarios!: Sequelize.HasManyGetAssociationsMixin<Usuario>;
  setUsuarios!: Sequelize.HasManySetAssociationsMixin<Usuario, UsuarioId>;
  addUsuario!: Sequelize.HasManyAddAssociationMixin<Usuario, UsuarioId>;
  addUsuarios!: Sequelize.HasManyAddAssociationsMixin<Usuario, UsuarioId>;
  createUsuario!: Sequelize.HasManyCreateAssociationMixin<Usuario>;
  removeUsuario!: Sequelize.HasManyRemoveAssociationMixin<Usuario, UsuarioId>;
  removeUsuarios!: Sequelize.HasManyRemoveAssociationsMixin<Usuario, UsuarioId>;
  hasUsuario!: Sequelize.HasManyHasAssociationMixin<Usuario, UsuarioId>;
  hasUsuarios!: Sequelize.HasManyHasAssociationsMixin<Usuario, UsuarioId>;
  countUsuarios!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof DocumentoTipo {
    return DocumentoTipo.init({
    _iddocumentotipo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    documentotipoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_documentotipoid"
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    alias: {
      type: DataTypes.STRING(50),
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
    tableName: 'documento_tipo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_iddocumentotipo" },
        ]
      },
      {
        name: "UQ_documentotipoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "documentotipoid" },
        ]
      },
    ]
  });
  }
}
