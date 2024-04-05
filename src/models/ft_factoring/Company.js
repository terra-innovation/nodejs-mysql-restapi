import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Company extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    idcompany: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    companyid: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    company_name: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    trade_name: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    taxpayer_type: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    registration_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    fiscal_address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    score: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    idusuariocrea: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fechacrea: {
      type: DataTypes.DATE(3),
      allowNull: true
    },
    idusuariomod: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fechamod: {
      type: DataTypes.DATE(3),
      allowNull: true
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'company',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "idcompany" },
        ]
      },
    ]
  });
  }
}
