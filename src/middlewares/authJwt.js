const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

function verifyToken (req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.split(' ')[1];  // “Bearer <token>”

  if (!token) return res.status(401).json({ msg: 'Token faltante' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;       // { id, correo }
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token inválido o expirado' });
  }
}

module.exports = verifyToken;
