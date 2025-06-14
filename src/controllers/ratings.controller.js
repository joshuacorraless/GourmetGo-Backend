const db = require('../../config/db');

/* ---------- Crear rating ---------- */
exports.create = async (req, res) => {
  const userId = req.user.id;
  const { reservation_id, puntuacion, comentario,imagen_url } = req.body;

  /* 1) Verificar reserva del usuario y estado Asistido */
  const [[resv]] = await db.query(
    `SELECT estado, experience_id
       FROM reservations
      WHERE id = ? AND user_id = ?`,
    [reservation_id, userId]
  );
  if (!resv)   return res.status(403).json({ msg: 'Reserva no encontrada' });
  if (resv.estado !== 'Asistido')
      return res.status(400).json({ msg: 'Solo puedes calificar reservas asistidas' });

  /* 2) Evitar duplicado */
  const [[dup]] = await db.query(
    'SELECT id FROM ratings WHERE reservation_id = ?',
    [reservation_id]
  );
  if (dup) return res.status(400).json({ msg: 'Ya calificaste esta experiencia' });

  /* 3) Insertar rating */
  await db.query(
    `INSERT INTO ratings (reservation_id, puntuacion, comentario,imagen_url)
     VALUES (?,?,?)`,
    [reservation_id, puntuacion, comentario,imagen_url|| null]
  );

  /* 4) Calcular nuevo promedio y actualizar experiencia */
  const [[avgRow]] = await db.query(
    `SELECT AVG(puntuacion) AS promedio
       FROM ratings r
       JOIN reservations rs ON rs.id = r.reservation_id
      WHERE rs.experience_id = ?`,
    [resv.experience_id]
  );

  const nuevoProm = Number(avgRow.promedio).toFixed(1);   // ej. 4.3

  await db.query(
    'UPDATE experiences SET calificacion = ? WHERE id = ?',
    [nuevoProm, resv.experience_id]
  );

  /* 5) Respuesta final */
  return res.status(201).json({
    msg: '¡Gracias por tu calificación!',
    calificacion_promedio: nuevoProm
  });
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
