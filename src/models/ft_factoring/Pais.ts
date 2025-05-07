import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Departamento, DepartamentoId } from './Departamento.js';
import type { Empresa, EmpresaId } from './Empresa.js';
import type { Factor, FactorId } from './Factor.js';
import type { Persona, PersonaId } from './Persona.js';

export interface PaisAttributes {
  _idpais: number;
  paisid: string;
  codigopais: string;
  nombrepais: string;
  nacionalidad: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type PaisPk = "_idpais";
export type PaisId = Pais[PaisPk];
export type PaisOptionalAttributes = "paisid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type PaisCreationAttributes = Optional<PaisAttributes, PaisOptionalAttributes>;

export class Pais extends Model<PaisAttributes, PaisCreationAttributes> implements PaisAttributes {
  _idpais!: number;
  paisid!: string;
  codigopais!: string;
  nombrepais!: string;
  nacionalidad!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // Pais hasMany Departamento via _idpais
  departamentos!: Departamento[];
  getDepartamentos!: Sequelize.HasManyGetAssociationsMixin<Departamento>;
  setDepartamentos!: Sequelize.HasManySetAssociationsMixin<Departamento, DepartamentoId>;
  addDepartamento!: Sequelize.HasManyAddAssociationMixin<Departamento, DepartamentoId>;
  addDepartamentos!: Sequelize.HasManyAddAssociationsMixin<Departamento, DepartamentoId>;
  createDepartamento!: Sequelize.HasManyCreateAssociationMixin<Departamento>;
  removeDepartamento!: Sequelize.HasManyRemoveAssociationMixin<Departamento, DepartamentoId>;
  removeDepartamentos!: Sequelize.HasManyRemoveAssociationsMixin<Departamento, DepartamentoId>;
  hasDepartamento!: Sequelize.HasManyHasAssociationMixin<Departamento, DepartamentoId>;
  hasDepartamentos!: Sequelize.HasManyHasAssociationsMixin<Departamento, DepartamentoId>;
  countDepartamentos!: Sequelize.HasManyCountAssociationsMixin;
  // Pais hasMany Empresa via _idpaissede
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
  // Pais hasMany Factor via _idpaissede
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
  // Pais hasMany Persona via _idpaisnacionalidad
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
  // Pais hasMany Persona via _idpaisnacimiento
  paisnacimiento_personas!: Persona[];
  get_idpaisnacimiento_personas!: Sequelize.HasManyGetAssociationsMixin<Persona>;
  set_idpaisnacimiento_personas!: Sequelize.HasManySetAssociationsMixin<Persona, PersonaId>;
  add_idpaisnacimiento_persona!: Sequelize.HasManyAddAssociationMixin<Persona, PersonaId>;
  add_idpaisnacimiento_personas!: Sequelize.HasManyAddAssociationsMixin<Persona, PersonaId>;
  create_idpaisnacimiento_persona!: Sequelize.HasManyCreateAssociationMixin<Persona>;
  remove_idpaisnacimiento_persona!: Sequelize.HasManyRemoveAssociationMixin<Persona, PersonaId>;
  remove_idpaisnacimiento_personas!: Sequelize.HasManyRemoveAssociationsMixin<Persona, PersonaId>;
  has_idpaisnacimiento_persona!: Sequelize.HasManyHasAssociationMixin<Persona, PersonaId>;
  has_idpaisnacimiento_personas!: Sequelize.HasManyHasAssociationsMixin<Persona, PersonaId>;
  count_idpaisnacimiento_personas!: Sequelize.HasManyCountAssociationsMixin;
  // Pais hasMany Persona via _idpaisresidencia
  paisresidencia_personas!: Persona[];
  get_idpaisresidencia_personas!: Sequelize.HasManyGetAssociationsMixin<Persona>;
  set_idpaisresidencia_personas!: Sequelize.HasManySetAssociationsMixin<Persona, PersonaId>;
  add_idpaisresidencia_persona!: Sequelize.HasManyAddAssociationMixin<Persona, PersonaId>;
  add_idpaisresidencia_personas!: Sequelize.HasManyAddAssociationsMixin<Persona, PersonaId>;
  create_idpaisresidencia_persona!: Sequelize.HasManyCreateAssociationMixin<Persona>;
  remove_idpaisresidencia_persona!: Sequelize.HasManyRemoveAssociationMixin<Persona, PersonaId>;
  remove_idpaisresidencia_personas!: Sequelize.HasManyRemoveAssociationsMixin<Persona, PersonaId>;
  has_idpaisresidencia_persona!: Sequelize.HasManyHasAssociationMixin<Persona, PersonaId>;
  has_idpaisresidencia_personas!: Sequelize.HasManyHasAssociationsMixin<Persona, PersonaId>;
  count_idpaisresidencia_personas!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Pais {
    return Pais.init({
    _idpais: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    paisid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_paisid"
    },
    codigopais: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    nombrepais: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    nacionalidad: {
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
    tableName: 'pais',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idpais" },
        ]
      },
      {
        name: "UQ_paisid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "paisid" },
        ]
      },
    ]
  });
  }
}
