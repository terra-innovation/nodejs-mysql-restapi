import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class FactoringPago extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idfactoringpago: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    factoringpagoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoringpago_factoringpagoid"
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "UQ_factoringpago_code"
    },
    _idfactoring: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'factoring',
        key: '_idfactoring'
      }
    },
    _idempresacuentabancaria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresa_cuenta_bancaria',
        key: '_idempresacuentabancaria'
      }
    },
    _idfactorcuentabancaria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'factor_cuenta_bancaria',
        key: '_idfactorcuentabancaria'
      }
    },
    numero_operacion: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    fecha_pago: {
      type: DataTypes.DATE,
      allowNull: false
    },
    monto_pagado: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
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
    tableName: 'factoring_pago',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringpago" },
        ]
      },
      {
        name: "UQ_factoringpago_factoringpagoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringpagoid" },
        ]
      },
      {
        name: "UQ_factoringpago_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "_idaceptante",
        using: "BTREE",
        fields: [
          { name: "_idfactoring" },
        ]
      },
      {
        name: "_idcedente",
        using: "BTREE",
        fields: [
          { name: "_idfactorcuentabancaria" },
        ]
      },
      {
        name: "_idmoneda",
        using: "BTREE",
        fields: [
          { name: "_idempresacuentabancaria" },
        ]
      },
    ]
  });
  }
}
