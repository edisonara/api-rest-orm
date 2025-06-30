const app = require('./src/app');
const port = process.env.PORT || 3003; // Forzar puerto 3003

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
