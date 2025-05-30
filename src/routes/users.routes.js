const express   = require('express');
const router    = express.Router();
const ctrl      = require('../controllers/users.controller');
const verifyJwt = require('../middlewares/authJwt');
const v         = require('../middlewares/validators');

/* Perfil actual */
router.get('/me',  verifyJwt, ctrl.getMe);
router.put('/me',
  verifyJwt,
  v.profileRules,
  v.check,
  ctrl.updateMe
);

module.exports = router;
