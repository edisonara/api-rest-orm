<div align="center">
  <h1 align="center">📡 API REST con Node.js</h1>
  <p align="center">
    <strong>API RESTful moderna para gestión de usuarios</strong>
    <br />
    <br />
    <a href="#características-">Características</a> •
    <a href="#instalación-">Instalación</a> •
    <a href="#documentación-">Documentación</a> •
    <a href="#endpoints-">Endpoints</a> •
    <a href="#despliegue-">Despliegue</a>
  </p>
  
  <p align="center">
    <a href="#">
      <img src="https://img.shields.io/badge/Node.js-18.x-brightgreen" alt="Node.js Version" />
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/Express-4.x-lightgrey" alt="Express Version" />
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/MongoDB-5.0+-47A248" alt="MongoDB Version" />
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" />
    </a>
  </p>
</div>

## 🚀 Características

## 🚀 Características

- Autenticación JWT
- Roles de usuario (admin, user)
- Operaciones CRUD para usuarios
- Validación de datos
- Manejo de errores centralizado
- Seguridad mejorada (helmet, rate limiting, sanitización)
- Documentación con Swagger
- Variables de entorno

## 🛠️ Tecnologías

<div align="center">
  <img src="https://img.icons8.com/color/48/000000/nodejs.png" alt="Node.js" title="Node.js" width="40" height="40"/>
  <img src="https://img.icons8.com/color/48/000000/express-js.png" alt="Express" title="Express" width="40" height="40"/>
  <img src="https://img.icons8.com/color/48/000000/mongodb.png" alt="MongoDB" title="MongoDB" width="40" height="40"/>
  <img src="https://img.icons8.com/color/48/000000/json-web-token.png" alt="JWT" title="JWT" width="40" height="40"/>
  <img src="https://img.icons8.com/color/48/000000/swagger.png" alt="Swagger" title="Swagger" width="40" height="40"/>
  <img src="https://img.icons8.com/color/48/000000/docker.png" alt="Docker" title="Docker" width="40" height="40"/>
</div>

## 📦 Dependencias principales

- Express - Framework web para Node.js
- Mongoose - ODM para MongoDB
- jsonwebtoken - Para autenticación JWT
- bcryptjs - Para hashing de contraseñas
- cors - Para habilitar CORS
- dotenv - Para manejar variables de entorno
- express-mongo-sanitize - Para prevenir inyección NoSQL
- helmet - Para seguridad HTTP
- hpp - Para prevenir contaminación de parámetros HTTP
- xss-clean - Para prevenir ataques XSS
- express-rate-limit - Para limitar peticiones

## 🚀 Empezando

### Requisitos previos

- Node.js 14+
- MongoDB 4.4+
- npm 6+ o yarn

### 🔧 Instalación

1. Clona el repositorio
   ```bash
   git clone [url-del-repositorio]
   cd api-rest-orm
   ```

2. Instala las dependencias
   ```bash
   npm install
   ```

3. Configura las variables de entorno
   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```env
   NODE_ENV=development
   PORT=3004
   DATABASE=mongodb://localhost:27017/nombre_basededatos
   DATABASE_PASSWORD=tu_contraseña
   JWT_SECRET=tu_jwt_secreto
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90
   ```

4. Inicia el servidor en desarrollo
   ```bash
   npm run dev
   ```

   O para producción:
   ```bash
   npm start
   ```

## 📚 Documentación

### API Documentation

La documentación interactiva de la API está disponible usando Swagger UI cuando la aplicación está en ejecución:

<div align="center">
  <img src="https://raw.githubusercontent.com/swagger-api/swagger-ui/master/dist/favicon-32x32.png" alt="Swagger" width="20"/> <strong>Swagger UI:</strong> <code>http://localhost:3004/api-docs</code>
  <br>
  <img src="https://www.json.org/img/json160.gif" alt="JSON" width="20"/> <strong>Esquema JSON:</strong> <code>http://localhost:3004/api-docs.json</code>
</div>

### Ejemplo de petición

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

### Respuesta exitosa

```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "5f8d0a4b7f8f8b2b7c3b3b3b",
      "name": "Usuario Ejemplo",
      "email": "usuario@ejemplo.com",
      "role": "user"
    }
  }
}
```

Una vez que el servidor esté en ejecución, puedes acceder a la documentación de la API en:

- **Swagger UI**: `http://localhost:3004/api-docs`
- **Documentación JSON**: `http://localhost:3004/api-docs.json`

## 🔌 Endpoints

### Autenticación

| Método | Endpoint | Descripción | Autenticación requerida |
|--------|----------|-------------|-------------------------|
| POST   | `/api/v1/auth/signup` | Registrar nuevo usuario | No |
| POST   | `/api/v1/auth/login` | Iniciar sesión | No |
| GET    | `/api/v1/auth/logout` | Cerrar sesión | Sí |
| POST   | `/api/v1/auth/forgot-password` | Solicitar restablecimiento | No |
| PATCH  | `/api/v1/auth/reset-password/:token` | Restablecer contraseña | No |

### Usuarios

| Método | Endpoint | Descripción | Rol requerido |
|--------|----------|-------------|----------------|
| GET    | `/api/v1/users` | Obtener todos los usuarios | admin |
| GET    | `/api/v1/users/me` | Obtener mi perfil | user |
| PATCH  | `/api/v1/users/update-me` | Actualizar mi perfil | user |
| DELETE | `/api/v1/users/delete-me` | Eliminar mi cuenta | user |
| GET    | `/api/v1/users/:id` | Obtener usuario por ID | admin |
| PATCH  | `/api/v1/users/:id` | Actualizar usuario | admin |
| DELETE | `/api/v1/users/:id` | Eliminar usuario | admin |

### Autenticación
- `POST /api/v1/auth/signup` - Registrar un nuevo usuario
- `POST /api/v1/auth/login` - Iniciar sesión
- `GET /api/v1/auth/logout` - Cerrar sesión
- `POST /api/v1/auth/forgot-password` - Solicitar restablecimiento de contraseña
- `PATCH /api/v1/auth/reset-password/:token` - Restablecer contraseña
- `PATCH /api/v1/auth/update-password` - Actualizar contraseña (requiere autenticación)

### Usuarios
- `GET /api/v1/users` - Obtener todos los usuarios (solo admin)
- `GET /api/v1/users/me` - Obtener mi perfil
- `PATCH /api/v1/users/update-me` - Actualizar mi perfil
- `DELETE /api/v1/users/delete-me` - Eliminar mi cuenta
- `GET /api/v1/users/:id` - Obtener un usuario por ID (solo admin)
- `PATCH /api/v1/users/:id` - Actualizar un usuario (solo admin)
- `DELETE /api/v1/users/:id` - Eliminar un usuario (solo admin)

## 🛡️ Seguridad

### Características de seguridad implementadas

- 🔒 **Autenticación JWT** con expiración
- 🔄 **Renovación automática** de tokens
- 🛡️ **Protección contra ataques** comunes:
  - Inyección NoSQL
  - XSS (Cross-Site Scripting)
  - Contaminación de parámetros HTTP
  - Fuerza bruta (rate limiting)
- 🔐 **Headers de seguridad** con Helmet
- 🔄 **CORS** configurado de forma segura
- 🍪 **Cookies HTTP-Only** para tokens

### Buenas prácticas

- Contraseñas hasheadas con **bcrypt**
- Validación de entrada en todos los endpoints
- Manejo centralizado de errores
- Logging de actividades importantes
- Variables de entorno para datos sensibles

- Contraseñas hasheadas con bcrypt
- Protección contra ataques XSS
- Prevención de inyección NoSQL
- Headers de seguridad con Helmet
- Rate limiting
- CORS habilitado
- Cookies HTTPOnly para JWT

## 🧪 Testing

### Ejecutar pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm test -- --watch

# Generar cobertura de código
npm run test:coverage
```

### Estructura de pruebas

```
tests/
├── integration/    # Pruebas de integración
├── unit/          # Pruebas unitarias
└── utils/         # Utilidades para pruebas
```

### Tecnologías de testing

- Jest - Framework de pruebas
- Supertest - Para pruebas de API
- MongoDB Memory Server - Para pruebas con base de datos en memoria

Para ejecutar las pruebas:

```bash
npm test
```

## 🛠️ Variables de entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|------------------|
| NODE_ENV | Entorno de ejecución | development |
| PORT | Puerto del servidor | 3004 |
| DATABASE | URL de conexión a MongoDB | - |
| JWT_SECRET | Secreto para firmar los JWT | - |
| JWT_EXPIRES_IN | Tiempo de expiración del JWT | 90d |
| JWT_COOKIE_EXPIRES_IN | Días de expiración de la cookie | 90 |
| EMAIL_HOST | Servidor SMTP | - |
| EMAIL_PORT | Puerto del servidor SMTP | - |
| EMAIL_USERNAME | Usuario SMTP | - |
| EMAIL_PASSWORD | Contraseña SMTP | - |
| EMAIL_FROM | Correo remitente | - |

## 🚀 Despliegue

### Opción 1: Despliegue local

1. Clona el repositorio
   ```bash
   git clone https://github.com/tu-usuario/api-rest-orm.git
   cd api-rest-orm
   ```

2. Instala dependencias
   ```bash
   npm install
   ```

3. Configura las variables de entorno
   ```bash
   cp .env.example .env
   # Edita el archivo .env con tus configuraciones
   ```

4. Inicia el servidor
   ```bash
   # Modo desarrollo
   npm run dev
   
   # Modo producción
   npm start
   ```

### Opción 2: Usando Docker

```bash
# Construir la imagen
docker build -t api-rest-orm .

# Ejecutar el contenedor
docker run -p 3004:3004 --env-file .env -d api-rest-orm
```

### Opción 3: Plataformas en la nube

[![Deploy on Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/tu-usuario/api-rest-orm)
[![Deploy on Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/tu-usuario/api-rest-orm)

### Requisitos previos
- Node.js (v14+)
- MongoDB
- NPM o Yarn

### Pasos para producción
1. Configura todas las variables de entorno necesarias
2. Instala las dependencias con `npm install --production`
3. Ejecuta `npm run build` si es necesario
4. Inicia la aplicación con `npm start`

## 👥 Contribución

¡Las contribuciones son bienvenidas! Por favor sigue estos pasos:

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guía de estilo de código

- Usa 2 espacios para la indentación
- Sigue el estándar de JavaScript
- Documenta tu código con JSDoc
- Escribe pruebas para nuevas funcionalidades

### Reportar problemas

Si encuentras algún error o tienes una sugerencia, por favor [crea un issue](https://github.com/tu-usuario/api-rest-orm/issues/new/choose).

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.

## ✨ Reconocimientos

- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/)
- [Swagger](https://swagger.io/)

## 📧 Contacto

**Tu Nombre** - [@tuusuario](https://twitter.com/tuusuario) - correo@ejemplo.com

🔗 **URL del proyecto:** [https://github.com/tu-usuario/api-rest-orm](https://github.com/tu-usuario/api-rest-orm)

<p align="right">
  <a href="#top">⬆️ Volver al inicio</a>
</p>

---

<div align="center">
  <sub>Creado con ❤️ por <a href="#">Tu Nombre</a></sub>
</div>
