const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

// Inicializar la aplicación Express
const app = express();

// Configuración de variables de entorno
require('dotenv').config({ path: './config.env' });

// Configuración de CORS
app.use((req, res, next) => {
  // Permitir solicitudes desde el frontend
  const allowedOrigins = ['http://localhost:3001', 'http://localhost:3000'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  // Configuración de encabezados permitidos
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Expires');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Manejar solicitudes preflight
  if (req.method === 'OPTIONS') {
    // Responder inmediatamente a las solicitudes OPTIONS
    res.header('Access-Control-Max-Age', '86400'); // 24 horas
    return res.status(200).end();
  }
  
  next();
});

// Middleware para analizar JSON
app.use(express.json({ limit: '10kb' }));

// Middleware para analizar texto plano
app.use(express.text({ type: '*/*', limit: '10kb' }));

// Middleware para analizar datos de formularios
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Middleware para registrar solicitudes (solo para depuración)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', req.body);
  next();
});

// Middleware para analizar datos de formularios
app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
  parameterLimit: 10000
}));

// Middleware para analizar el cuerpo de las solicitudes JSON
app.use((req, res, next) => {
  // Solo analizar como JSON si el Content-Type es application/json
  if (req.headers['content-type'] === 'application/json') {
    express.json({
      limit: '10mb',
      strict: false,
      verify: (req, res, buf, encoding) => {
        try {
          JSON.parse(buf.toString(encoding || 'utf8'));
          req.rawBody = buf.toString(encoding || 'utf8');
        } catch (e) {
          console.error('Error al analizar JSON:', e);
          throw new Error('Formato JSON inválido');
        }
      }
    })(req, res, next);
  } else {
    next();
  }
});

// Middleware para analizar cookies
app.use(cookieParser(process.env.JWT_SECRET));

// Middleware para asegurar que req.cookies siempre esté definido
app.use((req, res, next) => {
  if (!req.cookies) {
    req.cookies = {};
  }
  next();
});

// Middleware para registrar las solicitudes entrantes
app.use((req, res, next) => {
  const start = Date.now();
  
  // Hacer una copia de la función original de envío de respuesta
  const originalSend = res.send;
  
  // Interceptar la respuesta para registrar los detalles
  res.send = function(body) {
    const responseTime = Date.now() - start;
    
    console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${responseTime}ms)`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    
    // Registrar el cuerpo de la solicitud si existe
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    
    // Registrar el cuerpo de la respuesta si existe y es un objeto
    try {
      const jsonResponse = typeof body === 'string' ? JSON.parse(body) : body;
      console.log('Response:', JSON.stringify(jsonResponse, null, 2));
    } catch (e) {
      // Si no es JSON, mostrarlo como texto
      if (body) {
        console.log('Response:', body.toString().substring(0, 500) + (body.length > 500 ? '...' : ''));
      }
    }
    
    console.log('Content-Type:', res.get('Content-Type'));
    console.log('Status Code:', res.statusCode);
    
    // Llamar a la función original de envío
    return originalSend.apply(res, arguments);
  };
  
  next();
});



// Middleware para asegurar que req.cookies siempre esté definido
app.use((req, res, next) => {
  if (!req.cookies) {
    req.cookies = {};
  }
  next();
});

// Middleware para parsear el cuerpo de las solicitudes JSON y URL-encoded
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Middleware para parsear cookies
app.use(cookieParser(process.env.JWT_SECRET));

// Middleware para agregar el usuario a la respuesta local
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// ============================================
// RUTAS DE LA API
// ============================================

// Ruta de bienvenida
app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Bienvenido a la API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        logout: 'GET /api/auth/logout',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'PATCH /api/auth/reset-password/:token',
        updatePassword: 'PATCH /api/auth/update-password'
      },
      users: {
        getMe: 'GET /api/users/me',
        updateMe: 'PATCH /api/users/update-me',
        deleteMe: 'DELETE /api/users/delete-me'
      }
    }
  });
});

// Rutas de autenticación (públicas)
app.use('/api/auth', require('./routes/authRoutes'));

// Rutas de usuarios (algunas requieren autenticación)
app.use('/api/users', require('./routes/userRoutes'));

// Ruta para manejar rutas no encontradas
app.all('*', (req, res, next) => {
  next(new AppError(`No se pudo encontrar ${req.originalUrl} en este servidor.`, 404));
});

// Manejador de errores global
app.use(globalErrorHandler);

// Conexión a MongoDB
const DB_URI = process.env.MONGO_URI;

if (!DB_URI) {
  console.error('Error: MONGO_URI no está definido en las variables de entorno');  process.exit(1);
}

console.log('Conectando a la base de datos...');

mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log('Conexión a la base de datos exitosa!'))
  .catch((err) => {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1);
  });

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
