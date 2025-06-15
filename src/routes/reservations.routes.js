const express   = require('express');
const router    = express.Router();
const ctrl      = require('../controllers/reservations.controller');
const verifyJwt = require('../middlewares/authJwt');
const v         = require('../middlewares/validators');

/* Crear reserva */
router.post('/',
  verifyJwt,
  v.reservationRules,
  v.check,
  ctrl.create
);

/* Listar mis reservas */
router.get('/mine',
  verifyJwt,
  ctrl.listMine
);
router.get('/experience/:experience_id/users', ctrl.getUsersByExperience);

module.exports = router;
