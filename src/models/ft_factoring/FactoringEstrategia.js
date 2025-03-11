import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class FactoringEstrategia extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idfactoringestrategia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    factoringestrategiaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoring_estrategia_factoringestrategiaid"
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "UQ_factoring_estrategia_code"
    },
    nombre_estrategia: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Monto asociado a la colocación de la operación"
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
    tableName: 'factoring_estrategia',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoringestrategia" },
        ]
      },
      {
        name: "UQ_factoring_estrategia_factoringestrategiaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringestrategiaid" },
        ]
      },
      {
        name: "UQ_factoring_estrategia_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
    ]
  });
  }
}
