import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { CategorySelectorComponent } from './category-selector';
import { GameService } from '../../services/game.service';
import { CATEGORIES } from '../../models/question.model';

function createMockGame(overrides: Partial<{ loadedValue: boolean; difficultyValue: number }> = {}) {
  return {
    difficulty: signal(overrides.difficultyValue ?? 0),
    loaded: signal(overrides.loadedValue ?? true),
    categories: CATEGORIES,
    selectCategory: vi.fn(),
    loadAll: vi.fn(),
  };
}

describe('CategorySelectorComponent', () => {
  let fixture: ComponentFixture<CategorySelectorComponent>;
  let mockGame: ReturnType<typeof createMockGame>;
  let router: Router;

  async function setup(overrides: Parameters<typeof createMockGame>[0] = {}) {
    mockGame = createMockGame(overrides);

    await TestBed.configureTestingModule({
      imports: [CategorySelectorComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: GameService, useValue: mockGame },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategorySelectorComponent);
    router = TestBed.inject(Router);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  // ─── Estructura del componente ─────────────────────────────────────────────

  describe('estructura', () => {
    beforeEach(async () => setup());

    it('muestra el encabezado "Elige una categoría"', () => {
      const root: HTMLElement = fixture.nativeElement;
      const h2 = root.querySelector('h2') as HTMLElement;
      expect(h2.textContent).toContain('Elige una categoría');
    });

    it('muestra el botón de cambio de dificultad', () => {
      const root: HTMLElement = fixture.nativeElement;
      const btn = root.querySelector('.diff-btn') as HTMLButtonElement;
      expect(btn).not.toBeNull();
    });

    it('muestra la etiqueta de dificultad "Todas" para nivel 0', () => {
      const root: HTMLElement = fixture.nativeElement;
      const btn = root.querySelector('.diff-btn') as HTMLButtonElement;
      expect(btn.textContent).toContain('Todas');
    });
  });

  // ─── Estado de carga ───────────────────────────────────────────────────────

  describe('estado de carga', () => {
    it('muestra el mensaje de carga mientras loaded es false', async () => {
      await setup({ loadedValue: false });
      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('.loading')).not.toBeNull();
      expect(root.querySelector('.cat-btn')).toBeNull();
    });

    it('muestra los botones de categoría cuando loaded es true', async () => {
      await setup({ loadedValue: true });
      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('.loading')).toBeNull();
      expect(root.querySelectorAll('.cat-btn').length).toBe(6);
    });

    it('pasa del estado de carga a mostrar categorías al actualizar loaded', async () => {
      await setup({ loadedValue: false });
      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('.loading')).not.toBeNull();

      mockGame.loaded.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(root.querySelector('.loading')).toBeNull();
      expect(root.querySelectorAll('.cat-btn').length).toBe(6);
    });
  });

  // ─── Botones de categoría ──────────────────────────────────────────────────

  describe('botones de categoría', () => {
    beforeEach(async () => setup());

    it('renderiza exactamente 6 botones de categoría', () => {
      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelectorAll('.cat-btn').length).toBe(6);
    });

    it('aplica el color de fondo correcto a cada botón', () => {
      const root: HTMLElement = fixture.nativeElement;
      const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('.cat-btn'));
      buttons.forEach((btn, i) => {
        expect(btn.style.background).toBe(CATEGORIES[i].bgColor);
      });
    });

    it('muestra el nombre de cada categoría', () => {
      const root: HTMLElement = fixture.nativeElement;
      const names = Array.from(root.querySelectorAll('.cat-name')).map(
        el => (el as HTMLElement).textContent?.trim()
      );
      expect(names).toContain('Ciencias y Naturaleza');
      expect(names).toContain('Geografía');
      expect(names).toContain('Entretenimiento');
      expect(names).toContain('Historia');
      expect(names).toContain('Arte y Literatura');
      expect(names).toContain('Deportes y Pasatiempos');
    });
  });

  // ─── Interacción: seleccionar categoría ───────────────────────────────────

  describe('al seleccionar una categoría', () => {
    beforeEach(async () => setup());

    it('llama a game.selectCategory con la categoría correcta', async () => {
      vi.spyOn(router, 'navigate').mockResolvedValue(true);
      const root: HTMLElement = fixture.nativeElement;

      const buttons = root.querySelectorAll('.cat-btn');
      (buttons[0] as HTMLButtonElement).click();
      await fixture.whenStable();

      expect(mockGame.selectCategory).toHaveBeenCalledWith(CATEGORIES[0]);
    });

    it('navega a /question', async () => {
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      const root: HTMLElement = fixture.nativeElement;

      const buttons = root.querySelectorAll('.cat-btn');
      (buttons[2] as HTMLButtonElement).click();
      await fixture.whenStable();

      expect(navigateSpy).toHaveBeenCalledWith(['/question']);
    });
  });

  // ─── Interacción: cambiar dificultad ──────────────────────────────────────

  describe('al cambiar la dificultad', () => {
    beforeEach(async () => setup());

    it('navega a / al pulsar el botón de cambio de dificultad', async () => {
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      const root: HTMLElement = fixture.nativeElement;

      const btn = root.querySelector<HTMLButtonElement>('.diff-btn')!;
      btn.click();
      await fixture.whenStable();

      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
  });

  // ─── Etiqueta de dificultad ────────────────────────────────────────────────

  describe('etiqueta de dificultad', () => {
    const cases = [
      { value: 0, label: 'Todas' },
      { value: 1, label: '1' },
      { value: 3, label: '3' },
      { value: 5, label: '5' },
    ];

    for (const { value, label } of cases) {
      it(`muestra "${label}" para difficulty=${value}`, async () => {
        await setup({ difficultyValue: value });
        const root: HTMLElement = fixture.nativeElement;
        const btn = root.querySelector('.diff-btn') as HTMLButtonElement;
        expect(btn.textContent).toContain(label);
      });
    }
  });
});
