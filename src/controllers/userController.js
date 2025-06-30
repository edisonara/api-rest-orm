const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Función para filtrar los campos que no están permitidos actualizar
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-__v -password -passwordChangedAt');
  
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

// Middleware para obtener el ID del usuario actual
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-__v -password -passwordChangedAt');
  
  if (!user) {
    return next(new AppError('No se encontró ningún usuario con ese ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  // 1) Filtrar datos no permitidos
  const filteredBody = filterObj(req.body, 'name', 'email', 'password');
  
  // 2) Crear el usuario
  const newUser = await User.create(filteredBody);
  
  // 3) Eliminar la contraseña de la respuesta
  newUser.password = undefined;
  
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  // 1) Verificar si el usuario existe
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('No se encontró ningún usuario con ese ID', 404));
  }
  
  // 2) Filtrar campos no permitidos
  const filteredBody = filterObj(req.body, 'name', 'email');
  
  // 3) Actualizar el documento del usuario
  const updatedUser = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    return next(new AppError('No se encontró ningún usuario con ese ID', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Actualizar los datos del usuario actual
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Crear un error si el usuario intenta actualizar la contraseña
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Esta ruta no es para actualizar contraseñas. Por favor usa /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtrar campos no permitidos
  const filteredBody = filterObj(req.body, 'name', 'email');
  
  // 3) Actualizar el documento del usuario
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Eliminar la cuenta del usuario actual (desactivar)
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Controlador para que los usuarios actualicen su propia contraseña
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Obtener el usuario del documento
  const user = await User.findById(req.user.id).select('+password');
  
  // 2) Verificar si la contraseña actual es correcta
  if (!(await user.comparePassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Tu contraseña actual es incorrecta', 401));
  }
  
  // 3) Si es correcta, actualizar la contraseña
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  
  // 4) Iniciar sesión del usuario, enviar JWT
  const token = signToken(user._id);
  
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});
