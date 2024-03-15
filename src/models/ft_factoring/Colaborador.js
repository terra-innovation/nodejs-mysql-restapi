import _sequelize from "sequelize";
const { Model, Sequelize } = _sequelize;

export default class Colaborador extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        idcolaborador: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        colaboradorid: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        idempresa: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "empresa",
            key: "idempresa",
          },
        },
        nombre: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        cargo: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        telefono: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        idusuariocrea: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        fechacrea: {
          type: DataTypes.DATE(3),
          allowNull: false,
          defaultValue: "current_timestamp(3)",
        },
        idusuariomod: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        fechamod: {
          type: DataTypes.DATE(3),
          allowNull: false,
          defaultValue: "current_timestamp(3)",
        },
        estado: {
          type: DataTypes.TINYINT,
          allowNull: false,
          defaultValue: 1,
        },
      },
      {
        sequelize,
        tableName: "colaborador",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "idcolaborador" }],
          },
          {
            name: "FK_idempresa",
            using: "BTREE",
            fields: [{ name: "idempresa" }],
          },
        ],
      }
    );
  }
}
