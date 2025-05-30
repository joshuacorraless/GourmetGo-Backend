const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/auth.controller');
const v       = require('../middlewares/validators');
const verify  = require('../middlewares/authJwt');

/* Registro */
router.post('/register', v.registerRules, v.check, ctrl.registerUser);

/* Login */
router.post('/login', v.loginRules, v.check, ctrl.loginUser);

/* Olvidé mi contraseña */
router.post('/forgot-password', ctrl.forgotPassword);

/* Cambio de contraseña (requiere token) */
router.put('/change-password',
  verify,
  v.changePassRules,
  v.check,
  ctrl.changePassword
);

module.exports = router;
