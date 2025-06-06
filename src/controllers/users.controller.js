const db = require('../../config/db');

/* -------- GET /users/me -------- */
exports.getMe = async (req, res) => {
  const userId = req.user.id;
  const [rows] = await db.query(
    `SELECT id, nombre, correo, telefono, identificacion,
            foto_url, preferencias, creado_en,must_change_pw
     FROM users WHERE id = ?`,
    [userId]
  );
  res.json(rows[0]);
};

/* -------- PUT /users/me -------- */
exports.updateMe = async (req, res) => {
  const userId = req.user.id;
  const { telefono, identificacion, foto_url, preferencias } = req.body;

  await db.query(
    `UPDATE users
       SET telefono = COALESCE(?, telefono),
           identificacion = COALESCE(?, identificacion),
           foto_url = COALESCE(?, foto_url),
           preferencias = COALESCE(?, preferencias)
     WHERE id = ?`,
    [telefono, identificacion, foto_url, preferencias, userId]
  );

  res.json({ msg: 'Perfil actualizado' });
};
