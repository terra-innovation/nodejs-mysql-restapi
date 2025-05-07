import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Colaborador, ColaboradorId } from './Colaborador.js';
import type { Contacto, ContactoId } from './Contacto.js';
import type { CuentaBancaria, CuentaBancariaId } from './CuentaBancaria.js';
import type { Empresa, EmpresaId } from './Empresa.js';
import type { FactoringEjecutado, FactoringEjecutadoId } from './FactoringEjecutado.js';
import type { FactoringEstado, FactoringEstadoId } from './FactoringEstado.js';
import type { FactoringFactura, FactoringFacturaId } from './FactoringFactura.js';
import type { FactoringHistorialEstado, FactoringHistorialEstadoId } from './FactoringHistorialEstado.js';
import type { FactoringPago, FactoringPagoId } from './FactoringPago.js';
import type { FactoringPropuesta, FactoringPropuestaId } from './FactoringPropuesta.js';
import type { Factura, FacturaId } from './Factura.js';
import type { Moneda, MonedaId } from './Moneda.js';

export interface FactoringAttributes {
  _idfactoring: number;
  factoringid: string;
  code: string;
  _idaceptante: number;
  _idcedente: number;
  _idmoneda: number;
  _idfactoringestado: number;
  _idcuentabancaria?: number;
  _idcontactoaceptante?: number;
  _idcontactocedente?: number;
  _idfactoringejecutado?: number;
  _idfactoringpropuestaaceptada?: number;
  cantidad_facturas: number;
  fecha_registro: Date | Sequelize.Utils.Fn;
  fecha_emision: Date | Sequelize.Utils.Fn;
  fecha_operacion?: Date | Sequelize.Utils.Fn;
  fecha_pago_estimado: Date | Sequelize.Utils.Fn;
  monto_factura: number;
  monto_detraccion: number;
  monto_neto: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FactoringPk = "_idfactoring";
export type FactoringId = Factoring[FactoringPk];
export type FactoringOptionalAttributes = "_idfactoring" | "factoringid" | "_idcuentabancaria" | "_idcontactoaceptante" | "_idcontactocedente" | "_idfactoringejecutado" | "_idfactoringpropuestaaceptada" | "fecha_operacion" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FactoringCreationAttributes = Optional<FactoringAttributes, FactoringOptionalAttributes>;

export class Factoring extends Model<FactoringAttributes, FactoringCreationAttributes> implements FactoringAttributes {
  _idfactoring!: number;
  factoringid!: string;
  code!: string;
  _idaceptante!: number;
  _idcedente!: number;
  _idmoneda!: number;
  _idfactoringestado!: number;
  _idcuentabancaria?: number;
  _idcontactoaceptante?: number;
  _idcontactocedente?: number;
  _idfactoringejecutado?: number;
  _idfactoringpropuestaaceptada?: number;
  cantidad_facturas!: number;
  fecha_registro!: Date;
  fecha_emision!: Date;
  fecha_operacion?: Date | Sequelize.Utils.Fn;
  fecha_pago_estimado!: Date;
  monto_factura!: number;
  monto_detraccion!: number;
  monto_neto!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // Factoring belongsTo Colaborador via _idcontactocedente
  contactocedente_colaborador!: Colaborador;
  get_idcontactocedente_colaborador!: Sequelize.BelongsToGetAssociationMixin<Colaborador>;
  set_idcontactocedente_colaborador!: Sequelize.BelongsToSetAssociationMixin<Colaborador, ColaboradorId>;
  create_idcontactocedente_colaborador!: Sequelize.BelongsToCreateAssociationMixin<Colaborador>;
  // Factoring belongsTo Contacto via _idcontactoaceptante
  contactoaceptante_contacto!: Contacto;
  get_idcontactoaceptante_contacto!: Sequelize.BelongsToGetAssociationMixin<Contacto>;
  set_idcontactoaceptante_contacto!: Sequelize.BelongsToSetAssociationMixin<Contacto, ContactoId>;
  create_idcontactoaceptante_contacto!: Sequelize.BelongsToCreateAssociationMixin<Contacto>;
  // Factoring belongsTo CuentaBancaria via _idcuentabancaria
  cuentabancaria_cuenta_bancarium!: CuentaBancaria;
  get_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToGetAssociationMixin<CuentaBancaria>;
  set_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToSetAssociationMixin<CuentaBancaria, CuentaBancariaId>;
  create_idcuentabancaria_cuenta_bancarium!: Sequelize.BelongsToCreateAssociationMixin<CuentaBancaria>;
  // Factoring belongsTo Empresa via _idaceptante
  aceptante_empresa!: Empresa;
  get_idaceptante_empresa!: Sequelize.BelongsToGetAssociationMixin<Empresa>;
  set_idaceptante_empresa!: Sequelize.BelongsToSetAssociationMixin<Empresa, EmpresaId>;
  create_idaceptante_empresa!: Sequelize.BelongsToCreateAssociationMixin<Empresa>;
  // Factoring belongsTo Empresa via _idcedente
  cedente_empresa!: Empresa;
  get_idcedente_empresa!: Sequelize.BelongsToGetAssociationMixin<Empresa>;
  set_idcedente_empresa!: Sequelize.BelongsToSetAssociationMixin<Empresa, EmpresaId>;
  create_idcedente_empresa!: Sequelize.BelongsToCreateAssociationMixin<Empresa>;
  // Factoring hasMany FactoringEjecutado via _idfactoring
  factoring_ejecutados!: FactoringEjecutado[];
  getFactoring_ejecutados!: Sequelize.HasManyGetAssociationsMixin<FactoringEjecutado>;
  setFactoring_ejecutados!: Sequelize.HasManySetAssociationsMixin<FactoringEjecutado, FactoringEjecutadoId>;
  addFactoring_ejecutado!: Sequelize.HasManyAddAssociationMixin<FactoringEjecutado, FactoringEjecutadoId>;
  addFactoring_ejecutados!: Sequelize.HasManyAddAssociationsMixin<FactoringEjecutado, FactoringEjecutadoId>;
  createFactoring_ejecutado!: Sequelize.HasManyCreateAssociationMixin<FactoringEjecutado>;
  removeFactoring_ejecutado!: Sequelize.HasManyRemoveAssociationMixin<FactoringEjecutado, FactoringEjecutadoId>;
  removeFactoring_ejecutados!: Sequelize.HasManyRemoveAssociationsMixin<FactoringEjecutado, FactoringEjecutadoId>;
  hasFactoring_ejecutado!: Sequelize.HasManyHasAssociationMixin<FactoringEjecutado, FactoringEjecutadoId>;
  hasFactoring_ejecutados!: Sequelize.HasManyHasAssociationsMixin<FactoringEjecutado, FactoringEjecutadoId>;
  countFactoring_ejecutados!: Sequelize.HasManyCountAssociationsMixin;
  // Factoring hasMany FactoringFactura via _idfactoring
  factoring_facturas!: FactoringFactura[];
  getFactoring_facturas!: Sequelize.HasManyGetAssociationsMixin<FactoringFactura>;
  setFactoring_facturas!: Sequelize.HasManySetAssociationsMixin<FactoringFactura, FactoringFacturaId>;
  addFactoring_factura!: Sequelize.HasManyAddAssociationMixin<FactoringFactura, FactoringFacturaId>;
  addFactoring_facturas!: Sequelize.HasManyAddAssociationsMixin<FactoringFactura, FactoringFacturaId>;
  createFactoring_factura!: Sequelize.HasManyCreateAssociationMixin<FactoringFactura>;
  removeFactoring_factura!: Sequelize.HasManyRemoveAssociationMixin<FactoringFactura, FactoringFacturaId>;
  removeFactoring_facturas!: Sequelize.HasManyRemoveAssociationsMixin<FactoringFactura, FactoringFacturaId>;
  hasFactoring_factura!: Sequelize.HasManyHasAssociationMixin<FactoringFactura, FactoringFacturaId>;
  hasFactoring_facturas!: Sequelize.HasManyHasAssociationsMixin<FactoringFactura, FactoringFacturaId>;
  countFactoring_facturas!: Sequelize.HasManyCountAssociationsMixin;
  // Factoring hasMany FactoringHistorialEstado via _idfactoring
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
  // Factoring hasMany FactoringPago via _idfactoring
  factoring_pagos!: FactoringPago[];
  getFactoring_pagos!: Sequelize.HasManyGetAssociationsMixin<FactoringPago>;
  setFactoring_pagos!: Sequelize.HasManySetAssociationsMixin<FactoringPago, FactoringPagoId>;
  addFactoring_pago!: Sequelize.HasManyAddAssociationMixin<FactoringPago, FactoringPagoId>;
  addFactoring_pagos!: Sequelize.HasManyAddAssociationsMixin<FactoringPago, FactoringPagoId>;
  createFactoring_pago!: Sequelize.HasManyCreateAssociationMixin<FactoringPago>;
  removeFactoring_pago!: Sequelize.HasManyRemoveAssociationMixin<FactoringPago, FactoringPagoId>;
  removeFactoring_pagos!: Sequelize.HasManyRemoveAssociationsMixin<FactoringPago, FactoringPagoId>;
  hasFactoring_pago!: Sequelize.HasManyHasAssociationMixin<FactoringPago, FactoringPagoId>;
  hasFactoring_pagos!: Sequelize.HasManyHasAssociationsMixin<FactoringPago, FactoringPagoId>;
  countFactoring_pagos!: Sequelize.HasManyCountAssociationsMixin;
  // Factoring hasMany FactoringPropuesta via _idfactoring
  factoring_propuesta!: FactoringPropuesta[];
  getFactoring_propuesta!: Sequelize.HasManyGetAssociationsMixin<FactoringPropuesta>;
  setFactoring_propuesta!: Sequelize.HasManySetAssociationsMixin<FactoringPropuesta, FactoringPropuestaId>;
  addFactoring_propuestum!: Sequelize.HasManyAddAssociationMixin<FactoringPropuesta, FactoringPropuestaId>;
  addFactoring_propuesta!: Sequelize.HasManyAddAssociationsMixin<FactoringPropuesta, FactoringPropuestaId>;
  createFactoring_propuestum!: Sequelize.HasManyCreateAssociationMixin<FactoringPropuesta>;
  removeFactoring_propuestum!: Sequelize.HasManyRemoveAssociationMixin<FactoringPropuesta, FactoringPropuestaId>;
  removeFactoring_propuesta!: Sequelize.HasManyRemoveAssociationsMixin<FactoringPropuesta, FactoringPropuestaId>;
  hasFactoring_propuestum!: Sequelize.HasManyHasAssociationMixin<FactoringPropuesta, FactoringPropuestaId>;
  hasFactoring_propuesta!: Sequelize.HasManyHasAssociationsMixin<FactoringPropuesta, FactoringPropuestaId>;
  countFactoring_propuesta!: Sequelize.HasManyCountAssociationsMixin;
  // Factoring belongsToMany Factura via _idfactoring and _idfactura
  factura_factura_factoring_facturas!: Factura[];
  get_idfactura_factura_factoring_facturas!: Sequelize.BelongsToManyGetAssociationsMixin<Factura>;
  set_idfactura_factura_factoring_facturas!: Sequelize.BelongsToManySetAssociationsMixin<Factura, FacturaId>;
  add_idfactura_factura_factoring_factura!: Sequelize.BelongsToManyAddAssociationMixin<Factura, FacturaId>;
  add_idfactura_factura_factoring_facturas!: Sequelize.BelongsToManyAddAssociationsMixin<Factura, FacturaId>;
  create_idfactura_factura_factoring_factura!: Sequelize.BelongsToManyCreateAssociationMixin<Factura>;
  remove_idfactura_factura_factoring_factura!: Sequelize.BelongsToManyRemoveAssociationMixin<Factura, FacturaId>;
  remove_idfactura_factura_factoring_facturas!: Sequelize.BelongsToManyRemoveAssociationsMixin<Factura, FacturaId>;
  has_idfactura_factura_factoring_factura!: Sequelize.BelongsToManyHasAssociationMixin<Factura, FacturaId>;
  has_idfactura_factura_factoring_facturas!: Sequelize.BelongsToManyHasAssociationsMixin<Factura, FacturaId>;
  count_idfactura_factura_factoring_facturas!: Sequelize.BelongsToManyCountAssociationsMixin;
  // Factoring belongsTo FactoringEjecutado via _idfactoringejecutado
  factoringejecutado_factoring_ejecutado!: FactoringEjecutado;
  get_idfactoringejecutado_factoring_ejecutado!: Sequelize.BelongsToGetAssociationMixin<FactoringEjecutado>;
  set_idfactoringejecutado_factoring_ejecutado!: Sequelize.BelongsToSetAssociationMixin<FactoringEjecutado, FactoringEjecutadoId>;
  create_idfactoringejecutado_factoring_ejecutado!: Sequelize.BelongsToCreateAssociationMixin<FactoringEjecutado>;
  // Factoring belongsTo FactoringEstado via _idfactoringestado
  factoringestado_factoring_estado!: FactoringEstado;
  get_idfactoringestado_factoring_estado!: Sequelize.BelongsToGetAssociationMixin<FactoringEstado>;
  set_idfactoringestado_factoring_estado!: Sequelize.BelongsToSetAssociationMixin<FactoringEstado, FactoringEstadoId>;
  create_idfactoringestado_factoring_estado!: Sequelize.BelongsToCreateAssociationMixin<FactoringEstado>;
  // Factoring belongsTo FactoringPropuesta via _idfactoringpropuestaaceptada
  factoringpropuestaaceptada_factoring_propuestum!: FactoringPropuesta;
  get_idfactoringpropuestaaceptada_factoring_propuestum!: Sequelize.BelongsToGetAssociationMixin<FactoringPropuesta>;
  set_idfactoringpropuestaaceptada_factoring_propuestum!: Sequelize.BelongsToSetAssociationMixin<FactoringPropuesta, FactoringPropuestaId>;
  create_idfactoringpropuestaaceptada_factoring_propuestum!: Sequelize.BelongsToCreateAssociationMixin<FactoringPropuesta>;
  // Factoring belongsTo Moneda via _idmoneda
  moneda_moneda!: Moneda;
  get_idmoneda_moneda!: Sequelize.BelongsToGetAssociationMixin<Moneda>;
  set_idmoneda_moneda!: Sequelize.BelongsToSetAssociationMixin<Moneda, MonedaId>;
  create_idmoneda_moneda!: Sequelize.BelongsToCreateAssociationMixin<Moneda>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Factoring {
    return Factoring.init({
    _idfactoring: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    factoringid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoring_factoringid"
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "UQ_factoring_code"
    },
    _idaceptante: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresa',
        key: '_idempresa'
      }
    },
    _idcedente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresa',
        key: '_idempresa'
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
    _idfactoringestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'factoring_estado',
        key: '_idfactoringestado'
      }
    },
    _idcuentabancaria: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'cuenta_bancaria',
        key: '_idcuentabancaria'
      }
    },
    _idcontactoaceptante: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Contacto del aceptante",
      references: {
        model: 'contacto',
        key: '_idcontacto'
      }
    },
    _idcontactocedente: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Contacto del cedente",
      references: {
        model: 'colaborador',
        key: '_idcolaborador'
      }
    },
    _idfactoringejecutado: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'factoring_ejecutado',
        key: '_idfactoringejecutado'
      }
    },
    _idfactoringpropuestaaceptada: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'factoring_propuesta',
        key: '_idfactoringpropuesta'
      }
    },
    cantidad_facturas: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fecha_emision: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fecha_operacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Fecha desde que se debe tener en cuenta para el calculo de los intereses"
    },
    fecha_pago_estimado: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "Fecha en el que el deudor debe pagar"
    },
    monto_factura: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    monto_detraccion: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    monto_neto: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      comment: "Monto de la operación, descontando las detracciones"
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
    tableName: 'factoring',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoring" },
        ]
      },
      {
        name: "UQ_factoring_factoringid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringid" },
        ]
      },
      {
        name: "UQ_factoring_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_factoring_idaceptante",
        using: "BTREE",
        fields: [
          { name: "_idaceptante" },
        ]
      },
      {
        name: "FK_factoring_idcedente",
        using: "BTREE",
        fields: [
          { name: "_idcedente" },
        ]
      },
      {
        name: "FK_factoring_idcolaborador",
        using: "BTREE",
        fields: [
          { name: "_idcontactoaceptante" },
        ]
      },
      {
        name: "FK_factoring_idcontactocedente",
        using: "BTREE",
        fields: [
          { name: "_idcontactocedente" },
        ]
      },
      {
        name: "FK_factoring_idcuentabancaria",
        using: "BTREE",
        fields: [
          { name: "_idcuentabancaria" },
        ]
      },
      {
        name: "FK_factoring_idfactoringestado",
        using: "BTREE",
        fields: [
          { name: "_idfactoringestado" },
        ]
      },
      {
        name: "FK_factoring_idmoneda",
        using: "BTREE",
        fields: [
          { name: "_idmoneda" },
        ]
      },
      {
        name: "FK_factoring_idfactoringejecutado",
        using: "BTREE",
        fields: [
          { name: "_idfactoringejecutado" },
        ]
      },
      {
        name: "FK_factoring_idfactoringpropuestaaceptada",
        using: "BTREE",
        fields: [
          { name: "_idfactoringpropuestaaceptada" },
        ]
      },
    ]
  });
  }
}
