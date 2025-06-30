const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Valor inválido ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Valor duplicado: ${value}. Por favor usa otro valor.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Datos de entrada inválidos. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Token inválido. Por favor inicia sesión de nuevo!', 401);

const handleJWTExpiredError = () =>
  new AppError('Tu sesión ha expirado! Por favor inicia sesión de nuevo.', 401);

const sendErrorDev = (err, req, res) => {
  // Siempre devolvemos JSON
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

const sendErrorProd = (err, req, res) => {
  // A) Operacional, error de confianza: enviar mensaje al cliente
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  
  // B) Error de programación o desconocido: no enviar detalles al cliente
  // 1) Log error
  console.error('ERROR 💥', err);
  
  // 2) Enviar mensaje genérico
  return res.status(500).json({
    status: 'error',
    message: '¡Algo salió muy mal!',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
