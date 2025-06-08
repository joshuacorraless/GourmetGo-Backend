const express   = require('express');
const router    = express.Router();
const ctrl      = require('../controllers/users.controller');
const verifyJwt = require('../middlewares/authJwt');
const v         = require('../middlewares/validators');

/* ---------- GET /users/me ---------- */
router.get('/me', verifyJwt, ctrl.getMe);

/* ---------- PUT /users/me ---------- */
router.put(
  '/me',
  verifyJwt,

  /* Middleware dinámico: selecciona las reglas según el rol */
  async (req, res, next) => {
    const rules =
      req.user.rol === 'USER'
        ? v.profileUserRules      // teléfono, identificación, preferencias...
        : v.profileChefRules;     // contacto, ubicación, tipo_cocina, foto...

    /* Ejecutamos cada regla sobre la request */
    await Promise.all(rules.map(rule => rule.run(req)));
    next();
  },

  /* Comprueba si hubo errores de validación */
  v.check,

  /* Actualiza el perfil */
  ctrl.updateMe
);

module.exports = router;
