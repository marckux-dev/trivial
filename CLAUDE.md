# CLAUDE.md

## Commands

```bash
ng serve          # Dev server at http://localhost:4200
ng build          # Production build → dist/trivial/browser/
```

## Architecture

### Data

Questions live in `public/data/` (one JSON per category, served as static assets):

| File | Category | Color |
|---|---|---|
| `science.json` | Ciencias y Naturaleza | Verde |
| `geography.json` | Geografía | Azul |
| `entertainment.json` | Entretenimiento | Rosa |
| `history.json` | Historia | Amarillo |
| `art.json` | Arte y Literatura | Morado |
| `sports.json` | Deportes y Pasatiempos | Naranja |

Each question: `{ id, question, answer, difficulty }` where `difficulty` is 1–5.

### State management

`GameService` (signal-based, providedIn root) holds all game state:
- `difficulty` signal — 0 means "all levels", 1-5 filters by exact level
- `currentCategory` / `currentQuestion` / `showingAnswer` signals
- `questionPools` Map: shuffled on load, per-category
- `usedIndexes` Map: prevents repeats; resets when all questions in a pool are used

### Routing

| Path | Component |
|---|---|
| `/` | `DifficultySelectorComponent` — pick level 0-5 |
| `/play` | `CategorySelectorComponent` — pick a color/category |
| `/question` | `QuestionCardComponent` — question → reveal answer → back |

### Adding questions

Add items to the relevant JSON file in `public/data/`. Keep `difficulty` between 1 and 5.
