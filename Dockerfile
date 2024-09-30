# Usa la imagen de Node.js
FROM node:18-alpine

# Establecer el directorio de trabajo
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# Copia el package.json y el package-lock.json al contenedor
COPY package.json ./
COPY package-lock.json ./

# Instala las dependencias
RUN npm cache clean --force && npm install --legacy-peer-deps

# Copiar el resto del código de la aplicación
COPY . .

# Compila la aplicación NestJS (compila TypeScript a JavaScript)
RUN npm run build

# Exponer el puerto en el que corre la aplicación NestJS
EXPOSE 3000

# Comando por defecto para correr la aplicación
CMD ["npm", "run", "start:prod"]