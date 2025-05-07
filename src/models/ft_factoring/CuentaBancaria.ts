import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Archivo, ArchivoId } from './Archivo.js';
import type { ArchivoCuentaBancaria, ArchivoCuentaBancariaId } from './ArchivoCuentaBancaria.js';
import type { Banco, BancoId } from './Banco.js';
import type { CuentaBancariaEstado, CuentaBancariaEstadoId } from './CuentaBancariaEstado.js';
import type { CuentaTipo, CuentaTipoId } from './CuentaTipo.js';
import type { EmpresaCuentaBancaria, EmpresaCuentaBancariaId } from './EmpresaCuentaBancaria.js';
import type { FactorCuentaBancaria, FactorCuentaBancariaId } from './FactorCuentaBancaria.js';
import type { Factoring, FactoringId } from './Factoring.js';
import type { InversionistaCuentaBancaria, InversionistaCuentaBancariaId } from './InversionistaCuentaBancaria.js';
import type { Moneda, MonedaId } from './Moneda.js';
import type { PersonaCuentaBancaria, PersonaCuentaBancariaId } from './PersonaCuentaBancaria.js';

export interface CuentaBancariaAttributes {
  _idcuentabancaria: number;
  cuentabancariaid: string;
  code: string;
  _idbanco: number;
  _idcuentatipo: number;
  _idmoneda: number;
  _idcuentabancariaestado: number;
  numero: string;
  cci: string;
  alias: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type CuentaBancariaPk = "_idcuentabancaria";
export type CuentaBancariaId = CuentaBancaria[CuentaBancariaPk];
export type CuentaBancariaOptionalAttributes = "_idcuentabancaria" | "cuentabancariaid" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type CuentaBancariaCreationAttributes = Optional<CuentaBancariaAttributes, CuentaBancariaOptionalAttributes>;

export class CuentaBancaria extends Model<CuentaBancariaAttributes, CuentaBancariaCreationAttributes> implements CuentaBancariaAttributes {
  _idcuentabancaria!: number;
  cuentabancariaid!: string;
  code!: string;
  _idbanco!: number;
  _idcuentatipo!: number;
  _idmoneda!: number;
  _idcuentabancariaestado!: number;
  numero!: string;
  cci!: string;
  alias!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // CuentaBancaria belongsTo Banco via _idbanco
  banco_banco!: Banco;
  get_idbanco_banco!: Sequelize.BelongsToGetAssociationMixin<Banco>;
  set_idbanco_banco!: Sequelize.BelongsToSetAssociationMixin<Banco, BancoId>;
  create_idbanco_banco!: Sequelize.BelongsToCreateAssociationMixin<Banco>;
  // CuentaBancaria belongsToMany Archivo via _idcuentabancaria and _idarchivo
  archivo_archivo_archivo_cuenta_bancaria!: Archivo[];
  get_idarchivo_archivo_archivo_cuenta_bancaria!: Sequelize.BelongsToManyGetAssociationsMixin<Archivo>;
  set_idarchivo_archivo_archivo_cuenta_bancaria!: Sequelize.BelongsToManySetAssociationsMixin<Archivo, ArchivoId>;
  add_idarchivo_archivo_archivo_cuenta_bancarium!: Sequelize.BelongsToManyAddAssociationMixin<Archivo, ArchivoId>;
  add_idarchivo_archivo_archivo_cuenta_bancaria!: Sequelize.BelongsToManyAddAssociationsMixin<Archivo, ArchivoId>;
  create_idarchivo_archivo_archivo_cuenta_bancarium!: Sequelize.BelongsToManyCreateAssociationMixin<Archivo>;
  remove_idarchivo_archivo_archivo_cuenta_bancarium!: Sequelize.BelongsToManyRemoveAssociationMixin<Archivo, ArchivoId>;
  remove_idarchivo_archivo_archivo_cuenta_bancaria!: Sequelize.BelongsToManyRemoveAssociationsMixin<Archivo, ArchivoId>;
  has_idarchivo_archivo_archivo_cuenta_bancarium!: Sequelize.BelongsToManyHasAssociationMixin<Archivo, ArchivoId>;
  has_idarchivo_archivo_archivo_cuenta_bancaria!: Sequelize.BelongsToManyHasAssociationsMixin<Archivo, ArchivoId>;
  count_idarchivo_archivo_archivo_cuenta_bancaria!: Sequelize.BelongsToManyCountAssociationsMixin;
  // CuentaBancaria hasMany ArchivoCuentaBancaria via _idcuentabancaria
  archivo_cuenta_bancaria!: ArchivoCuentaBancaria[];
  getArchivo_cuenta_bancaria!: Sequelize.HasManyGetAssociationsMixin<ArchivoCuentaBancaria>;
  setArchivo_cuenta_bancaria!: Sequelize.HasManySetAssociationsMixin<ArchivoCuentaBancaria, ArchivoCuentaBancariaId>;
  addArchivo_cuenta_bancarium!: Sequelize.HasManyAddAssociationMixin<ArchivoCuentaBancaria, ArchivoCuentaBancariaId>;
  addArchivo_cuenta_bancaria!: Sequelize.HasManyAddAssociationsMixin<ArchivoCuentaBancaria, ArchivoCuentaBancariaId>;
  createArchivo_cuenta_bancarium!: Sequelize.HasManyCreateAssociationMixin<ArchivoCuentaBancaria>;
  removeArchivo_cuenta_bancarium!: Sequelize.HasManyRemoveAssociationMixin<ArchivoCuentaBancaria, ArchivoCuentaBancariaId>;
  removeArchivo_cuenta_bancaria!: Sequelize.HasManyRemoveAssociationsMixin<ArchivoCuentaBancaria, ArchivoCuentaBancariaId>;
  hasArchivo_cuenta_bancarium!: Sequelize.HasManyHasAssociationMixin<ArchivoCuentaBancaria, ArchivoCuentaBancariaId>;
  hasArchivo_cuenta_bancaria!: Sequelize.HasManyHasAssociationsMixin<ArchivoCuentaBancaria, ArchivoCuentaBancariaId>;
  countArchivo_cuenta_bancaria!: Sequelize.HasManyCountAssociationsMixin;
  // CuentaBancaria hasMany EmpresaCuentaBancaria via _idcuentabancaria
  empresa_cuenta_bancaria!: EmpresaCuentaBancaria[];
  getEmpresa_cuenta_bancaria!: Sequelize.HasManyGetAssociationsMixin<EmpresaCuentaBancaria>;
  setEmpresa_cuenta_bancaria!: Sequelize.HasManySetAssociationsMixin<EmpresaCuentaBancaria, EmpresaCuentaBancariaId>;
  addEmpresa_cuenta_bancarium!: Sequelize.HasManyAddAssociationMixin<EmpresaCuentaBancaria, EmpresaCuentaBancariaId>;
  addEmpresa_cuenta_bancaria!: Sequelize.HasManyAddAssociationsMixin<EmpresaCuentaBancaria, EmpresaCuentaBancariaId>;
  createEmpresa_cuenta_bancarium!: Sequelize.HasManyCreateAssociationMixin<EmpresaCuentaBancaria>;
  removeEmpresa_cuenta_bancarium!: Sequelize.HasManyRemoveAssociationMixin<EmpresaCuentaBancaria, EmpresaCuentaBancariaId>;
  removeEmpresa_cuenta_bancaria!: Sequelize.HasManyRemoveAssociationsMixin<EmpresaCuentaBancaria, EmpresaCuentaBancariaId>;
  hasEmpresa_cuenta_bancarium!: Sequelize.HasManyHasAssociationMixin<EmpresaCuentaBancaria, EmpresaCuentaBancariaId>;
  hasEmpresa_cuenta_bancaria!: Sequelize.HasManyHasAssociationsMixin<EmpresaCuentaBancaria, EmpresaCuentaBancariaId>;
  countEmpresa_cuenta_bancaria!: Sequelize.HasManyCountAssociationsMixin;
  // CuentaBancaria hasMany FactorCuentaBancaria via _idcuentabancaria
  factor_cuenta_bancaria!: FactorCuentaBancaria[];
  getFactor_cuenta_bancaria!: Sequelize.HasManyGetAssociationsMixin<FactorCuentaBancaria>;
  setFactor_cuenta_bancaria!: Sequelize.HasManySetAssociationsMixin<FactorCuentaBancaria, FactorCuentaBancariaId>;
  addFactor_cuenta_bancarium!: Sequelize.HasManyAddAssociationMixin<FactorCuentaBancaria, FactorCuentaBancariaId>;
  addFactor_cuenta_bancaria!: Sequelize.HasManyAddAssociationsMixin<FactorCuentaBancaria, FactorCuentaBancariaId>;
  createFactor_cuenta_bancarium!: Sequelize.HasManyCreateAssociationMixin<FactorCuentaBancaria>;
  removeFactor_cuenta_bancarium!: Sequelize.HasManyRemoveAssociationMixin<FactorCuentaBancaria, FactorCuentaBancariaId>;
  removeFactor_cuenta_bancaria!: Sequelize.HasManyRemoveAssociationsMixin<FactorCuentaBancaria, FactorCuentaBancariaId>;
  hasFactor_cuenta_bancarium!: Sequelize.HasManyHasAssociationMixin<FactorCuentaBancaria, FactorCuentaBancariaId>;
  hasFactor_cuenta_bancaria!: Sequelize.HasManyHasAssociationsMixin<FactorCuentaBancaria, FactorCuentaBancariaId>;
  countFactor_cuenta_bancaria!: Sequelize.HasManyCountAssociationsMixin;
  // CuentaBancaria hasMany Factoring via _idcuentabancaria
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
  // CuentaBancaria hasMany InversionistaCuentaBancaria via _idcuentabancaria
  inversionista_cuenta_bancaria!: InversionistaCuentaBancaria[];
  getInversionista_cuenta_bancaria!: Sequelize.HasManyGetAssociationsMixin<InversionistaCuentaBancaria>;
  setInversionista_cuenta_bancaria!: Sequelize.HasManySetAssociationsMixin<InversionistaCuentaBancaria, InversionistaCuentaBancariaId>;
  addInversionista_cuenta_bancarium!: Sequelize.HasManyAddAssociationMixin<InversionistaCuentaBancaria, InversionistaCuentaBancariaId>;
  addInversionista_cuenta_bancaria!: Sequelize.HasManyAddAssociationsMixin<InversionistaCuentaBancaria, InversionistaCuentaBancariaId>;
  createInversionista_cuenta_bancarium!: Sequelize.HasManyCreateAssociationMixin<InversionistaCuentaBancaria>;
  removeInversionista_cuenta_bancarium!: Sequelize.HasManyRemoveAssociationMixin<InversionistaCuentaBancaria, InversionistaCuentaBancariaId>;
  removeInversionista_cuenta_bancaria!: Sequelize.HasManyRemoveAssociationsMixin<InversionistaCuentaBancaria, InversionistaCuentaBancariaId>;
  hasInversionista_cuenta_bancarium!: Sequelize.HasManyHasAssociationMixin<InversionistaCuentaBancaria, InversionistaCuentaBancariaId>;
  hasInversionista_cuenta_bancaria!: Sequelize.HasManyHasAssociationsMixin<InversionistaCuentaBancaria, InversionistaCuentaBancariaId>;
  countInversionista_cuenta_bancaria!: Sequelize.HasManyCountAssociationsMixin;
  // CuentaBancaria hasMany PersonaCuentaBancaria via _idcuentabancaria
  persona_cuenta_bancaria!: PersonaCuentaBancaria[];
  getPersona_cuenta_bancaria!: Sequelize.HasManyGetAssociationsMixin<PersonaCuentaBancaria>;
  setPersona_cuenta_bancaria!: Sequelize.HasManySetAssociationsMixin<PersonaCuentaBancaria, PersonaCuentaBancariaId>;
  addPersona_cuenta_bancarium!: Sequelize.HasManyAddAssociationMixin<PersonaCuentaBancaria, PersonaCuentaBancariaId>;
  addPersona_cuenta_bancaria!: Sequelize.HasManyAddAssociationsMixin<PersonaCuentaBancaria, PersonaCuentaBancariaId>;
  createPersona_cuenta_bancarium!: Sequelize.HasManyCreateAssociationMixin<PersonaCuentaBancaria>;
  removePersona_cuenta_bancarium!: Sequelize.HasManyRemoveAssociationMixin<PersonaCuentaBancaria, PersonaCuentaBancariaId>;
  removePersona_cuenta_bancaria!: Sequelize.HasManyRemoveAssociationsMixin<PersonaCuentaBancaria, PersonaCuentaBancariaId>;
  hasPersona_cuenta_bancarium!: Sequelize.HasManyHasAssociationMixin<PersonaCuentaBancaria, PersonaCuentaBancariaId>;
  hasPersona_cuenta_bancaria!: Sequelize.HasManyHasAssociationsMixin<PersonaCuentaBancaria, PersonaCuentaBancariaId>;
  countPersona_cuenta_bancaria!: Sequelize.HasManyCountAssociationsMixin;
  // CuentaBancaria belongsTo CuentaBancariaEstado via _idcuentabancariaestado
  cuentabancariaestado_cuenta_bancaria_estado!: CuentaBancariaEstado;
  get_idcuentabancariaestado_cuenta_bancaria_estado!: Sequelize.BelongsToGetAssociationMixin<CuentaBancariaEstado>;
  set_idcuentabancariaestado_cuenta_bancaria_estado!: Sequelize.BelongsToSetAssociationMixin<CuentaBancariaEstado, CuentaBancariaEstadoId>;
  create_idcuentabancariaestado_cuenta_bancaria_estado!: Sequelize.BelongsToCreateAssociationMixin<CuentaBancariaEstado>;
  // CuentaBancaria belongsTo CuentaTipo via _idcuentatipo
  cuentatipo_cuenta_tipo!: CuentaTipo;
  get_idcuentatipo_cuenta_tipo!: Sequelize.BelongsToGetAssociationMixin<CuentaTipo>;
  set_idcuentatipo_cuenta_tipo!: Sequelize.BelongsToSetAssociationMixin<CuentaTipo, CuentaTipoId>;
  create_idcuentatipo_cuenta_tipo!: Sequelize.BelongsToCreateAssociationMixin<CuentaTipo>;
  // CuentaBancaria belongsTo Moneda via _idmoneda
  moneda_moneda!: Moneda;
  get_idmoneda_moneda!: Sequelize.BelongsToGetAssociationMixin<Moneda>;
  set_idmoneda_moneda!: Sequelize.BelongsToSetAssociationMixin<Moneda, MonedaId>;
  create_idmoneda_moneda!: Sequelize.BelongsToCreateAssociationMixin<Moneda>;

  static initModel(sequelize: Sequelize.Sequelize): typeof CuentaBancaria {
    return CuentaBancaria.init({
    _idcuentabancaria: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    cuentabancariaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_cuenta_bancaria_cuentabancariaid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_cuenta_bancaria_code"
    },
    _idbanco: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'banco',
        key: '_idbanco'
      }
    },
    _idcuentatipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cuenta_tipo',
        key: '_idcuentatipo'
      }
    },
    _idmoneda: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'moneda',
        key: '_idmoneda'
      }
    },
    _idcuentabancariaestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cuenta_bancaria_estado',
        key: '_idcuentabancariaestado'
      }
    },
    numero: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    cci: {
      type: DataTypes.STRING(20),
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
    tableName: 'cuenta_bancaria',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idcuentabancaria" },
        ]
      },
      {
        name: "UQ_cuenta_bancaria_cuentabancariaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "cuentabancariaid" },
        ]
      },
      {
        name: "UQ_cuenta_bancaria_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_cuenta_bancaria_idbanco",
        using: "BTREE",
        fields: [
          { name: "_idbanco" },
        ]
      },
      {
        name: "FK_cuenta_bancaria_idcuentabancariaestado",
        using: "BTREE",
        fields: [
          { name: "_idcuentabancariaestado" },
        ]
      },
      {
        name: "FK_cuenta_bancaria_idcuentatipo",
        using: "BTREE",
        fields: [
          { name: "_idcuentatipo" },
        ]
      },
      {
        name: "FK_cuenta_bancaria_idmoneda",
        using: "BTREE",
        fields: [
          { name: "_idmoneda" },
        ]
      },
    ]
  });
  }
}
