const express     = require('express');
const cors        = require('cors');
const dotenv      = require('dotenv');
const db          = require('../config/db');
const errorHandler= require('./middlewares/errorHandler');

dotenv.config();
const app  = express();
const PORT = process.env.PORT || 3000;

// ──────────── Middleware global ────────────
app.use(cors());            // CORS abierto –ajusta origin en prod
app.use(express.json());    // Body parser JSON

// ──────────── Prueba de DB ────────────
app.get('/db-test', async (_req, res, next) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json({ db: rows[0].result });   // => { "db": 2 }
  } catch (err) {
    next(err);
  }
});



// ──────────── Error handler global ────────────
app.use(errorHandler);

// ──────────── Levantar servidor ────────────
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

// ──────────── Aquí montare más rutas: ────────────

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

const userRoutes  = require('./routes/users.routes');
app.use('/api/users', userRoutes);


const expRoutes  = require('./routes/experiences.routes');
app.use('/api/experiences', expRoutes);

const resRoutes  = require('./routes/reservations.routes');
app.use('/api/reservations', resRoutes);


const ratRoutes = require('./routes/ratings.routes');
app.use('/api/ratings', ratRoutes);