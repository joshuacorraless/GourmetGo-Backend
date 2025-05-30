const express   = require('express');
const router    = express.Router();
const verifyJwt = require('../middlewares/authJwt');
const ctrl      = require('../controllers/export.controller');

/* Datos del ticket (JSON) */
router.get('/ticket/:id',
  verifyJwt,
  ctrl.ticketData
);

/* Lista de reservas propias (JSON) */
router.get('/reservations/mine',
  verifyJwt,
  ctrl.myReservations
);

module.exports = router;
