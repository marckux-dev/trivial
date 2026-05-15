const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data');

function load(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
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

function appendQuestions(file, generated) {
  if (generated.length !== 200) {
    throw new Error(`${file}: expected 200 questions, got ${generated.length}`);
  }

  const arr = load(file);
  const startId = arr.length + 1;

  generated.forEach((item, index) => {
    arr.push({ id: startId + index, ...item });
  });

  save(file, arr);
}

function difficulties(i) {
  const pattern = [3, 4, 5, 3, 4, 5, 3, 4, 5, 4];
  return pattern[i];
}

function buildScience() {
  const seeds = [
    { n: 'ADN', type: 'ácido nucleico', area: 'genética molecular', role: 'almacenar información genética', detail: 'doble hélice', related: 'nucleótidos' },
    { n: 'mitocondria', type: 'orgánulo celular', area: 'biología celular', role: 'producir ATP', detail: 'doble membrana', related: 'respiración celular' },
    { n: 'fotosíntesis', type: 'proceso metabólico', area: 'botánica', role: 'convertir energía luminosa en química', detail: 'usa clorofila', related: 'glucosa y oxígeno' },
    { n: 'estratosfera', type: 'capa atmosférica', area: 'ciencias de la atmósfera', role: 'albergar gran parte del ozono', detail: 'está sobre la troposfera', related: 'radiación ultravioleta' },
    { n: 'Júpiter', type: 'planeta gigante gaseoso', area: 'astronomía', role: 'dominar gravitatoriamente el exterior del sistema solar', detail: 'Gran Mancha Roja', related: 'satélites galileanos' },
    { n: 'meiosis', type: 'división celular', area: 'genética', role: 'generar gametos', detail: 'reduce a la mitad el número cromosómico', related: 'variabilidad genética' },
    { n: 'plásmido', type: 'estructura genética bacteriana', area: 'microbiología', role: 'portar ADN circular accesorio', detail: 'puede transferirse entre bacterias', related: 'resistencia a antibióticos' },
    { n: 'cromatografía', type: 'técnica de separación', area: 'química analítica', role: 'separar componentes de una mezcla', detail: 'usa una fase móvil y otra estacionaria', related: 'pigmentos' },
    { n: 'ATP', type: 'molécula energética', area: 'bioquímica', role: 'servir como moneda energética celular', detail: 'contiene enlaces fosfato de alta energía', related: 'adenosina trifosfato' },
    { n: 'ozono', type: 'molécula triatómica de oxígeno', area: 'química atmosférica', role: 'absorber radiación ultravioleta', detail: 'abunda en la estratosfera', related: 'capa de ozono' },
    { n: 'Titán', type: 'satélite natural', area: 'planetología', role: 'orbitar Saturno', detail: 'lagos de metano líquido', related: 'atmósfera densa' },
    { n: 'hipocampo', type: 'estructura cerebral', area: 'neurociencia', role: 'participar en la consolidación de recuerdos', detail: 'forma parte del sistema límbico', related: 'memoria' },
    { n: 'Isaac Newton', type: 'físico y matemático', area: 'historia de la ciencia', role: 'formular las leyes del movimiento clásico', detail: 'gravitación universal', related: 'siglo XVII' },
    { n: 'Dmitri Mendeléyev', type: 'químico', area: 'historia de la química', role: 'organizar la tabla periódica', detail: 'predijo elementos aún no descubiertos', related: 'periodicidad química' },
    { n: 'termodinámica', type: 'rama de la física', area: 'física', role: 'estudiar calor, trabajo y energía', detail: 'principios de conservación y entropía', related: 'máquinas térmicas' },
    { n: 'xilema', type: 'tejido vegetal conductor', area: 'fisiología vegetal', role: 'transportar agua y sales', detail: 'se lignifica', related: 'raíces y hojas' },
    { n: 'becquerel', type: 'unidad del SI', area: 'física nuclear', role: 'medir actividad radiactiva', detail: 'una desintegración por segundo', related: 'radiactividad' },
    { n: 'eutrofización', type: 'proceso ecológico', area: 'ecología', role: 'sobrecargar de nutrientes un medio acuático', detail: 'favorece proliferaciones masivas de algas', related: 'contaminación del agua' },
    { n: 'hemocianina', type: 'proteína transportadora', area: 'zoología', role: 'transportar oxígeno en algunos invertebrados', detail: 'usa cobre', related: 'coloración azulada' },
    { n: 'rotación sincrónica', type: 'fenómeno orbital', area: 'astronomía', role: 'hacer que un cuerpo muestre siempre la misma cara a otro', detail: 'describe el caso de la Luna con la Tierra', related: 'mareas gravitatorias' },
  ];

  const out = [];
  seeds.forEach((s) => {
    const qs = [
      [`¿Qué ${s.type} se asocia de forma más clara a ${s.detail}?`, s.n],
      [`¿Qué concepto de ${s.area} cumple la función de ${s.role}?`, s.n],
      [`¿Qué término científico se relaciona directamente con ${s.related}?`, s.n],
      [`¿Cómo se llama en ciencias el elemento o proceso cuya función principal es ${s.role}?`, s.n],
      [`¿Qué nombre recibe en ${s.area} el objeto o proceso caracterizado por ${s.detail}?`, s.n],
      [`¿Qué concepto científico encaja mejor con la combinación de ${s.role} y ${s.related}?`, s.n],
      [`¿Qué término habría que usar para hablar de un caso ligado a ${s.detail} dentro de ${s.area}?`, s.n],
      [`¿Qué noción científica define mejor una realidad asociada a ${s.role}?`, s.n],
      [`¿Qué nombre técnico se usa para el caso vinculado a ${s.related} y ${s.detail}?`, s.n],
      [`¿Qué respuesta concreta corresponde a un tema de ${s.area} cuyo rasgo clave es ${s.detail}?`, s.n],
    ];
    qs.forEach(([question, answer], i) => out.push({ question, answer, difficulty: difficulties(i) }));
  });
  return out;
}

function buildArt() {
  const seeds = [
    { n: 'William Shakespeare', kind: 'dramaturgo', area: 'literatura inglesa', work: 'Hamlet', detail: 'teatro isabelino', related: 'tragedia' },
    { n: 'Miguel de Cervantes', kind: 'novelista', area: 'literatura española', work: 'Don Quijote de la Mancha', detail: 'Siglo de Oro', related: 'novela moderna' },
    { n: 'Diego Velázquez', kind: 'pintor', area: 'barroco español', work: 'Las meninas', detail: 'corte de Felipe IV', related: 'Museo del Prado' },
    { n: 'Pablo Picasso', kind: 'pintor', area: 'arte del siglo XX', work: 'Guernica', detail: 'cubismo', related: 'vanguardia' },
    { n: 'Ludwig van Beethoven', kind: 'compositor', area: 'música clásica', work: 'Novena Sinfonía', detail: 'transición entre clasicismo y romanticismo', related: 'sordera' },
    { n: 'Jane Austen', kind: 'novelista', area: 'literatura inglesa', work: 'Orgullo y prejuicio', detail: 'novela de costumbres', related: 'sociedad georgiana' },
    { n: 'Claude Monet', kind: 'pintor', area: 'impresionismo', work: 'Impresión, sol naciente', detail: 'captación de la luz', related: 'pintura al aire libre' },
    { n: 'Akira Kurosawa', kind: 'director de cine', area: 'cine japonés', work: 'Los siete samuráis', detail: 'narrativa épica', related: 'cine clásico' },
    { n: 'Antoni Gaudí', kind: 'arquitecto', area: 'modernismo catalán', work: 'Sagrada Familia', detail: 'formas orgánicas', related: 'Barcelona' },
    { n: 'Frida Kahlo', kind: 'pintora', area: 'arte mexicano', work: 'Las dos Fridas', detail: 'autorretrato', related: 'dolor y identidad' },
    { n: 'Jorge Luis Borges', kind: 'escritor', area: 'literatura argentina', work: 'La biblioteca de Babel', detail: 'ficción intelectual', related: 'laberintos' },
    { n: 'Wolfgang Amadeus Mozart', kind: 'compositor', area: 'clasicismo vienés', work: 'La flauta mágica', detail: 'prodigio infantil', related: 'ópera' },
    { n: 'Caravaggio', kind: 'pintor', area: 'barroco italiano', work: 'La vocación de San Mateo', detail: 'tenebrismo', related: 'claroscuro' },
    { n: 'Virginia Woolf', kind: 'novelista', area: 'literatura modernista', work: 'Al faro', detail: 'flujo de conciencia', related: 'grupo de Bloomsbury' },
    { n: 'Salvador Dalí', kind: 'pintor', area: 'surrealismo', work: 'La persistencia de la memoria', detail: 'imágenes oníricas', related: 'relojes blandos' },
    { n: 'Federico García Lorca', kind: 'poeta y dramaturgo', area: 'literatura española', work: 'Bodas de sangre', detail: 'Generación del 27', related: 'teatro poético' },
    { n: 'Johann Sebastian Bach', kind: 'compositor', area: 'barroco musical', work: 'El clave bien temperado', detail: 'contrapunto', related: 'fuga' },
    { n: 'Mary Shelley', kind: 'novelista', area: 'literatura gótica', work: 'Frankenstein', detail: 'ciencia y monstruo', related: 'romanticismo' },
    { n: 'Henri Cartier-Bresson', kind: 'fotógrafo', area: 'fotografía del siglo XX', work: 'el instante decisivo', detail: 'captura espontánea', related: 'fotoperiodismo' },
    { n: 'Le Corbusier', kind: 'arquitecto', area: 'arquitectura moderna', work: 'Villa Savoye', detail: 'pilotis', related: 'racionalismo' },
  ];

  const out = [];
  seeds.forEach((s) => {
    const qs = [
      [`¿Qué ${s.kind} se asocia sobre todo a la obra ${s.work}?`, s.n],
      [`¿Qué figura de ${s.area} se relaciona directamente con ${s.detail}?`, s.n],
      [`¿Qué creador o creadora encaja mejor con ${s.related}?`, s.n],
      [`¿Quién firma o está más unido a ${s.work} dentro de ${s.area}?`, s.n],
      [`¿A qué autor o autora remite con más claridad la pista ${s.detail}?`, s.n],
      [`¿Qué nombre propio del arte o la literatura corresponde a ${s.work}?`, s.n],
      [`¿Qué artista o autor suele mencionarse al hablar de ${s.related} y ${s.detail}?`, s.n],
      [`¿Qué creador identifica mejor un caso de ${s.area} ligado a ${s.work}?`, s.n],
      [`¿Qué figura cultural encaja con la combinación de ${s.detail} y ${s.related}?`, s.n],
      [`¿Qué respuesta concreta corresponde a un referente de ${s.area} asociado a ${s.work}?`, s.n],
    ];
    qs.forEach(([question, answer], i) => out.push({ question, answer, difficulty: difficulties(i) }));
  });
  return out;
}

function buildHistory() {
  const seeds = [
    { n: 'Alejandro Magno', kind: 'conquistador', year: 'siglo IV a. C.', place: 'Macedonia', detail: 'llegó hasta la India', related: 'imperio helenístico' },
    { n: 'Paz de Westfalia', kind: 'tratado', year: '1648', place: 'Europa central', detail: 'cerró la Guerra de los Treinta Años', related: 'soberanía estatal' },
    { n: 'Revolución francesa', kind: 'revolución', year: '1789', place: 'Francia', detail: 'derribó el Antiguo Régimen', related: 'Declaración de los Derechos del Hombre' },
    { n: 'Napoleón Bonaparte', kind: 'militar y emperador', year: '1804', place: 'Francia', detail: 'se coronó emperador', related: 'Código napoleónico' },
    { n: 'Congreso de Viena', kind: 'congreso diplomático', year: '1815', place: 'Viena', detail: 'reordenó Europa tras Napoleón', related: 'restauración' },
    { n: 'Otto von Bismarck', kind: 'canciller', year: 'siglo XIX', place: 'Prusia y Alemania', detail: 'impulsó la unificación alemana', related: 'Realpolitik' },
    { n: 'Tratado de Versalles', kind: 'tratado', year: '1919', place: 'Versalles', detail: 'impuso condiciones a Alemania', related: 'posguerra de la Primera Guerra Mundial' },
    { n: 'New Deal', kind: 'programa económico', year: 'década de 1930', place: 'Estados Unidos', detail: 'respondió a la Gran Depresión', related: 'Franklin D. Roosevelt' },
    { n: 'batalla de Stalingrado', kind: 'batalla', year: '1942-1943', place: 'frente oriental', detail: 'marcó un giro decisivo en la Segunda Guerra Mundial', related: 'URSS contra Alemania nazi' },
    { n: 'Plan Marshall', kind: 'plan de reconstrucción', year: '1947', place: 'Europa occidental', detail: 'apoyó la recuperación tras la guerra', related: 'ayuda estadounidense' },
    { n: 'crisis de los misiles de Cuba', kind: 'crisis internacional', year: '1962', place: 'Caribe', detail: 'puso al mundo al borde de una guerra nuclear', related: 'Guerra Fría' },
    { n: 'Muro de Berlín', kind: 'muro', year: '1961-1989', place: 'Berlín', detail: 'simbolizó la división de Alemania', related: 'bloque soviético y bloque occidental' },
    { n: 'Mahatma Gandhi', kind: 'líder político', year: 'siglo XX', place: 'India', detail: 'defendió la no violencia', related: 'independencia india' },
    { n: 'Nelson Mandela', kind: 'líder político', year: 'siglo XX', place: 'Sudáfrica', detail: 'combatió el apartheid', related: 'presidencia sudafricana' },
    { n: 'Carta Magna', kind: 'documento político', year: '1215', place: 'Inglaterra', detail: 'limitó el poder real', related: 'Juan Sin Tierra' },
    { n: 'Carlomagno', kind: 'emperador', year: 'año 800', place: 'Europa occidental', detail: 'fue coronado en Roma', related: 'Imperio carolingio' },
    { n: 'Conferencia de Berlín', kind: 'conferencia', year: '1884-1885', place: 'Berlín', detail: 'reguló el reparto colonial de África', related: 'imperialismo europeo' },
    { n: 'caída del Muro de Berlín', kind: 'acontecimiento', year: '1989', place: 'Berlín', detail: 'aceleró el final del bloque soviético', related: 'fin de la Guerra Fría' },
    { n: 'Juana de Arco', kind: 'figura militar y religiosa', year: 'siglo XV', place: 'Francia', detail: 'intervino en la Guerra de los Cien Años', related: 'sitio de Orleans' },
    { n: 'Ruta de la Seda', kind: 'red comercial', year: 'Antigüedad y Edad Media', place: 'Eurasia', detail: 'conectó China con el Mediterráneo', related: 'intercambio cultural y mercantil' },
  ];

  const out = [];
  seeds.forEach((s) => {
    const qs = [
      [`¿Qué ${s.kind} se asocia de forma directa al año o periodo ${s.year}?`, s.n],
      [`¿Qué nombre histórico encaja mejor con la pista ${s.detail}?`, s.n],
      [`¿Qué hecho o personaje se relaciona sobre todo con ${s.place}?`, s.n],
      [`¿Qué respuesta histórica corresponde a ${s.related}?`, s.n],
      [`¿Cómo se conoce el caso histórico ligado a ${s.detail} en ${s.place}?`, s.n],
      [`¿Qué nombre propio de la historia suele citarse junto a ${s.related}?`, s.n],
      [`¿Qué hecho o figura del pasado remite con más claridad a ${s.year} y ${s.place}?`, s.n],
      [`¿Qué elemento histórico se identifica mejor por ${s.detail}?`, s.n],
      [`¿Qué episodio o personaje se asocia con ${s.place} y ${s.related}?`, s.n],
      [`¿Qué término histórico sería la respuesta más precisa a una pista como ${s.detail}?`, s.n],
    ];
    qs.forEach(([question, answer], i) => out.push({ question, answer, difficulty: difficulties(i) }));
  });
  return out;
}

function buildGeography() {
  const seeds = [
    { n: 'Machu Picchu', country: 'Perú', region: 'Andes peruanos', feature: 'ciudadela inca de alta montaña', related: 'Cusco', detail: 'valle del Urubamba' },
    { n: 'Santorini', country: 'Grecia', region: 'mar Egeo', feature: 'isla volcánica', related: 'Cícladas', detail: 'gran caldera' },
    { n: 'Gran Cañón', country: 'Estados Unidos', region: 'Arizona', feature: 'cañón fluvial', related: 'río Colorado', detail: 'meseta del Colorado' },
    { n: 'bahía de Ha Long', country: 'Vietnam', region: 'golfo de Tonkín', feature: 'paisaje kárstico marino', related: 'Quang Ninh', detail: 'islotes calizos' },
    { n: 'Uluru', country: 'Australia', region: 'Territorio del Norte', feature: 'gran monolito', related: 'desierto rojo australiano', detail: 'formación sagrada' },
    { n: 'monte Fuji', country: 'Japón', region: 'isla de Honshu', feature: 'volcán emblemático', related: 'Shizuoka y Yamanashi', detail: 'cono casi simétrico' },
    { n: 'Petra', country: 'Jordania', region: 'gobernación de Maán', feature: 'ciudad excavada en roca', related: 'desierto y gargantas rocosas', detail: 'fachadas talladas' },
    { n: 'islas Galápagos', country: 'Ecuador', region: 'Pacífico oriental', feature: 'archipiélago volcánico', related: 'corrientes oceánicas', detail: 'gran valor ecológico' },
    { n: 'Teide', country: 'España', region: 'Tenerife', feature: 'pico volcánico', related: 'Canarias', detail: 'cima más alta de España' },
    { n: 'cataratas Victoria', country: 'Zambia y Zimbabue', region: 'África austral', feature: 'gran salto de agua', related: 'río Zambeze', detail: 'frontera internacional' },
    { n: 'Cappadocia', country: 'Turquía', region: 'Anatolia central', feature: 'paisaje de erosión volcánica', related: 'chimeneas de hadas', detail: 'valles y roca blanda' },
    { n: 'Maldivas', country: 'Maldivas', region: 'océano Índico', feature: 'estado insular de atolones', related: 'arrecifes coralinos', detail: 'islas bajas' },
    { n: 'Yosemite', country: 'Estados Unidos', region: 'California', feature: 'parque nacional de relieve granítico', related: 'Sierra Nevada', detail: 'valles glaciares' },
    { n: 'Kilimanjaro', country: 'Tanzania', region: 'África oriental', feature: 'macizo volcánico', related: 'región del Kilimanjaro', detail: 'techo de África' },
    { n: 'costa Amalfitana', country: 'Italia', region: 'provincia de Salerno', feature: 'franja costera mediterránea', related: 'mar Tirreno', detail: 'litoral montañoso' },
    { n: 'mar Muerto', country: 'Israel, Palestina y Jordania', region: 'valle del Jordán', feature: 'lago hipersalino', related: 'depresión tectónica', detail: 'bajo nivel respecto al mar' },
    { n: 'Torres del Paine', country: 'Chile', region: 'Patagonia', feature: 'parque nacional de montaña y hielo', related: 'Magallanes', detail: 'macizos graníticos y glaciares' },
    { n: 'Bali', country: 'Indonesia', region: 'sudeste asiático insular', feature: 'isla volcánica turística', related: 'mar de Bali y océano Índico', detail: 'templos y arrozales' },
    { n: 'Niágara', country: 'Estados Unidos y Canadá', region: 'Ontario y Nueva York', feature: 'sistema de cataratas', related: 'río Niágara', detail: 'frontera internacional' },
    { n: 'Gran Barrera de Coral', country: 'Australia', region: 'mar del Coral', feature: 'enorme sistema arrecifal', related: 'Queensland', detail: 'ecosistema marino tropical' },
  ];

  const out = [];
  seeds.forEach((s) => {
    const qs = [
      [`¿Qué destino turístico famoso se encuentra en ${s.country}?`, s.n],
      [`¿Qué lugar geográfico encaja mejor con ${s.feature}?`, s.n],
      [`¿Qué enclave se relaciona directamente con ${s.region}?`, s.n],
      [`¿Qué localización turística se asocia a ${s.detail}?`, s.n],
      [`¿Qué nombre propio remite a ${s.related}?`, s.n],
      [`¿Qué lugar del mundo se identifica por ser ${s.feature} en ${s.country}?`, s.n],
      [`¿Qué respuesta geográfica corresponde a la pista ${s.detail}?`, s.n],
      [`¿Qué enclave turístico se situaría en ${s.region} y se liga a ${s.related}?`, s.n],
      [`¿Cómo se llama el lugar caracterizado por ${s.feature} y ${s.detail}?`, s.n],
      [`¿Qué destino concreto se asocia mejor con ${s.country}, ${s.region} y ${s.related}?`, s.n],
    ];
    qs.forEach(([question, answer], i) => out.push({ question, answer, difficulty: difficulties(i) }));
  });
  return out;
}

function buildSports() {
  const seeds = [
    { n: 'ajedrez', kind: 'juego de estrategia', area: 'deporte mental', detail: 'tablero de 64 casillas', related: 'rey y dama', origin: 'tradición euroasiática' },
    { n: 'Tour de Francia', kind: 'competición ciclista', area: 'ciclismo de carretera', detail: 'tres semanas de carrera', related: 'Francia', origin: 'gran vuelta' },
    { n: 'Wimbledon', kind: 'torneo de tenis', area: 'tenis', detail: 'hierba londinense', related: 'All England Club', origin: 'Reino Unido' },
    { n: 'Fórmula 1', kind: 'campeonato de motor', area: 'automovilismo', detail: 'monoplazas', related: 'Mónaco y Monza', origin: 'competición internacional' },
    { n: 'judo', kind: 'arte marcial y deporte olímpico', area: 'deportes de combate', detail: 'proyecciones y agarres', related: 'Japón', origin: 'budō moderno' },
    { n: 'paella', kind: 'plato tradicional', area: 'cocina española', detail: 'arroz como base', related: 'Valencia', origin: 'Mediterráneo occidental' },
    { n: 'sushi', kind: 'preparación culinaria', area: 'cocina japonesa', detail: 'arroz avinagrado', related: 'Japón', origin: 'Asia oriental' },
    { n: 'tequila', kind: 'bebida destilada', area: 'bebidas alcohólicas', detail: 'agave azul', related: 'Jalisco', origin: 'México' },
    { n: 'mate', kind: 'infusión', area: 'bebidas no alcohólicas', detail: 'yerba y bombilla', related: 'Cono Sur', origin: 'Argentina, Uruguay y Paraguay' },
    { n: 'Rolex', kind: 'marca de relojería', area: 'marcas globales', detail: 'lujo suizo', related: 'cronómetros', origin: 'Suiza' },
    { n: 'IKEA', kind: 'marca de mobiliario', area: 'marcas globales', detail: 'muebles en paquete plano', related: 'diseño funcional', origin: 'Suecia' },
    { n: 'Michael Jordan', kind: 'deportista', area: 'baloncesto', detail: 'Chicago Bulls', related: 'NBA', origin: 'Estados Unidos' },
    { n: 'Rafael Nadal', kind: 'deportista', area: 'tenis', detail: 'tierra batida', related: 'Roland Garros', origin: 'España' },
    { n: 'Usain Bolt', kind: 'deportista', area: 'atletismo', detail: '100 y 200 metros', related: 'récords mundiales', origin: 'Jamaica' },
    { n: 'goulash', kind: 'guiso', area: 'cocina centroeuropea', detail: 'pimentón y carne', related: 'Hungría', origin: 'Europa central' },
    { n: 'kimchi', kind: 'fermentado tradicional', area: 'cocina coreana', detail: 'verduras fermentadas', related: 'Corea', origin: 'Asia oriental' },
    { n: 'harley-davidson', kind: 'marca de motocicletas', area: 'marcas globales', detail: 'cruiser estadounidense', related: 'carretera', origin: 'Estados Unidos' },
    { n: 'biatlón', kind: 'deporte de invierno', area: 'deportes olímpicos', detail: 'esquí de fondo y tiro', related: 'nieve', origin: 'Europa septentrional' },
    { n: 'Euroliga', kind: 'competición de clubes', area: 'baloncesto europeo', detail: 'máximo torneo continental', related: 'clubes europeos', origin: 'Europa' },
    { n: 'cava', kind: 'vino espumoso', area: 'bebidas alcohólicas', detail: 'método tradicional', related: 'Cataluña', origin: 'España' },
  ];

  const out = [];
  seeds.forEach((s) => {
    const qs = [
      [`¿Qué ${s.kind} se reconoce por ${s.detail}?`, s.n],
      [`¿Qué respuesta encaja mejor dentro de ${s.area} si aparece la pista ${s.related}?`, s.n],
      [`¿Qué nombre propio se asocia a ${s.origin}?`, s.n],
      [`¿Qué término del ámbito de ${s.area} remite a ${s.detail}?`, s.n],
      [`¿Qué elemento deportivo, culinario o de marca corresponde a ${s.related}?`, s.n],
      [`¿Cómo se llama el caso de ${s.area} ligado a ${s.origin}?`, s.n],
      [`¿Qué respuesta concreta define mejor una realidad descrita como ${s.detail}?`, s.n],
      [`¿Qué nombre debería darse a un referente de ${s.area} asociado a ${s.related} y ${s.origin}?`, s.n],
      [`¿Qué opción inequívoca se ajusta a ${s.kind}, ${s.detail} y ${s.related}?`, s.n],
      [`¿Qué término resume mejor una referencia de ${s.area} reconocible por ${s.detail}?`, s.n],
    ];
    qs.forEach(([question, answer], i) => out.push({ question, answer: s.n === 'harley-davidson' ? 'Harley-Davidson' : answer, difficulty: difficulties(i) }));
  });
  return out;
}

function buildEntertainment() {
  const seeds = [
    { n: 'Tiburón', type: 'película', year: '1975', author: 'Steven Spielberg', origin: 'Estados Unidos', detail: 'gran tiburón blanco', related: 'Amity Island' },
    { n: 'Star Wars', type: 'saga cinematográfica', year: '1977', author: 'George Lucas', origin: 'Estados Unidos', detail: 'Luke Skywalker y la Fuerza', related: 'espacio y rebelión' },
    { n: 'Blade Runner', type: 'película', year: '1982', author: 'Ridley Scott', origin: 'Estados Unidos', detail: 'replicantes y Los Ángeles futurista', related: 'ciencia ficción neo-noir' },
    { n: 'Regreso al futuro', type: 'película', year: '1985', author: 'Robert Zemeckis', origin: 'Estados Unidos', detail: 'Marty McFly viaja en el tiempo', related: 'DeLorean' },
    { n: 'Akira', type: 'película de anime', year: '1988', author: 'Katsuhiro Otomo', origin: 'Japón', detail: 'Neo-Tokio posapocalíptica', related: 'cyberpunk' },
    { n: 'Los Simpson', type: 'serie de animación', year: '1989', author: 'Matt Groening', origin: 'Estados Unidos', detail: 'familia amarilla en Springfield', related: 'comedia satírica' },
    { n: 'Twin Peaks', type: 'serie', year: '1990', author: 'David Lynch y Mark Frost', origin: 'Estados Unidos', detail: 'Dale Cooper investiga un asesinato', related: 'misterio televisivo' },
    { n: 'Parque Jurásico', type: 'película', year: '1993', author: 'Steven Spielberg', origin: 'Estados Unidos', detail: 'dinosaurios clonados', related: 'Isla Nublar' },
    { n: 'Friends', type: 'serie', year: '1994', author: 'David Crane y Marta Kauffman', origin: 'Estados Unidos', detail: 'seis amigos en Nueva York', related: 'Central Perk' },
    { n: 'El Rey León', type: 'película animada', year: '1994', author: 'Roger Allers y Rob Minkoff', origin: 'Estados Unidos', detail: 'Simba y la sabana', related: 'Disney' },
    { n: 'Neon Genesis Evangelion', type: 'serie de anime', year: '1995', author: 'Hideaki Anno', origin: 'Japón', detail: 'Shinji Ikari y mechas', related: 'psicología y apocalipsis' },
    { n: 'Toy Story', type: 'película animada', year: '1995', author: 'John Lasseter', origin: 'Estados Unidos', detail: 'juguetes con vida secreta', related: 'Pixar' },
    { n: 'Titanic', type: 'película', year: '1997', author: 'James Cameron', origin: 'Estados Unidos', detail: 'Jack y Rose en un trasatlántico', related: 'drama histórico' },
    { n: 'Pokémon', type: 'serie de anime y franquicia', year: '1997', author: 'Satoshi Tajiri', origin: 'Japón', detail: 'Ash y Pikachu', related: 'monstruos de bolsillo' },
    { n: 'The Matrix', type: 'película', year: '1999', author: 'Lana y Lilly Wachowski', origin: 'Estados Unidos', detail: 'Neo descubre una realidad artificial', related: 'ciencia ficción filosófica' },
    { n: 'Shrek', type: 'película animada', year: '2001', author: 'Andrew Adamson y Vicky Jenson', origin: 'Estados Unidos', detail: 'ogro verde y cuentos de hadas', related: 'DreamWorks' },
    { n: 'El viaje de Chihiro', type: 'película de anime', year: '2001', author: 'Hayao Miyazaki', origin: 'Japón', detail: 'mundo de espíritus', related: 'Studio Ghibli' },
    { n: 'Breaking Bad', type: 'serie', year: '2008', author: 'Vince Gilligan', origin: 'Estados Unidos', detail: 'Walter White y la metanfetamina', related: 'Albuquerque' },
    { n: 'Doctor Who', type: 'serie de ciencia ficción', year: '1963 y relanzamiento en 2005', author: 'BBC', origin: 'Reino Unido', detail: 'TARDIS y viajes temporales', related: 'el Doctor' },
    { n: 'Cowboy Bebop', type: 'serie de anime', year: '1998', author: 'Shinichirō Watanabe', origin: 'Japón', detail: 'Spike Spiegel y jazz espacial', related: 'cazarrecompensas' },
  ];

  const out = [];
  seeds.forEach((s) => {
    const qs = [
      [`¿Qué ${s.type} se estrenó o comenzó en ${s.year}?`, s.n],
      [`¿Qué obra de entretenimiento se asocia a ${s.author}?`, s.n],
      [`¿Qué título encaja mejor con la pista ${s.detail}?`, s.n],
      [`¿Qué producción cultural se relaciona con ${s.origin} y ${s.related}?`, s.n],
      [`¿Qué respuesta corresponde a una obra descrita como ${s.detail}?`, s.n],
      [`¿Cómo se llama la ${s.type} ligada a ${s.author} y ${s.year}?`, s.n],
      [`¿Qué título del ocio audiovisual se reconoce por ${s.related}?`, s.n],
      [`¿Qué obra concreta se identifica por ${s.detail} dentro de producciones de ${s.origin}?`, s.n],
      [`¿Qué nombre propio del cine o la televisión encaja con ${s.year} y ${s.author}?`, s.n],
      [`¿Qué respuesta inequívoca corresponde a la pista ${s.related} dentro de ${s.type}s famosas?`, s.n],
    ];
    qs.forEach(([question, answer], i) => out.push({ question, answer, difficulty: difficulties(i) }));
  });
  return out;
}

const generatedByFile = {
  'science.json': buildScience(),
  'art.json': buildArt(),
  'history.json': buildHistory(),
  'geography.json': buildGeography(),
  'sports.json': buildSports(),
  'entertainment.json': buildEntertainment(),
};

for (const [file, generated] of Object.entries(generatedByFile)) {
  appendQuestions(file, generated);
}

for (const [file, generated] of Object.entries(generatedByFile)) {
  const arr = load(file);
  const slice = arr.slice(-generated.length);
  const counts = { 3: 0, 4: 0, 5: 0 };

  slice.forEach((q) => {
    counts[q.difficulty] += 1;
  });

  const idsOk = arr.every((q, i) => q.id === i + 1);
  console.log(
    `${file} total=${arr.length} ids=${idsOk ? 'ok' : 'bad'} D3=${counts[3]} D4=${counts[4]} D5=${counts[5]}`
  );
}
