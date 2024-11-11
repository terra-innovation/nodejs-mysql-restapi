import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Usuario extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idusuario: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    usuarioid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid')
    },
    _iddocumentotipo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'documento_tipo',
        key: '_iddocumentotipo'
      }
    },
    documentonumero: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "documentonumero"
    },
    usuarionombres: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    apellidopaterno: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    apellidomaterno: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "email"
    },
    celular: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    isemailvalidated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    ispersonavalidated: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0,
      comment: "1: Si; 0: No; 3: En proceso"
    },
    hash: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "hash"
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
    tableName: 'usuario',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idusuario" },
        ]
      },
      {
        name: "documentonumero",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "documentonumero" },
        ]
      },
      {
        name: "email",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "hash",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "hash" },
        ]
      },
      {
        name: "FK_usuario_iddocuemntotipo",
        using: "BTREE",
        fields: [
          { name: "_iddocumentotipo" },
        ]
      },
    ]
  });
  }
}
