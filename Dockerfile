# Stage 1: Dependencias (incluyendo devDependencies para build y tests)
# ----------------------
FROM node:22-alpine AS deps
WORKDIR /app
# Copia solo los manifiestos primero para aprovechar la caché de capas:
# si el código cambia pero package.json no, Docker reutiliza esta capa
COPY package*.json ./
# npm ci instala exactamente lo que dice package-lock.json (sin resolver versiones)
# garantiza builds reproducibles en cualquier entorno
RUN npm ci

# Stage 2: Test
# ----------------------
FROM node:22-alpine AS tester
WORKDIR /app
# Reutiliza node_modules del stage anterior en lugar de reinstalar
COPY --from=deps /app/node_modules ./node_modules/
# Copia el código fuente (separado del COPY anterior para optimizar caché)
COPY . .
# Si los tests fallan, Docker detiene aquí y no continúa con el build
RUN npm run test

# Stage 3: Build (extiende tester — los tests deben pasar antes de compilar)
# ----------------------
FROM tester AS builder
# Genera el bundle de producción en dist/trivial/browser/
RUN npm run build

# Stage 4: Servidor estático
# ----------------------
# Imagen final: solo nginx + los archivos estáticos, sin Node ni node_modules
FROM nginx:stable-alpine AS production
WORKDIR /usr/share/nginx/html
# Copia únicamente el output compilado (HTML/CSS/JS), descartando todo lo anterior
COPY --from=builder /app/dist/trivial/browser .
# Usa una plantilla en lugar de nginx.conf directa para permitir variables de entorno en tiempo de arranque
COPY nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 80
