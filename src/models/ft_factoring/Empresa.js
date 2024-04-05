import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Empresa extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idempresa: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    empresaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_empresaid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_code"
    },
    ruc: {
      type: DataTypes.STRING(11),
      allowNull: false,
      unique: "UQ_ruc"
    },
    razon_social: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    nombre_comercial: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    fecha_inscripcion: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    domicilio_fiscal: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    score: {
      type: DataTypes.STRING(5),
      allowNull: true
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
    tableName: 'empresa',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idempresa" },
        ]
      },
      {
        name: "UQ_ruc",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ruc" },
        ]
      },
      {
        name: "UQ_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "UQ_empresaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "empresaid" },
        ]
      },
    ]
  });
  }
}
