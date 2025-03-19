import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class FinancieroConcepto extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idfinancieroconcepto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    financieroconceptoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_financiero_concepto_financieroconceptoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_financiero_concepto_code"
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    alias: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(50),
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
    tableName: 'financiero_concepto',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfinancieroconcepto" },
        ]
      },
      {
        name: "UQ_financiero_concepto_financieroconceptoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "financieroconceptoid" },
        ]
      },
      {
        name: "UQ_financiero_concepto_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
    ]
  });
  }
}
