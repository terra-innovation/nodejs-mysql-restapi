import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Factura extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    idfactura: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    facturaid: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    serie: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    numero_comprobante: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    fecha_emision: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    hora_emision: {
      type: DataTypes.TIME,
      allowNull: true
    },
    fecha_vencimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    codigo_tipo_documento: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    nota: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    codigo_tipo_moneda: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    cantidad_items: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    proveedor_ruc: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    proveedor_razon_social: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    proveedor_direccion: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    proveedor_codigo_pais: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    proveedor_ubigeo: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    proveedor_provincia: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    proveedor_departamento: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    proveedor_urbanizacion: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    proveedor_distrito: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cliente_ruc: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    cliente_razon_social: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    impuesto_monto: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    impuesto_valor_venta_monto_venta: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    impuesto_valor_venta_monto_venta_mas_impuesto: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    impuesto_valor_venta_monto_pago: {
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
    tableName: 'factura',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "idfactura" },
        ]
      },
    ]
  });
  }
}
