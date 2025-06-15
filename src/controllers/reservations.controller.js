const db     = require('../../config/db');
const qrUtil = require('../utils/qr');
const transporter = require('../../config/mail');

/* ---------- Crear reserva ---------- */
exports.create = async (req, res) => {
  const userId = req.user.id;
  const {
    experience_id, nombre_entrada, correo_entrada,
    telefono_entry, cantidad, metodo_pago
  } = req.body;

  /* 1) ¿Existe la experiencia y hay cupo? */
  const [[exp]] = await db.query(
    `SELECT *
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

  if (exp.capacidad-usado < cantidad)
    return res.status(400).json({ msg: 'No hay suficientes espacios' });

  const [[{ count }]] = await db.query(
    `SELECT COUNT(*) AS count
    FROM reservations
    WHERE nombre_entrada = ? AND experience_id = ?`,
    [nombre_entrada, experience_id]
  );

  if (count > 0) {
    return res.status(400).json({ msg: 'Ya existe una reserva con ese nombre de entrada' });
  }


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

  await db.query(
    `UPDATE experiences
     SET capacidad = ?, estado = ?
     WHERE id = ?`,
    [
      exp.capacidad-cantidad,
      exp.capacidad-cantidad === 0 ? 'Agotado' : exp.estado,
      experience_id
    ]
  );


  const qrBuffer = Buffer.from(qrBase64.split(',')[1], 'base64');

  /* 5) Enviar correo al usuario con la confirmación */
    const mailOptions = {
    from: `"GourmetGo" <${process.env.EMAIL_USER}>`,
    to: correo_entrada,
    subject: `🎉 Confirmación de Reserva para "${exp.nombre}" - GourmetGo`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #ff6f61; padding: 20px; color: white; text-align: center;">
          <h1 style="margin: 0; font-weight: 700;">¡Reserva Confirmada!</h1>
        </div>
        <div style="padding: 20px; color: #333;">
          <p>Hola <strong>${nombre_entrada}</strong>,</p>
          <p>Gracias por reservar con <strong>GourmetGo</strong>. Aquí tienes los detalles de tu experiencia:</p>
          
          <h2 style="color: #ff6f61; margin-top: 0;">${exp.nombre}</h2>
          
          <p style="font-style: italic; color: #555;">${exp.descripcion}</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; font-weight: 600; border: 1px solid #eee;">📅 Fecha y hora:</td>
              <td style="padding: 8px; border: 1px solid #eee;">${new Date(exp.fecha_hora).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: 600; border: 1px solid #eee;">📍 Ubicación:</td>
              <td style="padding: 8px; border: 1px solid #eee;">
                <a href="${exp.ubicacion}" target="_blank" style="color: #ff6f61; text-decoration: none;">Ver en Google Maps</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: 600; border: 1px solid #eee;">💵 Precio por persona:</td>
              <td style="padding: 8px; border: 1px solid #eee;">₡${exp.precio.toLocaleString('es-CR')}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: 600; border: 1px solid #eee;">📝 Recomendaciones:</td>
              <td style="padding: 8px; border: 1px solid #eee;">${exp.recomendaciones || 'Ninguna'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: 600; border: 1px solid #eee;">🎟️ Entradas reservadas:</td>
              <td style="padding: 8px; border: 1px solid #eee;">${cantidad}</td>
            </tr>
          </table>

          <p style="text-align: center; margin: 30px 0;">
            <img src="cid:qrimage@correo" alt="Código QR" style="width: 180px; height: 180px; border: 2px solid #ff6f61; border-radius: 8px;" />
          </p>

          <p style="text-align: center; color: #777; font-size: 14px; margin-top: 40px;">
            Presenta este código QR al ingresar al evento.<br>
            ¡Disfruta tu experiencia GourmetGo!
          </p>

          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #999; margin-top: 40px;">
            GourmetGo &copy; 2025 - Todos los derechos reservados
          </div>
        </div>
      </div>
    `,
    attachments: [
    {
      filename: 'qr.png',
      content: qrBuffer,
      cid: 'qrimage@correo' // id del html para que se ponga
    }]
  };


  await transporter.sendMail(mailOptions);

  res.status(201).json({
    msg: 'Reserva confirmada, se le enviará un correo de confirmación',
    reserva_id: result.insertId,
    qr: qrBase64
  });
};

/* ---------- Listar reservas propias ---------- */
exports.listMine = async (req, res) => {
  const userId = req.user.id;
  const [rows] = await db.query(
    `SELECT r.*, e.nombre AS experiencia, e.ubicacion, e.fecha_hora
       FROM reservations r
       JOIN experiences e ON e.id = r.experience_id
      WHERE r.user_id = ?
   ORDER BY r.creado_en DESC`,
    [userId]
  );
  res.json(rows);
};
exports.getUsersByExperience = async (req, res) => {
  const { experience_id } = req.params;

  try {
    // 1. Verificar que la experiencia existe
    const [[experience]] = await db.query(
      `SELECT id, nombre FROM experiences WHERE id = ?`,
      [experience_id]
    );

    if (!experience) {
      return res.status(404).json({ msg: 'Experiencia no encontrada' });
    }

    // 2. Obtener todas las reservas para esta experiencia (con formato explícito)
    const [reservations] = await db.query(
      `SELECT 
         r.id AS reservation_id,
         r.nombre_entrada AS guest_name,
         r.correo_entrada AS guest_email,
         r.telefono_entry AS guest_phone,
         r.cantidad AS guests_count,
         r.estado AS reservation_status,
         DATE_FORMAT(r.creado_en, '%Y-%m-%d %H:%i:%s') AS reservation_date,
         r.codigo_qr AS qr_code,
         u.id AS user_id,
         u.nombre AS user_name,
         u.foto_url AS user_photo
       FROM reservations r
       LEFT JOIN users u ON u.id = r.user_id
       WHERE r.experience_id = ?
       ORDER BY r.creado_en DESC`,
      [experience_id]
    );

    // 3. Calcular estadísticas (con nombres de campos consistentes)
    const [[stats]] = await db.query(
      `SELECT 
         COUNT(*) AS total_reservations,
         SUM(cantidad) AS total_guests,
         SUM(CASE WHEN estado = 'Confirmada' THEN cantidad ELSE 0 END) AS confirmed_guests,
         SUM(CASE WHEN estado = 'Asistido' THEN cantidad ELSE 0 END) AS attended_guests,
         SUM(CASE WHEN estado = 'Cancelada' THEN cantidad ELSE 0 END) AS canceled_guests
       FROM reservations
       WHERE experience_id = ?`,
      [experience_id]
    );

    // 4. Obtener información detallada de la experiencia
    const [[experienceDetails]] = await db.query(
      `SELECT 
         e.id,
         e.nombre AS experience_name,
         DATE_FORMAT(e.fecha_hora, '%Y-%m-%dT%H:%i:%s.000Z') AS experience_date,
         e.ubicacion AS location,
         e.capacidad AS capacity,
         e.precio AS price_per_guest,
         u.nombre AS chef_name,
         u.foto_url AS chef_photo
       FROM experiences e
       JOIN users u ON u.id = e.chef_id
       WHERE e.id = ?`,
      [experience_id]
    );

    // 5. Construir respuesta con estructura consistente
    const response = {
      experience: {
        ...experienceDetails,
        capacidad: experienceDetails.capacity, // Duplicado para compatibilidad
        remaining_capacity: experienceDetails.capacity - stats.total_guests
      },
      reservations: reservations.map(res => ({
        ...res,
        // Aseguramos que ningún campo sea null
        guest_name: res.guest_name || 'Nombre no disponible',
        guest_email: res.guest_email || '',
        guest_phone: res.guest_phone || '',
        guests_count: res.guests_count || 0,
        reservation_status: res.reservation_status || 'Confirmada'
      })),
      statistics: {
        total_guests: stats.total_guests || 0,
        confirmed_guests: stats.confirmed_guests || 0,
        attended_guests: stats.attended_guests || 0,
        canceled_guests: stats.canceled_guests || 0,
        total_revenue: (stats.confirmed_guests * experienceDetails.price_per_guest) || 0
      }
    };

    // 6. Enviar respuesta
    res.json(response);

  } catch (error) {
    console.error('Error al obtener reservas por experiencia:', error);
    res.status(500).json({ 
      msg: 'Error al obtener la lista de reservas',
      error: error.message 
    });
  }
};