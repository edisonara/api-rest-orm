const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

// Función para crear token JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secreto-temporal', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  });
};

// Registro de usuario
exports.signup = catchAsync(async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;
  
  // Validaciones básicas
  if (!name || !email || !password || !passwordConfirm) {
    return res.status(400).json({
      status: 'error',
      message: 'Todos los campos son obligatorios'
    });
  }
  
  if (password !== passwordConfirm) {
    return res.status(400).json({
      status: 'error',
      message: 'Las contraseñas no coinciden'
    });
  }
  
  // Verificar si el usuario ya existe
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      status: 'error',
      message: 'Ya existe un usuario con este correo electrónico'
    });
  }
  
  // Crear el nuevo usuario (todos los usuarios nuevos son 'user' por defecto)
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role: 'user' // Rol por defecto
  });
  
  // Generar token JWT
  const token = signToken(newUser._id);
  
  // No enviar la contraseña en la respuesta
  newUser.password = undefined;
  
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

// Inicio de sesión
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Verificar si se proporcionó email y contraseña
  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Por favor ingresa tu correo y contraseña'
    });
  }

  // Buscar usuario por email
  const user = await User.findOne({ email }).select('+password');

  // Verificar si el usuario existe y la contraseña es correcta
  if (!user || !(await user.comparePassword(password, user.password))) {
    return res.status(401).json({
      status: 'error',
      message: 'Correo o contraseña incorrectos'
    });
  }

  // Generar token JWT
  const token = signToken(user._id);
  
  // No enviar la contraseña en la respuesta
  user.password = undefined;

  // Enviar respuesta exitosa
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});

// Cerrar sesión (simbólico, ya que JWT es stateless)
exports.logout = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Sesión cerrada correctamente'
  });
};

// Middleware para proteger rutas (opcional, si lo necesitas más adelante)
exports.protect = catchAsync(async (req, res, next) => {
  // Implementación básica de protección de rutas
  // Puedes personalizarla según tus necesidades
  next();
});
