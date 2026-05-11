import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-question-card',
  standalone: true,
  templateUrl: './question-card.html',
  styleUrl: './question-card.css',
})
export class QuestionCardComponent {
  private router = inject(Router);
  protected game = inject(GameService);

  protected reveal(): void {
    this.game.revealAnswer();
  }

  protected back(): void {
    this.router.navigate(['/play']);
  }
}
