const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      },
      message: 'Por favor ingresa un correo electrónico válido'
    }
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No devolver la contraseña en las consultas
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Por favor confirma tu contraseña'],
    validate: {
      // Esto solo funciona en CREATE y SAVE!!!
      validator: function(el) {
        return el === this.password;
      },
      message: 'Las contraseñas no coinciden'
    }
  },
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware para hashear la contraseña antes de guardar
UserSchema.pre('save', async function(next) {
  // Solo ejecutar esta función si la contraseña fue modificada
  if (!this.isModified('password')) return next();
  
  // Eliminar el campo passwordConfirm ya que no lo necesitamos en la base de datos
  this.passwordConfirm = undefined;
  
  try {
    // Generar un salt
    const salt = await bcrypt.genSalt(10);
    // Hashear la contraseña junto con el nuevo salt
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now() - 1000; // Asegura que el token se cree después
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware para filtrar usuarios inactivos en las consultas
UserSchema.pre(/^find/, function(next) {
  // this apunta a la consulta actual
  this.find({ active: { $ne: false } });
  next();
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Verificar si la contraseña fue cambiada después de que se emitió el token
UserSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False significa que NO fue cambiada
  return false;
};

module.exports = mongoose.model('User', UserSchema);
