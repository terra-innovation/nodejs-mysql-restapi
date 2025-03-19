import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class FactoringPropuestaFinanciero extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idfactoringpropuestafinanciero: {
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
      defaultValue: 0,
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
      allowNull: false
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
