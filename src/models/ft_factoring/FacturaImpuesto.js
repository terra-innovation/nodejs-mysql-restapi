import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class FacturaImpuesto extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    idfacturaimpuesto: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    facturaimpuestoid: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    idfactura: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    id: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    codigo_sunat: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    porcentaje: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    base_imponible: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    monto: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
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
    tableName: 'factura_impuesto',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "idfacturaimpuesto" },
        ]
      },
    ]
  });
  }
}
