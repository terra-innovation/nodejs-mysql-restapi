import { poolFactoring } from "../config/bd/mysql2_db_factoring.js";
import { ClientError, ConexionError } from "../utils/errors.js";

export const getEmpresasActivas = async (req) => {
  try {
    const { models } = req.app.locals;
    const empresas = await models.Empresa.findAll({
      attributes: {
        exclude: ["idempresa", "idusuariocrea", "fechacrea", "idusuariomod", "fechamod", "estado"],
      },
      where: {
        estado: 1,
      },
    });
    //console.log(empresas);
    return empresas;
  } catch (error) {
    console.error(error.original.code);
    console.error(error);
    throw new ConexionError("Ocurrio un error", 500);
  }
};

export const getEmpresaByEmpresaid = async (req, empresaid) => {
  try {
    const { models } = req.app.locals;
    const empresa = await models.Empresa.findAll({
      attributes: {
        exclude: ["idempresa", "idusuariocrea", "fechacrea", "idusuariomod", "fechamod", "estado"],
      },
      where: {
        empresaid: empresaid,
      },
    });
    //console.log(empresa);
    return empresa;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ConexionError("Ocurrio un error", 500);
  }
};

export const insertarEmpresa = async (req, empresa) => {
  try {
    const { models } = req.app.locals;
    const empresa_nuevo = await models.Empresa.create(empresa);

    /*
    const connection = await poolFactoring.getConnection();
    const [result] = await connection.query(
      `INSERT INTO empresa (
      empresaid, 
      code, 
      ruc, 
      razon_social, 
      nombre_comercial, 
      fecha_inscripcion, 
      domicilio_fiscal, 
      score, 
      idusuariocrea, 
      fechacrea, 
      idusuariomod, 
      fechamod, 
      estado) 
      VALUES 
      ( 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      now(3), 
      ?, 
      now(3), 
      1
      )`,
      [
        empresa.empresaid,
        empresa.code,
        empresa.ruc,
        empresa.razon_social,
        empresa.nombre_comercial,
        empresa.fecha_inscripcion,
        empresa.domicilio_fiscal,
        empresa.score,
        empresa.idusuariocrea,
        empresa.idusuariomod,
        empresa.estado,
      ]
    );
    //console.debug(result);
    connection.release();
    return result;

    */
    // console.log(empresa_nuevo);
    return empresa_nuevo;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ConexionError("Ocurrio un error", 500);
  }
};

export const actualizarEmpresa = async (empresa) => {
  try {
    const connection = await poolFactoring.getConnection();
    const [result] = await connection.query(
      `UPDATE empresa 
      SET 
      ruc = IFNULL(?, ruc),
      razon_social = IFNULL(?, razon_social), 
      nombre_comercial = IFNULL(?, nombre_comercial),
      fecha_inscripcion = IFNULL(?, fecha_inscripcion),
      domicilio_fiscal = IFNULL(?, domicilio_fiscal),
      score = IFNULL(?, score),
      idusuariomod = ?,
      fechamod = now(3),
      estado = IFNULL(?, estado)
      WHERE empresaid = ? `,
      [empresa.ruc, empresa.razon_social, empresa.nombre_comercial, empresa.fecha_inscripcion, empresa.domicilio_fiscal, empresa.score, empresa.idusuariomod, empresa.estado, empresa.empresaid]
    );
    //console.log(result);
    connection.release();
    return result;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ConexionError("Ocurrio un error", 500);
  }
};

export const deleteEmpresa = async (empresa) => {
  try {
    const connection = await poolFactoring.getConnection();
    const [result] = await connection.query(
      `UPDATE empresa 
      SET 
      idusuariomod = ?,
      fechamod = now(3),
      estado = 2
      WHERE empresaid = ? `,
      [empresa.idusuariomod, empresa.empresaid]
    );
    //console.log(result);
    connection.release();
    return result;
  } catch (error) {
    console.error(error.code);
    console.error(error);
    throw new ConexionError("Ocurrio un error", 500);
  }
};
