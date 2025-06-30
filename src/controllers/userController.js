const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

// Función para filtrar los campos permitidos
const filterObj = (obj, ...allowedFields) => {
  const filteredObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) filteredObj[el] = obj[el];
  });
  return filteredObj;
};

// Obtener todos los usuarios
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find().select('-__v -password -passwordChangedAt');
  
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

// Obtener el perfil del usuario actual
exports.getMe = catchAsync(async (req, res) => {
  // Obtener el primer usuario como ejemplo
  const user = await User.findOne().select('-__v -password -passwordChangedAt');
  
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'No se encontró el perfil del usuario'
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Obtener un usuario por ID
exports.getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).select('-__v -password -passwordChangedAt');
  
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'No se encontró ningún usuario con ese ID'
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Crear un nuevo usuario
exports.createUser = catchAsync(async (req, res) => {
  // Filtrar datos permitidos
  const filteredBody = filterObj(req.body, 'name', 'email', 'password', 'passwordConfirm');
  
  // Crear el usuario
  const newUser = await User.create(filteredBody);
  
  // No enviar la contraseña en la respuesta
  newUser.password = undefined;
  
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
});

// Actualizar un usuario
exports.updateUser = catchAsync(async (req, res) => {
  // Filtrar campos permitidos
  const filteredBody = filterObj(req.body, 'name', 'email');
  
  // Actualizar el usuario
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true
    }
  ).select('-__v -password -passwordChangedAt');

  if (!updatedUser) {
    return res.status(404).json({
      status: 'error',
      message: 'No se encontró ningún usuario con ese ID'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Eliminar un usuario
exports.deleteUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'No se encontró ningún usuario con ese ID'
    });
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Actualizar el perfil del usuario actual
exports.updateMe = catchAsync(async (req, res) => {
  // Filtrar campos permitidos
  const filteredBody = filterObj(req.body, 'name', 'email');
  
  // Actualizar el usuario (usando el primer usuario como ejemplo)
  const user = await User.findOne();
  
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'No se encontró el usuario'
    });
  }
  
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    filteredBody,
    {
      new: true,
      runValidators: true
    }
  ).select('-__v -password -passwordChangedAt');

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Eliminar la cuenta del usuario actual
exports.deleteMe = catchAsync(async (req, res) => {
  // Usar el primer usuario como ejemplo
  const user = await User.findOne();
  
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'No se encontró el usuario'
    });
  }
  
  await User.findByIdAndDelete(user._id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
