// eslint-disable-next-line no-unused-vars
function errorHandler (err, req, res, next) {
  console.error('💥  Error:', err);
  res.status(err.status || 500).json({
    msg: err.message || 'Error interno del servidor'
  });
}

module.exports = errorHandler;
