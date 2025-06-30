const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Obtener todos los usuarios
router.get('/', userController.getAllUsers);

// Operaciones CRUD en usuarios
router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

// Ruta para obtener el perfil del usuario actual
router.get('/me', userController.getMe);

// Actualizar datos del usuario actual
router.patch('/update-me', userController.updateMe);

// Eliminar la cuenta del usuario actual
router.delete('/delete-me', userController.deleteMe);

module.exports = router;
