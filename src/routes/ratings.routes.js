const express   = require('express');
const router    = express.Router();
const ctrl      = require('../controllers/ratings.controller');
const verifyJwt = require('../middlewares/authJwt');
const v         = require('../middlewares/validators');

/* Crear rating */
router.post('/',
  verifyJwt,
  v.ratingRules,
  v.check,
  ctrl.create
);

/* Listar ratings de una experiencia */
router.get('/experience/:id',
  ctrl.listByExperience
);

module.exports = router;
