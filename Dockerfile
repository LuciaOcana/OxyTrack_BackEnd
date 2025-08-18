# 1. Imagen base con Node
FROM node:20.19.2

# 2. Crear carpeta de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiar package.json y package-lock.json
COPY package*.json ./

# 4. Instalar dependencias
RUN npm install

# 5. Copiar todo el código al contenedor
COPY . .

# 6. Exponer el puerto que usará tu app
EXPOSE 5000

# 7. Comando para iniciar tu app ini
CMD ["npm", "start"]
