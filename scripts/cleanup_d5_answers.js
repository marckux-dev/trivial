const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data');

const files = [
  'art.json',
  'entertainment.json',
  'geography.json',
  'history.json',
  'science.json',
  'sports.json',
];

const manualFixes = {
  'art.json:15': {
    question: '¿Qué escritora británica recibió el Premio Nobel de Literatura en 2007 a los 88 años?',
    answer: 'Doris Lessing',
  },
  'art.json:16': {
    question: '¿Qué ciclo novelístico de Marcel Proust suele citarse como una de las obras más extensas de la literatura universal?',
    answer: 'En busca del tiempo perdido',
  },
  'entertainment.json:122': {
    question: '¿En qué ciudad consigue Daenerys Targaryen a los Inmaculados antes de emprender su avance hacia Poniente?',
    answer: 'Astapor',
  },
  'entertainment.json:123': {
    question: '¿Qué Lord Comandante de la Guardia de la Noche precede a Jon Snow y muere amotinado en el Torreón de Craster?',
    answer: 'Jeor Mormont',
  },
  'entertainment.json:111': {
    question: '¿Qué nombre de pila se revela para Jon Snow en la serie cuando se expone su origen targaryen?',
    answer: 'Aegon',
  },
  'entertainment.json:112': {
    question: '¿Qué maestre de Invernalia muestra escepticismo ante los caminantes blancos antes de su regreso?',
    answer: 'Luwin',
  },
  'entertainment.json:119': {
    question: '¿Qué designación recibe la armadura Hulkbuster diseñada por Tony Stark para contener a Hulk en el UCM?',
    answer: 'Mark XLIV',
  },
  'entertainment.json:126': {
    question: '¿Qué personaje empuña Mjolnir junto al escudo roto del Capitán América en la batalla final de Endgame?',
    answer: 'Steve Rogers',
  },
  'entertainment.json:316': {
    question: '¿Qué película de Stanley Kubrick satiriza la guerra nuclear y se conoce en inglés como Dr. Strangelove?',
    answer: '¿Teléfono rojo? Volamos hacia Moscú',
  },
  'geography.json:120': {
    question: '¿Cuál es el mayor lago de agua dulce de América del Sur por superficie?',
    answer: 'El Titicaca',
  },
  'geography.json:324': {
    question: '¿Qué mar separa el noreste de África de la península arábiga?',
    answer: 'El mar Rojo',
  },
  'history.json:126': {
    question: '¿Qué jurista y político presidió el Congreso de los Diputados entre 1979 y 1982 durante la Transición española?',
    answer: 'Landelino Lavilla',
  },
  'history.json:212': {
    question: '¿Qué batalla del año 732, librada en territorio franco, suele citarse como freno simbólico al avance omeya hacia el norte?',
    answer: 'La batalla de Poitiers',
  },
  'science.json:118': {
    question: '¿Qué hormona se eleva de forma característica en el hiperparatiroidismo primario?',
    answer: 'La hormona paratiroidea',
  },
  'science.json:120': {
    question: '¿Qué anticuerpo es especialmente útil y más específico que el factor reumatoide para apoyar el diagnóstico de artritis reumatoide?',
    answer: 'El anticuerpo anti-CCP',
  },
  'science.json:127': {
    question: '¿Qué bacteria encapsulada del grupo B causa con frecuencia sepsis neonatal y meningitis en recién nacidos?',
    answer: 'Streptococcus agalactiae',
  },
  'science.json:230': {
    question: '¿Qué célula inmunitaria produce anticuerpos de forma directa tras la diferenciación final de un linfocito B?',
    answer: 'La célula plasmática',
  },
  'science.json:329': {
    question: '¿Qué tipo de compuestos se emplea para emitir fluorescencia en muchos estudios biológicos bajo luz ultravioleta o azul?',
    answer: 'Proteínas fluorescentes',
  },
  'sports.json:212': {
    question: '¿Qué juego ferroviario de Francis Tresham está considerado el origen más citado de la familia 18XX?',
    answer: '1830: Railways and Robber Barons',
  },
  'sports.json:322': {
    question: '¿Qué juego de mesa de trenes y economía de Francis Tresham suele señalarse como referente fundador de los 18XX?',
    answer: '1830: Railways and Robber Barons',
  },
  'sports.json:327': {
    question: '¿Qué actividad de ciencia ciudadana consiste en salir al campo para identificar y registrar especies observadas?',
    answer: 'Bioblitz',
  },
};

const commentPools = {
  art: [
    'Curiosidad: esta respuesta suele conectar con varias obras más allá de la más famosa.',
    'Curiosidad: si esto te sonaba de clase, tu memoria artística sigue bastante en forma.',
    'Curiosidad: muchas veces el autor es más recordado por una sola obra que por toda su carrera.',
    'Curiosidad: en Trivial Pursuit, estas preguntas suelen separar al lector habitual del espectador casual.',
    'Curiosidad: detrás de este nombre suele haber medio temario de historia del arte o literatura.',
    'Curiosidad: acertar esto en una sobremesa da un prestigio desproporcionado.',
  ],
  entertainment: [
    'Curiosidad: esta referencia aparece muchísimo en rankings de cine y series.',
    'Curiosidad: una sola escena o personaje bastó para volverla cultura popular.',
    'Curiosidad: esta obra dejó frases, memes o imágenes que siguen vivas años después.',
    'Curiosidad: cuando una pregunta de ocio sobrevive décadas, suele ser por algo.',
    'Curiosidad: media humanidad reconoce el título aunque no haya visto la obra entera.',
    'Curiosidad: si no la has visto, seguramente ya te la han destripado alguna vez.',
  ],
  geography: [
    'Curiosidad: muchos de estos lugares son más fáciles de ubicar en foto que en mapa.',
    'Curiosidad: aquí suele fallarse más por nervios que por desconocimiento real.',
    'Curiosidad: varias rutas turísticas famosas existen casi solo para llegar hasta este punto.',
    'Curiosidad: el paisaje suele ser más famoso que la administración a la que pertenece.',
    'Curiosidad: en geografía, lo espectacular casi siempre ayuda a fijar la memoria.',
    'Curiosidad: es de esos sitios que mucha gente reconoce antes por postal que por atlas.',
  ],
  history: [
    'Curiosidad: muchos hechos históricos parecen inevitables solo después de haber ocurrido.',
    'Curiosidad: esta respuesta suele arrastrar una cadena de consecuencias bastante larga.',
    'Curiosidad: en historia, una fecha bien colocada vale media respuesta.',
    'Curiosidad: casi siempre hay más contexto detrás de este nombre del que parece.',
    'Curiosidad: si esto salió en examen alguna vez, no fuiste la única persona en sufrirlo.',
    'Curiosidad: los grandes acontecimientos suelen esconder detalles pequeños pero decisivos.',
  ],
  science: [
    'Curiosidad: muchas ideas científicas famosas parecen obvias solo cuando ya te las han explicado.',
    'Curiosidad: este concepto aparece más de una vez en biología, física o química de lo que parece.',
    'Curiosidad: la ciencia tiene esa costumbre de dar nombres elegantes a cosas nada sencillas.',
    'Curiosidad: detrás de esta respuesta suele haber más de una disciplina implicada.',
    'Curiosidad: es de esos términos que suenan simples hasta que toca desarrollarlos en un examen.',
    'Curiosidad: entender esto bien suele ahorrar muchos errores en preguntas parecidas.',
  ],
  sports: [
    'Curiosidad: estas respuestas parecen fáciles hasta que toca distinguir marcas, pruebas o variantes.',
    'Curiosidad: en deporte y cultura general, el detalle concreto suele ser la trampa real.',
    'Curiosidad: muchas veces el nombre es más famoso que la historia completa que lleva detrás.',
    'Curiosidad: si esto sale en un trivial, alguien en la mesa dirá que casi lo tenía.',
    'Curiosidad: algunas marcas y competiciones se recuerdan mejor que sus propias fechas.',
    'Curiosidad: esta es la clase de dato que parece inútil hasta que te hace ganar una ronda.',
  ],
};

function fileKey(file) {
  return file.replace('.json', '');
}

function withComment(answer, categoryKey, index) {
  if (/curiosidad:/i.test(answer)) return answer;
  const pool = commentPools[categoryKey];
  return `${answer}. ${pool[index % pool.length]}`;
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

for (const file of files) {
  const categoryKey = fileKey(file);
  const fullPath = path.join(dataDir, file);
  const arr = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

  let d5Index = 0;
  for (const item of arr) {
    const fix = manualFixes[`${file}:${item.id}`];
    if (fix) {
      item.question = fix.question;
      item.answer = fix.answer;
    }
    if (item.difficulty === 5) {
      item.answer = withComment(item.answer, categoryKey, d5Index);
      d5Index += 1;
    }
  }

  save(file, arr);
}

for (const file of files) {
  const arr = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
  const d5 = arr.filter((q) => q.difficulty === 5);
  const allCommented = d5.every((q) => /curiosidad:/i.test(q.answer));
  console.log(`${file} D5=${d5.length} commented=${allCommented ? 'ok' : 'bad'}`);
}
