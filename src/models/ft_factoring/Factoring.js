import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Factoring extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    idfactoring: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    factoringid: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    iddebtor: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'company',
        key: 'idcompany'
      }
    },
    idseller: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'company',
        key: 'idcompany'
      }
    },
    risk: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    tea: {
      type: DataTypes.DECIMAL(10,5),
      allowNull: true
    },
    tem: {
      type: DataTypes.DECIMAL(10,5),
      allowNull: true
    },
    ted: {
      type: DataTypes.DECIMAL(10,5),
      allowNull: true
    },
    term_estimated: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    term_real: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    advancement_amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    advancement_percetage: {
      type: DataTypes.DECIMAL(10,5),
      allowNull: true
    },
    date_payment_estimated: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    date_registration: {
      type: DataTypes.DATE,
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
      type: DataTypes.INTEGER,
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
    tableName: 'factoring',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "idfactoring" },
        ]
      },
      {
        name: "iddebtor",
        using: "BTREE",
        fields: [
          { name: "iddebtor" },
        ]
      },
      {
        name: "idseller",
        using: "BTREE",
        fields: [
          { name: "idseller" },
        ]
      },
    ]
  });
  }
}
