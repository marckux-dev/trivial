import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../../models/question.model';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-category-selector',
  standalone: true,
  templateUrl: './category-selector.html',
  styleUrl: './category-selector.css',
})
export class CategorySelectorComponent {
  private router = inject(Router);
  protected game = inject(GameService);

  protected readonly difficultyLabel = ['Todas', '1', '2', '3', '4', '5'];

  protected pick(cat: Category): void {
    this.game.selectCategory(cat);
    this.router.navigate(['/question']);
  }

  protected changeDifficulty(): void {
    this.router.navigate(['/']);
  }
}
