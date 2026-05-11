import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Category, CATEGORIES, Question } from '../models/question.model';

@Injectable({ providedIn: 'root' })
export class GameService {
  private http = inject(HttpClient);

  readonly categories: Category[] = CATEGORIES;
  readonly difficulty = signal<number>(0);
  readonly currentCategory = signal<Category | null>(null);
  readonly currentQuestion = signal<Question | null>(null);
  readonly showingAnswer = signal<boolean>(false);
  readonly loaded = signal<boolean>(false);

  private questionPools = new Map<string, Question[]>();
  private usedIndexes = new Map<string, Set<number>>();

  readonly availableCount = computed(() => {
    const cat = this.currentCategory();
    if (!cat) return 0;
    return this.getPool(cat.id).length;
  });

  loadAll(): void {
    if (this.loaded()) return;
    const requests = CATEGORIES.map(cat =>
      this.http.get<Question[]>(`data/${cat.file}`)
    );
    forkJoin(requests).subscribe(results => {
      results.forEach((questions, i) => {
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        this.questionPools.set(CATEGORIES[i].id, shuffled);
        this.usedIndexes.set(CATEGORIES[i].id, new Set());
      });
      this.loaded.set(true);
    });
  }

  setDifficulty(level: number): void {
    this.difficulty.set(level);
    this.usedIndexes.forEach((_, key) => this.usedIndexes.set(key, new Set()));
  }

  selectCategory(cat: Category): void {
    this.currentCategory.set(cat);
    this.showingAnswer.set(false);
    this.pickQuestion(cat.id);
  }

  revealAnswer(): void {
    this.showingAnswer.set(true);
  }

  private pickQuestion(categoryId: string): void {
    const pool = this.getPool(categoryId);
    if (pool.length === 0) {
      this.currentQuestion.set(null);
      return;
    }
    const used = this.usedIndexes.get(categoryId)!;
    const available = pool.map((_, i) => i).filter(i => !used.has(i));

    if (available.length === 0) {
      used.clear();
      available.push(...pool.map((_, i) => i));
    }

    const idx = available[Math.floor(Math.random() * available.length)];
    used.add(idx);
    this.currentQuestion.set(pool[idx]);
  }

  private getPool(categoryId: string): Question[] {
    const all = this.questionPools.get(categoryId) ?? [];
    const level = this.difficulty();
    return level === 0 ? all : all.filter(q => q.difficulty === level);
  }
}
