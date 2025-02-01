import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ServicioEmpresaEstado extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idservicioempresaestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    servicioempresaestadoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_servicioempresaestado_servicioempresaestadoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_servicioempresaestado_code"
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
    issuccessfulvalidation: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    isestadofinal: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    isusuarioedit: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
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
    tableName: 'servicio_empresa_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idservicioempresaestado" },
        ]
      },
      {
        name: "UQ_servicioempresaestado_servicioempresaestadoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "servicioempresaestadoid" },
        ]
      },
      {
        name: "UQ_servicioempresaestado_code",
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
