import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Factoring, FactoringId } from './Factoring.js';
import type { FactoringEstrategia, FactoringEstrategiaId } from './FactoringEstrategia.js';
import type { FactoringPropuestaEstado, FactoringPropuestaEstadoId } from './FactoringPropuestaEstado.js';
import type { FactoringPropuestaFinanciero, FactoringPropuestaFinancieroId } from './FactoringPropuestaFinanciero.js';
import type { FactoringTipo, FactoringTipoId } from './FactoringTipo.js';
import type { Riesgo, RiesgoId } from './Riesgo.js';

export interface FactoringPropuestaAttributes {
  _idfactoringpropuesta: number;
  factoringpropuestaid: string;
  code: string;
  _idfactoring?: number;
  _idfactoringtipo?: number;
  _idfactoringpropuestaestado: number;
  _idriesgooperacion?: number;
  _idriesgoaceptante?: number;
  _idriesgocedente?: number;
  _idfactoringestrategia?: number;
  tda?: number;
  tdm?: number;
  tdd?: number;
  tda_mora?: number;
  tdm_mora?: number;
  tdd_mora?: number;
  fecha_propuesta: Date | Sequelize.Utils.Fn;
  fecha_pago_estimado: Date | Sequelize.Utils.Fn;
  dias_pago_estimado: number;
  dias_antiguedad_estimado: number;
  dias_cobertura_garantia_estimado?: number;
  monto_neto: number;
  monto_garantia?: number;
  monto_efectivo?: number;
  monto_descuento?: number;
  monto_financiado?: number;
  monto_comision?: number;
  monto_comision_igv?: number;
  monto_costo_estimado?: number;
  monto_costo_estimado_igv?: number;
  monto_gasto_estimado?: number;
  monto_gasto_estimado_igv?: number;
  monto_total_igv?: number;
  monto_adelanto?: number;
  monto_dia_mora_estimado?: number;
  monto_dia_interes_estimado?: number;
  porcentaje_garantia_estimado?: number;
  porcentaje_efectivo_estimado?: number;
  porcentaje_descuento_estimado?: number;
  porcentaje_financiado_estimado?: number;
  porcentaje_adelanto_estimado?: number;
  porcentaje_comision_estimado?: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FactoringPropuestaPk = "_idfactoringpropuesta";
export type FactoringPropuestaId = FactoringPropuesta[FactoringPropuestaPk];
export type FactoringPropuestaOptionalAttributes = "_idfactoringpropuesta" | "factoringpropuestaid" | "_idfactoring" | "_idfactoringtipo" | "_idriesgooperacion" | "_idriesgoaceptante" | "_idriesgocedente" | "_idfactoringestrategia" | "tda" | "tdm" | "tdd" | "tda_mora" | "tdm_mora" | "tdd_mora" | "dias_cobertura_garantia_estimado" | "monto_garantia" | "monto_efectivo" | "monto_descuento" | "monto_financiado" | "monto_comision" | "monto_comision_igv" | "monto_costo_estimado" | "monto_costo_estimado_igv" | "monto_gasto_estimado" | "monto_gasto_estimado_igv" | "monto_total_igv" | "monto_adelanto" | "monto_dia_mora_estimado" | "monto_dia_interes_estimado" | "porcentaje_garantia_estimado" | "porcentaje_efectivo_estimado" | "porcentaje_descuento_estimado" | "porcentaje_financiado_estimado" | "porcentaje_adelanto_estimado" | "porcentaje_comision_estimado" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FactoringPropuestaCreationAttributes = Optional<FactoringPropuestaAttributes, FactoringPropuestaOptionalAttributes>;

export class FactoringPropuesta extends Model<FactoringPropuestaAttributes, FactoringPropuestaCreationAttributes> implements FactoringPropuestaAttributes {
  _idfactoringpropuesta!: number;
  factoringpropuestaid!: string;
  code!: string;
  _idfactoring?: number;
  _idfactoringtipo?: number;
  _idfactoringpropuestaestado!: number;
  _idriesgooperacion?: number;
  _idriesgoaceptante?: number;
  _idriesgocedente?: number;
  _idfactoringestrategia?: number;
  tda?: number;
  tdm?: number;
  tdd?: number;
  tda_mora?: number;
  tdm_mora?: number;
  tdd_mora?: number;
  fecha_propuesta!: Date;
  fecha_pago_estimado!: Date;
  dias_pago_estimado!: number;
  dias_antiguedad_estimado!: number;
  dias_cobertura_garantia_estimado?: number;
  monto_neto!: number;
  monto_garantia?: number;
  monto_efectivo?: number;
  monto_descuento?: number;
  monto_financiado?: number;
  monto_comision?: number;
  monto_comision_igv?: number;
  monto_costo_estimado?: number;
  monto_costo_estimado_igv?: number;
  monto_gasto_estimado?: number;
  monto_gasto_estimado_igv?: number;
  monto_total_igv?: number;
  monto_adelanto?: number;
  monto_dia_mora_estimado?: number;
  monto_dia_interes_estimado?: number;
  porcentaje_garantia_estimado?: number;
  porcentaje_efectivo_estimado?: number;
  porcentaje_descuento_estimado?: number;
  porcentaje_financiado_estimado?: number;
  porcentaje_adelanto_estimado?: number;
  porcentaje_comision_estimado?: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FactoringPropuesta belongsTo Factoring via _idfactoring
  factoring_factoring!: Factoring;
  get_idfactoring_factoring!: Sequelize.BelongsToGetAssociationMixin<Factoring>;
  set_idfactoring_factoring!: Sequelize.BelongsToSetAssociationMixin<Factoring, FactoringId>;
  create_idfactoring_factoring!: Sequelize.BelongsToCreateAssociationMixin<Factoring>;
  // FactoringPropuesta belongsTo FactoringEstrategia via _idfactoringestrategia
  factoringestrategia_factoring_estrategium!: FactoringEstrategia;
  get_idfactoringestrategia_factoring_estrategium!: Sequelize.BelongsToGetAssociationMixin<FactoringEstrategia>;
  set_idfactoringestrategia_factoring_estrategium!: Sequelize.BelongsToSetAssociationMixin<FactoringEstrategia, FactoringEstrategiaId>;
  create_idfactoringestrategia_factoring_estrategium!: Sequelize.BelongsToCreateAssociationMixin<FactoringEstrategia>;
  // FactoringPropuesta hasMany Factoring via _idfactoringpropuestaaceptada
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
  // FactoringPropuesta hasMany FactoringPropuestaFinanciero via _idfactoringpropuesta
  factoring_propuesta_financieros!: FactoringPropuestaFinanciero[];
  getFactoring_propuesta_financieros!: Sequelize.HasManyGetAssociationsMixin<FactoringPropuestaFinanciero>;
  setFactoring_propuesta_financieros!: Sequelize.HasManySetAssociationsMixin<FactoringPropuestaFinanciero, FactoringPropuestaFinancieroId>;
  addFactoring_propuesta_financiero!: Sequelize.HasManyAddAssociationMixin<FactoringPropuestaFinanciero, FactoringPropuestaFinancieroId>;
  addFactoring_propuesta_financieros!: Sequelize.HasManyAddAssociationsMixin<FactoringPropuestaFinanciero, FactoringPropuestaFinancieroId>;
  createFactoring_propuesta_financiero!: Sequelize.HasManyCreateAssociationMixin<FactoringPropuestaFinanciero>;
  removeFactoring_propuesta_financiero!: Sequelize.HasManyRemoveAssociationMixin<FactoringPropuestaFinanciero, FactoringPropuestaFinancieroId>;
  removeFactoring_propuesta_financieros!: Sequelize.HasManyRemoveAssociationsMixin<FactoringPropuestaFinanciero, FactoringPropuestaFinancieroId>;
  hasFactoring_propuesta_financiero!: Sequelize.HasManyHasAssociationMixin<FactoringPropuestaFinanciero, FactoringPropuestaFinancieroId>;
  hasFactoring_propuesta_financieros!: Sequelize.HasManyHasAssociationsMixin<FactoringPropuestaFinanciero, FactoringPropuestaFinancieroId>;
  countFactoring_propuesta_financieros!: Sequelize.HasManyCountAssociationsMixin;
  // FactoringPropuesta belongsTo FactoringPropuestaEstado via _idfactoringpropuestaestado
  factoringpropuestaestado_factoring_propuesta_estado!: FactoringPropuestaEstado;
  get_idfactoringpropuestaestado_factoring_propuesta_estado!: Sequelize.BelongsToGetAssociationMixin<FactoringPropuestaEstado>;
  set_idfactoringpropuestaestado_factoring_propuesta_estado!: Sequelize.BelongsToSetAssociationMixin<FactoringPropuestaEstado, FactoringPropuestaEstadoId>;
  create_idfactoringpropuestaestado_factoring_propuesta_estado!: Sequelize.BelongsToCreateAssociationMixin<FactoringPropuestaEstado>;
  // FactoringPropuesta belongsTo FactoringTipo via _idfactoringtipo
  factoringtipo_factoring_tipo!: FactoringTipo;
  get_idfactoringtipo_factoring_tipo!: Sequelize.BelongsToGetAssociationMixin<FactoringTipo>;
  set_idfactoringtipo_factoring_tipo!: Sequelize.BelongsToSetAssociationMixin<FactoringTipo, FactoringTipoId>;
  create_idfactoringtipo_factoring_tipo!: Sequelize.BelongsToCreateAssociationMixin<FactoringTipo>;
  // FactoringPropuesta belongsTo Riesgo via _idriesgooperacion
  riesgooperacion_riesgo!: Riesgo;
  get_idriesgooperacion_riesgo!: Sequelize.BelongsToGetAssociationMixin<Riesgo>;
  set_idriesgooperacion_riesgo!: Sequelize.BelongsToSetAssociationMixin<Riesgo, RiesgoId>;
  create_idriesgooperacion_riesgo!: Sequelize.BelongsToCreateAssociationMixin<Riesgo>;
  // FactoringPropuesta belongsTo Riesgo via _idriesgoaceptante
  riesgoaceptante_riesgo!: Riesgo;
  get_idriesgoaceptante_riesgo!: Sequelize.BelongsToGetAssociationMixin<Riesgo>;
  set_idriesgoaceptante_riesgo!: Sequelize.BelongsToSetAssociationMixin<Riesgo, RiesgoId>;
  create_idriesgoaceptante_riesgo!: Sequelize.BelongsToCreateAssociationMixin<Riesgo>;
  // FactoringPropuesta belongsTo Riesgo via _idriesgocedente
  riesgocedente_riesgo!: Riesgo;
  get_idriesgocedente_riesgo!: Sequelize.BelongsToGetAssociationMixin<Riesgo>;
  set_idriesgocedente_riesgo!: Sequelize.BelongsToSetAssociationMixin<Riesgo, RiesgoId>;
  create_idriesgocedente_riesgo!: Sequelize.BelongsToCreateAssociationMixin<Riesgo>;

  static initModel(sequelize: Sequelize.Sequelize): typeof FactoringPropuesta {
    return FactoringPropuesta.init({
    _idfactoringpropuesta: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    factoringpropuestaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoring_propuesta_factoringpropuestaid"
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "UQ_factoring_propuesta_code"
    },
    _idfactoring: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'factoring',
        key: '_idfactoring'
      }
    },
    _idfactoringtipo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'factoring_tipo',
        key: '_idfactoringtipo'
      }
    },
    _idfactoringpropuestaestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'factoring_propuesta_estado',
        key: '_idfactoringpropuestaestado'
      }
    },
    _idriesgooperacion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'riesgo',
        key: '_idriesgo'
      }
    },
    _idriesgoaceptante: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'riesgo',
        key: '_idriesgo'
      }
    },
    _idriesgocedente: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'riesgo',
        key: '_idriesgo'
      }
    },
    _idfactoringestrategia: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'factoring_estrategia',
        key: '_idfactoringestrategia'
      }
    },
    tda: {
      type: DataTypes.DECIMAL(10,5),
      allowNull: true,
      comment: "Tasa de descuento anual de los intereses compensatorios"
    },
    tdm: {
      type: DataTypes.DECIMAL(10,5),
      allowNull: true,
      comment: "Tasa de descuento mensual de los intereses compensatorios"
    },
    tdd: {
      type: DataTypes.DECIMAL(10,5),
      allowNull: true,
      comment: "Tasa de descuento diaria de los intereses compensatorios"
    },
    tda_mora: {
      type: DataTypes.DECIMAL(10,5),
      allowNull: true,
      comment: "Tasa de descuento anual de los intereses moratorios"
    },
    tdm_mora: {
      type: DataTypes.DECIMAL(10,5),
      allowNull: true,
      comment: "Tasa de descuento mensual de los intereses moratorios"
    },
    tdd_mora: {
      type: DataTypes.DECIMAL(10,5),
      allowNull: true,
      comment: "Tasa de descuento diara de los intereses moratorios"
    },
    fecha_propuesta: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "Fecha de inicio de la operación"
    },
    fecha_pago_estimado: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "Fecha en el que el deudor debe pagar"
    },
    dias_pago_estimado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Dias estimados para el pago"
    },
    dias_antiguedad_estimado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Días desde que se emitió la factura hasta la fecha en que se realiza la propuesta"
    },
    dias_cobertura_garantia_estimado: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Dias de mora que cubre la garantía"
    },
    monto_neto: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      comment: "Monto de la operación, descontando las detracciones"
    },
    monto_garantia: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto de la garantía que se le retiene al cedente"
    },
    monto_efectivo: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "monto_neto - monto_garantía"
    },
    monto_descuento: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "monto_financiado  x  tnd  + dias"
    },
    monto_financiado: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto que se toma para calcular el monto_descuento en base a la tasa"
    },
    monto_comision: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto asociado a la colocación de la operación"
    },
    monto_comision_igv: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto del igv de la comisión"
    },
    monto_costo_estimado: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto del costo de la operación de factoring"
    },
    monto_costo_estimado_igv: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto del igv del costo"
    },
    monto_gasto_estimado: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto del gasto de la operación de factoring"
    },
    monto_gasto_estimado_igv: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto del igv del gasto"
    },
    monto_total_igv: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto total del igv"
    },
    monto_adelanto: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto del adelanto que se le dará al cedente"
    },
    monto_dia_mora_estimado: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto por día de interés moratorio"
    },
    monto_dia_interes_estimado: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto por día de interés compensatorio"
    },
    porcentaje_garantia_estimado: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "monto_garantia \/ monto_neto"
    },
    porcentaje_efectivo_estimado: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "monto_efectivo \/ monto_neto"
    },
    porcentaje_descuento_estimado: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "monto_descuento \/ monto_neto"
    },
    porcentaje_financiado_estimado: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "monto_financiado \/ monto_neto"
    },
    porcentaje_adelanto_estimado: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "monto_adelanto \/ monto_neto"
    },
    porcentaje_comision_estimado: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "monto_comision \/ monto_neto"
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
    tableName: 'factoring_propuesta',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringpropuesta" },
        ]
      },
      {
        name: "UQ_factoring_propuesta_factoringpropuestaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringpropuestaid" },
        ]
      },
      {
        name: "UQ_factoring_propuesta_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_factoring_propuesta_idfactoringtipo",
        using: "BTREE",
        fields: [
          { name: "_idfactoringtipo" },
        ]
      },
      {
        name: "FK_factoring_propuesta_idfactoring",
        using: "BTREE",
        fields: [
          { name: "_idfactoring" },
        ]
      },
      {
        name: "FK_factoring_propuesta_idfactoringpropuestaestado",
        using: "BTREE",
        fields: [
          { name: "_idfactoringpropuestaestado" },
        ]
      },
      {
        name: "FK_factoring_propuesta_idriesgooperacion",
        using: "BTREE",
        fields: [
          { name: "_idriesgooperacion" },
        ]
      },
      {
        name: "FK_factoring_propuesta_idriesgoaceptante",
        using: "BTREE",
        fields: [
          { name: "_idriesgoaceptante" },
        ]
      },
      {
        name: "FK_factoring_propuesta_idriesgocedente",
        using: "BTREE",
        fields: [
          { name: "_idriesgocedente" },
        ]
      },
      {
        name: "FK_factoring_propuesta_idfactoringestrategia",
        using: "BTREE",
        fields: [
          { name: "_idfactoringestrategia" },
        ]
      },
    ]
  });
  }
}
