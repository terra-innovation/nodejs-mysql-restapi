import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class PersonaVerificacionEstado extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idpersonaverificacionestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    personaverificacionestadoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_personaverificacionestadoid"
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
    ispersonavalidated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
      comment: "True si la persona ha sido validada correctamente"
    },
    isestadofinal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
      comment: "True si es estado final y el usuario ya no puede editar"
    },
    isusuarioedit: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
      comment: "True si el usuario puede editar su solicitud de verificación"
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
    tableName: 'persona_verificacion_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idpersonaverificacionestado" },
        ]
      },
      {
        name: "UQ_personaverificacionestadoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "personaverificacionestadoid" },
        ]
      },
    ]
  });
  }
}
