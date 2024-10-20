import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class FactoringFactura extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idfactoring: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    _idfactura: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
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
    tableName: 'factoring_factura',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoring" },
          { name: "_idfactura" },
        ]
      },
      {
        name: "FK_factoring_factura_idfactura",
        using: "BTREE",
        fields: [
          { name: "_idfactura" },
        ]
      },
    ]
  });
  }
}
