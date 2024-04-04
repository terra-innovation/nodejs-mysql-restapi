import { poolFactoring } from "../config/bd/mysql2_db_factoring.js";
import { poolBigData } from "../config/bd/mysql2_db_bigdata.js";
import { TOKEN_KEY } from "../config.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import * as Yup from "yup";
import { ValidationError } from "yup";

export const loginUser = async (req, res) => {
  try {
    // Get user input
    const { correo, clave } = req.body;

    let EMAIL_REGX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;

    const loginUserSchema = Yup.object()
      .shape({
        email: Yup.string()
          .trim()
          .required("Correo electrónico es requerido")
          .email("Debe ser un correo válido")
          .matches(EMAIL_REGX, "Debe ser un correo válido.")
          .min(5, "Mínimo 5 caracteres")
          .max(50, "Máximo 50 caracteres"),
        password: Yup.string().required("Contraseña es requerido").min(6, "Mínimo 6 caracteres").max(20, "Máximo 20 caracteres"),
      })
      .required();
    const data = loginUserSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

    const { email, password } = data;

    // Validate if user exist in our database
    const [rows] = await poolFactoring.query("SELECT idusuario, usuarioid, email, password FROM usuario WHERE email = ?", [email]);

    if (rows.length <= 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const rol = 1;
    if (rows[0].email && (await bcrypt.compare(password, rows[0].password))) {
      // Create token
      const token = jwt.sign({ idusuario: rows[0].idusuario, usuarioid: rows[0].usuarioid, email: rows[0].email, rol: rol }, TOKEN_KEY, {
        expiresIn: "200000h",
      });

      // save user token
      // user.token = token;
      rows[0].token = token;

      res.status(201).json({ token });
    } else {
      return res.status(404).json({ message: "Credenciales no válidas" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const registerUser = async (req, res) => {
  try {
    let EMAIL_REGX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;
    var NAME_REGX = /^[a-zA-Z ]+$/;

    const registerUserSchema = Yup.object()
      .shape({
        iddocumentotipo: Yup.string().max(25).trim().required("Tipo documento es requerido"),
        documentonumero: Yup.string()
          .trim()
          .required("Nro de documento es requerido")
          .matches(/^[0-9]*$/, "Ingrese solo números")
          .length(8, "Debe ser 8 caracteres"),
        nombres: Yup.string().trim().required("Nombres es requerido").matches(NAME_REGX, "Debe ser un nombre válido").min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
        apellidopaterno: Yup.string().trim().required("Apellido paterno es requerido").matches(NAME_REGX, "Debe ser un apellido válido").min(2, "Mínimo 2 caracteres").max(50, "Máximo 50 caracteres"),
        apellidomaterno: Yup.string().trim().required("Apellido materno es requerido").matches(NAME_REGX, "Debe ser un apellido válido").min(2, "Mínimo 2 caracteres").max(50, "Máximo 50 caracteres"),
        email: Yup.string()
          .trim()
          .required("Correo electrónico es requerido")
          .email("Debe ser un correo válido")
          .matches(EMAIL_REGX, "Debe ser un correo válido.")
          .min(5, "Mínimo 5 caracteres")
          .max(50, "Máximo 50 caracteres"),
        celular: Yup.string()
          .trim()
          .required("Número de celular es requerido")
          .matches(/^\+\d+$/, "Ingrese solo números")
          .length(12, "Debe ser 12 caracteres"),
        password: Yup.string().min(6, "Mínimo 6 caracteres").max(20, "Máximo 20 caracteres").required("Contraseña es requerido"),
      })
      .required();
    const data = registerUserSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

    const { iddocumentotipo, documentonumero, nombres, apellidopaterno, apellidomaterno, email, celular, password } = data;
    const uuid = uuidv4();

    const emailvalidationcode = crypto.randomBytes(20).toString("hex");
    const hash = crypto
      .createHash("sha1")
      .update(email + "|" + documentonumero)
      .digest("hex");

    //Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10);

    //Validate unique register
    var query01 = `
    SELECT usuarioid FROM usuario WHERE email = ? or documentonumero=?
    `;

    const [registros] = await poolFactoring.query(query01, [email, documentonumero]);

    if (registros.length > 0) return res.status(404).json({ message: "El usuario ya se encuentra registrado" });

    const [rows] = await poolFactoring.query(
      "INSERT INTO usuario (usuarioid, iddocumentotipo, documentonumero, nombres, apellidopaterno, apellidomaterno, email, celular, password, emailvalidationcode, hash) VALUES (?, ?,?, ?,?, ?,?, ?,?, ?,?)",
      [uuid, iddocumentotipo, documentonumero, nombres, apellidopaterno, apellidomaterno, email, celular, encryptedPassword, emailvalidationcode, hash]
    );
    res.status(201).json({ id: uuid, iddocumentotipo, documentonumero, nombres, apellidopaterno, apellidomaterno, email, celular });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something goes wrong" });
  }
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

    const [rows] = await poolFactoring.query("INSERT INTO user (nombre, apellido_paterno, apellido_materno, correo, clave) VALUES (?,?,?,?,?)", [
      nombre,
      apellido_paterno,
      apellido_materno,
      correo,
      encryptedPassword,
    ]);

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
