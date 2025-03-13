# Usamos la imagen oficial de Node.js
FROM node:18

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto de la aplicación
COPY . .

# Exponemos el puerto en el que corre la API
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "app.js"]