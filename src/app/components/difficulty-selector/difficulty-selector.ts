import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-difficulty-selector',
  standalone: true,
  templateUrl: './difficulty-selector.html',
  styleUrl: './difficulty-selector.css',
})
export class DifficultySelectorComponent {
  private router = inject(Router);
  protected game = inject(GameService);

  protected readonly levels = [
    { value: 0, label: 'Todas',     desc: 'Mezcla de niveles' },
    { value: 1, label: 'Nivel 1',   desc: 'Muy fácil' },
    { value: 2, label: 'Nivel 2',   desc: 'Fácil' },
    { value: 3, label: 'Nivel 3',   desc: 'Intermedio' },
    { value: 4, label: 'Nivel 4',   desc: 'Difícil' },
    { value: 5, label: 'Nivel 5',   desc: 'Experto' },
  ];

  protected select(value: number): void {
    this.game.setDifficulty(value);
    this.router.navigate(['/play']);
  }
}
