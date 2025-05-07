import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Archivo, ArchivoId } from './Archivo.js';
import type { ArchivoEmpresa, ArchivoEmpresaId } from './ArchivoEmpresa.js';
import type { Colaborador, ColaboradorId } from './Colaborador.js';
import type { Contacto, ContactoId } from './Contacto.js';
import type { Departamento, DepartamentoId } from './Departamento.js';
import type { Distrito, DistritoId } from './Distrito.js';
import type { EmpresaCuentaBancaria, EmpresaCuentaBancariaId } from './EmpresaCuentaBancaria.js';
import type { Factoring, FactoringId } from './Factoring.js';
import type { Pais, PaisId } from './Pais.js';
import type { Provincia, ProvinciaId } from './Provincia.js';
import type { Riesgo, RiesgoId } from './Riesgo.js';
import type { ServicioEmpresa, ServicioEmpresaId } from './ServicioEmpresa.js';
import type { UsuarioServicioEmpresa, UsuarioServicioEmpresaId } from './UsuarioServicioEmpresa.js';

export interface EmpresaAttributes {
  _idempresa: number;
  empresaid: string;
  code: string;
  _idpaissede?: number;
  _iddepartamentosede?: number;
  _idprovinciasede?: number;
  _iddistritosede?: number;
  _idriesgo?: number;
  ruc: string;
  razon_social: string;
  nombre_comercial?: string;
  fecha_inscripcion?: string;
  domicilio_fiscal?: string;
  direccion_sede?: string;
  direccion_sede_referencia?: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type EmpresaPk = "_idempresa";
export type EmpresaId = Empresa[EmpresaPk];
export type EmpresaOptionalAttributes = "_idempresa" | "empresaid" | "_idpaissede" | "_iddepartamentosede" | "_idprovinciasede" | "_iddistritosede" | "_idriesgo" | "nombre_comercial" | "fecha_inscripcion" | "domicilio_fiscal" | "direccion_sede" | "direccion_sede_referencia" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type EmpresaCreationAttributes = Optional<EmpresaAttributes, EmpresaOptionalAttributes>;

export class Empresa extends Model<EmpresaAttributes, EmpresaCreationAttributes> implements EmpresaAttributes {
  _idempresa!: number;
  empresaid!: string;
  code!: string;
  _idpaissede?: number;
  _iddepartamentosede?: number;
  _idprovinciasede?: number;
  _iddistritosede?: number;
  _idriesgo?: number;
  ruc!: string;
  razon_social!: string;
  nombre_comercial?: string;
  fecha_inscripcion?: string;
  domicilio_fiscal?: string;
  direccion_sede?: string;
  direccion_sede_referencia?: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // Empresa belongsTo Departamento via _iddepartamentosede
  departamentosede_departamento!: Departamento;
  get_iddepartamentosede_departamento!: Sequelize.BelongsToGetAssociationMixin<Departamento>;
  set_iddepartamentosede_departamento!: Sequelize.BelongsToSetAssociationMixin<Departamento, DepartamentoId>;
  create_iddepartamentosede_departamento!: Sequelize.BelongsToCreateAssociationMixin<Departamento>;
  // Empresa belongsTo Distrito via _iddistritosede
  distritosede_distrito!: Distrito;
  get_iddistritosede_distrito!: Sequelize.BelongsToGetAssociationMixin<Distrito>;
  set_iddistritosede_distrito!: Sequelize.BelongsToSetAssociationMixin<Distrito, DistritoId>;
  create_iddistritosede_distrito!: Sequelize.BelongsToCreateAssociationMixin<Distrito>;
  // Empresa belongsToMany Archivo via _idempresa and _idarchivo
  archivo_archivo_archivo_empresas!: Archivo[];
  get_idarchivo_archivo_archivo_empresas!: Sequelize.BelongsToManyGetAssociationsMixin<Archivo>;
  set_idarchivo_archivo_archivo_empresas!: Sequelize.BelongsToManySetAssociationsMixin<Archivo, ArchivoId>;
  add_idarchivo_archivo_archivo_empresa!: Sequelize.BelongsToManyAddAssociationMixin<Archivo, ArchivoId>;
  add_idarchivo_archivo_archivo_empresas!: Sequelize.BelongsToManyAddAssociationsMixin<Archivo, ArchivoId>;
  create_idarchivo_archivo_archivo_empresa!: Sequelize.BelongsToManyCreateAssociationMixin<Archivo>;
  remove_idarchivo_archivo_archivo_empresa!: Sequelize.BelongsToManyRemoveAssociationMixin<Archivo, ArchivoId>;
  remove_idarchivo_archivo_archivo_empresas!: Sequelize.BelongsToManyRemoveAssociationsMixin<Archivo, ArchivoId>;
  has_idarchivo_archivo_archivo_empresa!: Sequelize.BelongsToManyHasAssociationMixin<Archivo, ArchivoId>;
  has_idarchivo_archivo_archivo_empresas!: Sequelize.BelongsToManyHasAssociationsMixin<Archivo, ArchivoId>;
  count_idarchivo_archivo_archivo_empresas!: Sequelize.BelongsToManyCountAssociationsMixin;
  // Empresa hasMany ArchivoEmpresa via _idempresa
  archivo_empresas!: ArchivoEmpresa[];
  getArchivo_empresas!: Sequelize.HasManyGetAssociationsMixin<ArchivoEmpresa>;
  setArchivo_empresas!: Sequelize.HasManySetAssociationsMixin<ArchivoEmpresa, ArchivoEmpresaId>;
  addArchivo_empresa!: Sequelize.HasManyAddAssociationMixin<ArchivoEmpresa, ArchivoEmpresaId>;
  addArchivo_empresas!: Sequelize.HasManyAddAssociationsMixin<ArchivoEmpresa, ArchivoEmpresaId>;
  createArchivo_empresa!: Sequelize.HasManyCreateAssociationMixin<ArchivoEmpresa>;
  removeArchivo_empresa!: Sequelize.HasManyRemoveAssociationMixin<ArchivoEmpresa, ArchivoEmpresaId>;
  removeArchivo_empresas!: Sequelize.HasManyRemoveAssociationsMixin<ArchivoEmpresa, ArchivoEmpresaId>;
  hasArchivo_empresa!: Sequelize.HasManyHasAssociationMixin<ArchivoEmpresa, ArchivoEmpresaId>;
  hasArchivo_empresas!: Sequelize.HasManyHasAssociationsMixin<ArchivoEmpresa, ArchivoEmpresaId>;
  countArchivo_empresas!: Sequelize.HasManyCountAssociationsMixin;
  // Empresa hasMany Colaborador via _idempresa
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
  // Empresa hasMany Contacto via _idempresa
  contactos!: Contacto[];
  getContactos!: Sequelize.HasManyGetAssociationsMixin<Contacto>;
  setContactos!: Sequelize.HasManySetAssociationsMixin<Contacto, ContactoId>;
  addContacto!: Sequelize.HasManyAddAssociationMixin<Contacto, ContactoId>;
  addContactos!: Sequelize.HasManyAddAssociationsMixin<Contacto, ContactoId>;
  createContacto!: Sequelize.HasManyCreateAssociationMixin<Contacto>;
  removeContacto!: Sequelize.HasManyRemoveAssociationMixin<Contacto, ContactoId>;
  removeContactos!: Sequelize.HasManyRemoveAssociationsMixin<Contacto, ContactoId>;
  hasContacto!: Sequelize.HasManyHasAssociationMixin<Contacto, ContactoId>;
  hasContactos!: Sequelize.HasManyHasAssociationsMixin<Contacto, ContactoId>;
  countContactos!: Sequelize.HasManyCountAssociationsMixin;
  // Empresa hasMany EmpresaCuentaBancaria via _idempresa
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
  // Empresa hasMany Factoring via _idaceptante
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
  // Empresa hasMany Factoring via _idcedente
  cedente_factorings!: Factoring[];
  get_idcedente_factorings!: Sequelize.HasManyGetAssociationsMixin<Factoring>;
  set_idcedente_factorings!: Sequelize.HasManySetAssociationsMixin<Factoring, FactoringId>;
  add_idcedente_factoring!: Sequelize.HasManyAddAssociationMixin<Factoring, FactoringId>;
  add_idcedente_factorings!: Sequelize.HasManyAddAssociationsMixin<Factoring, FactoringId>;
  create_idcedente_factoring!: Sequelize.HasManyCreateAssociationMixin<Factoring>;
  remove_idcedente_factoring!: Sequelize.HasManyRemoveAssociationMixin<Factoring, FactoringId>;
  remove_idcedente_factorings!: Sequelize.HasManyRemoveAssociationsMixin<Factoring, FactoringId>;
  has_idcedente_factoring!: Sequelize.HasManyHasAssociationMixin<Factoring, FactoringId>;
  has_idcedente_factorings!: Sequelize.HasManyHasAssociationsMixin<Factoring, FactoringId>;
  count_idcedente_factorings!: Sequelize.HasManyCountAssociationsMixin;
  // Empresa hasMany ServicioEmpresa via _idempresa
  servicio_empresas!: ServicioEmpresa[];
  getServicio_empresas!: Sequelize.HasManyGetAssociationsMixin<ServicioEmpresa>;
  setServicio_empresas!: Sequelize.HasManySetAssociationsMixin<ServicioEmpresa, ServicioEmpresaId>;
  addServicio_empresa!: Sequelize.HasManyAddAssociationMixin<ServicioEmpresa, ServicioEmpresaId>;
  addServicio_empresas!: Sequelize.HasManyAddAssociationsMixin<ServicioEmpresa, ServicioEmpresaId>;
  createServicio_empresa!: Sequelize.HasManyCreateAssociationMixin<ServicioEmpresa>;
  removeServicio_empresa!: Sequelize.HasManyRemoveAssociationMixin<ServicioEmpresa, ServicioEmpresaId>;
  removeServicio_empresas!: Sequelize.HasManyRemoveAssociationsMixin<ServicioEmpresa, ServicioEmpresaId>;
  hasServicio_empresa!: Sequelize.HasManyHasAssociationMixin<ServicioEmpresa, ServicioEmpresaId>;
  hasServicio_empresas!: Sequelize.HasManyHasAssociationsMixin<ServicioEmpresa, ServicioEmpresaId>;
  countServicio_empresas!: Sequelize.HasManyCountAssociationsMixin;
  // Empresa hasMany UsuarioServicioEmpresa via _idempresa
  usuario_servicio_empresas!: UsuarioServicioEmpresa[];
  getUsuario_servicio_empresas!: Sequelize.HasManyGetAssociationsMixin<UsuarioServicioEmpresa>;
  setUsuario_servicio_empresas!: Sequelize.HasManySetAssociationsMixin<UsuarioServicioEmpresa, UsuarioServicioEmpresaId>;
  addUsuario_servicio_empresa!: Sequelize.HasManyAddAssociationMixin<UsuarioServicioEmpresa, UsuarioServicioEmpresaId>;
  addUsuario_servicio_empresas!: Sequelize.HasManyAddAssociationsMixin<UsuarioServicioEmpresa, UsuarioServicioEmpresaId>;
  createUsuario_servicio_empresa!: Sequelize.HasManyCreateAssociationMixin<UsuarioServicioEmpresa>;
  removeUsuario_servicio_empresa!: Sequelize.HasManyRemoveAssociationMixin<UsuarioServicioEmpresa, UsuarioServicioEmpresaId>;
  removeUsuario_servicio_empresas!: Sequelize.HasManyRemoveAssociationsMixin<UsuarioServicioEmpresa, UsuarioServicioEmpresaId>;
  hasUsuario_servicio_empresa!: Sequelize.HasManyHasAssociationMixin<UsuarioServicioEmpresa, UsuarioServicioEmpresaId>;
  hasUsuario_servicio_empresas!: Sequelize.HasManyHasAssociationsMixin<UsuarioServicioEmpresa, UsuarioServicioEmpresaId>;
  countUsuario_servicio_empresas!: Sequelize.HasManyCountAssociationsMixin;
  // Empresa belongsTo Pais via _idpaissede
  paissede_pai!: Pais;
  get_idpaissede_pai!: Sequelize.BelongsToGetAssociationMixin<Pais>;
  set_idpaissede_pai!: Sequelize.BelongsToSetAssociationMixin<Pais, PaisId>;
  create_idpaissede_pai!: Sequelize.BelongsToCreateAssociationMixin<Pais>;
  // Empresa belongsTo Provincia via _idprovinciasede
  provinciasede_provincium!: Provincia;
  get_idprovinciasede_provincium!: Sequelize.BelongsToGetAssociationMixin<Provincia>;
  set_idprovinciasede_provincium!: Sequelize.BelongsToSetAssociationMixin<Provincia, ProvinciaId>;
  create_idprovinciasede_provincium!: Sequelize.BelongsToCreateAssociationMixin<Provincia>;
  // Empresa belongsTo Riesgo via _idriesgo
  riesgo_riesgo!: Riesgo;
  get_idriesgo_riesgo!: Sequelize.BelongsToGetAssociationMixin<Riesgo>;
  set_idriesgo_riesgo!: Sequelize.BelongsToSetAssociationMixin<Riesgo, RiesgoId>;
  create_idriesgo_riesgo!: Sequelize.BelongsToCreateAssociationMixin<Riesgo>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Empresa {
    return Empresa.init({
    _idempresa: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    empresaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_empresaid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_code"
    },
    _idpaissede: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'pais',
        key: '_idpais'
      }
    },
    _iddepartamentosede: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'departamento',
        key: '_iddepartamento'
      }
    },
    _idprovinciasede: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'provincia',
        key: '_idprovincia'
      }
    },
    _iddistritosede: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'distrito',
        key: '_iddistrito'
      }
    },
    _idriesgo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'riesgo',
        key: '_idriesgo'
      }
    },
    ruc: {
      type: DataTypes.STRING(11),
      allowNull: false,
      unique: "UQ_ruc"
    },
    razon_social: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    nombre_comercial: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    fecha_inscripcion: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    domicilio_fiscal: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    direccion_sede: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    direccion_sede_referencia: {
      type: DataTypes.STRING(200),
      allowNull: true
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
    tableName: 'empresa',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idempresa" },
        ]
      },
      {
        name: "UQ_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "UQ_empresaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "empresaid" },
        ]
      },
      {
        name: "UQ_ruc",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ruc" },
        ]
      },
      {
        name: "FK_empresa_idpaissede",
        using: "BTREE",
        fields: [
          { name: "_idpaissede" },
        ]
      },
      {
        name: "FK_empresa_iddepartamentosede",
        using: "BTREE",
        fields: [
          { name: "_iddepartamentosede" },
        ]
      },
      {
        name: "FK_empresa_idprovinciasede",
        using: "BTREE",
        fields: [
          { name: "_idprovinciasede" },
        ]
      },
      {
        name: "FK_empresa_iddistritosede",
        using: "BTREE",
        fields: [
          { name: "_iddistritosede" },
        ]
      },
      {
        name: "FK_empresa_idriesgo",
        using: "BTREE",
        fields: [
          { name: "_idriesgo" },
        ]
      },
    ]
  });
  }
}
