const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

// Inicializar la aplicación Express
const app = express();

// Configuración de variables de entorno
require('dotenv').config({ path: './config.env' });

// Middleware para analizar el cuerpo de las solicitudes
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Configuración de CORS
app.use(cors());
app.options('*', cors());

// Rutas
app.use('/api', userRoutes);

// Manejo de rutas no encontradas
app.all('*', (req, res, next) => {
  next(new AppError(`No se pudo encontrar ${req.originalUrl} en este servidor!`, 404));
});

// Manejador de errores global
app.use(globalErrorHandler);

// Conexión a MongoDB
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log('Conexión a la base de datos exitosa!'))
  .catch((err) => console.error('Error al conectar a la base de datos:', err));

// Iniciar el servidor
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto ${port}...`);
});

// Manejo de errores no manejados
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Apagando...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECIBIDO. Apagando correctamente');
  server.close(() => {
    console.log('💥 Proceso terminado');
  });
});

module.exports = app;
