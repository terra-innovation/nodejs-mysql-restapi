import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ServicioEmpresa extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idservicioempresa: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    servicioempresaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_servicioempresa_servicioempresaid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_servicioempresa_code"
    },
    _idservicio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'servicio',
        key: '_idservicio'
      }
    },
    _idempresa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresa',
        key: '_idempresa'
      }
    },
    _idservicioempresaestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'servicio_empresa_estado',
        key: '_idservicioempresaestado'
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
    tableName: 'servicio_empresa',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idservicioempresa" },
        ]
      },
      {
        name: "UQ_servicioempresa_idservicio__idempresa",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idservicio" },
          { name: "_idempresa" },
        ]
      },
      {
        name: "UQ_servicioempresa_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "UQ_servicioempresa_servicioempresaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "servicioempresaid" },
        ]
      },
      {
        name: "FK_servicioempresa_idempresa",
        using: "BTREE",
        fields: [
          { name: "_idempresa" },
        ]
      },
      {
        name: "FK_servicioempresa_idservicioempresaestado",
        using: "BTREE",
        fields: [
          { name: "_idservicioempresaestado" },
        ]
      },
    ]
  });
  }
}
