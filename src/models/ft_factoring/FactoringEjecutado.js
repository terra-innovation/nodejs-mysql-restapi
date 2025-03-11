import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class FactoringEjecutado extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
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
