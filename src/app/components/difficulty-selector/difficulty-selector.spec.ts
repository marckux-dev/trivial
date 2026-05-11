import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DifficultySelectorComponent } from './difficulty-selector';
import { GameService } from '../../services/game.service';

describe('DifficultySelectorComponent', () => {
  let fixture: ComponentFixture<DifficultySelectorComponent>;
  let gameService: GameService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DifficultySelectorComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DifficultySelectorComponent);
    gameService = TestBed.inject(GameService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renderiza el título de la aplicación', () => {
    const root: HTMLElement = fixture.nativeElement;
    const h1 = root.querySelector('h1') as HTMLElement;
    expect(h1.textContent).toBe('Trivial');
  });

  it('renderiza los 6 botones de dificultad', () => {
    const root: HTMLElement = fixture.nativeElement;
    const buttons = root.querySelectorAll('.level-btn');
    expect(buttons).toHaveLength(6);
  });

  it('las etiquetas de los botones son correctas', () => {
    const root: HTMLElement = fixture.nativeElement;
    const labels = Array.from(root.querySelectorAll('.level-label')).map(
      el => (el as HTMLElement).textContent?.trim()
    );
    expect(labels).toEqual(['Todas', 'Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5']);
  });

  it('al hacer click en Nivel 3 la dificultad cambia a 3', async () => {
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const root: HTMLElement = fixture.nativeElement;

    const buttons = root.querySelectorAll('.level-btn');
    (buttons[3] as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(gameService.difficulty()).toBe(3);
  });

  it('al hacer click en Nivel 3 navega a /play', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const root: HTMLElement = fixture.nativeElement;

    const buttons = root.querySelectorAll('.level-btn');
    (buttons[3] as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith(['/play']);
  });

  it('el botón seleccionado recibe la clase selected', async () => {
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const root: HTMLElement = fixture.nativeElement;

    const buttons = root.querySelectorAll('.level-btn');
    (buttons[1] as HTMLButtonElement).click(); // Nivel 1
    await fixture.whenStable();
    fixture.detectChanges();

    const updated = root.querySelectorAll('.level-btn');
    expect((updated[1] as HTMLButtonElement).classList.contains('selected')).toBe(true);
    expect((updated[0] as HTMLButtonElement).classList.contains('selected')).toBe(false);
  });
});
