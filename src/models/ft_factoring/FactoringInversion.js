import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class FactoringInversion extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idfactoringinversion: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    factoringinversionid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoringinversion_factoringinversionid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_factoringinversion_code"
    },
    _idfactoring: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    _idinversionista: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    monto_invertido: {
      type: DataTypes.DECIMAL(20,2),
      allowNull: false
    },
    fecha_inversion: {
      type: DataTypes.DATE(3),
      allowNull: false
    },
    porcentaje_participacion: {
      type: DataTypes.DECIMAL(20,6),
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
    tableName: 'factoring_inversion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringinversion" },
        ]
      },
      {
        name: "UQ_factoringinversion_factoringinversionid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringinversionid" },
        ]
      },
      {
        name: "UQ_factoringinversion_code",
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
