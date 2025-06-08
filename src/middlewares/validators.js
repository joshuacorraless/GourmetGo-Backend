const { validationResult, body } = require('express-validator');


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




/* A. Reglas de registro para USER - acaaaaaaaaaaaa */
exports.registerUserRules = [
  body('nombre').notEmpty(),
  body('correo').isEmail(),
  body('telefono').matches(/^\d{8}$/),
  body('identificacion').matches(/^\d{9}$/),
  body('contrasena').matches(/^(?=(?:.*[A-Za-z]){6})(?=(?:.*\d){4})(?=.*\.)[A-Za-z\d\.]{11}$/),
  body('foto_url').isURL(),
  body('preferencias').optional().isLength({ max: 255 })
];

/* B. Reglas de registro para CHEF/RESTAURANT */
exports.registerChefRules = [
  body('nombre').notEmpty(),
  body('contacto').notEmpty(),
  body('correo').isEmail(),
  body('telefono').matches(/^\d{8}$/),
  body('ubicacion').notEmpty(),        // enlace de Maps o dirección
  body('tipo_cocina').notEmpty(),
  body('contrasena').matches(/^(?=(?:.*[A-Za-z]){6})(?=(?:.*\d){4})(?=.*\.)[A-Za-z\d\.]{11}$/),
  body('foto_url').isURL()
];

/* C. Reglas de edición genéricas: USER o CHEF */
exports.profileUserRules = [
  body('telefono').optional().matches(/^\d{8}$/),
  body('identificacion').optional().matches(/^\d{9}$/),
  body('foto_url').optional().isURL(),
  body('preferencias').optional().isLength({ max:255 })
];

exports.profileChefRules = [
  body('contacto').optional().notEmpty(),
  body('telefono').optional().matches(/^\d{8}$/),
  body('ubicacion').optional().notEmpty(),
  body('tipo_cocina').optional().notEmpty(),
  body('foto_url').optional().isURL()
];













/* 6. Validación de creación / edición de experiencia */
exports.experienceRules = [
  body('nombre').notEmpty().withMessage('Nombre requerido'),
  body('descripcion').notEmpty(),
  body('fecha_hora').isISO8601().withMessage('Fecha inválida')
     .custom(v => new Date(v) >= new Date()).withMessage('Fecha debe ser futura'),
  body('ubicacion').matches(
    /^https:\/\/(?:www\.)?(?:google\.[^\/]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps).*$/i
  ).withMessage('Debe ser URL de Google Maps'),

  body('capacidad').isInt({ min: 1 }).withMessage('Capacidad > 0'),
  body('precio').isFloat({ min: 1 }).withMessage('Precio > 0'),
  body('duracion_h').isFloat({ min: 0.1 })
  .withMessage('Duración (horas) requerida y > 0')

];





exports.experienceUpdateRules = [
  body('nombre').optional().notEmpty(),
  body('descripcion').optional().notEmpty(),
  body('fecha_hora').optional().isISO8601()
       .withMessage('Fecha inválida')
       .custom(v => new Date(v) >= new Date())
       .withMessage('Fecha debe ser futura'),
  body('ubicacion').optional().matches(
        /^https:\/\/(?:www\.)?(?:google\.[^\/]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps).*$/i
  ).withMessage('Debe ser URL de Google Maps'),
  body('capacidad').optional().isInt({ min: 1 }),
  body('duracion_h').isFloat({ min: 0.1 })
  .withMessage('Duración (horas) requerida y > 0'),

  body('precio').optional().isFloat({ min: 1 })
];


/* 7. Reglas de reserva */
exports.reservationRules = [
  body('experience_id').isInt({ min: 1 }),
  body('nombre_entrada').notEmpty(),
  body('correo_entrada').isEmail(),
  body('telefono_entry').matches(/^\d{8}$/),
  body('cantidad').isInt({ min: 1 }),
  body('metodo_pago').isIn(['Lugar', 'Transferencia'])
                      .withMessage('Método debe ser Lugar o Transferencia')
];



/* 8. Reglas de rating */
exports.ratingRules = [
  body('reservation_id').isInt({ min: 1 }),
  body('puntuacion').isInt({ min: 1, max: 5 })
                     .withMessage('Puntuación debe estar entre 1 y 5'),
  body('comentario').optional().isLength({ max: 500 })
];
