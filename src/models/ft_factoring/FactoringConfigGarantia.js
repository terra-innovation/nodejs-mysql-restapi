import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class FactoringConfigGarantia extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idfactoringconfiggarantia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    factoringconfiggarantiaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoring_config_garantia_v1_factoringconfiggarantiav1id"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_factoring_config_garantia_v1_code"
    },
    _idriesgo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'riesgo',
        key: '_idriesgo'
      }
    },
    version: {
      type: DataTypes.FLOAT(6,3),
      allowNull: false,
      defaultValue: 0.000
    },
    monto_neto_min: {
      type: DataTypes.DECIMAL(20,2),
      allowNull: false
    },
    monto_neto_max: {
      type: DataTypes.DECIMAL(20,2),
      allowNull: false
    },
    porcentaje_dias_cubre_garantia: {
      type: DataTypes.DECIMAL(10,5),
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
    tableName: 'factoring_config_garantia',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringconfiggarantia" },
        ]
      },
      {
        name: "UQ_factoring_config_garantia_v1_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "UQ_factoring_config_garantia_v1_factoringconfiggarantiav1id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringconfiggarantiaid" },
        ]
      },
      {
        name: "FK_factoring_config_garantia_idriesgo",
        using: "BTREE",
        fields: [
          { name: "_idriesgo" },
        ]
      },
    ]
  });
  }
}
