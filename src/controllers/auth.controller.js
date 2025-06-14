const bcrypt      = require('bcryptjs');
const jwt         = require('jsonwebtoken');
const crypto      = require('crypto');
const db          = require('../../config/db');
const transporter = require('../../config/mail');
require('dotenv').config();

/* ---------- Registro de chef / restaurante ---------- */
exports.registerChef = async (req, res) => {
  const {
    nombre,           // nombre del establecimiento o chef
    contacto,         // persona de contacto
    correo,
    telefono,
    ubicacion,        // enlace o dirección
    tipo_cocina,
    contrasena,
    foto_url
  } = req.body;

  try {
    /* 1) ¿Correo ya existe? */
    const [exist] = await db.query('SELECT id FROM users WHERE correo = ?', [correo]);
    if (exist.length) return res.status(400).json({ msg: 'Correo ya registrado' });

    /* 2) Hash + inserción con rol CHEF (o RESTAURANT) */
    const hash = await bcrypt.hash(contrasena, 10);
    await db.query(
      `INSERT INTO users
        (nombre, contacto, correo, telefono, ubicacion,
         tipo_cocina, foto_url, contrasena, rol)
       VALUES (?,?,?,?,?,?,?,?, 'CHEF')`,
      [nombre, contacto, correo, telefono, ubicacion,
       tipo_cocina, foto_url, hash]
    );

    res.status(201).json({ msg: 'Chef / Restaurante registrado, ahora inicia sesión' });
  } catch (err) {
    console.error('registerChef:', err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};



/* ---------- Registro ---------- */
exports.registerUser = async (req, res) => {
  const { nombre, correo, telefono, identificacion, contrasena,preferencias,foto_url } = req.body;

  try {
    /* 1) ¿Existe ese correo? */
    const [exist] = await db.query('SELECT id FROM users WHERE correo = ?', [correo]);
    if (exist.length) return res.status(400).json({ msg: 'Usuario ya registrado' });

    /* 2) Hash y alta */
    const hash = await bcrypt.hash(contrasena, 10);
    await db.query(
      `INSERT INTO users (nombre, correo, telefono, identificacion, contrasena, preferencias,foto_url,rol)
       VALUES (?, ?, ?, ?, ?,?,?,?)`,
      [nombre, correo, telefono, identificacion, hash,preferencias,foto_url,"USER"]
    );

    res.status(201).json({ msg: 'Usuario registrado, ahora inicia sesión' });
  } catch (err) {
    console.error('registerUser:', err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

/* ---------- Login de DANIELA LA CABRA ---------- */
exports.loginUser = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT id, rol, contrasena FROM users WHERE correo = ?',
      [correo]
    );
    if (!rows.length) return res.status(400).json({ msg: 'Credenciales inválidas' });

    const user = rows[0];
    const id = user.id;
    const rol = user.rol;
    const passOK = await bcrypt.compare(contrasena, user.contrasena);
    if (!passOK) return res.status(400).json({ msg: 'Credenciales inválidas' });

    const token = jwt.sign(
  { id: user.id, correo, rol: user.rol },
  process.env.JWT_SECRET,
  { expiresIn: '2h' }
);


    res.json({ rol,id,token, must_change_pw: !!user.must_change_pw });
  } catch (err) {
    console.error('loginUser:', err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

/* ---------- Olvidé mi contraseña (password temporal) ---------- */
exports.forgotPassword = async (req, res) => {
  const { correo } = req.body;

  try {
    /* 1) ¿Usuario existe? */
    const [rows] = await db.query('SELECT id FROM users WHERE correo = ?', [correo]);
    if (!rows.length) return res.status(404).json({ msg: 'Correo no registrado' });
    const userId = rows[0].id;

    /* 2) Generar clave temporal */
    const tempPass = crypto.randomBytes(4).toString('hex'); // 8 caracteres
    const hash     = await bcrypt.hash(tempPass, 10);

    /* 3) Guardar y marcar must_change_pw */
    await db.query(
      'UPDATE users SET contrasena = ?, must_change_pw = 1 WHERE id = ?',
      [hash, userId]
    );

    /* 4) Enviar email */
    await transporter.sendMail({
    from: `"GourmetGo" <${process.env.EMAIL_USER}>`,
    to: correo,
    subject: 'Tu nueva contraseña temporal – GourmetGo',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #fdfdfd; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #ff6f61; text-align: center;">GourmetGo</h2>
        <p style="font-size: 16px; color: #333;">Hola,</p>
        <p style="font-size: 16px; color: #333;">Hemos generado una nueva contraseña temporal para tu cuenta:</p>
        <div style="background-color: #ffeae6; border-left: 4px solid #ff6f61; padding: 10px 15px; margin: 20px 0; border-radius: 5px;">
          <p style="font-size: 18px; color: #ff3c00; font-weight: bold; margin: 0;">${tempPass}</p>
        </div>
        <p style="font-size: 16px; color: #333;">Por seguridad, te recomendamos iniciar sesión lo antes posible y cambiarla desde tu perfil.</p>
        <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px;">¿No solicitaste esta contraseña? Ignora este mensaje o contáctanos.</p>
      </div>
    `
  });


    res.json({ msg: 'Contraseña temporal enviada a tu correo' });
  } catch (err) {
    console.error('forgotPassword:', err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

/* ---------- Cambio de contraseña ---------- */
exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { nuevaContrasena } = req.body;

  try {
    const hash = await bcrypt.hash(nuevaContrasena, 10);
    await db.query(
      'UPDATE users SET contrasena = ?, must_change_pw = 0 WHERE id = ?',
      [hash, userId]
    );
    res.json({ msg: 'Contraseña actualizada' });
  } catch (err) {
    console.error('changePassword:', err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};
