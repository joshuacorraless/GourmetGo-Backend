const db     = require('../../config/db');
const qrUtil = require('../utils/qr');

/* ---------- Crear reserva ---------- */
exports.create = async (req, res) => {
  const userId = req.user.id;
  const {
    experience_id, nombre_entrada, correo_entrada,
    telefono_entry, cantidad, metodo_pago
  } = req.body;

  /* 1) ¿Existe la experiencia y hay cupo? */
  const [[exp]] = await db.query(
    `SELECT capacidad, estado
       FROM experiences
      WHERE id = ?`, [experience_id]);

  if (!exp) return res.status(404).json({ msg: 'Experiencia no encontrada' });
  if (exp.estado === 'Agotado')
    return res.status(400).json({ msg: 'Experiencia agotada' });

  /* cupo restante */
  const [[{ usado }]] = await db.query(
    `SELECT COALESCE(SUM(cantidad),0) AS usado
       FROM reservations
      WHERE experience_id = ?`, [experience_id]);

  if (usado + cantidad > exp.capacidad)
    return res.status(400).json({ msg: 'No hay suficientes espacios' });

  /* 2) Insertar reserva */
  const [result] = await db.query(
    `INSERT INTO reservations
       (user_id, experience_id, nombre_entrada, correo_entrada,
        telefono_entry, cantidad, metodo_pago)
     VALUES (?,?,?,?,?,?,?)`,
    [userId, experience_id, nombre_entrada, correo_entrada,
     telefono_entry, cantidad, metodo_pago]
  );

  /* 3) Generar QR (texto = id-reserva|nombre) */
  const qrBase64 = await qrUtil.generateBase64(
    `RES#${result.insertId}|${nombre_entrada}`
  );

  /* 4) Guardar QR */
  await db.query(
    'UPDATE reservations SET codigo_qr = ? WHERE id = ?',
    [qrBase64, result.insertId]
  );

  res.status(201).json({
    msg: 'Reserva confirmada',
    reserva_id: result.insertId,
    qr: qrBase64
  });
};

/* ---------- Listar reservas propias ---------- */
exports.listMine = async (req, res) => {
  const userId = req.user.id;
  const [rows] = await db.query(
    `SELECT r.*, e.nombre AS experiencia
       FROM reservations r
       JOIN experiences e ON e.id = r.experience_id
      WHERE r.user_id = ?
   ORDER BY r.creado_en DESC`,
    [userId]
  );
  res.json(rows);
};
