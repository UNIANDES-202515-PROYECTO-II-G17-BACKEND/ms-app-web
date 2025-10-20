# ====== Etapa 1: Build Angular ======
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# ====== Etapa 2: NGINX estático con inyección de variables ======
FROM nginx:stable-alpine

# Habilita sustitución automática de variables
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d
ENV PORT=8080

# Elimina el default.conf por defecto de NGINX
RUN rm -f /etc/nginx/conf.d/default.conf

# Copiamos tu plantilla a la carpeta que NGINX transformará
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copiamos los archivos generados por Angular
COPY --from=build /app/dist/ms-app-web /usr/share/nginx/html

# Inyección de variables en runtime: generamos assets/env.js
COPY env.template.js /usr/share/nginx/html/browser/assets/env.template.js

COPY docker-entrypoint.sh /docker-entrypoint.d/10-gen-env.sh
RUN sed -i 's/\r$//' /docker-entrypoint.d/10-gen-env.sh && chmod +x /docker-entrypoint.d/10-gen-env.sh

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
