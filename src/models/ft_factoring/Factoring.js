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
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factoring_factoringid"
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "UQ_factoring_code"
    },
    _idaceptante: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresa',
        key: '_idempresa'
      }
    },
    _idcedente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresa',
        key: '_idempresa'
      }
    },
    _idmoneda: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'moneda',
        key: '_idmoneda'
      }
    },
    _idfactoringestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'factoring_estado',
        key: '_idfactoringestado'
      }
    },
    _idcuentabancaria: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'cuenta_bancaria',
        key: '_idcuentabancaria'
      }
    },
    _idcontactoaceptante: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Contacto del aceptante",
      references: {
        model: 'contacto',
        key: '_idcontacto'
      }
    },
    _idcontactocedente: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Contacto del cedente",
      references: {
        model: 'colaborador',
        key: '_idcolaborador'
      }
    },
    _idfactoringejecutado: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'factoring_ejecutado',
        key: '_idfactoringejecutado'
      }
    },
    _idfactoringpropuestaaceptada: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'factoring_propuesta',
        key: '_idfactoringpropuesta'
      }
    },
    cantidad_facturas: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fecha_emision: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fecha_operacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Fecha desde que se debe tener en cuenta para el calculo de los intereses"
    },
    fecha_pago_estimado: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "Fecha en el que el deudor debe pagar"
    },
    monto_factura: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    monto_detraccion: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    monto_neto: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      comment: "Monto de la operación, descontando las detracciones"
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
      {
        name: "UQ_factoring_factoringid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factoringid" },
        ]
      },
      {
        name: "UQ_factoring_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_factoring_idaceptante",
        using: "BTREE",
        fields: [
          { name: "_idaceptante" },
        ]
      },
      {
        name: "FK_factoring_idcedente",
        using: "BTREE",
        fields: [
          { name: "_idcedente" },
        ]
      },
      {
        name: "FK_factoring_idcolaborador",
        using: "BTREE",
        fields: [
          { name: "_idcontactoaceptante" },
        ]
      },
      {
        name: "FK_factoring_idcontactocedente",
        using: "BTREE",
        fields: [
          { name: "_idcontactocedente" },
        ]
      },
      {
        name: "FK_factoring_idcuentabancaria",
        using: "BTREE",
        fields: [
          { name: "_idcuentabancaria" },
        ]
      },
      {
        name: "FK_factoring_idfactoringestado",
        using: "BTREE",
        fields: [
          { name: "_idfactoringestado" },
        ]
      },
      {
        name: "FK_factoring_idmoneda",
        using: "BTREE",
        fields: [
          { name: "_idmoneda" },
        ]
      },
      {
        name: "FK_factoring_idfactoringejecutado",
        using: "BTREE",
        fields: [
          { name: "_idfactoringejecutado" },
        ]
      },
      {
        name: "FK_factoring_idfactoringpropuestaaceptada",
        using: "BTREE",
        fields: [
          { name: "_idfactoringpropuestaaceptada" },
        ]
      },
    ]
  });
  }
}
