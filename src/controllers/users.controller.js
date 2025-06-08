const db = require('../../config/db');

/* -------- GET /users/me -------- */
exports.getMe = async (req, res) => {
  const userId = req.user.id;
  const [[u]] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  res.json(u);
};

/* -------- PUT /users/me -------- */
exports.updateMe = async (req, res) => {
  const userId = req.user.id;
  const rol    = req.user.rol;   // viene del JWT

  const campos = (rol === 'USER')
    ? ['telefono','identificacion','foto_url','preferencias']
    : ['contacto','telefono','ubicacion','tipo_cocina','foto_url'];

  const set  = [];
  const vals = [];
  campos.forEach(c => {
    if (req.body[c] !== undefined) {
      set.push(`${c} = ?`);
      vals.push(req.body[c]);
    }
  });
  if (!set.length) return res.json({ msg:'Sin cambios' });

  vals.push(userId);
  await db.query(`UPDATE users SET ${set.join(', ')} WHERE id = ?`, vals);
  res.json({ msg:'Perfil actualizado' });
};
