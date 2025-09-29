# Etapa de build
FROM node:20-alpine AS build

# Instalar pnpm globalmente
RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos de dependencias primero
COPY frontend/package.json frontend/pnpm-lock.yaml ./

# Instalar dependencias (sin modificar lockfile)
RUN pnpm install --frozen-lockfile

# Copiar el código fuente (excluyendo node_modules)
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/*.json frontend/*.ts frontend/*.js frontend/*.html ./

# Construir la app
RUN pnpm run build

# Etapa de producción con Nginx
FROM nginx:stable-alpine

# Copiar archivos compilados
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]