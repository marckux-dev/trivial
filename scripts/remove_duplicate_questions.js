const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data');
const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json')).sort();

const stopwords = new Set([
  'que',
  'cual',
  'como',
  'quien',
  'quienes',
  'donde',
  'cuando',
  'cuantos',
  'cuantas',
  'de',
  'del',
  'la',
  'las',
  'el',
  'los',
  'en',
  'y',
  'o',
  'un',
  'una',
  'unos',
  'unas',
  'se',
  'es',
  'fue',
  'fueron',
  'ha',
  'han',
  'por',
  'para',
  'con',
  'sin',
  'al',
  'a',
  'do',
  'da',
]);

function norm(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizedQuestion(text) {
  return norm(text)
    .split(/\s+/)
    .filter((token) => token && !stopwords.has(token))
    .join(' ');
}

function questionSimilarity(a, b) {
  const aSet = new Set(normalizedQuestion(a).split(' ').filter(Boolean));
  const bSet = new Set(normalizedQuestion(b).split(' ').filter(Boolean));
  const intersection = [...aSet].filter((token) => bSet.has(token)).length;
  const union = new Set([...aSet, ...bSet]).size || 1;
  return intersection / union;
}

function pairLooksDuplicated(a, b) {
  const aq = normalizedQuestion(a.question);
  const bq = normalizedQuestion(b.question);
  if (!aq || !bq) return false;
  if (aq === bq) return true;
  if (aq.includes(bq) || bq.includes(aq)) return true;
  return questionSimilarity(a.question, b.question) >= 0.9;
}

function comparePreference(a, b, countsByFile) {
  const aCount = countsByFile[a.file][a.difficulty];
  const bCount = countsByFile[b.file][b.difficulty];

  if (aCount !== bCount) return aCount - bCount;
  if (a.file !== b.file) return a.file.localeCompare(b.file);
  return a.id - b.id;
}

function save(file, arr) {
  const text =
    '[\n' +
    arr
      .map(
        (q) =>
          `  { "id": ${q.id}, "question": ${JSON.stringify(q.question)}, "answer": ${JSON.stringify(
            q.answer
          )}, "difficulty": ${q.difficulty} }`
      )
      .join(',\n') +
    '\n]\n';
  fs.writeFileSync(path.join(dataDir, file), text, 'utf8');
}

const items = [];
const byFile = {};
const countsByFile = {};

for (const file of files) {
  const arr = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
  byFile[file] = arr;
  countsByFile[file] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const q of arr) {
    countsByFile[file][q.difficulty] += 1;
    items.push({ key: `${file}#${q.id}`, file, ...q });
  }
}

const byAnswer = new Map();
for (const item of items) {
  const key = norm(item.answer);
  if (!byAnswer.has(key)) byAnswer.set(key, []);
  byAnswer.get(key).push(item);
}

const adjacency = new Map(items.map((item) => [item.key, new Set()]));
for (const group of byAnswer.values()) {
  if (group.length < 2) continue;
  for (let i = 0; i < group.length; i += 1) {
    for (let j = i + 1; j < group.length; j += 1) {
      if (pairLooksDuplicated(group[i], group[j])) {
        adjacency.get(group[i].key).add(group[j].key);
        adjacency.get(group[j].key).add(group[i].key);
      }
    }
  }
}

const itemByKey = new Map(items.map((item) => [item.key, item]));
const visited = new Set();
const toRemove = new Set();
const removalLog = [];

for (const item of items) {
  if (visited.has(item.key) || adjacency.get(item.key).size === 0) continue;

  const stack = [item.key];
  const component = [];
  visited.add(item.key);

  while (stack.length) {
    const current = stack.pop();
    component.push(itemByKey.get(current));
    for (const neighbor of adjacency.get(current)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        stack.push(neighbor);
      }
    }
  }

  component.sort((a, b) => comparePreference(a, b, countsByFile));
  const keeper = component[0];
  for (const candidate of component.slice(1)) {
    toRemove.add(candidate.key);
    removalLog.push({
      keep: `${keeper.file}#${keeper.id} D${keeper.difficulty}`,
      drop: `${candidate.file}#${candidate.id} D${candidate.difficulty}`,
      answer: keeper.answer,
      keepQuestion: keeper.question,
      dropQuestion: candidate.question,
    });
  }
}

for (const file of files) {
  const filtered = byFile[file]
    .filter((q) => !toRemove.has(`${file}#${q.id}`))
    .map((q, index) => ({
      id: index + 1,
      question: q.question,
      answer: q.answer,
      difficulty: q.difficulty,
    }));
  save(file, filtered);
}

console.log(`Removed ${toRemove.size} questions across ${files.length} files.`);
for (const entry of removalLog.slice(0, 80)) {
  console.log(`KEEP ${entry.keep}`);
  console.log(`DROP ${entry.drop}`);
  console.log(`Q1 ${entry.keepQuestion}`);
  console.log(`Q2 ${entry.dropQuestion}`);
  console.log(`A  ${entry.answer}`);
}
