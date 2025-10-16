# ====== Etapa 1: Build Angular ======
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Si tu script de build es "ng build" ya configurado a prod, déjalo:
RUN npm run build

# ====== Etapa 2: NGINX estático con inyección de variables ======
FROM nginx:stable-alpine

# Config de NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos el build
COPY --from=build /app/dist/ms-app-web /usr/share/nginx/html

# ▶ Archivos para generar env.js desde una variable de entorno en runtime
#   - el script en /docker-entrypoint.d/* se ejecuta automáticamente
COPY env.template.js /usr/share/nginx/html/assets/env.template.js
COPY docker-entrypoint.sh /docker-entrypoint.d/10-gen-env.sh
RUN chmod +x /docker-entrypoint.d/10-gen-env.sh

EXPOSE 8080
# Usamos el CMD por defecto de la imagen de nginx (o este)
CMD ["nginx", "-g", "daemon off;"]
