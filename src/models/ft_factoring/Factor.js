import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Factor extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idfactor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    factorid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_factor_factorid"
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "UQ_factor_code"
    },
    _idpaissede: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'pais',
        key: '_idpais'
      }
    },
    _iddepartamentosede: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'departamento',
        key: '_iddepartamento'
      }
    },
    _idprovinciasede: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'provincia',
        key: '_idprovincia'
      }
    },
    _iddistritosede: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'distrito',
        key: '_iddistrito'
      }
    },
    _idriesgo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'riesgo',
        key: '_idriesgo'
      }
    },
    ruc: {
      type: DataTypes.STRING(11),
      allowNull: false
    },
    razon_social: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    nombre_comercial: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    fecha_inscripcion: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    domicilio_fiscal: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    direccion_sede: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    direccion_sede_referencia: {
      type: DataTypes.STRING(200),
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
    tableName: 'factor',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idfactor" },
        ]
      },
      {
        name: "UQ_factor_factorid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "factorid" },
        ]
      },
      {
        name: "UQ_factor_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_factor_idpaissede",
        using: "BTREE",
        fields: [
          { name: "_idpaissede" },
        ]
      },
      {
        name: "FK_factor_iddepartamentosede",
        using: "BTREE",
        fields: [
          { name: "_iddepartamentosede" },
        ]
      },
      {
        name: "FK_factor_idprovinciasede",
        using: "BTREE",
        fields: [
          { name: "_idprovinciasede" },
        ]
      },
      {
        name: "FK_factor_iddistritosede",
        using: "BTREE",
        fields: [
          { name: "_iddistritosede" },
        ]
      },
      {
        name: "FK_factor_idriesgo",
        using: "BTREE",
        fields: [
          { name: "_idriesgo" },
        ]
      },
    ]
  });
  }
}
