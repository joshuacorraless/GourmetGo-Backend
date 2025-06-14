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
    `SELECT r.*, e.nombre AS experiencia
       FROM reservations r
       JOIN experiences e ON e.id = r.experience_id
      WHERE r.user_id = ?
   ORDER BY r.creado_en DESC`,
    [userId]
  );
  res.json(rows);
};
