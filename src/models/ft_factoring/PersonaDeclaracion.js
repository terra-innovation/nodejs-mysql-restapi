import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class PersonaDeclaracion extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idpersonadeclaracion: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    personadeclaracionid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_personadeclaracionid"
    },
    _idpersona: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'persona',
        key: '_idpersona'
      }
    },
    espep: {
      type: DataTypes.TINYINT,
      allowNull: true,
      comment: "Declaro que soy una Persona Expuesta Políticamente"
    },
    tienevinculopep: {
      type: DataTypes.TINYINT,
      allowNull: true,
      comment: "Declaro que tengo un vínculo con una Persona Expuesta"
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
    tableName: 'persona_declaracion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idpersonadeclaracion" },
        ]
      },
      {
        name: "UQ_personadeclaracionid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "personadeclaracionid" },
        ]
      },
      {
        name: "FK_persona_declaracion_idpersona",
        using: "BTREE",
        fields: [
          { name: "_idpersona" },
        ]
      },
    ]
  });
  }
}
