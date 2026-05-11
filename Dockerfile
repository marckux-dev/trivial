# Stage 1: Test y build
# ----------------------
FROM node:22-bullseye AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run test
RUN npm run build

# Stage 2: Servidor estático
# ----------------------
FROM nginx:stable-alpine AS production

WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist/trivial/browser .
COPY nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 80

