import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Departamento, DepartamentoId } from './Departamento.js';
import type { Distrito, DistritoId } from './Distrito.js';
import type { Empresa, EmpresaId } from './Empresa.js';
import type { Factor, FactorId } from './Factor.js';
import type { Persona, PersonaId } from './Persona.js';

export interface ProvinciaAttributes {
  _idprovincia: number;
  provinciaid: string;
  _iddepartamento: number;
  codigoprovincia: string;
  nombreprovincia: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ProvinciaPk = "_idprovincia";
export type ProvinciaId = Provincia[ProvinciaPk];
export type ProvinciaOptionalAttributes = "provinciaid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ProvinciaCreationAttributes = Optional<ProvinciaAttributes, ProvinciaOptionalAttributes>;

export class Provincia extends Model<ProvinciaAttributes, ProvinciaCreationAttributes> implements ProvinciaAttributes {
  _idprovincia!: number;
  provinciaid!: string;
  _iddepartamento!: number;
  codigoprovincia!: string;
  nombreprovincia!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // Provincia belongsTo Departamento via _iddepartamento
  departamento_departamento!: Departamento;
  get_iddepartamento_departamento!: Sequelize.BelongsToGetAssociationMixin<Departamento>;
  set_iddepartamento_departamento!: Sequelize.BelongsToSetAssociationMixin<Departamento, DepartamentoId>;
  create_iddepartamento_departamento!: Sequelize.BelongsToCreateAssociationMixin<Departamento>;
  // Provincia hasMany Distrito via _idprovincia
  distritos!: Distrito[];
  getDistritos!: Sequelize.HasManyGetAssociationsMixin<Distrito>;
  setDistritos!: Sequelize.HasManySetAssociationsMixin<Distrito, DistritoId>;
  addDistrito!: Sequelize.HasManyAddAssociationMixin<Distrito, DistritoId>;
  addDistritos!: Sequelize.HasManyAddAssociationsMixin<Distrito, DistritoId>;
  createDistrito!: Sequelize.HasManyCreateAssociationMixin<Distrito>;
  removeDistrito!: Sequelize.HasManyRemoveAssociationMixin<Distrito, DistritoId>;
  removeDistritos!: Sequelize.HasManyRemoveAssociationsMixin<Distrito, DistritoId>;
  hasDistrito!: Sequelize.HasManyHasAssociationMixin<Distrito, DistritoId>;
  hasDistritos!: Sequelize.HasManyHasAssociationsMixin<Distrito, DistritoId>;
  countDistritos!: Sequelize.HasManyCountAssociationsMixin;
  // Provincia hasMany Empresa via _idprovinciasede
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
  // Provincia hasMany Factor via _idprovinciasede
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
  // Provincia hasMany Persona via _idprovinciaresidencia
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

  static initModel(sequelize: Sequelize.Sequelize): typeof Provincia {
    return Provincia.init({
    _idprovincia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    provinciaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_provinciaid"
    },
    _iddepartamento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'departamento',
        key: '_iddepartamento'
      }
    },
    codigoprovincia: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    nombreprovincia: {
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
    tableName: 'provincia',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idprovincia" },
        ]
      },
      {
        name: "UQ_provinciaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "provinciaid" },
        ]
      },
      {
        name: "FK_provincia_iddepartamento",
        using: "BTREE",
        fields: [
          { name: "_iddepartamento" },
        ]
      },
    ]
  });
  }
}
