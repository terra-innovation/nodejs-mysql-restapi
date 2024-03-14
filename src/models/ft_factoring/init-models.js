import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _Empresa from  "./Empresa.js";

export default function initModels(sequelize) {
  const Empresa = _Empresa.init(sequelize, DataTypes);


  return {
    Empresa,
  };
}
