# ====== Etapa 1: Build Angular (SSR build genera /browser y /server) ======
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# ====== Etapa 2: NGINX estático con inyección de variables ======
FROM nginx:stable-alpine

# Puerto por defecto local; en Cloud Run llega por env PORT
ENV PORT=8080

# Limpia la conf por defecto y deja nuestra plantilla
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
# Copia adicional para el generador manual (parche a prueba de fallos)
COPY nginx.conf.template /etc/nginx/default.conf.template

# Copiamos TODO el dist; usaremos /browser como root
COPY --from=build /app/dist/ms-app-web /usr/share/nginx/html

# Inyección de variables de runtime -> /browser/assets/env.js
COPY env.template.js /usr/share/nginx/html/browser/assets/env.template.js

# Entrypoints: 10 = genera env.js, 20 = genera default.conf con ${PORT}
COPY docker-entrypoint.sh /docker-entrypoint.d/10-gen-env.sh
COPY 20-gen-nginx-conf.sh /docker-entrypoint.d/20-gen-nginx-conf.sh
RUN chmod +x /docker-entrypoint.d/10-gen-env.sh /docker-entrypoint.d/20-gen-nginx-conf.sh && \
    sed -i 's/\r$//' /docker-entrypoint.d/10-gen-env.sh /docker-entrypoint.d/20-gen-nginx-conf.sh

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
