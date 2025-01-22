import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ServicioEmpresaVerificacion extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idservicioempresaverificacion: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    servicioempresaverificacionid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_servicioempresaverificacion_servicioempresaverificacionid"
    },
    _idservicioempresa: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'servicio_empresa',
        key: '_idservicioempresa'
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
    _idusuarioverifica: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'usuario',
        key: '_idusuario'
      }
    },
    comentariousuario: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    comentariointerno: {
      type: DataTypes.TEXT,
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
    tableName: 'servicio_empresa_verificacion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idservicioempresaverificacion" },
        ]
      },
      {
        name: "UQ_servicioempresaverificacion_servicioempresaverificacionid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "servicioempresaverificacionid" },
        ]
      },
      {
        name: "FK_servicioempresaverificacion_idservicioempresa",
        using: "BTREE",
        fields: [
          { name: "_idservicioempresa" },
        ]
      },
      {
        name: "FK_servicioempresaverificacion_idservicioempresaestado",
        using: "BTREE",
        fields: [
          { name: "_idservicioempresaestado" },
        ]
      },
      {
        name: "FK_servicioempresaverificacion_idusuarioverifica",
        using: "BTREE",
        fields: [
          { name: "_idusuarioverifica" },
        ]
      },
    ]
  });
  }
}
