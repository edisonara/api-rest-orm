const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Cargar variables de entorno desde el archivo .env
dotenv.config({ path: './config.env' });

console.log('Intentando conectar a MongoDB con URI:', process.env.MONGO_URI);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado a MongoDB exitosamente');
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err.message);
    console.error('URI utilizada:', process.env.MONGO_URI);
    process.exit(1);
  }
};

module.exports = connectDB;
