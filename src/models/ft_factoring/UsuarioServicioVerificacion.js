import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class UsuarioServicioVerificacion extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idusuarioservicioverificacion: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    usuarioservicioverificacionid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_usuarioservicioverificacion_usuarioservicioverificacionid"
    },
    _idusuarioservicio: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'usuario_servicio',
        key: '_idusuarioservicio'
      }
    },
    _idusuarioservicioestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuario_servicio_estado',
        key: '_idusuarioservicioestado'
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
    tableName: 'usuario_servicio_verificacion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuarioservicioverificacion" },
        ]
      },
      {
        name: "UQ_usuarioservicioverificacion_usuarioservicioverificacionid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "usuarioservicioverificacionid" },
        ]
      },
      {
        name: "FK_usuarioservicioverificacion_idusuarioservicio",
        using: "BTREE",
        fields: [
          { name: "_idusuarioservicio" },
        ]
      },
      {
        name: "FK_usuarioservicioverificacion_idusuarioservicioestado",
        using: "BTREE",
        fields: [
          { name: "_idusuarioservicioestado" },
        ]
      },
      {
        name: "FK_usuarioservicioverificacion_idusuarioverifica",
        using: "BTREE",
        fields: [
          { name: "_idusuarioverifica" },
        ]
      },
    ]
  });
  }
}
