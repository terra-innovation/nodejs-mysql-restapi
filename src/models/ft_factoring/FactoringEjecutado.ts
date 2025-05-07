import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Factoring, FactoringId } from './Factoring.js';
import type { FactoringEjecutadoEstado, FactoringEjecutadoEstadoId } from './FactoringEjecutadoEstado.js';

export interface FactoringEjecutadoAttributes {
  _idfactoringejecutado: number;
  factoringejecutadoid: string;
  code: string;
  _idfactoring?: number;
  _idfactoringejecutadoaestado: number;
  fecha_propuesta: Date | Sequelize.Utils.Fn;
  fecha_pago_real: string;
  dias_pago_real: number;
  dias_antiguedad_real: number;
  dias_cobertura_garantia_real?: number;
  dias_mora_real?: number;
  monto_neto: number;
  monto_garantia_real?: number;
  monto_efectivo_real?: number;
  monto_descuento_real?: number;
  monto_financiado_real?: number;
  monto_comision_real?: number;
  monto_comision_igv_real?: number;
  monto_adelanto_real?: number;
  monto_costo_real?: number;
  monto_dia_mora?: number;
  monto_dia_interes?: number;
  porcentaje_garantia_real?: number;
  porcentaje_efectivo_real?: number;
  porcentaje_descuento_real?: number;
  porcentaje_financiado_real?: number;
  porcentaje_comision_real?: number;
  porcentaje_adelanto_real?: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FactoringEjecutadoPk = "_idfactoringejecutado";
export type FactoringEjecutadoId = FactoringEjecutado[FactoringEjecutadoPk];
export type FactoringEjecutadoOptionalAttributes = "_idfactoringejecutado" | "factoringejecutadoid" | "_idfactoring" | "dias_cobertura_garantia_real" | "dias_mora_real" | "monto_garantia_real" | "monto_efectivo_real" | "monto_descuento_real" | "monto_financiado_real" | "monto_comision_real" | "monto_comision_igv_real" | "monto_adelanto_real" | "monto_costo_real" | "monto_dia_mora" | "monto_dia_interes" | "porcentaje_garantia_real" | "porcentaje_efectivo_real" | "porcentaje_descuento_real" | "porcentaje_financiado_real" | "porcentaje_comision_real" | "porcentaje_adelanto_real" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FactoringEjecutadoCreationAttributes = Optional<FactoringEjecutadoAttributes, FactoringEjecutadoOptionalAttributes>;

export class FactoringEjecutado extends Model<FactoringEjecutadoAttributes, FactoringEjecutadoCreationAttributes> implements FactoringEjecutadoAttributes {
  _idfactoringejecutado!: number;
  factoringejecutadoid!: string;
  code!: string;
  _idfactoring?: number;
  _idfactoringejecutadoaestado!: number;
  fecha_propuesta!: Date;
  fecha_pago_real!: string;
  dias_pago_real!: number;
  dias_antiguedad_real!: number;
  dias_cobertura_garantia_real?: number;
  dias_mora_real?: number;
  monto_neto!: number;
  monto_garantia_real?: number;
  monto_efectivo_real?: number;
  monto_descuento_real?: number;
  monto_financiado_real?: number;
  monto_comision_real?: number;
  monto_comision_igv_real?: number;
  monto_adelanto_real?: number;
  monto_costo_real?: number;
  monto_dia_mora?: number;
  monto_dia_interes?: number;
  porcentaje_garantia_real?: number;
  porcentaje_efectivo_real?: number;
  porcentaje_descuento_real?: number;
  porcentaje_financiado_real?: number;
  porcentaje_comision_real?: number;
  porcentaje_adelanto_real?: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FactoringEjecutado belongsTo Factoring via _idfactoring
  factoring_factoring!: Factoring;
  get_idfactoring_factoring!: Sequelize.BelongsToGetAssociationMixin<Factoring>;
  set_idfactoring_factoring!: Sequelize.BelongsToSetAssociationMixin<Factoring, FactoringId>;
  create_idfactoring_factoring!: Sequelize.BelongsToCreateAssociationMixin<Factoring>;
  // FactoringEjecutado hasMany Factoring via _idfactoringejecutado
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
  // FactoringEjecutado belongsTo FactoringEjecutadoEstado via _idfactoringejecutadoaestado
  factoringejecutadoaestado_factoring_ejecutado_estado!: FactoringEjecutadoEstado;
  get_idfactoringejecutadoaestado_factoring_ejecutado_estado!: Sequelize.BelongsToGetAssociationMixin<FactoringEjecutadoEstado>;
  set_idfactoringejecutadoaestado_factoring_ejecutado_estado!: Sequelize.BelongsToSetAssociationMixin<FactoringEjecutadoEstado, FactoringEjecutadoEstadoId>;
  create_idfactoringejecutadoaestado_factoring_ejecutado_estado!: Sequelize.BelongsToCreateAssociationMixin<FactoringEjecutadoEstado>;

  static initModel(sequelize: Sequelize.Sequelize): typeof FactoringEjecutado {
    return FactoringEjecutado.init({
    _idfactoringejecutado: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    factoringejecutadoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoring_ejecutado_factoringejecutadoid"
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "UQ_factoring_ejecutado_code"
    },
    _idfactoring: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'factoring',
        key: '_idfactoring'
      }
    },
    _idfactoringejecutadoaestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'factoring_ejecutado_estado',
        key: '_idfactoringejecutadoestado'
      }
    },
    fecha_propuesta: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "Fecha de inicio de la operación"
    },
    fecha_pago_real: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Fecha en el que el deudor debe pagar"
    },
    dias_pago_real: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Dias estimados para el pago"
    },
    dias_antiguedad_real: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Días desde que se emitió la factura hasta la fecha en que se realiza la propuesta"
    },
    dias_cobertura_garantia_real: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Dias de mora que cubre la garantía"
    },
    dias_mora_real: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    monto_neto: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      comment: "Monto de la operación, descontando las detracciones"
    },
    monto_garantia_real: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto de la garantía que se le retiene al cedente"
    },
    monto_efectivo_real: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "monto_neto - monto_garantía"
    },
    monto_descuento_real: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "monto_financiado  x  tnd  + dias"
    },
    monto_financiado_real: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto que se toma para calcular el monto_descuento en base a la tasa"
    },
    monto_comision_real: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto asociado a la colocación de la operación"
    },
    monto_comision_igv_real: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto del igv de la comisión"
    },
    monto_adelanto_real: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto del adelanto que se le dará al cedente"
    },
    monto_costo_real: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto del costo de la operación de factoring"
    },
    monto_dia_mora: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto por día de interés moratorio"
    },
    monto_dia_interes: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto por día de interés compensatorio"
    },
    porcentaje_garantia_real: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "monto_garantia \/ monto_neto"
    },
    porcentaje_efectivo_real: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "monto_efectivo \/ monto_neto"
    },
    porcentaje_descuento_real: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "monto_descuento \/ monto_neto"
    },
    porcentaje_financiado_real: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "monto_financiado \/ monto_neto"
    },
    porcentaje_comision_real: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "monto_comision \/ monto_financiado"
    },
    porcentaje_adelanto_real: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "monto_adelanto \/ monto_neto"
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
    tableName: 'factoring_ejecutado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringejecutado" },
        ]
      },
      {
        name: "UQ_factoring_ejecutado_factoringejecutadoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringejecutadoid" },
        ]
      },
      {
        name: "UQ_factoring_ejecutado_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_factoring_ejecutado_idfactoring",
        using: "BTREE",
        fields: [
          { name: "_idfactoring" },
        ]
      },
      {
        name: "FK_factoring_ejecutado_idfactoringejecutadoestado",
        using: "BTREE",
        fields: [
          { name: "_idfactoringejecutadoaestado" },
        ]
      },
    ]
  });
  }
}
