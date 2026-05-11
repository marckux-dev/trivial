import { Routes } from '@angular/router';
import { DifficultySelectorComponent } from './components/difficulty-selector/difficulty-selector';
import { CategorySelectorComponent } from './components/category-selector/category-selector';
import { QuestionCardComponent } from './components/question-card/question-card';

export const routes: Routes = [
  { path: '',         component: DifficultySelectorComponent },
  { path: 'play',     component: CategorySelectorComponent },
  { path: 'question', component: QuestionCardComponent },
  { path: '**',       redirectTo: '' },
];
