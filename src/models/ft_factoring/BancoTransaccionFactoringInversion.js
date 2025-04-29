import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class BancoTransaccionFactoringInversion extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idbancotransaccion: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'banco_transaccion',
        key: '_idbancotransaccion'
      }
    },
    _idfactoringinversion: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'factoring_inversion',
        key: '_idfactoringinversion'
      }
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
    tableName: 'banco_transaccion_factoring_inversion',
    timestamps: false,
    indexes: [
      {
        name: "_idbancodeposito",
        using: "BTREE",
        fields: [
          { name: "_idfactoringinversion" },
        ]
      },
      {
        name: "FK_bancotransaccionfactoringinversion_idbancotransaccion",
        using: "BTREE",
        fields: [
          { name: "_idbancotransaccion" },
        ]
      },
    ]
  });
  }
}
