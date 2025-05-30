/* Permite acceso sólo a usuarios con rol CHEF (o  o RESTAURANT) */
module.exports = (req, res, next) => {
   if (
req.user &&
['CHEF', 'RESTAURANT', 'ADMIN'].includes(req.user.rol)
) {
     return next();
   }
   return res.status(403).json({ msg: 'Requiere rol de chef o restaurante' });
};