import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class PersonaVerificacion extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idpersonaverificacion: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    personaverificacionid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_personaid"
    },
    _idpersona: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'persona',
        key: '_idpersona'
      }
    },
    _idpersonaverificacionestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'persona_verificacion_estado',
        key: '_idpersonaverificacionestado'
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
    tableName: 'persona_verificacion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idpersonaverificacion" },
        ]
      },
      {
        name: "UQ_personaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "personaverificacionid" },
        ]
      },
      {
        name: "FK_persona_verificacion_idpersona",
        using: "BTREE",
        fields: [
          { name: "_idpersona" },
        ]
      },
      {
        name: "FK_persona_verificacion_idpersonaverificacionestado",
        using: "BTREE",
        fields: [
          { name: "_idpersonaverificacionestado" },
        ]
      },
      {
        name: "FK_persona_verificacion_idusuarioverifica",
        using: "BTREE",
        fields: [
          { name: "_idusuarioverifica" },
        ]
      },
    ]
  });
  }
}
