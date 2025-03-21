import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class FactoringPropuesta extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
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
      type: DataTypes.DATEONLY,
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
