FROM node:20-alpine

WORKDIR /usr/src/app

# Instalar dependencias de compilación
RUN apk --no-cache add --virtual .build-deps python3 make g++

# Instalar dependencias de la aplicación
COPY package*.json ./
RUN npm install

# Copiar el código fuente
COPY . .

# Exponer el puerto
EXPOSE 3004

# Comando para desarrollo con recarga en caliente
CMD ["npm", "run", "dev"]
