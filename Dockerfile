# ====== Etapa 1: Build Angular ======
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
# No tocamos tus deps locales (nvm). En contenedor, resolvemos peers con flag.
RUN npm ci --legacy-peer-deps

COPY . .
# Usa tu script de build existente (SSR/Prerender si lo tienes configurado)
RUN npm run build

# ====== Etapa 2: NGINX estático con inyección de variables ======
FROM nginx:stable-alpine

# Config de NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos TODO el dist (incluye /browser y /server y archivos raíz)
COPY --from=build /app/dist/ms-app-web /usr/share/nginx/html

# ▶ Inyección de variables en runtime: generamos assets/env.js
# Colocamos el template en la carpeta correcta (browser/assets)
COPY env.template.js /usr/share/nginx/html/browser/assets/env.template.js

# Script que se ejecuta automáticamente al arrancar NGINX en esta imagen
COPY docker-entrypoint.sh /docker-entrypoint.d/10-gen-env.sh
# Convert line endings to be compatible with Linux
RUN sed -i 's/\r$//' /docker-entrypoint.d/10-gen-env.sh
RUN chmod +x /docker-entrypoint.d/10-gen-env.sh

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
