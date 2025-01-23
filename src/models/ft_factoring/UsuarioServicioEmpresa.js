import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class UsuarioServicioEmpresa extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idusuarioservicioempresa: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    usuarioservicioempresaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_usuarioservicioempresa_usuarioempresaservicioid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_usuarioservicioempresa_code"
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
    _idusuarioservicioempresaestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuario_servicio_empresa_estado',
        key: '_idusuarioservicioempresaestado'
      }
    },
    _idusuarioservicioempresarol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuario_servicio_empresa_rol',
        key: '_idusuarioservicioempresarol'
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
    tableName: 'usuario_servicio_empresa',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuarioservicioempresa" },
        ]
      },
      {
        name: "UQ_usuarioservicioempresa_idusuario__idempresa__idservicio",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuario" },
          { name: "_idempresa" },
          { name: "_idservicio" },
        ]
      },
      {
        name: "UQ_usuarioservicioempresa_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "UQ_usuarioservicioempresa_usuarioempresaservicioid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "usuarioservicioempresaid" },
        ]
      },
      {
        name: "FK_usuarioservicioempresa_idempresa",
        using: "BTREE",
        fields: [
          { name: "_idempresa" },
        ]
      },
      {
        name: "FK_usuarioservicioempresa_idservicio",
        using: "BTREE",
        fields: [
          { name: "_idservicio" },
        ]
      },
      {
        name: "FK_usuarioservicioempresa_idusuarioempresaservicioestado",
        using: "BTREE",
        fields: [
          { name: "_idusuarioservicioempresaestado" },
        ]
      },
      {
        name: "FK_usuarioservicioempresa_idusuarioservicioempresarol",
        using: "BTREE",
        fields: [
          { name: "_idusuarioservicioempresarol" },
        ]
      },
    ]
  });
  }
}
