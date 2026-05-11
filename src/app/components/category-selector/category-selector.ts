import { Component, inject, signal, ElementRef, viewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../../models/question.model';
import { GameService } from '../../services/game.service';

type DiceState = 'idle' | 'spinning' | 'landed';

// Cube rotation to bring each face toward the camera (in CATEGORIES order)
const FACE_ROTATIONS = [
  { x: 0,   y: 0   },  // front  → science (index 0)
  { x: 0,   y: -90 },  // right  → geography (index 1)
  { x: 0,   y: 180 },  // back   → entertainment (index 2)
  { x: 0,   y: 90  },  // left   → history (index 3)
  { x: 90,  y: 0   },  // top    → art (index 4)
  { x: -90, y: 0   },  // bottom → sports (index 5)
] as const;

@Component({
  selector: 'app-category-selector',
  standalone: true,
  templateUrl: './category-selector.html',
  styleUrl: './category-selector.css',
})
export class CategorySelectorComponent implements AfterViewInit {
  private router = inject(Router);
  protected game = inject(GameService);

  protected readonly difficultyLabel = ['Todas', '1', '2', '3', '4', '5'];
  protected diceState = signal<DiceState>('idle');
  protected diceResult = signal<Category | null>(null);

  private cubeEl = viewChild<ElementRef<HTMLElement>>('cube');
  private idleAnim: Animation | null = null;
  private spinAnim: Animation | null = null;

  ngAfterViewInit(): void {
    this.startIdle();
  }

  private startIdle(): void {
    const el = this.cubeEl()?.nativeElement;
    if (!el) return;
    this.idleAnim?.cancel();
    this.idleAnim = el.animate?.(
      [
        { transform: 'rotateX(-15deg) rotateY(0deg)' },
        { transform: 'rotateX(-15deg) rotateY(360deg)' },
      ],
      { duration: 8000, iterations: Infinity, easing: 'linear' }
    ) ?? null;
  }

  protected isDisabled(cat: Category): boolean {
    const result = this.diceResult();
    return this.diceState() === 'landed' && result !== null && result.id !== cat.id;
  }

  protected diceResultColor(): string | null {
    const result = this.diceResult();
    return this.diceState() === 'landed' && result ? result.bgColor : null;
  }

  protected pick(cat: Category): void {
    if (this.diceState() === 'spinning' || this.isDisabled(cat)) return;
    this.game.selectCategory(cat);
    this.router.navigate(['/question']);
  }

  protected rollDice(): void {
    if (this.diceState() !== 'idle') return;

    const el = this.cubeEl()?.nativeElement;
    if (!el) return;

    this.idleAnim?.cancel();
    this.spinAnim?.cancel();
    this.diceState.set('spinning');
    this.diceResult.set(null);

    const idx = Math.floor(Math.random() * 6);
    const { x: fx, y: fy } = FACE_ROTATIONS[idx];
    const spins = 4 + Math.floor(Math.random() * 2);
    const endX = fx + spins * 360;
    const endY = fy + spins * 360;
    const xWobble = (Math.random() - 0.5) * 200;

    this.spinAnim = el.animate?.(
      [
        {
          transform: 'rotateX(-15deg) rotateY(0deg)',
          easing: 'cubic-bezier(0.55, 0, 1, 0.45)',
        },
        {
          transform: `rotateX(${endX * 0.5 + xWobble}deg) rotateY(${endY * 0.5}deg)`,
          offset: 0.5,
          easing: 'cubic-bezier(0, 0.55, 0.45, 1)',
        },
        {
          transform: `rotateX(${endX}deg) rotateY(${endY}deg)`,
        },
      ],
      { duration: 2600, fill: 'forwards' }
    ) ?? null;

    if (this.spinAnim) {
      this.spinAnim.onfinish = () => {
        this.diceState.set('landed');
        this.diceResult.set(this.game.categories[idx]);
      };
    }
  }

  protected changeDifficulty(): void {
    this.router.navigate(['/']);
  }
}
