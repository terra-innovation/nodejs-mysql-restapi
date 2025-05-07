import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Archivo, ArchivoId } from './Archivo.js';
import type { ArchivoPersona, ArchivoPersonaId } from './ArchivoPersona.js';
import type { Colaborador, ColaboradorId } from './Colaborador.js';
import type { Departamento, DepartamentoId } from './Departamento.js';
import type { Distrito, DistritoId } from './Distrito.js';
import type { DocumentoTipo, DocumentoTipoId } from './DocumentoTipo.js';
import type { Genero, GeneroId } from './Genero.js';
import type { Inversionista, InversionistaCreationAttributes, InversionistaId } from './Inversionista.js';
import type { Pais, PaisId } from './Pais.js';
import type { PersonaCuentaBancaria, PersonaCuentaBancariaId } from './PersonaCuentaBancaria.js';
import type { PersonaDeclaracion, PersonaDeclaracionId } from './PersonaDeclaracion.js';
import type { PersonaPepDirecto, PersonaPepDirectoId } from './PersonaPepDirecto.js';
import type { PersonaPepIndirecto, PersonaPepIndirectoId } from './PersonaPepIndirecto.js';
import type { PersonaVerificacion, PersonaVerificacionId } from './PersonaVerificacion.js';
import type { PersonaVerificacionEstado, PersonaVerificacionEstadoId } from './PersonaVerificacionEstado.js';
import type { Provincia, ProvinciaId } from './Provincia.js';
import type { Usuario, UsuarioId } from './Usuario.js';

export interface PersonaAttributes {
  _idpersona: number;
  personaid: string;
  code: string;
  _idusuario: number;
  _idpersonaverificacionestado: number;
  _iddocumentotipo?: number;
  _idpaisnacionalidad?: number;
  _idpaisnacimiento?: number;
  _idpaisresidencia?: number;
  _iddepartamentoresidencia?: number;
  _idprovinciaresidencia?: number;
  _iddistritoresidencia?: number;
  _idgenero?: number;
  documentonumero: string;
  personanombres: string;
  apellidopaterno: string;
  apellidomaterno: string;
  email: string;
  celular: string;
  fechanacimiento?: string;
  direccion?: string;
  direccionreferencia?: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type PersonaPk = "_idpersona";
export type PersonaId = Persona[PersonaPk];
export type PersonaOptionalAttributes = "_idpersona" | "personaid" | "_iddocumentotipo" | "_idpaisnacionalidad" | "_idpaisnacimiento" | "_idpaisresidencia" | "_iddepartamentoresidencia" | "_idprovinciaresidencia" | "_iddistritoresidencia" | "_idgenero" | "fechanacimiento" | "direccion" | "direccionreferencia" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type PersonaCreationAttributes = Optional<PersonaAttributes, PersonaOptionalAttributes>;

export class Persona extends Model<PersonaAttributes, PersonaCreationAttributes> implements PersonaAttributes {
  _idpersona!: number;
  personaid!: string;
  code!: string;
  _idusuario!: number;
  _idpersonaverificacionestado!: number;
  _iddocumentotipo?: number;
  _idpaisnacionalidad?: number;
  _idpaisnacimiento?: number;
  _idpaisresidencia?: number;
  _iddepartamentoresidencia?: number;
  _idprovinciaresidencia?: number;
  _iddistritoresidencia?: number;
  _idgenero?: number;
  documentonumero!: string;
  personanombres!: string;
  apellidopaterno!: string;
  apellidomaterno!: string;
  email!: string;
  celular!: string;
  fechanacimiento?: string;
  direccion?: string;
  direccionreferencia?: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // Persona belongsTo Departamento via _iddepartamentoresidencia
  departamentoresidencia_departamento!: Departamento;
  get_iddepartamentoresidencia_departamento!: Sequelize.BelongsToGetAssociationMixin<Departamento>;
  set_iddepartamentoresidencia_departamento!: Sequelize.BelongsToSetAssociationMixin<Departamento, DepartamentoId>;
  create_iddepartamentoresidencia_departamento!: Sequelize.BelongsToCreateAssociationMixin<Departamento>;
  // Persona belongsTo Distrito via _iddistritoresidencia
  distritoresidencia_distrito!: Distrito;
  get_iddistritoresidencia_distrito!: Sequelize.BelongsToGetAssociationMixin<Distrito>;
  set_iddistritoresidencia_distrito!: Sequelize.BelongsToSetAssociationMixin<Distrito, DistritoId>;
  create_iddistritoresidencia_distrito!: Sequelize.BelongsToCreateAssociationMixin<Distrito>;
  // Persona belongsTo DocumentoTipo via _iddocumentotipo
  documentotipo_documento_tipo!: DocumentoTipo;
  get_iddocumentotipo_documento_tipo!: Sequelize.BelongsToGetAssociationMixin<DocumentoTipo>;
  set_iddocumentotipo_documento_tipo!: Sequelize.BelongsToSetAssociationMixin<DocumentoTipo, DocumentoTipoId>;
  create_iddocumentotipo_documento_tipo!: Sequelize.BelongsToCreateAssociationMixin<DocumentoTipo>;
  // Persona belongsTo Genero via _idgenero
  genero_genero!: Genero;
  get_idgenero_genero!: Sequelize.BelongsToGetAssociationMixin<Genero>;
  set_idgenero_genero!: Sequelize.BelongsToSetAssociationMixin<Genero, GeneroId>;
  create_idgenero_genero!: Sequelize.BelongsToCreateAssociationMixin<Genero>;
  // Persona belongsTo Pais via _idpaisnacionalidad
  paisnacionalidad_pai!: Pais;
  get_idpaisnacionalidad_pai!: Sequelize.BelongsToGetAssociationMixin<Pais>;
  set_idpaisnacionalidad_pai!: Sequelize.BelongsToSetAssociationMixin<Pais, PaisId>;
  create_idpaisnacionalidad_pai!: Sequelize.BelongsToCreateAssociationMixin<Pais>;
  // Persona belongsTo Pais via _idpaisnacimiento
  paisnacimiento_pai!: Pais;
  get_idpaisnacimiento_pai!: Sequelize.BelongsToGetAssociationMixin<Pais>;
  set_idpaisnacimiento_pai!: Sequelize.BelongsToSetAssociationMixin<Pais, PaisId>;
  create_idpaisnacimiento_pai!: Sequelize.BelongsToCreateAssociationMixin<Pais>;
  // Persona belongsTo Pais via _idpaisresidencia
  paisresidencia_pai!: Pais;
  get_idpaisresidencia_pai!: Sequelize.BelongsToGetAssociationMixin<Pais>;
  set_idpaisresidencia_pai!: Sequelize.BelongsToSetAssociationMixin<Pais, PaisId>;
  create_idpaisresidencia_pai!: Sequelize.BelongsToCreateAssociationMixin<Pais>;
  // Persona belongsToMany Archivo via _idpersona and _idarchivo
  archivo_archivo_archivo_personas!: Archivo[];
  get_idarchivo_archivo_archivo_personas!: Sequelize.BelongsToManyGetAssociationsMixin<Archivo>;
  set_idarchivo_archivo_archivo_personas!: Sequelize.BelongsToManySetAssociationsMixin<Archivo, ArchivoId>;
  add_idarchivo_archivo_archivo_persona!: Sequelize.BelongsToManyAddAssociationMixin<Archivo, ArchivoId>;
  add_idarchivo_archivo_archivo_personas!: Sequelize.BelongsToManyAddAssociationsMixin<Archivo, ArchivoId>;
  create_idarchivo_archivo_archivo_persona!: Sequelize.BelongsToManyCreateAssociationMixin<Archivo>;
  remove_idarchivo_archivo_archivo_persona!: Sequelize.BelongsToManyRemoveAssociationMixin<Archivo, ArchivoId>;
  remove_idarchivo_archivo_archivo_personas!: Sequelize.BelongsToManyRemoveAssociationsMixin<Archivo, ArchivoId>;
  has_idarchivo_archivo_archivo_persona!: Sequelize.BelongsToManyHasAssociationMixin<Archivo, ArchivoId>;
  has_idarchivo_archivo_archivo_personas!: Sequelize.BelongsToManyHasAssociationsMixin<Archivo, ArchivoId>;
  count_idarchivo_archivo_archivo_personas!: Sequelize.BelongsToManyCountAssociationsMixin;
  // Persona hasMany ArchivoPersona via _idpersona
  archivo_personas!: ArchivoPersona[];
  getArchivo_personas!: Sequelize.HasManyGetAssociationsMixin<ArchivoPersona>;
  setArchivo_personas!: Sequelize.HasManySetAssociationsMixin<ArchivoPersona, ArchivoPersonaId>;
  addArchivo_persona!: Sequelize.HasManyAddAssociationMixin<ArchivoPersona, ArchivoPersonaId>;
  addArchivo_personas!: Sequelize.HasManyAddAssociationsMixin<ArchivoPersona, ArchivoPersonaId>;
  createArchivo_persona!: Sequelize.HasManyCreateAssociationMixin<ArchivoPersona>;
  removeArchivo_persona!: Sequelize.HasManyRemoveAssociationMixin<ArchivoPersona, ArchivoPersonaId>;
  removeArchivo_personas!: Sequelize.HasManyRemoveAssociationsMixin<ArchivoPersona, ArchivoPersonaId>;
  hasArchivo_persona!: Sequelize.HasManyHasAssociationMixin<ArchivoPersona, ArchivoPersonaId>;
  hasArchivo_personas!: Sequelize.HasManyHasAssociationsMixin<ArchivoPersona, ArchivoPersonaId>;
  countArchivo_personas!: Sequelize.HasManyCountAssociationsMixin;
  // Persona hasMany Colaborador via _idpersona
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
  // Persona hasOne Inversionista via _idpersona
  inversionistum!: Inversionista;
  getInversionistum!: Sequelize.HasOneGetAssociationMixin<Inversionista>;
  setInversionistum!: Sequelize.HasOneSetAssociationMixin<Inversionista, InversionistaId>;
  createInversionistum!: Sequelize.HasOneCreateAssociationMixin<Inversionista>;
  // Persona hasMany PersonaCuentaBancaria via _idpersona
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
  // Persona hasMany PersonaDeclaracion via _idpersona
  persona_declaracions!: PersonaDeclaracion[];
  getPersona_declaracions!: Sequelize.HasManyGetAssociationsMixin<PersonaDeclaracion>;
  setPersona_declaracions!: Sequelize.HasManySetAssociationsMixin<PersonaDeclaracion, PersonaDeclaracionId>;
  addPersona_declaracion!: Sequelize.HasManyAddAssociationMixin<PersonaDeclaracion, PersonaDeclaracionId>;
  addPersona_declaracions!: Sequelize.HasManyAddAssociationsMixin<PersonaDeclaracion, PersonaDeclaracionId>;
  createPersona_declaracion!: Sequelize.HasManyCreateAssociationMixin<PersonaDeclaracion>;
  removePersona_declaracion!: Sequelize.HasManyRemoveAssociationMixin<PersonaDeclaracion, PersonaDeclaracionId>;
  removePersona_declaracions!: Sequelize.HasManyRemoveAssociationsMixin<PersonaDeclaracion, PersonaDeclaracionId>;
  hasPersona_declaracion!: Sequelize.HasManyHasAssociationMixin<PersonaDeclaracion, PersonaDeclaracionId>;
  hasPersona_declaracions!: Sequelize.HasManyHasAssociationsMixin<PersonaDeclaracion, PersonaDeclaracionId>;
  countPersona_declaracions!: Sequelize.HasManyCountAssociationsMixin;
  // Persona hasMany PersonaPepDirecto via _idpersona
  persona_pep_directos!: PersonaPepDirecto[];
  getPersona_pep_directos!: Sequelize.HasManyGetAssociationsMixin<PersonaPepDirecto>;
  setPersona_pep_directos!: Sequelize.HasManySetAssociationsMixin<PersonaPepDirecto, PersonaPepDirectoId>;
  addPersona_pep_directo!: Sequelize.HasManyAddAssociationMixin<PersonaPepDirecto, PersonaPepDirectoId>;
  addPersona_pep_directos!: Sequelize.HasManyAddAssociationsMixin<PersonaPepDirecto, PersonaPepDirectoId>;
  createPersona_pep_directo!: Sequelize.HasManyCreateAssociationMixin<PersonaPepDirecto>;
  removePersona_pep_directo!: Sequelize.HasManyRemoveAssociationMixin<PersonaPepDirecto, PersonaPepDirectoId>;
  removePersona_pep_directos!: Sequelize.HasManyRemoveAssociationsMixin<PersonaPepDirecto, PersonaPepDirectoId>;
  hasPersona_pep_directo!: Sequelize.HasManyHasAssociationMixin<PersonaPepDirecto, PersonaPepDirectoId>;
  hasPersona_pep_directos!: Sequelize.HasManyHasAssociationsMixin<PersonaPepDirecto, PersonaPepDirectoId>;
  countPersona_pep_directos!: Sequelize.HasManyCountAssociationsMixin;
  // Persona hasMany PersonaPepIndirecto via _idpersona
  persona_pep_indirectos!: PersonaPepIndirecto[];
  getPersona_pep_indirectos!: Sequelize.HasManyGetAssociationsMixin<PersonaPepIndirecto>;
  setPersona_pep_indirectos!: Sequelize.HasManySetAssociationsMixin<PersonaPepIndirecto, PersonaPepIndirectoId>;
  addPersona_pep_indirecto!: Sequelize.HasManyAddAssociationMixin<PersonaPepIndirecto, PersonaPepIndirectoId>;
  addPersona_pep_indirectos!: Sequelize.HasManyAddAssociationsMixin<PersonaPepIndirecto, PersonaPepIndirectoId>;
  createPersona_pep_indirecto!: Sequelize.HasManyCreateAssociationMixin<PersonaPepIndirecto>;
  removePersona_pep_indirecto!: Sequelize.HasManyRemoveAssociationMixin<PersonaPepIndirecto, PersonaPepIndirectoId>;
  removePersona_pep_indirectos!: Sequelize.HasManyRemoveAssociationsMixin<PersonaPepIndirecto, PersonaPepIndirectoId>;
  hasPersona_pep_indirecto!: Sequelize.HasManyHasAssociationMixin<PersonaPepIndirecto, PersonaPepIndirectoId>;
  hasPersona_pep_indirectos!: Sequelize.HasManyHasAssociationsMixin<PersonaPepIndirecto, PersonaPepIndirectoId>;
  countPersona_pep_indirectos!: Sequelize.HasManyCountAssociationsMixin;
  // Persona hasMany PersonaVerificacion via _idpersona
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
  // Persona belongsTo PersonaVerificacionEstado via _idpersonaverificacionestado
  personaverificacionestado_persona_verificacion_estado!: PersonaVerificacionEstado;
  get_idpersonaverificacionestado_persona_verificacion_estado!: Sequelize.BelongsToGetAssociationMixin<PersonaVerificacionEstado>;
  set_idpersonaverificacionestado_persona_verificacion_estado!: Sequelize.BelongsToSetAssociationMixin<PersonaVerificacionEstado, PersonaVerificacionEstadoId>;
  create_idpersonaverificacionestado_persona_verificacion_estado!: Sequelize.BelongsToCreateAssociationMixin<PersonaVerificacionEstado>;
  // Persona belongsTo Provincia via _idprovinciaresidencia
  provinciaresidencia_provincium!: Provincia;
  get_idprovinciaresidencia_provincium!: Sequelize.BelongsToGetAssociationMixin<Provincia>;
  set_idprovinciaresidencia_provincium!: Sequelize.BelongsToSetAssociationMixin<Provincia, ProvinciaId>;
  create_idprovinciaresidencia_provincium!: Sequelize.BelongsToCreateAssociationMixin<Provincia>;
  // Persona belongsTo Usuario via _idusuario
  usuario_usuario!: Usuario;
  get_idusuario_usuario!: Sequelize.BelongsToGetAssociationMixin<Usuario>;
  set_idusuario_usuario!: Sequelize.BelongsToSetAssociationMixin<Usuario, UsuarioId>;
  create_idusuario_usuario!: Sequelize.BelongsToCreateAssociationMixin<Usuario>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Persona {
    return Persona.init({
    _idpersona: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    personaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_personaid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_code"
    },
    _idusuario: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'usuario',
        key: '_idusuario'
      },
      unique: "FK_persona_idusuario"
    },
    _idpersonaverificacionestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'persona_verificacion_estado',
        key: '_idpersonaverificacionestado'
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
    _idpaisnacionalidad: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'pais',
        key: '_idpais'
      }
    },
    _idpaisnacimiento: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'pais',
        key: '_idpais'
      }
    },
    _idpaisresidencia: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'pais',
        key: '_idpais'
      }
    },
    _iddepartamentoresidencia: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'departamento',
        key: '_iddepartamento'
      }
    },
    _idprovinciaresidencia: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'provincia',
        key: '_idprovincia'
      }
    },
    _iddistritoresidencia: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'distrito',
        key: '_iddistrito'
      }
    },
    _idgenero: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'genero',
        key: '_idgenero'
      }
    },
    documentonumero: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    personanombres: {
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
      allowNull: false
    },
    celular: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    fechanacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    direccion: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    direccionreferencia: {
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
    tableName: 'persona',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idpersona" },
        ]
      },
      {
        name: "UQ_personaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "personaid" },
        ]
      },
      {
        name: "UQ_idusuario",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuario" },
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
        name: "FK_persona_iddocumentotipo",
        using: "BTREE",
        fields: [
          { name: "_iddocumentotipo" },
        ]
      },
      {
        name: "FK_persona_iddepartamentoresidencia",
        using: "BTREE",
        fields: [
          { name: "_iddepartamentoresidencia" },
        ]
      },
      {
        name: "FK_persona_iddistritoresidencia",
        using: "BTREE",
        fields: [
          { name: "_iddistritoresidencia" },
        ]
      },
      {
        name: "FK_persona_idgenero",
        using: "BTREE",
        fields: [
          { name: "_idgenero" },
        ]
      },
      {
        name: "FK_persona_idpaisnacimiento",
        using: "BTREE",
        fields: [
          { name: "_idpaisnacimiento" },
        ]
      },
      {
        name: "FK_persona_idpaisnacionalidad",
        using: "BTREE",
        fields: [
          { name: "_idpaisnacionalidad" },
        ]
      },
      {
        name: "FK_persona_idpaisresidencia",
        using: "BTREE",
        fields: [
          { name: "_idpaisresidencia" },
        ]
      },
      {
        name: "FK_persona_idprovinciaresidencia",
        using: "BTREE",
        fields: [
          { name: "_idprovinciaresidencia" },
        ]
      },
      {
        name: "FK_persona_idpersonaverificacionestado",
        using: "BTREE",
        fields: [
          { name: "_idpersonaverificacionestado" },
        ]
      },
    ]
  });
  }
}
