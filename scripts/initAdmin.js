const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

// Configurar variables de entorno
const path = require('path');
const envPath = path.join(__dirname, '..', 'config.env');
console.log('Cargando variables de entorno desde:', envPath);
dotenv.config({ path: envPath });

// Verificar variables de entorno
console.log('MONGO_URI:', process.env.MONGO_URI ? '*** URI configurada ***' : 'No configurada');

// Datos del administrador
const adminData = {
  name: 'Admin',
  email: 'admin@example.com',
  password: 'admin123',
  passwordConfirm: 'admin123',
  role: 'admin',
  active: true
};

// Función para conectar a la base de datos
const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/user_management';
    console.log('Conectando a MongoDB con URI:', MONGO_URI.replace(/:([^:]*?)@/, ':***@'));
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Conexión a MongoDB establecida');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  }
};

// Función para crear el usuario administrador
const createAdmin = async () => {
  try {
    // Verificar si ya existe un administrador
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Ya existe un usuario administrador:');
      console.log(`- ID: ${existingAdmin._id}`);
      console.log(`- Email: ${existingAdmin.email}`);
      console.log(`- Rol: ${existingAdmin.role}`);
      return;
    }
    
    // Crear el nuevo administrador
    const admin = await User.create(adminData);
    
    console.log('Usuario administrador creado exitosamente:');
    console.log(`- ID: ${admin._id}`);
    console.log(`- Email: ${admin.email}`);
    console.log(`- Rol: ${admin.role}`);
    
  } catch (error) {
    console.error('Error al crear el administrador:', error);
  } finally {
    // Cerrar la conexión
    await mongoose.connection.close();
  }
};

// Ejecutar el script
(async () => {
  try {
    await connectDB();
    await createAdmin();
    process.exit(0);
  } catch (error) {
    console.error('Error en el script:', error);
    process.exit(1);
  }
})();
