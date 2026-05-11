export interface Question {
  id: number;
  question: string;
  answer: string;
  difficulty: number;
}

export interface Category {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
  file: string;
  emoji: string;
}

export const CATEGORIES: Category[] = [
  { id: 'science',       name: 'Ciencias y Naturaleza', bgColor: '#4caf50', textColor: '#fff', file: 'science.json',       emoji: '🔬' },
  { id: 'geography',     name: 'Geografía',             bgColor: '#2196f3', textColor: '#fff', file: 'geography.json',     emoji: '🌍' },
  { id: 'entertainment', name: 'Entretenimiento',       bgColor: '#e91e8c', textColor: '#fff', file: 'entertainment.json', emoji: '🎬' },
  { id: 'history',       name: 'Historia',              bgColor: '#ffb300', textColor: '#222', file: 'history.json',       emoji: '🏛️' },
  { id: 'art',           name: 'Arte y Literatura',     bgColor: '#9c27b0', textColor: '#fff', file: 'art.json',           emoji: '🎨' },
  { id: 'sports',        name: 'Deportes y Pasatiempos',bgColor: '#ff6f00', textColor: '#fff', file: 'sports.json',        emoji: '⚽' },
];
