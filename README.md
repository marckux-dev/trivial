# Trivial

Juego de preguntas y respuestas estilo trivial con 6 categorías y 5 niveles de dificultad. Construido con Angular 21 (standalone, signals, zoneless).

---

## Reglas del juego

1. **Elige dificultad** — selecciona un nivel del 1 al 5, o "Todos" para mezclar todos los niveles.
2. **Elige categoría** — pulsa una de las 6 casillas de colores.
3. **Lee la pregunta** — cuando estés listo, pulsa para revelar la respuesta.
4. **Vuelve al selector** — elige otra categoría para continuar.

El juego evita repetir preguntas: lleva un registro de las ya mostradas por categoría y solo reinicia el ciclo cuando se han visto todas las disponibles del nivel seleccionado.

### Niveles de dificultad

| Nivel | Descripción | Equivalencia |
|-------|-------------|--------------|
| ★☆☆☆☆ | Muy fácil | Cultura general básica |
| ★★☆☆☆ | Fácil | ESO media |
| ★★★☆☆ | Media | 4.º de ESO finalizado |
| ★★★★☆ | Difícil | Bachillerato finalizado |
| ★★★★★ | Muy difícil | Estudiante universitario |

### Categorías

| Color | Categoría |
|-------|-----------|
| 🟢 Verde | Ciencias y Naturaleza |
| 🔵 Azul | Geografía |
| 🩷 Rosa | Entretenimiento |
| 🟡 Amarillo | Historia |
| 🟣 Morado | Arte y Literatura |
| 🟠 Naranja | Deportes y Pasatiempos |

---

## Desarrollo

### Requisitos

- Node.js 22+
- Angular CLI (`npm install -g @angular/cli`)

### Levantar en local

```bash
npm install
ng serve
```

La aplicación queda disponible en `http://localhost:4200`. Los cambios en el código recargan el navegador automáticamente.

### Tests

```bash
ng test
```

Ejecuta los tests con [Vitest](https://vitest.dev/) en entorno `happy-dom`. Para un único pase sin watcher:

```bash
ng test --watch=false
```

### Build de producción

```bash
ng build
```

El bundle generado queda en `dist/trivial/browser/`.

---

## Producción con Docker

### Build y arranque local

```bash
docker build -t trivial .
docker run -p 8080:80 -e PORT=80 trivial
```

La aplicación queda disponible en `http://localhost:8080`.

El `Dockerfile` tiene 4 stages:

| Stage | Base | Qué hace |
|-------|------|----------|
| `deps` | `node:22-alpine` | Instala dependencias (`npm ci`) |
| `tester` | `node:22-alpine` | Ejecuta los tests — si fallan, el build se detiene |
| `builder` | extiende `tester` | Compila el bundle de producción |
| `production` | `nginx:stable-alpine` | Sirve los estáticos; no contiene Node ni `node_modules` |

### Con docker-compose

```bash
docker-compose up
```

Expone la aplicación en el puerto `8080`.

---

## Despliegue en Railway

El proyecto se despliega automáticamente en [Railway](https://railway.app) mediante el fichero `railway.toml`, que usa el `Dockerfile` como builder.

Railway inyecta la variable de entorno `PORT` en tiempo de arranque. La configuración de nginx usa una plantilla (`nginx.conf`) que sustituye `${PORT}` al iniciar el contenedor, por lo que no es necesario modificar nada para distintos entornos.

**Pasos para desplegar:**

1. Conecta el repositorio a un proyecto en Railway.
2. Railway detecta `railway.toml` y construye la imagen automáticamente en cada push a `main`.
3. El healthcheck apunta a `/` con un timeout de 30 segundos.

---

## Estructura del proyecto

```
trivial/
├── public/
│   └── data/                  # Banco de preguntas (JSON estáticos)
│       ├── science.json
│       ├── geography.json
│       ├── entertainment.json
│       ├── history.json
│       ├── art.json
│       └── sports.json
├── src/
│   └── app/
│       ├── models/
│       │   └── question.model.ts      # Interfaces Question y Category; array CATEGORIES
│       ├── services/
│       │   └── game.service.ts        # Estado global con signals; carga, filtrado y rotación de preguntas
│       └── components/
│           ├── difficulty-selector/   # Pantalla inicial — elige nivel 0-5
│           ├── category-selector/     # Selector de categoría con dado 3D animado
│           └── question-card/         # Muestra pregunta → revela respuesta
├── Dockerfile                 # Multi-stage: deps → tester → builder → nginx
├── nginx.conf                 # Plantilla nginx; soporta ${PORT} de Railway
├── railway.toml               # Configuración de despliegue en Railway
└── docker-compose.yml         # Arranque local en puerto 8080
```

### Flujo de rutas

```
/            DifficultySelectorComponent   — elige dificultad
/play        CategorySelectorComponent     — elige categoría
/question    QuestionCardComponent         — pregunta y respuesta
```

### Añadir preguntas

Edita el fichero JSON correspondiente en `public/data/`. Cada entrada sigue este formato:

```json
{ "id": 999, "question": "¿...?", "answer": "...", "difficulty": 3 }
```

`difficulty` debe estar entre 1 y 5. El `id` debe ser único dentro del fichero.
