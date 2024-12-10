import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class UsuarioServicio extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idusuarioservicio: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    usuarioservicioid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_usuarioservicio_usuarioservicioid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "FK_usuarioservicio_code"
    },
    _idusuario: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'usuario',
        key: '_idusuario'
      }
    },
    _idservicio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'servicio',
        key: '_idservicio'
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
    tableName: 'usuario_servicio',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuarioservicio" },
        ]
      },
      {
        name: "UQ_usuarioservicio_usuarioservicioid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "usuarioservicioid" },
        ]
      },
      {
        name: "UQ_usuarioservicio_idusuario__idservicio",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuario" },
          { name: "_idservicio" },
        ]
      },
      {
        name: "FK_usuarioservicio_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_usuarioservicio_idservicio",
        using: "BTREE",
        fields: [
          { name: "_idservicio" },
        ]
      },
      {
        name: "FK_usuarioservicio_idusuarioservicioestado",
        using: "BTREE",
        fields: [
          { name: "_idusuarioservicioestado" },
        ]
      },
    ]
  });
  }
}
