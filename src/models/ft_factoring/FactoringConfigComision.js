import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class FactoringConfigComision extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idfactoringconfigcomision: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    factoringconfigcomisionid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoring_config_comision_factoringconfigcomisionid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_factoring_config_comision_code"
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
    factor1: {
      type: DataTypes.DECIMAL(20,10),
      allowNull: false
    },
    factor2: {
      type: DataTypes.DECIMAL(20,10),
      allowNull: false
    },
    factor3: {
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
    tableName: 'factoring_config_comision',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringconfigcomision" },
        ]
      },
      {
        name: "UQ_factoring_config_comision_factoringconfigcomisionid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringconfigcomisionid" },
        ]
      },
      {
        name: "UQ_factoring_config_comision_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_factoring_config_comision_idriesgo",
        using: "BTREE",
        fields: [
          { name: "_idriesgo" },
        ]
      },
    ]
  });
  }
}
