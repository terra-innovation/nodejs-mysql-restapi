import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { FactoringPropuesta, FactoringPropuestaId } from './FactoringPropuesta.js';
import type { FinancieroConcepto, FinancieroConceptoId } from './FinancieroConcepto.js';
import type { FinancieroTipo, FinancieroTipoId } from './FinancieroTipo.js';

export interface FactoringPropuestaFinancieroAttributes {
  _idfactoringpropuestafinanciero: number;
  factoringpropuestafinancieroid: string;
  code: string;
  _idfactoringpropuesta: number;
  _idfinancierotipo: number;
  _idfinancieroconcepto: number;
  descripcion?: string;
  monto: number;
  igv: number;
  total: number;
  idusuariocrea: number;
  fechacrea: Date | Sequelize.Utils.Fn;
  idusuariomod: number;
  fechamod: Date | Sequelize.Utils.Fn;
  estado: number;
}

export type FactoringPropuestaFinancieroPk = "_idfactoringpropuestafinanciero";
export type FactoringPropuestaFinancieroId = FactoringPropuestaFinanciero[FactoringPropuestaFinancieroPk];
export type FactoringPropuestaFinancieroOptionalAttributes = "_idfactoringpropuestafinanciero" | "factoringpropuestafinancieroid" | "descripcion" | "monto" | "igv" | "total" | "idusuariocrea" | "fechacrea" | "idusuariomod" | "fechamod" | "estado";
export type FactoringPropuestaFinancieroCreationAttributes = Optional<FactoringPropuestaFinancieroAttributes, FactoringPropuestaFinancieroOptionalAttributes>;

export class FactoringPropuestaFinanciero extends Model<FactoringPropuestaFinancieroAttributes, FactoringPropuestaFinancieroCreationAttributes> implements FactoringPropuestaFinancieroAttributes {
  _idfactoringpropuestafinanciero!: number;
  factoringpropuestafinancieroid!: string;
  code!: string;
  _idfactoringpropuesta!: number;
  _idfinancierotipo!: number;
  _idfinancieroconcepto!: number;
  descripcion?: string;
  monto!: number;
  igv!: number;
  total!: number;
  idusuariocrea!: number;
  fechacrea!: Date;
  idusuariomod!: number;
  fechamod!: Date;
  estado!: number;

  // FactoringPropuestaFinanciero belongsTo FactoringPropuesta via _idfactoringpropuesta
  factoringpropuesta_factoring_propuestum!: FactoringPropuesta;
  get_idfactoringpropuesta_factoring_propuestum!: Sequelize.BelongsToGetAssociationMixin<FactoringPropuesta>;
  set_idfactoringpropuesta_factoring_propuestum!: Sequelize.BelongsToSetAssociationMixin<FactoringPropuesta, FactoringPropuestaId>;
  create_idfactoringpropuesta_factoring_propuestum!: Sequelize.BelongsToCreateAssociationMixin<FactoringPropuesta>;
  // FactoringPropuestaFinanciero belongsTo FinancieroConcepto via _idfinancieroconcepto
  financieroconcepto_financiero_concepto!: FinancieroConcepto;
  get_idfinancieroconcepto_financiero_concepto!: Sequelize.BelongsToGetAssociationMixin<FinancieroConcepto>;
  set_idfinancieroconcepto_financiero_concepto!: Sequelize.BelongsToSetAssociationMixin<FinancieroConcepto, FinancieroConceptoId>;
  create_idfinancieroconcepto_financiero_concepto!: Sequelize.BelongsToCreateAssociationMixin<FinancieroConcepto>;
  // FactoringPropuestaFinanciero belongsTo FinancieroTipo via _idfinancierotipo
  financierotipo_financiero_tipo!: FinancieroTipo;
  get_idfinancierotipo_financiero_tipo!: Sequelize.BelongsToGetAssociationMixin<FinancieroTipo>;
  set_idfinancierotipo_financiero_tipo!: Sequelize.BelongsToSetAssociationMixin<FinancieroTipo, FinancieroTipoId>;
  create_idfinancierotipo_financiero_tipo!: Sequelize.BelongsToCreateAssociationMixin<FinancieroTipo>;

  static initModel(sequelize: Sequelize.Sequelize): typeof FactoringPropuestaFinanciero {
    return FactoringPropuestaFinanciero.init({
    _idfactoringpropuestafinanciero: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    factoringpropuestafinancieroid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoring_propuesta_financiero_factoringpropuestafinancieroid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_factoring_propuesta_financiero_code"
    },
    _idfactoringpropuesta: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'factoring_propuesta',
        key: '_idfactoringpropuesta'
      }
    },
    _idfinancierotipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'financiero_tipo',
        key: '_idfinancierotipo'
      }
    },
    _idfinancieroconcepto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'financiero_concepto',
        key: '_idfinancieroconcepto'
      }
    },
    descripcion: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    monto: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      defaultValue: 0.00
    },
    igv: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      defaultValue: 0.00
    },
    total: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      defaultValue: 0.00,
      comment: "monto + igv"
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
    tableName: 'factoring_propuesta_financiero',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringpropuestafinanciero" },
        ]
      },
      {
        name: "UQ_factoring_propuesta_financiero_factoringpropuestafinancieroid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringpropuestafinancieroid" },
        ]
      },
      {
        name: "UQ_factoring_propuesta_financiero_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_factoring_propuesta_financiero_idfactoringpropuesta",
        using: "BTREE",
        fields: [
          { name: "_idfactoringpropuesta" },
        ]
      },
      {
        name: "FK_factoring_propuesta_financiero_idfinancierotipo",
        using: "BTREE",
        fields: [
          { name: "_idfinancierotipo" },
        ]
      },
      {
        name: "FK_factoring_propuesta_financiero_idfinancieroconcepto",
        using: "BTREE",
        fields: [
          { name: "_idfinancieroconcepto" },
        ]
      },
    ]
  });
  }
}
