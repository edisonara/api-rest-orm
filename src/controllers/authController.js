const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Eliminar la contraseña de la salida
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Verificar si el email y la contraseña existen
  if (!email || !password) {
    return next(new AppError('Por favor ingresa tu correo y contraseña', 400));
  }

  // 2) Verificar si el usuario existe y la contraseña es correcta
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Correo o contraseña incorrectos', 401));
  }

  // 3) Si todo está bien, enviar el token al cliente
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Obtener el token y verificar si existe
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('No estás autenticado. Por favor inicia sesión para obtener acceso.', 401)
    );
  }

  // 2) Verificar el token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Verificar si el usuario aún existe
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('El usuario perteneciente a este token ya no existe.', 401)
    );
  }

  // 4) Verificar si el usuario cambió la contraseña después de que se emitió el token
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('El usuario cambió recientemente su contraseña. Por favor inicia sesión de nuevo.', 401)
    );
  }

  // CONCEDE ACCESO A LA RUTA PROTEGIDA
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('No tienes permiso para realizar esta acción', 403)
      );
    }

    next();
  };
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Obtener el usuario de la colección
  const user = await User.findById(req.user.id).select('+password');

  // 2) Verificar si la contraseña actual es correcta
  if (!(await user.comparePassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Tu contraseña actual es incorrecta.', 401));
  }

  // 3) Si es así, actualizar la contraseña
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Iniciar sesión del usuario, enviar JWT
  createSendToken(user, 200, res);
});
