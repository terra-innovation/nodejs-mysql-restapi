import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class FactoringConfigTasaDescuento extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idfactoringconfigtasadescuento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    factoringconfigtasadescuentoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoring_config_tasa_factoringconfigtasadescuentoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_factoring_config_tasa_code"
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
      allowNull: false
    },
    mensual_minimo: {
      type: DataTypes.DECIMAL(20,10),
      allowNull: false
    },
    mensual_maximo: {
      type: DataTypes.DECIMAL(20,10),
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
    tableName: 'factoring_config_tasa_descuento',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringconfigtasadescuento" },
        ]
      },
      {
        name: "UQ_factoring_config_tasa_factoringconfigtasadescuentoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringconfigtasadescuentoid" },
        ]
      },
      {
        name: "UQ_factoring_config_tasa_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_factoring_config_tasa_idriesgo",
        using: "BTREE",
        fields: [
          { name: "_idriesgo" },
        ]
      },
    ]
  });
  }
}
