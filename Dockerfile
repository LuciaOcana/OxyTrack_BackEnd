# Usamos Node LTS
FROM node:20

# Creamos el directorio de la app
WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos todo el código
COPY . .

# Compilamos TypeScript
RUN npm run build
#RUN node --max-old-space-size=4096 node_modules/.bin/tsc


# Puerto que expondrá la app
EXPOSE 3000

# Comando para iniciar
#CMD ["npm", "start"]
CMD ["node", "build/index.js"]

