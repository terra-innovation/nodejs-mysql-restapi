import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class RegionNatural extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idregionnatural: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    regionnaturalid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid')
    },
    nombreregionnatural: {
      type: DataTypes.STRING(200),
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
    tableName: 'region_natural',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idregionnatural" },
        ]
      },
      {
        name: "UQ_distritoid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "regionnaturalid" },
        ]
      },
    ]
  });
  }
}
