import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class UsuarioEmpresaServicioRol extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idusuarioempresaserviciorol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    usuarioempresaserviciorolid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_usuarioempresaserviciorol_usuarioempresaserviciorolid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_usuarioempresaserviciorol_code"
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
    tableName: 'usuario_empresa_servicio_rol',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuarioempresaserviciorol" },
        ]
      },
      {
        name: "UQ_usuarioempresaserviciorol_usuarioempresaserviciorolid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "usuarioempresaserviciorolid" },
        ]
      },
      {
        name: "UQ_usuarioempresaserviciorol_code",
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
