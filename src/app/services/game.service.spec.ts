import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { GameService } from './game.service';
import { CATEGORIES, type Question } from '../models/question.model';

const Q = (id: number, difficulty: number): Question => ({
  id,
  question: `Pregunta ${id}`,
  answer: `Respuesta ${id}`,
  difficulty,
});

const POOL_3 = [Q(1, 1), Q(2, 2), Q(3, 3)];
const POOL_MIXED = [Q(1, 1), Q(2, 1), Q(3, 3), Q(4, 5)];

function flushLoad(http: HttpTestingController, pools: Question[][] = []) {
  const reqs = http.match(req => req.url.startsWith('data/'));
  reqs.forEach((r, i) => r.flush(pools[i] ?? []));
}

function loadWith(service: GameService, http: HttpTestingController, sciencePool: Question[]) {
  service.loadAll();
  flushLoad(http, [sciencePool]);
}

describe('GameService', () => {
  let service: GameService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(GameService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  // ─── Estado inicial ────────────────────────────────────────────────────────

  describe('estado inicial', () => {
    it('difficulty es 0', () => {
      expect(service.difficulty()).toBe(0);
    });

    it('loaded es false', () => {
      expect(service.loaded()).toBe(false);
    });

    it('currentCategory es null', () => {
      expect(service.currentCategory()).toBeNull();
    });

    it('currentQuestion es null', () => {
      expect(service.currentQuestion()).toBeNull();
    });

    it('showingAnswer es false', () => {
      expect(service.showingAnswer()).toBe(false);
    });

    it('availableCount es 0', () => {
      expect(service.availableCount()).toBe(0);
    });

    it('categories expone las 6 categorías', () => {
      expect(service.categories).toHaveLength(6);
    });
  });

  // ─── setDifficulty ────────────────────────────────────────────────────────

  describe('setDifficulty', () => {
    it('actualiza el signal difficulty', () => {
      service.setDifficulty(3);
      expect(service.difficulty()).toBe(3);
    });

    it('acepta 0 como "todas las dificultades"', () => {
      service.setDifficulty(3);
      service.setDifficulty(0);
      expect(service.difficulty()).toBe(0);
    });

    it('después de cambiar dificultad, selectCategory sigue dando preguntas', () => {
      loadWith(service, http, POOL_3);
      service.setDifficulty(0);
      service.selectCategory(CATEGORIES[0]);
      expect(service.currentQuestion()).not.toBeNull();
    });
  });

  // ─── loadAll ─────────────────────────────────────────────────────────────

  describe('loadAll', () => {
    it('realiza exactamente 6 peticiones HTTP', () => {
      service.loadAll();
      const reqs = http.match(req => req.url.startsWith('data/'));
      expect(reqs).toHaveLength(6);
      reqs.forEach(r => r.flush([]));
    });

    it('solicita las URLs correctas de los 6 archivos JSON', () => {
      service.loadAll();
      const reqs = http.match(req => req.url.startsWith('data/'));
      const urls = new Set(reqs.map(r => r.request.url));
      expect(urls.has('data/science.json')).toBe(true);
      expect(urls.has('data/geography.json')).toBe(true);
      expect(urls.has('data/entertainment.json')).toBe(true);
      expect(urls.has('data/history.json')).toBe(true);
      expect(urls.has('data/art.json')).toBe(true);
      expect(urls.has('data/sports.json')).toBe(true);
      reqs.forEach(r => r.flush([]));
    });

    it('establece loaded en true al completar la carga', () => {
      service.loadAll();
      flushLoad(http);
      expect(service.loaded()).toBe(true);
    });

    it('no emite nuevas peticiones si ya está cargado', () => {
      service.loadAll();
      flushLoad(http);
      service.loadAll();
      http.expectNone(() => true);
    });
  });

  // ─── revealAnswer ─────────────────────────────────────────────────────────

  describe('revealAnswer', () => {
    it('establece showingAnswer en true', () => {
      service.revealAnswer();
      expect(service.showingAnswer()).toBe(true);
    });
  });

  // ─── selectCategory ───────────────────────────────────────────────────────

  describe('selectCategory', () => {
    beforeEach(() => loadWith(service, http, POOL_3));

    it('establece currentCategory', () => {
      service.selectCategory(CATEGORIES[0]);
      expect(service.currentCategory()).toEqual(CATEGORIES[0]);
    });

    it('resetea showingAnswer a false', () => {
      service.revealAnswer();
      service.selectCategory(CATEGORIES[0]);
      expect(service.showingAnswer()).toBe(false);
    });

    it('asigna una pregunta del pool a currentQuestion', () => {
      service.selectCategory(CATEGORIES[0]);
      const q = service.currentQuestion();
      expect(q).not.toBeNull();
      expect(POOL_3).toContainEqual(q);
    });

    it('devuelve null si la categoría no tiene preguntas cargadas', () => {
      service.selectCategory(CATEGORIES[1]); // geography — pool vacío
      expect(service.currentQuestion()).toBeNull();
    });

    it('no repite preguntas hasta agotar el pool', () => {
      const seen = new Set<number>();
      for (let i = 0; i < POOL_3.length; i++) {
        service.selectCategory(CATEGORIES[0]);
        seen.add(service.currentQuestion()!.id);
      }
      expect(seen.size).toBe(POOL_3.length);
    });

    it('reinicia el ciclo cuando se agotan todas las preguntas', () => {
      for (let i = 0; i < POOL_3.length; i++) {
        service.selectCategory(CATEGORIES[0]);
      }
      service.selectCategory(CATEGORIES[0]);
      expect(service.currentQuestion()).not.toBeNull();
    });

    it('permite cambiar de categoría manteniendo estados independientes', () => {
      loadWith(service, http, POOL_3); // second load would no-op, but we need sci loaded already

      service.selectCategory(CATEGORIES[0]);
      const qSci = service.currentQuestion();

      // categories[1] pool is empty so question is null — valid independent state
      service.selectCategory(CATEGORIES[1]);
      expect(service.currentQuestion()).toBeNull();
      expect(service.currentCategory()).toEqual(CATEGORIES[1]);

      // Back to science: retains independent used-index history
      service.selectCategory(CATEGORIES[0]);
      expect(service.currentQuestion()).not.toBeNull();
    });
  });

  // ─── availableCount ───────────────────────────────────────────────────────

  describe('availableCount', () => {
    it('es 0 cuando no hay categoría seleccionada', () => {
      loadWith(service, http, POOL_3);
      expect(service.availableCount()).toBe(0);
    });

    it('con difficulty=0 devuelve el total de preguntas del pool', () => {
      loadWith(service, http, POOL_3);
      service.setDifficulty(0);
      service.selectCategory(CATEGORIES[0]);
      expect(service.availableCount()).toBe(POOL_3.length);
    });

    it('con difficulty específica devuelve solo las de ese nivel', () => {
      loadWith(service, http, POOL_MIXED);
      service.setDifficulty(1);
      service.selectCategory(CATEGORIES[0]);
      const expected = POOL_MIXED.filter(q => q.difficulty === 1).length;
      expect(service.availableCount()).toBe(expected);
    });

    it('se actualiza al cambiar difficulty', () => {
      loadWith(service, http, POOL_MIXED);
      service.setDifficulty(0);
      service.selectCategory(CATEGORIES[0]);
      const countAll = service.availableCount();

      service.setDifficulty(1);
      const countFiltered = service.availableCount();

      expect(countFiltered).toBeLessThan(countAll);
    });
  });

  // ─── Filtrado por dificultad ───────────────────────────────────────────────

  describe('filtrado por dificultad', () => {
    beforeEach(() => loadWith(service, http, POOL_MIXED));

    it('difficulty=0 permite obtener preguntas', () => {
      service.setDifficulty(0);
      service.selectCategory(CATEGORIES[0]);
      expect(service.currentQuestion()).not.toBeNull();
    });

    it('difficulty=1 devuelve únicamente preguntas de nivel 1', () => {
      service.setDifficulty(1);
      const level1count = POOL_MIXED.filter(q => q.difficulty === 1).length;
      const seen = new Set<number>();
      for (let i = 0; i < level1count; i++) {
        service.selectCategory(CATEGORIES[0]);
        if (service.currentQuestion()) seen.add(service.currentQuestion()!.id);
      }
      for (const id of seen) {
        expect(POOL_MIXED.find(q => q.id === id)!.difficulty).toBe(1);
      }
    });

    it('difficulty=5 devuelve únicamente preguntas de nivel 5', () => {
      service.setDifficulty(5);
      service.selectCategory(CATEGORIES[0]);
      expect(service.currentQuestion()?.difficulty).toBe(5);
    });

    it('difficulty sin coincidencias deja currentQuestion en null', () => {
      service.setDifficulty(2); // no hay nivel 2 en POOL_MIXED
      service.selectCategory(CATEGORIES[0]);
      expect(service.currentQuestion()).toBeNull();
    });
  });
});
