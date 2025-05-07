import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId } from './BancoTransaccionEstadoHistorial.js';
import type { Credencial, CredencialCreationAttributes, CredencialId } from './Credencial.js';
import type { DocumentoTipo, DocumentoTipoId } from './DocumentoTipo.js';
import type { FactoringHistorialEstado, FactoringHistorialEstadoId } from './FactoringHistorialEstado.js';
import type { Factura, FacturaId } from './Factura.js';
import type { Persona, PersonaCreationAttributes, PersonaId } from './Persona.js';
import type { PersonaVerificacion, PersonaVerificacionId } from './PersonaVerificacion.js';
import type { Rol, RolId } from './Rol.js';
import type { ServicioEmpresa, ServicioEmpresaId } from './ServicioEmpresa.js';
import type { ServicioEmpresaVerificacion, ServicioEmpresaVerificacionId } from './ServicioEmpresaVerificacion.js';
import type { UsuarioRol, UsuarioRolId } from './UsuarioRol.js';
import type { UsuarioServicio, UsuarioServicioId } from './UsuarioServicio.js';
import type { UsuarioServicioEmpresa, UsuarioServicioEmpresaId } from './UsuarioServicioEmpresa.js';
import type { UsuarioServicioVerificacion, UsuarioServicioVerificacionId } from './UsuarioServicioVerificacion.js';
import type { Validacion, ValidacionId } from './Validacion.js';

export interface UsuarioAttributes {
  _idusuario: number;
  usuarioid: string;
  code: string;
  _iddocumentotipo: number;
  documentonumero: string;
  usuarionombres: string;
  apellidopaterno: string;
  apellidomaterno: string;
  email: string;
  celular: string;
  isemailvalidated: number;
  ispersonavalidated: number;
  hash: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type UsuarioPk = "_idusuario";
export type UsuarioId = Usuario[UsuarioPk];
export type UsuarioOptionalAttributes = "_idusuario" | "usuarioid" | "isemailvalidated" | "ispersonavalidated" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type UsuarioCreationAttributes = Optional<UsuarioAttributes, UsuarioOptionalAttributes>;

export class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
  _idusuario!: number;
  usuarioid!: string;
  code!: string;
  _iddocumentotipo!: number;
  documentonumero!: string;
  usuarionombres!: string;
  apellidopaterno!: string;
  apellidomaterno!: string;
  email!: string;
  celular!: string;
  isemailvalidated!: number;
  ispersonavalidated!: number;
  hash!: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // Usuario belongsTo DocumentoTipo via _iddocumentotipo
  documentotipo_documento_tipo!: DocumentoTipo;
  get_iddocumentotipo_documento_tipo!: Sequelize.BelongsToGetAssociationMixin<DocumentoTipo>;
  set_iddocumentotipo_documento_tipo!: Sequelize.BelongsToSetAssociationMixin<DocumentoTipo, DocumentoTipoId>;
  create_iddocumentotipo_documento_tipo!: Sequelize.BelongsToCreateAssociationMixin<DocumentoTipo>;
  // Usuario hasMany BancoTransaccionEstadoHistorial via _idusuariomodifica
  banco_transaccion_estado_historials!: BancoTransaccionEstadoHistorial[];
  getBanco_transaccion_estado_historials!: Sequelize.HasManyGetAssociationsMixin<BancoTransaccionEstadoHistorial>;
  setBanco_transaccion_estado_historials!: Sequelize.HasManySetAssociationsMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  addBanco_transaccion_estado_historial!: Sequelize.HasManyAddAssociationMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  addBanco_transaccion_estado_historials!: Sequelize.HasManyAddAssociationsMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  createBanco_transaccion_estado_historial!: Sequelize.HasManyCreateAssociationMixin<BancoTransaccionEstadoHistorial>;
  removeBanco_transaccion_estado_historial!: Sequelize.HasManyRemoveAssociationMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  removeBanco_transaccion_estado_historials!: Sequelize.HasManyRemoveAssociationsMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  hasBanco_transaccion_estado_historial!: Sequelize.HasManyHasAssociationMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  hasBanco_transaccion_estado_historials!: Sequelize.HasManyHasAssociationsMixin<BancoTransaccionEstadoHistorial, BancoTransaccionEstadoHistorialId>;
  countBanco_transaccion_estado_historials!: Sequelize.HasManyCountAssociationsMixin;
  // Usuario hasOne Credencial via _idusuario
  credencial!: Credencial;
  getCredencial!: Sequelize.HasOneGetAssociationMixin<Credencial>;
  setCredencial!: Sequelize.HasOneSetAssociationMixin<Credencial, CredencialId>;
  createCredencial!: Sequelize.HasOneCreateAssociationMixin<Credencial>;
  // Usuario hasMany FactoringHistorialEstado via _idusuariomodifica
  factoring_historial_estados!: FactoringHistorialEstado[];
  getFactoring_historial_estados!: Sequelize.HasManyGetAssociationsMixin<FactoringHistorialEstado>;
  setFactoring_historial_estados!: Sequelize.HasManySetAssociationsMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  addFactoring_historial_estado!: Sequelize.HasManyAddAssociationMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  addFactoring_historial_estados!: Sequelize.HasManyAddAssociationsMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  createFactoring_historial_estado!: Sequelize.HasManyCreateAssociationMixin<FactoringHistorialEstado>;
  removeFactoring_historial_estado!: Sequelize.HasManyRemoveAssociationMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  removeFactoring_historial_estados!: Sequelize.HasManyRemoveAssociationsMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  hasFactoring_historial_estado!: Sequelize.HasManyHasAssociationMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  hasFactoring_historial_estados!: Sequelize.HasManyHasAssociationsMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  countFactoring_historial_estados!: Sequelize.HasManyCountAssociationsMixin;
  // Usuario hasMany Factura via _idusuarioupload
  facturas!: Factura[];
  getFacturas!: Sequelize.HasManyGetAssociationsMixin<Factura>;
  setFacturas!: Sequelize.HasManySetAssociationsMixin<Factura, FacturaId>;
  addFactura!: Sequelize.HasManyAddAssociationMixin<Factura, FacturaId>;
  addFacturas!: Sequelize.HasManyAddAssociationsMixin<Factura, FacturaId>;
  createFactura!: Sequelize.HasManyCreateAssociationMixin<Factura>;
  removeFactura!: Sequelize.HasManyRemoveAssociationMixin<Factura, FacturaId>;
  removeFacturas!: Sequelize.HasManyRemoveAssociationsMixin<Factura, FacturaId>;
  hasFactura!: Sequelize.HasManyHasAssociationMixin<Factura, FacturaId>;
  hasFacturas!: Sequelize.HasManyHasAssociationsMixin<Factura, FacturaId>;
  countFacturas!: Sequelize.HasManyCountAssociationsMixin;
  // Usuario hasOne Persona via _idusuario
  persona!: Persona;
  getPersona!: Sequelize.HasOneGetAssociationMixin<Persona>;
  setPersona!: Sequelize.HasOneSetAssociationMixin<Persona, PersonaId>;
  createPersona!: Sequelize.HasOneCreateAssociationMixin<Persona>;
  // Usuario hasMany PersonaVerificacion via _idusuarioverifica
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
  // Usuario belongsToMany Rol via _idusuario and _idrol
  rol_rols!: Rol[];
  get_idrol_rols!: Sequelize.BelongsToManyGetAssociationsMixin<Rol>;
  set_idrol_rols!: Sequelize.BelongsToManySetAssociationsMixin<Rol, RolId>;
  add_idrol_rol!: Sequelize.BelongsToManyAddAssociationMixin<Rol, RolId>;
  add_idrol_rols!: Sequelize.BelongsToManyAddAssociationsMixin<Rol, RolId>;
  create_idrol_rol!: Sequelize.BelongsToManyCreateAssociationMixin<Rol>;
  remove_idrol_rol!: Sequelize.BelongsToManyRemoveAssociationMixin<Rol, RolId>;
  remove_idrol_rols!: Sequelize.BelongsToManyRemoveAssociationsMixin<Rol, RolId>;
  has_idrol_rol!: Sequelize.BelongsToManyHasAssociationMixin<Rol, RolId>;
  has_idrol_rols!: Sequelize.BelongsToManyHasAssociationsMixin<Rol, RolId>;
  count_idrol_rols!: Sequelize.BelongsToManyCountAssociationsMixin;
  // Usuario hasMany ServicioEmpresa via _idusuariosuscriptor
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
  // Usuario hasMany ServicioEmpresaVerificacion via _idusuarioverifica
  servicio_empresa_verificacions!: ServicioEmpresaVerificacion[];
  getServicio_empresa_verificacions!: Sequelize.HasManyGetAssociationsMixin<ServicioEmpresaVerificacion>;
  setServicio_empresa_verificacions!: Sequelize.HasManySetAssociationsMixin<ServicioEmpresaVerificacion, ServicioEmpresaVerificacionId>;
  addServicio_empresa_verificacion!: Sequelize.HasManyAddAssociationMixin<ServicioEmpresaVerificacion, ServicioEmpresaVerificacionId>;
  addServicio_empresa_verificacions!: Sequelize.HasManyAddAssociationsMixin<ServicioEmpresaVerificacion, ServicioEmpresaVerificacionId>;
  createServicio_empresa_verificacion!: Sequelize.HasManyCreateAssociationMixin<ServicioEmpresaVerificacion>;
  removeServicio_empresa_verificacion!: Sequelize.HasManyRemoveAssociationMixin<ServicioEmpresaVerificacion, ServicioEmpresaVerificacionId>;
  removeServicio_empresa_verificacions!: Sequelize.HasManyRemoveAssociationsMixin<ServicioEmpresaVerificacion, ServicioEmpresaVerificacionId>;
  hasServicio_empresa_verificacion!: Sequelize.HasManyHasAssociationMixin<ServicioEmpresaVerificacion, ServicioEmpresaVerificacionId>;
  hasServicio_empresa_verificacions!: Sequelize.HasManyHasAssociationsMixin<ServicioEmpresaVerificacion, ServicioEmpresaVerificacionId>;
  countServicio_empresa_verificacions!: Sequelize.HasManyCountAssociationsMixin;
  // Usuario hasMany UsuarioRol via _idusuario
  usuario_rols!: UsuarioRol[];
  getUsuario_rols!: Sequelize.HasManyGetAssociationsMixin<UsuarioRol>;
  setUsuario_rols!: Sequelize.HasManySetAssociationsMixin<UsuarioRol, UsuarioRolId>;
  addUsuario_rol!: Sequelize.HasManyAddAssociationMixin<UsuarioRol, UsuarioRolId>;
  addUsuario_rols!: Sequelize.HasManyAddAssociationsMixin<UsuarioRol, UsuarioRolId>;
  createUsuario_rol!: Sequelize.HasManyCreateAssociationMixin<UsuarioRol>;
  removeUsuario_rol!: Sequelize.HasManyRemoveAssociationMixin<UsuarioRol, UsuarioRolId>;
  removeUsuario_rols!: Sequelize.HasManyRemoveAssociationsMixin<UsuarioRol, UsuarioRolId>;
  hasUsuario_rol!: Sequelize.HasManyHasAssociationMixin<UsuarioRol, UsuarioRolId>;
  hasUsuario_rols!: Sequelize.HasManyHasAssociationsMixin<UsuarioRol, UsuarioRolId>;
  countUsuario_rols!: Sequelize.HasManyCountAssociationsMixin;
  // Usuario hasMany UsuarioServicio via _idusuario
  usuario_servicios!: UsuarioServicio[];
  getUsuario_servicios!: Sequelize.HasManyGetAssociationsMixin<UsuarioServicio>;
  setUsuario_servicios!: Sequelize.HasManySetAssociationsMixin<UsuarioServicio, UsuarioServicioId>;
  addUsuario_servicio!: Sequelize.HasManyAddAssociationMixin<UsuarioServicio, UsuarioServicioId>;
  addUsuario_servicios!: Sequelize.HasManyAddAssociationsMixin<UsuarioServicio, UsuarioServicioId>;
  createUsuario_servicio!: Sequelize.HasManyCreateAssociationMixin<UsuarioServicio>;
  removeUsuario_servicio!: Sequelize.HasManyRemoveAssociationMixin<UsuarioServicio, UsuarioServicioId>;
  removeUsuario_servicios!: Sequelize.HasManyRemoveAssociationsMixin<UsuarioServicio, UsuarioServicioId>;
  hasUsuario_servicio!: Sequelize.HasManyHasAssociationMixin<UsuarioServicio, UsuarioServicioId>;
  hasUsuario_servicios!: Sequelize.HasManyHasAssociationsMixin<UsuarioServicio, UsuarioServicioId>;
  countUsuario_servicios!: Sequelize.HasManyCountAssociationsMixin;
  // Usuario hasMany UsuarioServicioEmpresa via _idusuario
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
  // Usuario hasMany UsuarioServicioVerificacion via _idusuarioverifica
  usuario_servicio_verificacions!: UsuarioServicioVerificacion[];
  getUsuario_servicio_verificacions!: Sequelize.HasManyGetAssociationsMixin<UsuarioServicioVerificacion>;
  setUsuario_servicio_verificacions!: Sequelize.HasManySetAssociationsMixin<UsuarioServicioVerificacion, UsuarioServicioVerificacionId>;
  addUsuario_servicio_verificacion!: Sequelize.HasManyAddAssociationMixin<UsuarioServicioVerificacion, UsuarioServicioVerificacionId>;
  addUsuario_servicio_verificacions!: Sequelize.HasManyAddAssociationsMixin<UsuarioServicioVerificacion, UsuarioServicioVerificacionId>;
  createUsuario_servicio_verificacion!: Sequelize.HasManyCreateAssociationMixin<UsuarioServicioVerificacion>;
  removeUsuario_servicio_verificacion!: Sequelize.HasManyRemoveAssociationMixin<UsuarioServicioVerificacion, UsuarioServicioVerificacionId>;
  removeUsuario_servicio_verificacions!: Sequelize.HasManyRemoveAssociationsMixin<UsuarioServicioVerificacion, UsuarioServicioVerificacionId>;
  hasUsuario_servicio_verificacion!: Sequelize.HasManyHasAssociationMixin<UsuarioServicioVerificacion, UsuarioServicioVerificacionId>;
  hasUsuario_servicio_verificacions!: Sequelize.HasManyHasAssociationsMixin<UsuarioServicioVerificacion, UsuarioServicioVerificacionId>;
  countUsuario_servicio_verificacions!: Sequelize.HasManyCountAssociationsMixin;
  // Usuario hasMany Validacion via _idusuario
  validacions!: Validacion[];
  getValidacions!: Sequelize.HasManyGetAssociationsMixin<Validacion>;
  setValidacions!: Sequelize.HasManySetAssociationsMixin<Validacion, ValidacionId>;
  addValidacion!: Sequelize.HasManyAddAssociationMixin<Validacion, ValidacionId>;
  addValidacions!: Sequelize.HasManyAddAssociationsMixin<Validacion, ValidacionId>;
  createValidacion!: Sequelize.HasManyCreateAssociationMixin<Validacion>;
  removeValidacion!: Sequelize.HasManyRemoveAssociationMixin<Validacion, ValidacionId>;
  removeValidacions!: Sequelize.HasManyRemoveAssociationsMixin<Validacion, ValidacionId>;
  hasValidacion!: Sequelize.HasManyHasAssociationMixin<Validacion, ValidacionId>;
  hasValidacions!: Sequelize.HasManyHasAssociationsMixin<Validacion, ValidacionId>;
  countValidacions!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Usuario {
    return Usuario.init({
    _idusuario: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    usuarioid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_usuario_usuarioid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_usuario_code"
    },
    _iddocumentotipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'documento_tipo',
        key: '_iddocumentotipo'
      }
    },
    documentonumero: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "documentonumero"
    },
    usuarionombres: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    apellidopaterno: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    apellidomaterno: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "email"
    },
    celular: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    isemailvalidated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    ispersonavalidated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
      comment: "1: Si; 0: No; 3: En proceso"
    },
    hash: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "hash"
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
    tableName: 'usuario',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuario" },
        ]
      },
      {
        name: "documentonumero",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "documentonumero" },
        ]
      },
      {
        name: "email",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "hash",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "hash" },
        ]
      },
      {
        name: "UQ_usuario_usuarioid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "usuarioid" },
        ]
      },
      {
        name: "UQ_usuario_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_usuario_iddocuemntotipo",
        using: "BTREE",
        fields: [
          { name: "_iddocumentotipo" },
        ]
      },
    ]
  });
  }
}
