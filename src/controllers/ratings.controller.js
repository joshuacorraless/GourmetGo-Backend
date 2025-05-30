const db = require('../../config/db');

/* ---------- Crear rating ---------- */
exports.create = async (req, res) => {
  const userId = req.user.id;
  const { reservation_id, puntuacion, comentario } = req.body;

  /* 1) Verificar que la reserva pertenece al usuario y fue asistida */
  const [[resv]] = await db.query(
    `SELECT estado, experience_id
       FROM reservations
      WHERE id = ? AND user_id = ?`,
    [reservation_id, userId]
  );
  if (!resv)  return res.status(403).json({ msg: 'Reserva no encontrada' });
  if (resv.estado !== 'Asistido')
      return res.status(400).json({ msg: 'Solo puedes calificar reservas asistidas' });

  /* 2) ¿Ya existe rating? */
  const [[dup]] = await db.query(
    'SELECT id FROM ratings WHERE reservation_id = ?',
    [reservation_id]
  );
  if (dup) return res.status(400).json({ msg: 'Ya calificaste esta experiencia' });

  /* 3) Insertar rating */
  await db.query(
    `INSERT INTO ratings (reservation_id, puntuacion, comentario)
     VALUES (?,?,?)`,
    [reservation_id, puntuacion, comentario]
  );

  res.status(201).json({ msg: '¡Gracias por tu calificación!' });
};

/* ---------- Listar ratings por experiencia ---------- */
exports.listByExperience = async (req, res) => {
  const expId = req.params.id;
  const [rows] = await db.query(
    `SELECT r.id, r.puntuacion, r.comentario, r.creado_en,
            u.nombre AS usuario
       FROM ratings r
       JOIN reservations re ON re.id = r.reservation_id
       JOIN users u ON u.id = re.user_id
      WHERE re.experience_id = ?
   ORDER BY r.creado_en DESC`,
    [expId]
  );
  res.json(rows);
};
