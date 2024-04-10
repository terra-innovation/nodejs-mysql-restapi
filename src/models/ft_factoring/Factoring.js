import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Factoring extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idfactoring: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    factoringid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid')
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    _idaceptante: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    _idcedente: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    _idmoneda: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    _idfactoringtipo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    _idfactoringestado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    _idriesgooperacion: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    _idriesgodeudor: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    _idriesgocedente: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    _idcuentabancaria: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    _idcolaborador: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tea: {
      type: DataTypes.DECIMAL(10,5),
      allowNull: true,
      comment: "Tasa efectiva anual"
    },
    tem: {
      type: DataTypes.DECIMAL(10,5),
      allowNull: true,
      comment: "Tasa efectiva mensual"
    },
    ted: {
      type: DataTypes.DECIMAL(10,5),
      allowNull: true,
      comment: "Tasa efectiva diaria"
    },
    tna: {
      type: DataTypes.DECIMAL(10,5),
      allowNull: true,
      comment: "Tasa nominal anual"
    },
    tnm: {
      type: DataTypes.DECIMAL(10,5),
      allowNull: true,
      comment: "Tasa nominal mensual"
    },
    tnd: {
      type: DataTypes.DECIMAL(10,5),
      allowNull: true,
      comment: "Tasa nominal diaria"
    },
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "Fecha de inicio de la operación"
    },
    fecha_operacion: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Fecha desde que se debe tener en cuenta para el calculo de los intereses"
    },
    fecha_desembolso: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Fecha en que se transfiere el dinero al cedente"
    },
    fecha_pago_estimado: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Fecha en el que el deudor debe pagar"
    },
    fecha_pago_real: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Fecha en en el que el deudor realmente paga"
    },
    fecha_pago_contable: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Fecha en que se registra el pago en nuestra contabilidad"
    },
    dias_pago_estimado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Dias estimados para el pago"
    },
    dias_pago_real: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Dias reales en la que pagó el deudor"
    },
    dias_mora: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Dias de mora de la operación"
    },
    monto_neto: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      comment: "Monto de la operación, descontando las detracciones"
    },
    monto_adelanto: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto del adelanto que se le dará al cedente"
    },
    monto_garantia: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto de la garantía que se le retiene al cedente"
    },
    monto_costo_financiamiento_estimado: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto estimado de los intereses que debe pagar el cedente"
    },
    monto_costo_financiamiento_real: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto real de los intereses que debe pagar el cedente"
    },
    monto_comision_estructuracion: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto de la comisión de estructuración"
    },
    monto_igv: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto del IGV por la comisón de estructuración"
    },
    monto_costo_factoring: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Monto del costo de la operación de factoring"
    },
    porcentaje_adelanto: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Porcentaje del adelanto"
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
    tableName: 'factoring',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactoring" },
        ]
      },
    ]
  });
  }
}
