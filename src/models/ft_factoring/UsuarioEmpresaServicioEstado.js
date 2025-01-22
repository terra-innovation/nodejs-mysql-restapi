import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class UsuarioEmpresaServicioEstado extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idusuarioempresaservicioestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    usuarioempresaservicioestadoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_usuarioempresaservicioestado_usuarioempresaservicioestadoid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_usuarioempresaservicioestado_code"
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
    tableName: 'usuario_empresa_servicio_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuarioempresaservicioestado" },
        ]
      },
      {
        name: "UQ_usuarioempresaservicioestado_usuarioempresaservicioestadoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "usuarioempresaservicioestadoid" },
        ]
      },
      {
        name: "UQ_usuarioempresaservicioestado_code",
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
