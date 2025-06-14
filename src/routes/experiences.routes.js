const express   = require('express');
const router    = express.Router();
const ctrl      = require('../controllers/experiences.controller');
const verifyJwt = require('../middlewares/authJwt');
const roleChef  = require('../middlewares/roleChef');
const v         = require('../middlewares/validators');

/* Públicas */
router.get('/',        ctrl.getAll);
router.get('/:id',     ctrl.getById);
router.post('/filtrar',        ctrl.getFiltered);
router.get('/:chefId', experiencesController.getByChef);

/* Protegidas (CHEF) */
router.post('/',
  verifyJwt, roleChef,
  v.experienceRules, v.check,
  ctrl.create
);

router.put('/:id',
  verifyJwt,
  roleChef,
  v.experienceUpdateRules,
  v.check,
  ctrl.update
);


router.post('/:id/request-delete',
  verifyJwt, roleChef,
  ctrl.requestDelete
);

router.delete('/:id',
  verifyJwt, roleChef,
  ctrl.remove
);

module.exports = router;
