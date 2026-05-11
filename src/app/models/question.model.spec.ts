import { CATEGORIES } from './question.model';

describe('CATEGORIES', () => {
  it('contiene exactamente 6 categorías', () => {
    expect(CATEGORIES).toHaveLength(6);
  });

  it('cada categoría tiene todos los campos obligatorios', () => {
    for (const cat of CATEGORIES) {
      expect(cat.id).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(cat.bgColor).toBeTruthy();
      expect(cat.textColor).toBeTruthy();
      expect(cat.file).toBeTruthy();
      expect(cat.emoji).toBeTruthy();
    }
  });

  it('los IDs son únicos', () => {
    const ids = CATEGORIES.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todos los archivos tienen extensión .json', () => {
    for (const cat of CATEGORIES) {
      expect(cat.file).toMatch(/\.json$/);
    }
  });

  it('el nombre del archivo coincide con el ID de la categoría', () => {
    for (const cat of CATEGORIES) {
      expect(cat.file).toBe(`${cat.id}.json`);
    }
  });

  it('contiene las 6 categorías temáticas esperadas', () => {
    const ids = new Set(CATEGORIES.map(c => c.id));
    expect(ids.has('science')).toBe(true);
    expect(ids.has('geography')).toBe(true);
    expect(ids.has('entertainment')).toBe(true);
    expect(ids.has('history')).toBe(true);
    expect(ids.has('art')).toBe(true);
    expect(ids.has('sports')).toBe(true);
  });
});
