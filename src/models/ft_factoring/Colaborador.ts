import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Archivo, ArchivoId } from './Archivo.js';
import type { ArchivoColaborador, ArchivoColaboradorId } from './ArchivoColaborador.js';
import type { ColaboradorTipo, ColaboradorTipoId } from './ColaboradorTipo.js';
import type { DocumentoTipo, DocumentoTipoId } from './DocumentoTipo.js';
import type { Empresa, EmpresaId } from './Empresa.js';
import type { Factoring, FactoringId } from './Factoring.js';
import type { Persona, PersonaId } from './Persona.js';

export interface ColaboradorAttributes {
  _idcolaborador: number;
  colaboradorid: string;
  _idempresa?: number;
  _idpersona?: number;
  _idcolaboradortipo?: number;
  _iddocumentotipo?: number;
  documentonumero?: string;
  nombrecolaborador: string;
  apellidocolaborador: string;
  cargo: string;
  email: string;
  telefono: string;
  poderpartidanumero: string;
  poderpartidaciudad: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ColaboradorPk = "_idcolaborador";
export type ColaboradorId = Colaborador[ColaboradorPk];
export type ColaboradorOptionalAttributes = "_idcolaborador" | "colaboradorid" | "_idempresa" | "_idpersona" | "_idcolaboradortipo" | "_iddocumentotipo" | "documentonumero" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ColaboradorCreationAttributes = Optional<ColaboradorAttributes, ColaboradorOptionalAttributes>;

export class Colaborador extends Model<ColaboradorAttributes, ColaboradorCreationAttributes> implements ColaboradorAttributes {
  _idcolaborador!: number;
  colaboradorid!: string;
  _idempresa?: number;
  _idpersona?: number;
  _idcolaboradortipo?: number;
  _iddocumentotipo?: number;
  documentonumero?: string;
  nombrecolaborador!: string;
  apellidocolaborador!: string;
  cargo!: string;
  email!: string;
  telefono!: string;
  poderpartidanumero!: string;
  poderpartidaciudad!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // Colaborador belongsToMany Archivo via _idcolaborador and _idarchivo
  archivo_archivos!: Archivo[];
  get_idarchivo_archivos!: Sequelize.BelongsToManyGetAssociationsMixin<Archivo>;
  set_idarchivo_archivos!: Sequelize.BelongsToManySetAssociationsMixin<Archivo, ArchivoId>;
  add_idarchivo_archivo!: Sequelize.BelongsToManyAddAssociationMixin<Archivo, ArchivoId>;
  add_idarchivo_archivos!: Sequelize.BelongsToManyAddAssociationsMixin<Archivo, ArchivoId>;
  create_idarchivo_archivo!: Sequelize.BelongsToManyCreateAssociationMixin<Archivo>;
  remove_idarchivo_archivo!: Sequelize.BelongsToManyRemoveAssociationMixin<Archivo, ArchivoId>;
  remove_idarchivo_archivos!: Sequelize.BelongsToManyRemoveAssociationsMixin<Archivo, ArchivoId>;
  has_idarchivo_archivo!: Sequelize.BelongsToManyHasAssociationMixin<Archivo, ArchivoId>;
  has_idarchivo_archivos!: Sequelize.BelongsToManyHasAssociationsMixin<Archivo, ArchivoId>;
  count_idarchivo_archivos!: Sequelize.BelongsToManyCountAssociationsMixin;
  // Colaborador hasMany ArchivoColaborador via _idcolaborador
  archivo_colaboradors!: ArchivoColaborador[];
  getArchivo_colaboradors!: Sequelize.HasManyGetAssociationsMixin<ArchivoColaborador>;
  setArchivo_colaboradors!: Sequelize.HasManySetAssociationsMixin<ArchivoColaborador, ArchivoColaboradorId>;
  addArchivo_colaborador!: Sequelize.HasManyAddAssociationMixin<ArchivoColaborador, ArchivoColaboradorId>;
  addArchivo_colaboradors!: Sequelize.HasManyAddAssociationsMixin<ArchivoColaborador, ArchivoColaboradorId>;
  createArchivo_colaborador!: Sequelize.HasManyCreateAssociationMixin<ArchivoColaborador>;
  removeArchivo_colaborador!: Sequelize.HasManyRemoveAssociationMixin<ArchivoColaborador, ArchivoColaboradorId>;
  removeArchivo_colaboradors!: Sequelize.HasManyRemoveAssociationsMixin<ArchivoColaborador, ArchivoColaboradorId>;
  hasArchivo_colaborador!: Sequelize.HasManyHasAssociationMixin<ArchivoColaborador, ArchivoColaboradorId>;
  hasArchivo_colaboradors!: Sequelize.HasManyHasAssociationsMixin<ArchivoColaborador, ArchivoColaboradorId>;
  countArchivo_colaboradors!: Sequelize.HasManyCountAssociationsMixin;
  // Colaborador hasMany Factoring via _idcontactocedente
  factorings!: Factoring[];
  getFactorings!: Sequelize.HasManyGetAssociationsMixin<Factoring>;
  setFactorings!: Sequelize.HasManySetAssociationsMixin<Factoring, FactoringId>;
  addFactoring!: Sequelize.HasManyAddAssociationMixin<Factoring, FactoringId>;
  addFactorings!: Sequelize.HasManyAddAssociationsMixin<Factoring, FactoringId>;
  createFactoring!: Sequelize.HasManyCreateAssociationMixin<Factoring>;
  removeFactoring!: Sequelize.HasManyRemoveAssociationMixin<Factoring, FactoringId>;
  removeFactorings!: Sequelize.HasManyRemoveAssociationsMixin<Factoring, FactoringId>;
  hasFactoring!: Sequelize.HasManyHasAssociationMixin<Factoring, FactoringId>;
  hasFactorings!: Sequelize.HasManyHasAssociationsMixin<Factoring, FactoringId>;
  countFactorings!: Sequelize.HasManyCountAssociationsMixin;
  // Colaborador belongsTo ColaboradorTipo via _idcolaboradortipo
  colaboradortipo_colaborador_tipo!: ColaboradorTipo;
  get_idcolaboradortipo_colaborador_tipo!: Sequelize.BelongsToGetAssociationMixin<ColaboradorTipo>;
  set_idcolaboradortipo_colaborador_tipo!: Sequelize.BelongsToSetAssociationMixin<ColaboradorTipo, ColaboradorTipoId>;
  create_idcolaboradortipo_colaborador_tipo!: Sequelize.BelongsToCreateAssociationMixin<ColaboradorTipo>;
  // Colaborador belongsTo DocumentoTipo via _iddocumentotipo
  documentotipo_documento_tipo!: DocumentoTipo;
  get_iddocumentotipo_documento_tipo!: Sequelize.BelongsToGetAssociationMixin<DocumentoTipo>;
  set_iddocumentotipo_documento_tipo!: Sequelize.BelongsToSetAssociationMixin<DocumentoTipo, DocumentoTipoId>;
  create_iddocumentotipo_documento_tipo!: Sequelize.BelongsToCreateAssociationMixin<DocumentoTipo>;
  // Colaborador belongsTo Empresa via _idempresa
  empresa_empresa!: Empresa;
  get_idempresa_empresa!: Sequelize.BelongsToGetAssociationMixin<Empresa>;
  set_idempresa_empresa!: Sequelize.BelongsToSetAssociationMixin<Empresa, EmpresaId>;
  create_idempresa_empresa!: Sequelize.BelongsToCreateAssociationMixin<Empresa>;
  // Colaborador belongsTo Persona via _idpersona
  persona_persona!: Persona;
  get_idpersona_persona!: Sequelize.BelongsToGetAssociationMixin<Persona>;
  set_idpersona_persona!: Sequelize.BelongsToSetAssociationMixin<Persona, PersonaId>;
  create_idpersona_persona!: Sequelize.BelongsToCreateAssociationMixin<Persona>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Colaborador {
    return Colaborador.init({
    _idcolaborador: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    colaboradorid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid')
    },
    _idempresa: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'empresa',
        key: '_idempresa'
      }
    },
    _idpersona: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'persona',
        key: '_idpersona'
      }
    },
    _idcolaboradortipo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'colaborador_tipo',
        key: '_idcolaboradortipo'
      }
    },
    _iddocumentotipo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'documento_tipo',
        key: '_iddocumentotipo'
      }
    },
    documentonumero: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    nombrecolaborador: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    apellidocolaborador: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cargo: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    poderpartidanumero: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    poderpartidaciudad: {
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
    tableName: 'colaborador',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idcolaborador" },
        ]
      },
      {
        name: "FK_colaborador_idempresa",
        using: "BTREE",
        fields: [
          { name: "_idempresa" },
        ]
      },
      {
        name: "FK_colaborador_idcolaboradortipo",
        using: "BTREE",
        fields: [
          { name: "_idcolaboradortipo" },
        ]
      },
      {
        name: "FK_colaborador_iddocumentotipo",
        using: "BTREE",
        fields: [
          { name: "_iddocumentotipo" },
        ]
      },
      {
        name: "FK_colaborador_idpersona",
        using: "BTREE",
        fields: [
          { name: "_idpersona" },
        ]
      },
    ]
  });
  }
}
