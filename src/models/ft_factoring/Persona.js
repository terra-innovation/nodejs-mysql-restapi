import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Persona extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idpersona: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    personaid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_personaid"
    },
    _idusuario: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'usuario',
        key: '_idusuario'
      }
    },
    _iddocumentotipo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'documento_tipo',
        key: '_iddocumentotipo'
      }
    },
    _idpaisnacionalidad: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'pais',
        key: '_idpais'
      }
    },
    _idpaisnacimiento: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'pais',
        key: '_idpais'
      }
    },
    _idpaisresidencia: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'pais',
        key: '_idpais'
      }
    },
    _iddepartamentoresidencia: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'departamento',
        key: '_iddepartamento'
      }
    },
    _idprovinciaresidencia: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'provincia',
        key: '_idprovincia'
      }
    },
    _iddistritoresidencia: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'distrito',
        key: '_iddistrito'
      }
    },
    _idgenero: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'genero',
        key: '_idgenero'
      }
    },
    documentonumero: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    personanombres: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    apellidopaterno: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    apellidomaterno: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    celular: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    fechanacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    direccion: {
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
    tableName: 'persona',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idpersona" },
        ]
      },
      {
        name: "UQ_personaid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "personaid" },
        ]
      },
      {
        name: "FK_persona_iddocumentotipo",
        using: "BTREE",
        fields: [
          { name: "_iddocumentotipo" },
        ]
      },
      {
        name: "FK_persona_idpaisnacionalidad",
        using: "BTREE",
        fields: [
          { name: "_idpaisnacionalidad" },
        ]
      },
      {
        name: "FK_persona_idpaisnacimiento",
        using: "BTREE",
        fields: [
          { name: "_idpaisnacimiento" },
        ]
      },
      {
        name: "FK_persona_idpaisresidencia",
        using: "BTREE",
        fields: [
          { name: "_idpaisresidencia" },
        ]
      },
      {
        name: "FK_persona_iddepartamentoresidencia",
        using: "BTREE",
        fields: [
          { name: "_iddepartamentoresidencia" },
        ]
      },
      {
        name: "FK_persona_idprovinciaresidencia",
        using: "BTREE",
        fields: [
          { name: "_idprovinciaresidencia" },
        ]
      },
      {
        name: "FK_persona_iddistritoresidencia",
        using: "BTREE",
        fields: [
          { name: "_iddistritoresidencia" },
        ]
      },
      {
        name: "FK_persona_idgenero",
        using: "BTREE",
        fields: [
          { name: "_idgenero" },
        ]
      },
      {
        name: "FK_persona_idusuario",
        using: "BTREE",
        fields: [
          { name: "_idusuario" },
        ]
      },
    ]
  });
  }
}
