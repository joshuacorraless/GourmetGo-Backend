const db = require('../../config/db');

/* ---------- GET /api/export/ticket/:id ---------- */
exports.ticketData = async (req, res) => {
  const userId = req.user.id;
  const id     = req.params.id;

  const [[r]] = await db.query(
    `SELECT r.id,
            r.nombre_entrada,
            r.correo_entrada,
            r.telefono_entry,
            r.cantidad,
            r.metodo_pago,
            r.estado,
            r.codigo_qr,
            e.id AS exp_id,
            e.nombre AS exp_nombre,
            e.fecha_hora,
            e.ubicacion
       FROM reservations r
       JOIN experiences e ON e.id = r.experience_id
      WHERE r.id = ? AND r.user_id = ?`,
    [id, userId]
  );

  if (!r) return res.status(404).json({ msg: 'Reserva no encontrada' });

  res.json({
    reserva: {
      id: r.id,
      nombre_entrada : r.nombre_entrada,
      correo_entrada : r.correo_entrada,
      telefono_entry : r.telefono_entry,
      cantidad       : r.cantidad,
      metodo_pago    : r.metodo_pago,
      estado         : r.estado,
      qr_base64      : r.codigo_qr
    },
    experiencia: {
      id          : r.exp_id,
      nombre      : r.exp_nombre,
      fecha_hora  : r.fecha_hora,
      ubicacion   : r.ubicacion
    }
  });
};

/* ---------- GET /api/export/reservations/mine ---------- */
exports.myReservations = async (req, res) => {
  const userId = req.user.id;
  const [rows] = await db.query(
    `SELECT r.id,
            e.nombre  AS experiencia,
            r.cantidad,
            r.estado,
            DATE_FORMAT(r.creado_en,'%Y-%m-%d %H:%i') AS creado
       FROM reservations r
       JOIN experiences e ON e.id = r.experience_id
      WHERE r.user_id = ?
   ORDER BY r.creado_en DESC`,
    [userId]
  );

  res.json(rows);        // lista lista; el front puede transformarla a CSV
};
