const express   = require('express');
const router    = express.Router();
const authCtrl  = require('../controllers/auth.controller');
const v         = require('../middlewares/validators');
const verify    = require('../middlewares/authJwt');

/* Registro */
router.post('/register/user',
  v.registerUserRules, v.check,
  authCtrl.registerUser
);

router.post('/register/chef',
  v.registerChefRules, v.check,
  authCtrl.registerChef
);

/* Login */
router.post('/login',
  v.loginRules, v.check,
  authCtrl.loginUser
);

/* Olvidé mi contraseña */
router.post('/forgot-password', authCtrl.forgotPassword);

/* Cambio de contraseña */
router.put('/change-password',
  verify,
  v.changePassRules,
  v.check,
  authCtrl.changePassword
);

module.exports = router;