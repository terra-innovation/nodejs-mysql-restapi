import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ZlaboratorioPedido extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idperdido: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    _idusuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'zlaboratorio_usuario',
        key: '_idusuario'
      }
    },
    nombre: {
      type: DataTypes.STRING(100),
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
    tableName: 'zlaboratorio_pedido',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idperdido" },
        ]
      },
      {
        name: "FK_zlaboratorio_pedido__idusuario",
        using: "BTREE",
        fields: [
          { name: "_idusuario" },
        ]
      },
    ]
  });
  }
}
