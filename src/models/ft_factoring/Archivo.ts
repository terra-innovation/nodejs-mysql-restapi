import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ArchivoColaborador, ArchivoColaboradorId } from './ArchivoColaborador.js';
import type { ArchivoCuentaBancaria, ArchivoCuentaBancariaId } from './ArchivoCuentaBancaria.js';
import type { ArchivoEmpresa, ArchivoEmpresaId } from './ArchivoEmpresa.js';
import type { ArchivoEstado, ArchivoEstadoId } from './ArchivoEstado.js';
import type { ArchivoFactoringHistorialEstado, ArchivoFactoringHistorialEstadoId } from './ArchivoFactoringHistorialEstado.js';
import type { ArchivoFactura, ArchivoFacturaId } from './ArchivoFactura.js';
import type { ArchivoInversionistaDeposito, ArchivoInversionistaDepositoId } from './ArchivoInversionistaDeposito.js';
import type { ArchivoInversionistaRetiro, ArchivoInversionistaRetiroId } from './ArchivoInversionistaRetiro.js';
import type { ArchivoPersona, ArchivoPersonaId } from './ArchivoPersona.js';
import type { ArchivoTipo, ArchivoTipoId } from './ArchivoTipo.js';
import type { Colaborador, ColaboradorId } from './Colaborador.js';
import type { CuentaBancaria, CuentaBancariaId } from './CuentaBancaria.js';
import type { Empresa, EmpresaId } from './Empresa.js';
import type { FactoringHistorialEstado, FactoringHistorialEstadoId } from './FactoringHistorialEstado.js';
import type { Factura, FacturaId } from './Factura.js';
import type { InversionistaDeposito, InversionistaDepositoId } from './InversionistaDeposito.js';
import type { InversionistaRetiro, InversionistaRetiroId } from './InversionistaRetiro.js';
import type { Persona, PersonaId } from './Persona.js';

export interface ArchivoAttributes {
  _idarchivo: number;
  archivoid: string;
  _idarchivotipo: number;
  _idarchivoestado: number;
  codigo: string;
  nombrereal: string;
  nombrealmacenamiento: string;
  ruta: string;
  tamanio: number;
  mimetype: string;
  encoding: string;
  extension: string;
  observacion?: string;
  fechavencimiento?: string;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type ArchivoPk = "_idarchivo";
export type ArchivoId = Archivo[ArchivoPk];
export type ArchivoOptionalAttributes = "_idarchivo" | "archivoid" | "_idarchivotipo" | "_idarchivoestado" | "codigo" | "tamanio" | "observacion" | "fechavencimiento" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type ArchivoCreationAttributes = Optional<ArchivoAttributes, ArchivoOptionalAttributes>;

export class Archivo extends Model<ArchivoAttributes, ArchivoCreationAttributes> implements ArchivoAttributes {
  _idarchivo!: number;
  archivoid!: string;
  _idarchivotipo!: number;
  _idarchivoestado!: number;
  codigo!: string;
  nombrereal!: string;
  nombrealmacenamiento!: string;
  ruta!: string;
  tamanio!: number;
  mimetype!: string;
  encoding!: string;
  extension!: string;
  observacion?: string;
  fechavencimiento?: string;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // Archivo hasMany ArchivoColaborador via _idarchivo
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
  // Archivo hasMany ArchivoCuentaBancaria via _idarchivo
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
  // Archivo hasMany ArchivoEmpresa via _idarchivo
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
  // Archivo hasMany ArchivoFactoringHistorialEstado via _idarchivo
  archivo_factoring_historial_estados!: ArchivoFactoringHistorialEstado[];
  getArchivo_factoring_historial_estados!: Sequelize.HasManyGetAssociationsMixin<ArchivoFactoringHistorialEstado>;
  setArchivo_factoring_historial_estados!: Sequelize.HasManySetAssociationsMixin<ArchivoFactoringHistorialEstado, ArchivoFactoringHistorialEstadoId>;
  addArchivo_factoring_historial_estado!: Sequelize.HasManyAddAssociationMixin<ArchivoFactoringHistorialEstado, ArchivoFactoringHistorialEstadoId>;
  addArchivo_factoring_historial_estados!: Sequelize.HasManyAddAssociationsMixin<ArchivoFactoringHistorialEstado, ArchivoFactoringHistorialEstadoId>;
  createArchivo_factoring_historial_estado!: Sequelize.HasManyCreateAssociationMixin<ArchivoFactoringHistorialEstado>;
  removeArchivo_factoring_historial_estado!: Sequelize.HasManyRemoveAssociationMixin<ArchivoFactoringHistorialEstado, ArchivoFactoringHistorialEstadoId>;
  removeArchivo_factoring_historial_estados!: Sequelize.HasManyRemoveAssociationsMixin<ArchivoFactoringHistorialEstado, ArchivoFactoringHistorialEstadoId>;
  hasArchivo_factoring_historial_estado!: Sequelize.HasManyHasAssociationMixin<ArchivoFactoringHistorialEstado, ArchivoFactoringHistorialEstadoId>;
  hasArchivo_factoring_historial_estados!: Sequelize.HasManyHasAssociationsMixin<ArchivoFactoringHistorialEstado, ArchivoFactoringHistorialEstadoId>;
  countArchivo_factoring_historial_estados!: Sequelize.HasManyCountAssociationsMixin;
  // Archivo hasMany ArchivoFactura via _idarchivo
  archivo_facturas!: ArchivoFactura[];
  getArchivo_facturas!: Sequelize.HasManyGetAssociationsMixin<ArchivoFactura>;
  setArchivo_facturas!: Sequelize.HasManySetAssociationsMixin<ArchivoFactura, ArchivoFacturaId>;
  addArchivo_factura!: Sequelize.HasManyAddAssociationMixin<ArchivoFactura, ArchivoFacturaId>;
  addArchivo_facturas!: Sequelize.HasManyAddAssociationsMixin<ArchivoFactura, ArchivoFacturaId>;
  createArchivo_factura!: Sequelize.HasManyCreateAssociationMixin<ArchivoFactura>;
  removeArchivo_factura!: Sequelize.HasManyRemoveAssociationMixin<ArchivoFactura, ArchivoFacturaId>;
  removeArchivo_facturas!: Sequelize.HasManyRemoveAssociationsMixin<ArchivoFactura, ArchivoFacturaId>;
  hasArchivo_factura!: Sequelize.HasManyHasAssociationMixin<ArchivoFactura, ArchivoFacturaId>;
  hasArchivo_facturas!: Sequelize.HasManyHasAssociationsMixin<ArchivoFactura, ArchivoFacturaId>;
  countArchivo_facturas!: Sequelize.HasManyCountAssociationsMixin;
  // Archivo hasMany ArchivoInversionistaDeposito via _idarchivo
  archivo_inversionista_depositos!: ArchivoInversionistaDeposito[];
  getArchivo_inversionista_depositos!: Sequelize.HasManyGetAssociationsMixin<ArchivoInversionistaDeposito>;
  setArchivo_inversionista_depositos!: Sequelize.HasManySetAssociationsMixin<ArchivoInversionistaDeposito, ArchivoInversionistaDepositoId>;
  addArchivo_inversionista_deposito!: Sequelize.HasManyAddAssociationMixin<ArchivoInversionistaDeposito, ArchivoInversionistaDepositoId>;
  addArchivo_inversionista_depositos!: Sequelize.HasManyAddAssociationsMixin<ArchivoInversionistaDeposito, ArchivoInversionistaDepositoId>;
  createArchivo_inversionista_deposito!: Sequelize.HasManyCreateAssociationMixin<ArchivoInversionistaDeposito>;
  removeArchivo_inversionista_deposito!: Sequelize.HasManyRemoveAssociationMixin<ArchivoInversionistaDeposito, ArchivoInversionistaDepositoId>;
  removeArchivo_inversionista_depositos!: Sequelize.HasManyRemoveAssociationsMixin<ArchivoInversionistaDeposito, ArchivoInversionistaDepositoId>;
  hasArchivo_inversionista_deposito!: Sequelize.HasManyHasAssociationMixin<ArchivoInversionistaDeposito, ArchivoInversionistaDepositoId>;
  hasArchivo_inversionista_depositos!: Sequelize.HasManyHasAssociationsMixin<ArchivoInversionistaDeposito, ArchivoInversionistaDepositoId>;
  countArchivo_inversionista_depositos!: Sequelize.HasManyCountAssociationsMixin;
  // Archivo hasMany ArchivoInversionistaRetiro via _idarchivo
  archivo_inversionista_retiros!: ArchivoInversionistaRetiro[];
  getArchivo_inversionista_retiros!: Sequelize.HasManyGetAssociationsMixin<ArchivoInversionistaRetiro>;
  setArchivo_inversionista_retiros!: Sequelize.HasManySetAssociationsMixin<ArchivoInversionistaRetiro, ArchivoInversionistaRetiroId>;
  addArchivo_inversionista_retiro!: Sequelize.HasManyAddAssociationMixin<ArchivoInversionistaRetiro, ArchivoInversionistaRetiroId>;
  addArchivo_inversionista_retiros!: Sequelize.HasManyAddAssociationsMixin<ArchivoInversionistaRetiro, ArchivoInversionistaRetiroId>;
  createArchivo_inversionista_retiro!: Sequelize.HasManyCreateAssociationMixin<ArchivoInversionistaRetiro>;
  removeArchivo_inversionista_retiro!: Sequelize.HasManyRemoveAssociationMixin<ArchivoInversionistaRetiro, ArchivoInversionistaRetiroId>;
  removeArchivo_inversionista_retiros!: Sequelize.HasManyRemoveAssociationsMixin<ArchivoInversionistaRetiro, ArchivoInversionistaRetiroId>;
  hasArchivo_inversionista_retiro!: Sequelize.HasManyHasAssociationMixin<ArchivoInversionistaRetiro, ArchivoInversionistaRetiroId>;
  hasArchivo_inversionista_retiros!: Sequelize.HasManyHasAssociationsMixin<ArchivoInversionistaRetiro, ArchivoInversionistaRetiroId>;
  countArchivo_inversionista_retiros!: Sequelize.HasManyCountAssociationsMixin;
  // Archivo hasMany ArchivoPersona via _idarchivo
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
  // Archivo belongsToMany Colaborador via _idarchivo and _idcolaborador
  colaborador_colaboradors!: Colaborador[];
  get_idcolaborador_colaboradors!: Sequelize.BelongsToManyGetAssociationsMixin<Colaborador>;
  set_idcolaborador_colaboradors!: Sequelize.BelongsToManySetAssociationsMixin<Colaborador, ColaboradorId>;
  add_idcolaborador_colaborador!: Sequelize.BelongsToManyAddAssociationMixin<Colaborador, ColaboradorId>;
  add_idcolaborador_colaboradors!: Sequelize.BelongsToManyAddAssociationsMixin<Colaborador, ColaboradorId>;
  create_idcolaborador_colaborador!: Sequelize.BelongsToManyCreateAssociationMixin<Colaborador>;
  remove_idcolaborador_colaborador!: Sequelize.BelongsToManyRemoveAssociationMixin<Colaborador, ColaboradorId>;
  remove_idcolaborador_colaboradors!: Sequelize.BelongsToManyRemoveAssociationsMixin<Colaborador, ColaboradorId>;
  has_idcolaborador_colaborador!: Sequelize.BelongsToManyHasAssociationMixin<Colaborador, ColaboradorId>;
  has_idcolaborador_colaboradors!: Sequelize.BelongsToManyHasAssociationsMixin<Colaborador, ColaboradorId>;
  count_idcolaborador_colaboradors!: Sequelize.BelongsToManyCountAssociationsMixin;
  // Archivo belongsToMany CuentaBancaria via _idarchivo and _idcuentabancaria
  cuentabancaria_cuenta_bancaria!: CuentaBancaria[];
  get_idcuentabancaria_cuenta_bancaria!: Sequelize.BelongsToManyGetAssociationsMixin<CuentaBancaria>;
  set_idcuentabancaria_cuenta_bancaria!: Sequelize.BelongsToManySetAssociationsMixin<CuentaBancaria, CuentaBancariaId>;
  add_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToManyAddAssociationMixin<CuentaBancaria, CuentaBancariaId>;
  add_idcuentabancaria_cuenta_bancaria!: Sequelize.BelongsToManyAddAssociationsMixin<CuentaBancaria, CuentaBancariaId>;
  create_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToManyCreateAssociationMixin<CuentaBancaria>;
  remove_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToManyRemoveAssociationMixin<CuentaBancaria, CuentaBancariaId>;
  remove_idcuentabancaria_cuenta_bancaria!: Sequelize.BelongsToManyRemoveAssociationsMixin<CuentaBancaria, CuentaBancariaId>;
  has_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToManyHasAssociationMixin<CuentaBancaria, CuentaBancariaId>;
  has_idcuentabancaria_cuenta_bancaria!: Sequelize.BelongsToManyHasAssociationsMixin<CuentaBancaria, CuentaBancariaId>;
  count_idcuentabancaria_cuenta_bancaria!: Sequelize.BelongsToManyCountAssociationsMixin;
  // Archivo belongsToMany Empresa via _idarchivo and _idempresa
  empresa_empresas!: Empresa[];
  get_idempresa_empresas!: Sequelize.BelongsToManyGetAssociationsMixin<Empresa>;
  set_idempresa_empresas!: Sequelize.BelongsToManySetAssociationsMixin<Empresa, EmpresaId>;
  add_idempresa_empresa!: Sequelize.BelongsToManyAddAssociationMixin<Empresa, EmpresaId>;
  add_idempresa_empresas!: Sequelize.BelongsToManyAddAssociationsMixin<Empresa, EmpresaId>;
  create_idempresa_empresa!: Sequelize.BelongsToManyCreateAssociationMixin<Empresa>;
  remove_idempresa_empresa!: Sequelize.BelongsToManyRemoveAssociationMixin<Empresa, EmpresaId>;
  remove_idempresa_empresas!: Sequelize.BelongsToManyRemoveAssociationsMixin<Empresa, EmpresaId>;
  has_idempresa_empresa!: Sequelize.BelongsToManyHasAssociationMixin<Empresa, EmpresaId>;
  has_idempresa_empresas!: Sequelize.BelongsToManyHasAssociationsMixin<Empresa, EmpresaId>;
  count_idempresa_empresas!: Sequelize.BelongsToManyCountAssociationsMixin;
  // Archivo belongsToMany FactoringHistorialEstado via _idarchivo and _idfactoringhistorialestado
  factoringhistorialestado_factoring_historial_estados!: FactoringHistorialEstado[];
  get_idfactoringhistorialestado_factoring_historial_estados!: Sequelize.BelongsToManyGetAssociationsMixin<FactoringHistorialEstado>;
  set_idfactoringhistorialestado_factoring_historial_estados!: Sequelize.BelongsToManySetAssociationsMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  add_idfactoringhistorialestado_factoring_historial_estado!: Sequelize.BelongsToManyAddAssociationMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  add_idfactoringhistorialestado_factoring_historial_estados!: Sequelize.BelongsToManyAddAssociationsMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  create_idfactoringhistorialestado_factoring_historial_estado!: Sequelize.BelongsToManyCreateAssociationMixin<FactoringHistorialEstado>;
  remove_idfactoringhistorialestado_factoring_historial_estado!: Sequelize.BelongsToManyRemoveAssociationMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  remove_idfactoringhistorialestado_factoring_historial_estados!: Sequelize.BelongsToManyRemoveAssociationsMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  has_idfactoringhistorialestado_factoring_historial_estado!: Sequelize.BelongsToManyHasAssociationMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  has_idfactoringhistorialestado_factoring_historial_estados!: Sequelize.BelongsToManyHasAssociationsMixin<FactoringHistorialEstado, FactoringHistorialEstadoId>;
  count_idfactoringhistorialestado_factoring_historial_estados!: Sequelize.BelongsToManyCountAssociationsMixin;
  // Archivo belongsToMany Factura via _idarchivo and _idfactura
  factura_facturas!: Factura[];
  get_idfactura_facturas!: Sequelize.BelongsToManyGetAssociationsMixin<Factura>;
  set_idfactura_facturas!: Sequelize.BelongsToManySetAssociationsMixin<Factura, FacturaId>;
  add_idfactura_factura!: Sequelize.BelongsToManyAddAssociationMixin<Factura, FacturaId>;
  add_idfactura_facturas!: Sequelize.BelongsToManyAddAssociationsMixin<Factura, FacturaId>;
  create_idfactura_factura!: Sequelize.BelongsToManyCreateAssociationMixin<Factura>;
  remove_idfactura_factura!: Sequelize.BelongsToManyRemoveAssociationMixin<Factura, FacturaId>;
  remove_idfactura_facturas!: Sequelize.BelongsToManyRemoveAssociationsMixin<Factura, FacturaId>;
  has_idfactura_factura!: Sequelize.BelongsToManyHasAssociationMixin<Factura, FacturaId>;
  has_idfactura_facturas!: Sequelize.BelongsToManyHasAssociationsMixin<Factura, FacturaId>;
  count_idfactura_facturas!: Sequelize.BelongsToManyCountAssociationsMixin;
  // Archivo belongsToMany InversionistaDeposito via _idarchivo and _idinversionistadeposito
  inversionistadeposito_inversionista_depositos!: InversionistaDeposito[];
  get_idinversionistadeposito_inversionista_depositos!: Sequelize.BelongsToManyGetAssociationsMixin<InversionistaDeposito>;
  set_idinversionistadeposito_inversionista_depositos!: Sequelize.BelongsToManySetAssociationsMixin<InversionistaDeposito, InversionistaDepositoId>;
  add_idinversionistadeposito_inversionista_deposito!: Sequelize.BelongsToManyAddAssociationMixin<InversionistaDeposito, InversionistaDepositoId>;
  add_idinversionistadeposito_inversionista_depositos!: Sequelize.BelongsToManyAddAssociationsMixin<InversionistaDeposito, InversionistaDepositoId>;
  create_idinversionistadeposito_inversionista_deposito!: Sequelize.BelongsToManyCreateAssociationMixin<InversionistaDeposito>;
  remove_idinversionistadeposito_inversionista_deposito!: Sequelize.BelongsToManyRemoveAssociationMixin<InversionistaDeposito, InversionistaDepositoId>;
  remove_idinversionistadeposito_inversionista_depositos!: Sequelize.BelongsToManyRemoveAssociationsMixin<InversionistaDeposito, InversionistaDepositoId>;
  has_idinversionistadeposito_inversionista_deposito!: Sequelize.BelongsToManyHasAssociationMixin<InversionistaDeposito, InversionistaDepositoId>;
  has_idinversionistadeposito_inversionista_depositos!: Sequelize.BelongsToManyHasAssociationsMixin<InversionistaDeposito, InversionistaDepositoId>;
  count_idinversionistadeposito_inversionista_depositos!: Sequelize.BelongsToManyCountAssociationsMixin;
  // Archivo belongsToMany InversionistaRetiro via _idarchivo and _idinversionistaretiro
  inversionistaretiro_inversionista_retiros!: InversionistaRetiro[];
  get_idinversionistaretiro_inversionista_retiros!: Sequelize.BelongsToManyGetAssociationsMixin<InversionistaRetiro>;
  set_idinversionistaretiro_inversionista_retiros!: Sequelize.BelongsToManySetAssociationsMixin<InversionistaRetiro, InversionistaRetiroId>;
  add_idinversionistaretiro_inversionista_retiro!: Sequelize.BelongsToManyAddAssociationMixin<InversionistaRetiro, InversionistaRetiroId>;
  add_idinversionistaretiro_inversionista_retiros!: Sequelize.BelongsToManyAddAssociationsMixin<InversionistaRetiro, InversionistaRetiroId>;
  create_idinversionistaretiro_inversionista_retiro!: Sequelize.BelongsToManyCreateAssociationMixin<InversionistaRetiro>;
  remove_idinversionistaretiro_inversionista_retiro!: Sequelize.BelongsToManyRemoveAssociationMixin<InversionistaRetiro, InversionistaRetiroId>;
  remove_idinversionistaretiro_inversionista_retiros!: Sequelize.BelongsToManyRemoveAssociationsMixin<InversionistaRetiro, InversionistaRetiroId>;
  has_idinversionistaretiro_inversionista_retiro!: Sequelize.BelongsToManyHasAssociationMixin<InversionistaRetiro, InversionistaRetiroId>;
  has_idinversionistaretiro_inversionista_retiros!: Sequelize.BelongsToManyHasAssociationsMixin<InversionistaRetiro, InversionistaRetiroId>;
  count_idinversionistaretiro_inversionista_retiros!: Sequelize.BelongsToManyCountAssociationsMixin;
  // Archivo belongsToMany Persona via _idarchivo and _idpersona
  persona_personas!: Persona[];
  get_idpersona_personas!: Sequelize.BelongsToManyGetAssociationsMixin<Persona>;
  set_idpersona_personas!: Sequelize.BelongsToManySetAssociationsMixin<Persona, PersonaId>;
  add_idpersona_persona!: Sequelize.BelongsToManyAddAssociationMixin<Persona, PersonaId>;
  add_idpersona_personas!: Sequelize.BelongsToManyAddAssociationsMixin<Persona, PersonaId>;
  create_idpersona_persona!: Sequelize.BelongsToManyCreateAssociationMixin<Persona>;
  remove_idpersona_persona!: Sequelize.BelongsToManyRemoveAssociationMixin<Persona, PersonaId>;
  remove_idpersona_personas!: Sequelize.BelongsToManyRemoveAssociationsMixin<Persona, PersonaId>;
  has_idpersona_persona!: Sequelize.BelongsToManyHasAssociationMixin<Persona, PersonaId>;
  has_idpersona_personas!: Sequelize.BelongsToManyHasAssociationsMixin<Persona, PersonaId>;
  count_idpersona_personas!: Sequelize.BelongsToManyCountAssociationsMixin;
  // Archivo belongsTo ArchivoEstado via _idarchivoestado
  archivoestado_archivo_estado!: ArchivoEstado;
  get_idarchivoestado_archivo_estado!: Sequelize.BelongsToGetAssociationMixin<ArchivoEstado>;
  set_idarchivoestado_archivo_estado!: Sequelize.BelongsToSetAssociationMixin<ArchivoEstado, ArchivoEstadoId>;
  create_idarchivoestado_archivo_estado!: Sequelize.BelongsToCreateAssociationMixin<ArchivoEstado>;
  // Archivo belongsTo ArchivoTipo via _idarchivotipo
  archivotipo_archivo_tipo!: ArchivoTipo;
  get_idarchivotipo_archivo_tipo!: Sequelize.BelongsToGetAssociationMixin<ArchivoTipo>;
  set_idarchivotipo_archivo_tipo!: Sequelize.BelongsToSetAssociationMixin<ArchivoTipo, ArchivoTipoId>;
  create_idarchivotipo_archivo_tipo!: Sequelize.BelongsToCreateAssociationMixin<ArchivoTipo>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Archivo {
    return Archivo.init({
    _idarchivo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    archivoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_archivoid"
    },
    _idarchivotipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'archivo_tipo',
        key: '_idarchivotipo'
      }
    },
    _idarchivoestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'archivo_estado',
        key: '_idarchivoestado'
      }
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "0"
    },
    nombrereal: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: "Nombre real del archivo"
    },
    nombrealmacenamiento: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: "Nombre del archivo en el almacenamiento"
    },
    ruta: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    tamanio: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
      comment: "Tamaño del archivo en KB"
    },
    mimetype: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "MineType"
    },
    encoding: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Encoding"
    },
    extension: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "Extesión del archivo"
    },
    observacion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Campo adicional para comentarios o información relevante."
    },
    fechavencimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Fecha en que el documento expira o requiere revisión, si es relevante."
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
    tableName: 'archivo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idarchivo" },
        ]
      },
      {
        name: "UQ_archivoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "archivoid" },
        ]
      },
      {
        name: "FK_archivo_idarchivotipo",
        using: "BTREE",
        fields: [
          { name: "_idarchivotipo" },
        ]
      },
      {
        name: "FK_archivo_idarchivoestado",
        using: "BTREE",
        fields: [
          { name: "_idarchivoestado" },
        ]
      },
    ]
  });
  }
}
