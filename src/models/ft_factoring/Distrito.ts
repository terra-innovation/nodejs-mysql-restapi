import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Empresa, EmpresaId } from './Empresa.js';
import type { Factor, FactorId } from './Factor.js';
import type { Persona, PersonaId } from './Persona.js';
import type { Provincia, ProvinciaId } from './Provincia.js';
import type { RegionNatural, RegionNaturalId } from './RegionNatural.js';

export interface DistritoAttributes {
  _iddistrito: number;
  distritoid: string;
  _idprovincia: number;
  _idregionnatural: number;
  codigodistrito: string;
  nombredistrito: string;
  capitallegal: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type DistritoPk = "_iddistrito";
export type DistritoId = Distrito[DistritoPk];
export type DistritoOptionalAttributes = "distritoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type DistritoCreationAttributes = Optional<DistritoAttributes, DistritoOptionalAttributes>;

export class Distrito extends Model<DistritoAttributes, DistritoCreationAttributes> implements DistritoAttributes {
  _iddistrito!: number;
  distritoid!: string;
  _idprovincia!: number;
  _idregionnatural!: number;
  codigodistrito!: string;
  nombredistrito!: string;
  capitallegal!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // Distrito hasMany Empresa via _iddistritosede
  empresas!: Empresa[];
  getEmpresas!: Sequelize.HasManyGetAssociationsMixin<Empresa>;
  setEmpresas!: Sequelize.HasManySetAssociationsMixin<Empresa, EmpresaId>;
  addEmpresa!: Sequelize.HasManyAddAssociationMixin<Empresa, EmpresaId>;
  addEmpresas!: Sequelize.HasManyAddAssociationsMixin<Empresa, EmpresaId>;
  createEmpresa!: Sequelize.HasManyCreateAssociationMixin<Empresa>;
  removeEmpresa!: Sequelize.HasManyRemoveAssociationMixin<Empresa, EmpresaId>;
  removeEmpresas!: Sequelize.HasManyRemoveAssociationsMixin<Empresa, EmpresaId>;
  hasEmpresa!: Sequelize.HasManyHasAssociationMixin<Empresa, EmpresaId>;
  hasEmpresas!: Sequelize.HasManyHasAssociationsMixin<Empresa, EmpresaId>;
  countEmpresas!: Sequelize.HasManyCountAssociationsMixin;
  // Distrito hasMany Factor via _iddistritosede
  factors!: Factor[];
  getFactors!: Sequelize.HasManyGetAssociationsMixin<Factor>;
  setFactors!: Sequelize.HasManySetAssociationsMixin<Factor, FactorId>;
  addFactor!: Sequelize.HasManyAddAssociationMixin<Factor, FactorId>;
  addFactors!: Sequelize.HasManyAddAssociationsMixin<Factor, FactorId>;
  createFactor!: Sequelize.HasManyCreateAssociationMixin<Factor>;
  removeFactor!: Sequelize.HasManyRemoveAssociationMixin<Factor, FactorId>;
  removeFactors!: Sequelize.HasManyRemoveAssociationsMixin<Factor, FactorId>;
  hasFactor!: Sequelize.HasManyHasAssociationMixin<Factor, FactorId>;
  hasFactors!: Sequelize.HasManyHasAssociationsMixin<Factor, FactorId>;
  countFactors!: Sequelize.HasManyCountAssociationsMixin;
  // Distrito hasMany Persona via _iddistritoresidencia
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
  // Distrito belongsTo Provincia via _idprovincia
  provincia_provincium!: Provincia;
  get_idprovincia_provincium!: Sequelize.BelongsToGetAssociationMixin<Provincia>;
  set_idprovincia_provincium!: Sequelize.BelongsToSetAssociationMixin<Provincia, ProvinciaId>;
  create_idprovincia_provincium!: Sequelize.BelongsToCreateAssociationMixin<Provincia>;
  // Distrito belongsTo RegionNatural via _idregionnatural
  regionnatural_region_natural!: RegionNatural;
  get_idregionnatural_region_natural!: Sequelize.BelongsToGetAssociationMixin<RegionNatural>;
  set_idregionnatural_region_natural!: Sequelize.BelongsToSetAssociationMixin<RegionNatural, RegionNaturalId>;
  create_idregionnatural_region_natural!: Sequelize.BelongsToCreateAssociationMixin<RegionNatural>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Distrito {
    return Distrito.init({
    _iddistrito: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    distritoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_distritoid"
    },
    _idprovincia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'provincia',
        key: '_idprovincia'
      }
    },
    _idregionnatural: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'region_natural',
        key: '_idregionnatural'
      }
    },
    codigodistrito: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    nombredistrito: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    capitallegal: {
      type: DataTypes.STRING(200),
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
    tableName: 'distrito',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_iddistrito" },
        ]
      },
      {
        name: "UQ_distritoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "distritoid" },
        ]
      },
      {
        name: "FK_distrito_idprovincia",
        using: "BTREE",
        fields: [
          { name: "_idprovincia" },
        ]
      },
      {
        name: "FK_distrito_idregionnatural",
        using: "BTREE",
        fields: [
          { name: "_idregionnatural" },
        ]
      },
    ]
  });
  }
}
