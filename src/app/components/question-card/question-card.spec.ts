import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { QuestionCardComponent } from './question-card';
import { GameService } from '../../services/game.service';
import { CATEGORIES, type Category, type Question } from '../../models/question.model';

const SCIENCE: Category = CATEGORIES[0];

const SAMPLE_QUESTION: Question = {
  id: 1,
  question: '¿Cuál es la fórmula del agua?',
  answer: 'H2O',
  difficulty: 2,
};

function createMockGame(overrides: {
  category?: Category | null;
  question?: Question | null;
  showingAnswer?: boolean;
  difficulty?: number;
} = {}) {
  return {
    currentCategory: signal<Category | null>(overrides.category ?? null),
    currentQuestion: signal<Question | null>(overrides.question ?? null),
    showingAnswer: signal(overrides.showingAnswer ?? false),
    difficulty: signal(overrides.difficulty ?? 0),
    revealAnswer: vi.fn(),
    loadAll: vi.fn(),
  };
}

describe('QuestionCardComponent', () => {
  let fixture: ComponentFixture<QuestionCardComponent>;
  let mockGame: ReturnType<typeof createMockGame>;
  let router: Router;

  async function setup(overrides: Parameters<typeof createMockGame>[0] = {}) {
    mockGame = createMockGame(overrides);

    await TestBed.configureTestingModule({
      imports: [QuestionCardComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: GameService, useValue: mockGame },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionCardComponent);
    router = TestBed.inject(Router);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  // ─── Sin categoría seleccionada ───────────────────────────────────────────

  describe('sin categoría seleccionada', () => {
    beforeEach(async () => setup({ category: null }));

    it('muestra "Sin categoría seleccionada"', () => {
      const root: HTMLElement = fixture.nativeElement;
      expect(root.textContent).toContain('Sin categoría seleccionada');
    });

    it('muestra el botón Volver', () => {
      const root: HTMLElement = fixture.nativeElement;
      const btn = root.querySelector('.back-btn') as HTMLButtonElement;
      expect(btn).not.toBeNull();
      expect(btn.textContent).toContain('Volver');
    });

    it('no muestra la tarjeta de pregunta', () => {
      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('.card-body')).toBeNull();
    });
  });

  // ─── Con categoría y pregunta ──────────────────────────────────────────────

  describe('con categoría y pregunta', () => {
    beforeEach(async () =>
      setup({ category: SCIENCE, question: SAMPLE_QUESTION, showingAnswer: false })
    );

    it('muestra el nombre de la categoría en el encabezado', () => {
      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('.cat-name')?.textContent).toContain(SCIENCE.name);
    });

    it('aplica el color de fondo de la categoría al encabezado', () => {
      const root: HTMLElement = fixture.nativeElement;
      const header = root.querySelector<HTMLElement>('.card-header');
      expect(header?.style.background).toBe(SCIENCE.bgColor);
    });

    it('muestra el texto de la pregunta', () => {
      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('.question-text')?.textContent).toContain(
        SAMPLE_QUESTION.question
      );
    });

    it('muestra el botón "Ver respuesta" cuando aún no se ha revelado', () => {
      const root: HTMLElement = fixture.nativeElement;
      const btn = root.querySelector('.reveal-btn') as HTMLButtonElement;
      expect(btn).not.toBeNull();
      expect(btn.textContent).toContain('Ver respuesta');
    });

    it('no muestra la respuesta ni el botón "Siguiente pregunta" antes de revelar', () => {
      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('.answer-section')).toBeNull();
      expect(root.querySelector('.back-btn')).toBeNull();
    });
  });

  // ─── Revelar respuesta ─────────────────────────────────────────────────────

  describe('al revelar la respuesta', () => {
    it('llama a game.revealAnswer al pulsar "Ver respuesta"', async () => {
      await setup({ category: SCIENCE, question: SAMPLE_QUESTION, showingAnswer: false });
      const root: HTMLElement = fixture.nativeElement;

      (root.querySelector('.reveal-btn') as HTMLButtonElement).click();
      await fixture.whenStable();

      expect(mockGame.revealAnswer).toHaveBeenCalledTimes(1);
    });

    it('muestra la respuesta cuando showingAnswer es true', async () => {
      await setup({ category: SCIENCE, question: SAMPLE_QUESTION, showingAnswer: true });
      const root: HTMLElement = fixture.nativeElement;

      expect(root.querySelector('.answer-text')?.textContent).toContain(SAMPLE_QUESTION.answer);
    });

    it('muestra el botón "Siguiente pregunta" cuando showingAnswer es true', async () => {
      await setup({ category: SCIENCE, question: SAMPLE_QUESTION, showingAnswer: true });
      const root: HTMLElement = fixture.nativeElement;

      const btn = root.querySelector('.back-btn') as HTMLButtonElement;
      expect(btn).not.toBeNull();
      expect(btn.textContent).toContain('Siguiente pregunta');
    });

    it('oculta "Ver respuesta" cuando showingAnswer es true', async () => {
      await setup({ category: SCIENCE, question: SAMPLE_QUESTION, showingAnswer: true });
      const root: HTMLElement = fixture.nativeElement;

      expect(root.querySelector('.reveal-btn')).toBeNull();
    });

    it('pasa de pregunta a respuesta al actualizar el signal showingAnswer', async () => {
      await setup({ category: SCIENCE, question: SAMPLE_QUESTION, showingAnswer: false });
      const root: HTMLElement = fixture.nativeElement;

      expect(root.querySelector('.reveal-btn')).not.toBeNull();

      mockGame.showingAnswer.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(root.querySelector('.reveal-btn')).toBeNull();
      expect(root.querySelector('.answer-text')).not.toBeNull();
    });
  });

  // ─── Navegar de vuelta ─────────────────────────────────────────────────────

  describe('navegación de vuelta a categorías', () => {
    it('navega a /play desde el botón Volver (sin categoría)', async () => {
      await setup({ category: null });
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      const root: HTMLElement = fixture.nativeElement;

      (root.querySelector('.back-btn') as HTMLButtonElement).click();
      await fixture.whenStable();

      expect(navigateSpy).toHaveBeenCalledWith(['/play']);
    });

    it('navega a /play desde "Siguiente pregunta"', async () => {
      await setup({ category: SCIENCE, question: SAMPLE_QUESTION, showingAnswer: true });
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      const root: HTMLElement = fixture.nativeElement;

      (root.querySelector('.back-btn') as HTMLButtonElement).click();
      await fixture.whenStable();

      expect(navigateSpy).toHaveBeenCalledWith(['/play']);
    });

    it('navega a /play desde el botón Volver (sin preguntas disponibles)', async () => {
      await setup({ category: SCIENCE, question: null });
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      const root: HTMLElement = fixture.nativeElement;

      (root.querySelector('.back-btn') as HTMLButtonElement).click();
      await fixture.whenStable();

      expect(navigateSpy).toHaveBeenCalledWith(['/play']);
    });
  });

  // ─── Sin preguntas disponibles ─────────────────────────────────────────────

  describe('sin preguntas disponibles para el nivel', () => {
    beforeEach(async () => setup({ category: SCIENCE, question: null }));

    it('muestra el mensaje de no disponibilidad', () => {
      const root: HTMLElement = fixture.nativeElement;
      expect(root.textContent).toContain('No hay preguntas disponibles');
    });

    it('muestra el botón Volver', () => {
      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('.back-btn')).not.toBeNull();
    });

    it('no muestra el texto de pregunta', () => {
      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('.question-text')).toBeNull();
    });
  });

  // ─── Badge de dificultad ───────────────────────────────────────────────────

  describe('badge de nivel', () => {
    it('no muestra badge cuando difficulty es 0', async () => {
      await setup({ category: SCIENCE, question: SAMPLE_QUESTION, difficulty: 0 });
      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('.badge')).toBeNull();
    });

    it('muestra badge con el nivel cuando difficulty > 0', async () => {
      await setup({ category: SCIENCE, question: SAMPLE_QUESTION, difficulty: 3 });
      const root: HTMLElement = fixture.nativeElement;
      const badge = root.querySelector('.badge') as HTMLElement;
      expect(badge).not.toBeNull();
      expect(badge.textContent).toContain('3');
    });
  });
});
