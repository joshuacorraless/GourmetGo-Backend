const { validationResult, body } = require('express-validator');

/* 1. Validación de registro */
exports.registerRules = [
  body('nombre'     ).notEmpty().withMessage('El nombre es requerido'),
  body('correo'     ).isEmail().withMessage('Correo inválido'),
  body('telefono'   ).optional().matches(/^\d{8}$/).withMessage('Teléfono 8 dígitos'),
  body('identificacion').optional().matches(/^\d{9}$/).withMessage('Cédula 9 dígitos'),
  body('contrasena' ).matches(/^(?=(?:.*[A-Za-z]){6})(?=(?:.*\d){4})(?=.*\.)[A-Za-z\d\.]{11}$/)
                     .withMessage('Password = 6 letras, 4 números y un punto')
];

/* 2. Validación de login */
exports.loginRules = [
  body('correo').isEmail(),
  body('contrasena').notEmpty()
];

/* 3. Validación de cambio de pass */
exports.changePassRules = [
  body('nuevaContrasena')
    .matches(/^(?=(?:.*[A-Za-z]){6})(?=(?:.*\d){4})(?=.*\.)[A-Za-z\d\.]{11}$/)
    .withMessage('Nueva password inválida')
];

/* 4. Middleware que comprueba resultados */
exports.check = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};


/* 5. Validación de edición de perfil */
exports.profileRules = [
  body('telefono'      ).optional().matches(/^\d{8}$/ ).withMessage('Teléfono 8 dígitos'),
  body('identificacion').optional().matches(/^\d{9}$/ ).withMessage('Cédula 9 dígitos'),
  body('foto_url'      ).optional().isURL().withMessage('URL de la foto inválida')
];
