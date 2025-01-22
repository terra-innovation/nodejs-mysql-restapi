import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class UsuarioEmpresaServicio extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idusuarioempresaservicio: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    usuarioempresaservicioid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_usuarioempresaservicio_usuarioempresaservicioid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_usuarioempresaservicio_code"
    },
    _idusuario: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'usuario',
        key: '_idusuario'
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
    _idservicio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'servicio',
        key: '_idservicio'
      }
    },
    _idusuarioempresaservicioestado: {
      type: DataTypes.INTEGER,
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
    tableName: 'usuario_empresa_servicio',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuarioempresaservicio" },
        ]
      },
      {
        name: "UQ_usuarioempresaservicio_idusuario__idempresa__idservicio",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuario" },
          { name: "_idempresa" },
          { name: "_idservicio" },
        ]
      },
      {
        name: "UQ_usuarioempresaservicio_usuarioempresaservicioid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "usuarioempresaservicioid" },
        ]
      },
      {
        name: "UQ_usuarioempresaservicio_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_usuarioempresaservicio_idempresa",
        using: "BTREE",
        fields: [
          { name: "_idempresa" },
        ]
      },
      {
        name: "FK_usuarioempresaservicio_idservicio",
        using: "BTREE",
        fields: [
          { name: "_idservicio" },
        ]
      },
    ]
  });
  }
}
