import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class FacturaItem extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idfacturaitem: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    facturaitemid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid')
    },
    _idfactura: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    id: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    codigo_producto_sunat: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    codigo_producto_vendedor: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    unidad_medida: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cantidad: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    valor_unitario: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    precio_venta: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    impuesto_codigo_sunat: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    impuesto_nombre: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    impuesto_porcentaje: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    impuesto_codigo_afectacion_sunat: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    impuesto_base_imponible: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    impuesto_monto: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    moneda: {
      type: DataTypes.STRING(50),
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
    tableName: 'factura_item',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfacturaitem" },
        ]
      },
      {
        name: "FK_factura_item_idfactura",
        using: "BTREE",
        fields: [
          { name: "_idfactura" },
        ]
      },
    ]
  });
  }
}
