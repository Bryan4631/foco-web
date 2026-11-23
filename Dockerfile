# syntax=docker/dockerfile:1
# Imagen de produccion del frontend de Foco: compila la SPA con Vite y la sirve con Nginx.
#
#   docker build --build-arg VITE_API_URL=https://apifoco.frubilarz.cl/api/v1 -t foco-web .
#   docker run -d -p 4109:80 --name foco-web foco-web
#
# VITE_API_URL se fija en tiempo de build (Vite la incrusta en el bundle), por eso es un ARG.
# Etapa opcional de lint (la usa Jenkins): docker build --target lint .

ARG NODE_VERSION=22
ARG NGINX_VERSION=1.27

FROM docker.io/library/node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM deps AS lint
COPY . .
RUN npm run lint

FROM deps AS build
COPY . .
ARG VITE_API_URL=https://apifoco.frubilarz.cl/api/v1
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM docker.io/library/nginx:${NGINX_VERSION}-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health >/dev/null || exit 1
