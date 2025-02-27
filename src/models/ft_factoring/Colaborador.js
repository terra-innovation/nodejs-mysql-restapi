import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Colaborador extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idcolaborador: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    colaboradorid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid')
    },
    _idempresa: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'empresa',
        key: '_idempresa'
      }
    },
    _idpersona: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'persona',
        key: '_idpersona'
      }
    },
    _idcolaboradortipo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'colaborador_tipo',
        key: '_idcolaboradortipo'
      }
    },
    _iddocumentotipo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'documento_tipo',
        key: '_iddocumentotipo'
      }
    },
    documentonumero: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    nombrecolaborador: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    apellidocolaborador: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cargo: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    poderpartidanumero: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    poderpartidaciudad: {
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
    tableName: 'colaborador',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idcolaborador" },
        ]
      },
      {
        name: "FK_colaborador_idempresa",
        using: "BTREE",
        fields: [
          { name: "_idempresa" },
        ]
      },
      {
        name: "FK_colaborador_idcolaboradortipo",
        using: "BTREE",
        fields: [
          { name: "_idcolaboradortipo" },
        ]
      },
      {
        name: "FK_colaborador_iddocumentotipo",
        using: "BTREE",
        fields: [
          { name: "_iddocumentotipo" },
        ]
      },
      {
        name: "FK_colaborador_idpersona",
        using: "BTREE",
        fields: [
          { name: "_idpersona" },
        ]
      },
    ]
  });
  }
}
