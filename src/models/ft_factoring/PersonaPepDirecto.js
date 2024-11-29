import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class PersonaPepDirecto extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idpersonapepdirecto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    personapepdirectoid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid')
    },
    _idpersona: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    rucentidad: {
      type: DataTypes.STRING(11),
      allowNull: false
    },
    nombreentidad: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    cargoentidad: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    desde: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    hasta: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    actualmente: {
      type: DataTypes.TINYINT,
      allowNull: true,
      comment: "1:si, 0:no"
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
    tableName: 'persona_pep_directo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idpersonapepdirecto" },
        ]
      },
      {
        name: "UQ_personapepdirectoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "personapepdirectoid" },
        ]
      },
      {
        name: "FK_persona_pep_directo_idpersona",
        using: "BTREE",
        fields: [
          { name: "_idpersona" },
        ]
      },
    ]
  });
  }
}
