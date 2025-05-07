import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Empresa, EmpresaId } from './Empresa.js';
import type { Factor, FactorId } from './Factor.js';
import type { Pais, PaisId } from './Pais.js';
import type { Persona, PersonaId } from './Persona.js';
import type { Provincia, ProvinciaId } from './Provincia.js';

export interface DepartamentoAttributes {
  _iddepartamento: number;
  departamentoid: string;
  _idpais: number;
  codigodepartamento: string;
  nombredepartamento: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type DepartamentoPk = "_iddepartamento";
export type DepartamentoId = Departamento[DepartamentoPk];
export type DepartamentoOptionalAttributes = "departamentoid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type DepartamentoCreationAttributes = Optional<DepartamentoAttributes, DepartamentoOptionalAttributes>;

export class Departamento extends Model<DepartamentoAttributes, DepartamentoCreationAttributes> implements DepartamentoAttributes {
  _iddepartamento!: number;
  departamentoid!: string;
  _idpais!: number;
  codigodepartamento!: string;
  nombredepartamento!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // Departamento hasMany Empresa via _iddepartamentosede
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
  // Departamento hasMany Factor via _iddepartamentosede
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
  // Departamento hasMany Persona via _iddepartamentoresidencia
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
  // Departamento hasMany Provincia via _iddepartamento
  provincia!: Provincia[];
  getProvincia!: Sequelize.HasManyGetAssociationsMixin<Provincia>;
  setProvincia!: Sequelize.HasManySetAssociationsMixin<Provincia, ProvinciaId>;
  addProvincium!: Sequelize.HasManyAddAssociationMixin<Provincia, ProvinciaId>;
  addProvincia!: Sequelize.HasManyAddAssociationsMixin<Provincia, ProvinciaId>;
  createProvincium!: Sequelize.HasManyCreateAssociationMixin<Provincia>;
  removeProvincium!: Sequelize.HasManyRemoveAssociationMixin<Provincia, ProvinciaId>;
  removeProvincia!: Sequelize.HasManyRemoveAssociationsMixin<Provincia, ProvinciaId>;
  hasProvincium!: Sequelize.HasManyHasAssociationMixin<Provincia, ProvinciaId>;
  hasProvincia!: Sequelize.HasManyHasAssociationsMixin<Provincia, ProvinciaId>;
  countProvincia!: Sequelize.HasManyCountAssociationsMixin;
  // Departamento belongsTo Pais via _idpais
  pais_pai!: Pais;
  get_idpais_pai!: Sequelize.BelongsToGetAssociationMixin<Pais>;
  set_idpais_pai!: Sequelize.BelongsToSetAssociationMixin<Pais, PaisId>;
  create_idpais_pai!: Sequelize.BelongsToCreateAssociationMixin<Pais>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Departamento {
    return Departamento.init({
    _iddepartamento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    departamentoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_departamentoid"
    },
    _idpais: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pais',
        key: '_idpais'
      }
    },
    codigodepartamento: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    nombredepartamento: {
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
    tableName: 'departamento',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_iddepartamento" },
        ]
      },
      {
        name: "UQ_departamentoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "departamentoid" },
        ]
      },
      {
        name: "FK_departamento_idpais",
        using: "BTREE",
        fields: [
          { name: "_idpais" },
        ]
      },
    ]
  });
  }
}
