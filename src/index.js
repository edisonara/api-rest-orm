const express = require('express');
require('dotenv').config();
const connectDB = require('./db');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use('/api', userRoutes);

// Start server after DB connection tested
(async () => {
  await connectDB();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
})();
