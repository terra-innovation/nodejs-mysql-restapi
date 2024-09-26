import * as usuarioDao from "../../daos/usuarioDao.js";
import * as documentotipoDao from "../../daos/documentotipoDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import { poolFactoring } from "../../config/bd/mysql2_db_factoring.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import { poolBigData } from "../../config/bd/mysql2_db_bigdata.js";
import { TOKEN_KEY } from "../../config.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import * as Yup from "yup";
import { Sequelize } from "sequelize";

import { ValidationError } from "yup";

export const loginUser = async (req, res) => {
  // Get user input
  const { correo, clave } = req.body;

  let EMAIL_REGX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;

  const loginUserSchema = Yup.object()
    .shape({
      email: Yup.string().trim().required("Correo electrónico es requerido").email("Debe ser un correo válido").matches(EMAIL_REGX, "Debe ser un correo válido.").min(5, "Mínimo 5 caracteres").max(50, "Máximo 50 caracteres"),
      password: Yup.string().required("Contraseña es requerido").min(6, "Mínimo 6 caracteres").max(20, "Máximo 20 caracteres"),
    })
    .required();
  const loginUserValidated = loginUserSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

  // Validate if user exist in our database
  const usuario_login = await usuarioDao.autenticarUsuario(req, loginUserValidated.email);
  if (usuario_login.length <= 0) {
    throw new ClientError("Usuario no existe", 404);
  }

  jsonUtils.prettyPrint(usuario_login);

  if (usuario_login[0].email && (await bcrypt.compare(loginUserValidated.password, usuario_login[0].password))) {
    // Consultamos todos los datos del usuario y sus roles
    const usuario_autenticado = await usuarioDao.getUsuarioAndRolesByEmail(req, loginUserValidated.email);
    // Obtén el primer registro de usuario_autenticado
    const usuario = usuario_autenticado[0];
    //jsonUtils.prettyPrint(usuario);
    // Create token
    const token = jwt.sign({ usuario: usuario }, TOKEN_KEY, {
      expiresIn: "200000h",
    });

    response(res, 201, { token });
  } else {
    throw new ClientError("Credenciales no válidas", 404);
  }
};

export const registerUsuario = async (req, res) => {
  let EMAIL_REGX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;
  var NAME_REGX = /^[a-zA-Z ]+$/;

  const usuarioCreateSchema = Yup.object()
    .shape({
      documentotipoid: Yup.string().min(36).max(36).trim().required(),
      documentonumero: Yup.string()
        .trim()
        .required()
        .matches(/^[0-9]*$/, "Ingrese solo números")
        .length(8),
      usuarionombres: Yup.string().trim().required().matches(NAME_REGX, "Debe ser un nombre válido").min(2).max(100),
      apellidopaterno: Yup.string().trim().required().matches(NAME_REGX, "Debe ser un apellido válido").min(2).max(50),
      apellidomaterno: Yup.string().trim().required().matches(NAME_REGX, "Debe ser un apellido válido").min(2).max(50),
      email: Yup.string().trim().required().email().matches(EMAIL_REGX, "Debe ser un correo válido.").min(5).max(50),
      celular: Yup.string()
        .trim()
        .required()
        .matches(/^\+\d+$/, "Ingrese solo números")
        .length(12),
      password: Yup.string().min(8).max(50).required(),
    })
    .required();
  const usuarioValidated = usuarioCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

  var documentotipo = await documentotipoDao.findDocumentotipoPk(req, usuarioValidated.documentotipoid);
  if (!documentotipo) {
    throw new ClientError("Documento tipo no existe", 404);
  }

  //Validate unique register
  var usuariobynumerodocumento = await usuarioDao.getUsuarioByNumerodocumento(req, usuarioValidated.documentonumero);
  if (usuariobynumerodocumento?.length > 0) {
    throw new ClientError("El número de documento ya se encuentra registrado. ", 404);
  }

  var usuariobyemail = await usuarioDao.getUsuarioByEmail(req, usuarioValidated.email);
  if (usuariobyemail?.length > 0) {
    throw new ClientError("El correo electrónico ya se encuentra registrado. ", 404);
  }

  const emailvalidationcode = Math.floor(100000 + Math.random() * 900000);
  const hash = crypto
    .createHash("sha1")
    .update(usuarioValidated.email + "|" + usuarioValidated.documentonumero)
    .digest("hex");

  //Encrypt user password
  const encryptedPassword = await bcrypt.hash(usuarioValidated.password, 10);

  delete usuarioValidated.password;

  var camposFk = {};
  camposFk._iddocumentotipo = documentotipo._iddocumentotipo;

  var camposAdicionales = {};
  camposAdicionales.usuarioid = uuidv4();
  camposAdicionales.password = encryptedPassword;
  camposAdicionales.emailvalidationcode = emailvalidationcode;
  camposAdicionales.hash = hash;

  var camposAuditoria = {};
  camposAuditoria.idusuariocrea = req.session_user?.usuario?._idusuario ?? 1;
  camposAuditoria.fechacrea = Sequelize.fn("now", 3);
  camposAuditoria.idusuariomod = req.session_user?.usuario?._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 1;

  const usuarioCreated = await usuarioDao.insertUsuario(req, {
    ...camposFk,
    ...camposAdicionales,
    ...usuarioValidated,
    ...camposAuditoria,
  });
  delete camposAdicionales.password;
  delete camposAdicionales.emailvalidationcode;
  delete camposAdicionales.hash;

  response(res, 201, { ...camposAdicionales, ...usuarioValidated });
};

export const validateEmail = async (req, res) => {
  try {
    //console.log(req);
    const validateEmailSchema = Yup.object({
      hash: Yup.string().max(50, "Máximo 50 caracteres").required("Hash es requerido").trim(),
      token: Yup.string().max(50, "Máximo 50 caracteres").required("Token es requerido").trim(),
    }).required();
    const data = validateEmailSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

    // await new Promise((r) => setTimeout(r, 3000));
    var query01 = `
    UPDATE usuario SET emailvalid = 1,  emaillastvalidate= now(), emailnumvalidation = ifnull(emailnumvalidation,0)+1, idusuariomod=1, fechamod=now(), estado = 2
    WHERE hash = ? and emailvalidationcode=?
    `;

    const [result] = await poolFactoring.query(query01, [data.hash, data.token]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "Parámetros no válidos" });

    var query02 = `
    SELECT email FROM usuario WHERE hash = ? and emailvalidationcode=?
    `;

    const [rows] = await poolFactoring.query(query02, [data.hash, data.token]);

    res.json({ result: result.affectedRows, ...rows[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const registerUser_20230701 = async (req, res) => {
  try {
    // Get user input
    let { nombre, apellido_paterno, apellido_materno, correo, clave } = req.body;

    // sanitize: convert email to lowercase
    correo = correo.toLowerCase();

    //Encrypt user password
    const encryptedPassword = await bcrypt.hash(clave, 10);
    console.log(encryptedPassword);

    const [rows] = await poolFactoring.query("INSERT INTO user (nombre, apellido_paterno, apellido_materno, correo, clave) VALUES (?,?,?,?,?)", [nombre, apellido_paterno, apellido_materno, correo, encryptedPassword]);

    const idusuario = rows.insertId;

    // Create token
    const token = jwt.sign({ idusuario: idusuario, correo }, TOKEN_KEY, {
      expiresIn: "2h",
    });

    res.status(201).json({
      idusuario,
      nombre,
      apellido_paterno,
      apellido_materno,
      correo,
      encryptedPassword,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something goes wrong" });
  }
};
