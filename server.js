const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./src/app');

// Cargar variables de entorno
dotenv.config({ path: './config.env' });

const port = process.env.PORT || 3004; // Forzar puerto 3004

// Conectar a la base de datos
console.log('Conectando a la base de datos...');
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Conectado a MongoDB exitosamente'))
  .catch((err) => {
    console.error('❌ Error conectando a MongoDB:', err.message);
    process.exit(1);
  });

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en el puerto ${port}...`);
});

// Manejo de errores de servidor
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Error: El puerto ${port} ya está en uso.`);
    console.log('Por favor, cierra otras instancias o usa un puerto diferente.');
  } else {
    console.error('Error al iniciar el servidor:', error);
  }
  process.exit(1);
});

// Manejo de cierre del proceso
process.on('SIGINT', () => {
  console.log('\nDeteniendo el servidor...');
  server.close(() => {
    console.log('Servidor detenido.');
    process.exit(0);
  });
});
