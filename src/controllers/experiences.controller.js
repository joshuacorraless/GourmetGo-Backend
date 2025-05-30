const db          = require('../../config/db');
const transporter = require('../../config/mail');
const crypto      = require('crypto');

/* ---------- Crear experiencia ---------- */
exports.create = async (req, res) => {
  const hostId = req.user.id;               // CHEF o RESTAURANT
  const {
    nombre, descripcion, fecha_hora, ubicacion,
    capacidad, precio, duracion_h, categoria, requisitos
  } = req.body;

  await db.query(
    `INSERT INTO experiences
      (host_id, nombre, descripcion, fecha_hora, ubicacion,
       capacidad, precio, duracion_h, categoria, requisitos)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [hostId, nombre, descripcion, fecha_hora, ubicacion,
     capacidad, precio, duracion_h, categoria, requisitos]
  );

  res.status(201).json({ msg: 'Experiencia creada' });
};

/* ---------- Listar todas ---------- */
exports.getAll = async (_req, res) => {
  const [rows] = await db.query(
    `SELECT e.*, u.nombre AS anfitrion
       FROM experiences e
       JOIN users u ON u.id = e.host_id
     ORDER BY fecha_hora`
  );
  res.json(rows);
};

/* ---------- Detalle ---------- */
exports.getById = async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM experiences WHERE id = ?',
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ msg: 'No encontrada' });
  res.json(rows[0]);
};

/* ---------- Actualizar ---------- */
exports.update = async (req, res) => {
  const id     = req.params.id;
  const hostId = req.user.id;

  const [rows] = await db.query(
    'SELECT * FROM experiences WHERE id = ? AND host_id = ?',
    [id, hostId]
  );
  if (!rows.length) return res.status(403).json({ msg: 'No autorizado' });

  /* Reglas de estado */
  if (rows[0].estado === 'Activo' && req.body.estado && req.body.estado !== 'Activo')
    return res.status(400).json({ msg: 'Estado no puede revertir a Agotado/Próximamente' });
  if (rows[0].estado === 'Próximamente' && req.body.estado === 'Agotado')
    return res.status(400).json({ msg: 'Debe pasar por Activo primero' });

  /* Construir SET dinámico */
  const campos = ['nombre','descripcion','fecha_hora','ubicacion',
                  'capacidad','precio','duracion_h','categoria',
                  'requisitos','estado'];
  const set  = [];
  const vals = [];
  campos.forEach(c => {
    if (req.body[c] !== undefined) {
      set.push(`${c} = ?`);
      vals.push(req.body[c]);
    }
  });
  if (!set.length) return res.json({ msg: 'Sin cambios' });

  vals.push(id);
  await db.query(`UPDATE experiences SET ${set.join(', ')} WHERE id = ?`, vals);
  res.json({ msg: 'Experiencia actualizada' });
};

/* ---------- Solicitar borrado (envía código) ---------- */
exports.requestDelete = async (req, res) => {
  const id     = req.params.id;
  const hostId = req.user.id;

  const [rows] = await db.query(
    `SELECT e.*, u.correo
       FROM experiences e
       JOIN users u ON u.id = e.host_id
     WHERE e.id = ? AND host_id = ?`,
    [id, hostId]
  );
  if (!rows.length) return res.status(403).json({ msg: 'No autorizado' });
  if (rows[0].estado === 'Agotado')
    return res.status(400).json({ msg: 'No se puede borrar una experiencia agotada' });

  const code    = crypto.randomInt(100000, 999999).toString();
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  await db.query(
    `REPLACE INTO exp_delete_codes (experience_id, code, expires_at)
     VALUES (?, ?, ?)`,
    [id, code, expires]
  );

  await transporter.sendMail({
    to: rows[0].correo,
    subject: `Código para borrar experiencia #${id}`,
    html: `<p>Tu código de confirmación es <b>${code}</b>. Expira en 15 min.</p>`
  });

  res.json({ msg: 'Código enviado al correo registrado' });
};

/* ---------- Borrar experiencia ---------- */
exports.remove = async (req, res) => {
  const id   = req.params.id;
  const code = req.body.code || '';

  const [rows] = await db.query(
    `SELECT * FROM exp_delete_codes
      WHERE experience_id = ? AND code = ? AND expires_at >= NOW()`,
    [id, code]
  );
  if (!rows.length)
    return res.status(400).json({ msg: 'Código inválido o expirado' });

  await db.query('DELETE FROM experiences WHERE id = ?', [id]);
  await db.query('DELETE FROM exp_delete_codes WHERE experience_id = ?', [id]);

  res.json({ msg: 'Experiencia borrada' });
};
