const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta de prueba para verificar que las rutas estén funcionando
router.get('/signup', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Ruta GET /signup funcionando. Usa POST para registrar un nuevo usuario.'
  });
});

// Rutas de autenticación públicas
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Exportar el enrutador
module.exports = router;
