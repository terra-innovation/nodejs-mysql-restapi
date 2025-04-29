import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class BancoTransaccionEstadoHistorial extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    _idbancotransaccionestadohistorial: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    bancotransaccionestadohistorialid: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('uuid'),
      unique: "UQ_bteh_bancotransaccionestadohistorialid"
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "UQ_bteh_code"
    },
    _idbancotransaccion: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'banco_transaccion',
        key: '_idbancotransaccion'
      }
    },
    _idbancotransaccionestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'banco_transaccion_estado',
        key: '_idbancotransaccionestado'
      }
    },
    _idusuariomodifica: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'usuario',
        key: '_idusuario'
      }
    },
    motivo: {
      type: DataTypes.TEXT,
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
    tableName: 'banco_transaccion_estado_historial',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "_idbancotransaccionestadohistorial" },
        ]
      },
      {
        name: "UQ_bteh_bancotransaccionestadohistorialid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bancotransaccionestadohistorialid" },
        ]
      },
      {
        name: "UQ_bteh_code",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "code" },
        ]
      },
      {
        name: "FK_bteh_idbancotransaccionestado",
        using: "BTREE",
        fields: [
          { name: "_idbancotransaccionestado" },
        ]
      },
      {
        name: "FK_bteh_idusuariomodifica",
        using: "BTREE",
        fields: [
          { name: "_idusuariomodifica" },
        ]
      },
      {
        name: "FK_bteh_idtransaccion",
        using: "BTREE",
        fields: [
          { name: "_idbancotransaccion" },
        ]
      },
    ]
  });
  }
}
