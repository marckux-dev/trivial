# AGENTS.md

## Estado actual del proyecto

Aplicación de trivial hecha con Angular 21 usando componentes standalone y estado local con signals. El proyecto no muestra backend: las preguntas se sirven como assets estáticos desde `public/data/`.

## Comandos útiles

```bash
npm start
npm run build
npm test
```

Equivalentes definidos en `package.json`:
- `start` → `ng serve`
- `build` → `ng build`
- `test` → `ng test`

## Estructura funcional

- `src/app/app.ts`
  Carga todas las preguntas al iniciar llamando a `GameService.loadAll()`.
- `src/app/services/game.service.ts`
  Servicio principal del juego. Mantiene:
  - `difficulty`
  - `currentCategory`
  - `currentQuestion`
  - `showingAnswer`
  - `loaded`
  También guarda pools de preguntas barajadas por categoría y evita repeticiones con `usedIndexes`.
- `src/app/app.routes.ts`
  Flujo de navegación:
  - `/` selector de dificultad
  - `/play` selector de categoría
  - `/question` tarjeta de pregunta/respuesta

## Modelo de datos

Archivo: `src/app/models/question.model.ts`

Cada pregunta sigue este formato:

```ts
{ id: number, question: string, answer: string, difficulty: number }
```

Restricciones actuales:
- `difficulty` usa niveles `1` a `5`
- `0` solo existe en UI/estado como valor especial para “todas”
- los JSON de categorías son arrays planos
- conviene mantener ids correlativos por archivo

## Categorías y fuentes

Los datos viven en `public/data/`:

- `science.json` → Ciencias y Naturaleza
- `geography.json` → Geografía
- `entertainment.json` → Entretenimiento
- `history.json` → Historia
- `art.json` → Arte y Literatura
- `sports.json` → Deportes y Pasatiempos

## Cambio reciente importante

El estado actual de los datos en `public/data/` es este:

- `art.json` → `930` preguntas
- `entertainment.json` → `930` preguntas
- `geography.json` → `930` preguntas
- `history.json` → `930` preguntas
- `science.json` → `930` preguntas
- `sports.json` → `930` preguntas

Verificación realizada sobre los seis archivos:
- JSON válido
- ids correlativos del `1` al `930` en cada categoría
- dificultades presentes `1` a `5` en todos los bancos

## Comportamiento actual del juego

- Al elegir dificultad, se reinician los índices usados por categoría.
- Al entrar en una categoría, se escoge una pregunta aleatoria del pool filtrado.
- Si se agotan las preguntas disponibles de una categoría para la dificultad actual, el servicio limpia el registro de usadas y vuelve a reutilizar el pool.
- Si una categoría no tiene preguntas para la dificultad elegida, `currentQuestion` queda en `null`.

## Puntos a vigilar en próximos cambios

- No hay tests visibles específicos para integridad de datos o equilibrio por dificultad.
- `loadAll()` solo carga una vez por sesión mientras `loaded` sea `true`.
- El barajado actual usa `sort(() => Math.random() - 0.5)`, suficiente para este proyecto pero no ideal si se quiere consistencia o aleatoriedad más controlada.
- Aunque el tamaño total por categoría está equilibrado, sigue sin haber validación automática visible sobre reparto interno por dificultad o calidad de contenido.
