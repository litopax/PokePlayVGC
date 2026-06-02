import { writeFileSync } from 'fs';

const API = 'https://www.wikidex.net/api.php';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Referer': 'https://www.wikidex.net/',
};

async function fetchWT(page) {
  const url = `${API}?action=parse&page=${encodeURIComponent(page)}&prop=wikitext&format=json`;
  console.log(`  Fetching: ${page}...`);
  const r = await fetch(url, { headers: HEADERS });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const d = await r.json();
  if (d.error) throw new Error(d.error.info);
  return d.parse.wikitext['*'];
}

function clean(s = '') {
  return s
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, '$1')
    .replace(/'''|''|\{\{[^}]*\}\}|<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract value from {{template|value}}
function tmplVal(s = '') {
  const m = s.match(/\{\{[^|]+\|([^}]+)\}\}/);
  return m ? m[1].trim() : '';
}

// ── MOVIMIENTOS ─────────────────────────────────────────────────
async function scrapeMoves() {
  console.log('\n[Movimientos]');
  const wt = await fetchWT('Lista de movimientos por generación');

  const moves = [];
  const seen = new Set();

  // Format per block (separated by |-):
  // | [[Name ES]]        <- link, first cell
  // | Alt name           <- second cell (sometimes same)
  // | {{t2|type}}        <- type
  // | {{clase|category}} <- category
  // | {{cualidad|...}}   <- contest (skip)
  // | Name EN            <- english name

  // Split into row blocks by "|-"
  const blocks = wt.split(/^\|-/m);

  for (const block of blocks) {
    const lines = block.split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('|') && !l.startsWith('|-') && !l.startsWith('!'));

    if (lines.length < 4) continue;

    // Line 0: | [[Nombre ES]] or | [[Link|Nombre]]
    const nameLine = lines[0].replace(/^\|/, '').trim();
    const nameMatch = nameLine.match(/\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/);
    if (!nameMatch) continue;

    const name_es = nameMatch[1].trim();
    if (!name_es || name_es.length < 2 || seen.has(name_es)) continue;

    // Line 1: alt name (skip — same or minor variant)
    // Line 2: {{t2|tipo}}
    const type_es = tmplVal(lines[2] || '');
    // Line 3: {{clase|físico/especial/estado}}
    const category_es = tmplVal(lines[3] || '');
    // Line 4: {{cualidad|...}} — skip
    // Line 5: English name (plain text)
    const name_en = (lines[5] || '').replace(/^\|/, '').trim();

    seen.add(name_es);
    moves.push({
      name_es,
      name_en: name_en || '',
      type: type_es,
      category: category_es,
    });
  }

  // Also check Champions-specific page
  try {
    const wt2 = await fetchWT('Lista de movimientos de Pokémon Champions');
    const blocks2 = wt2.split(/^\|-/m);
    for (const block of blocks2) {
      const lines = block.split('\n').map(l=>l.trim()).filter(l=>l.startsWith('|') && !l.startsWith('|-') && !l.startsWith('!'));
      if (lines.length < 2) continue;
      const nameLine = lines[0].replace(/^\|/,'').trim();
      const nm = nameLine.match(/\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/);
      if (!nm) continue;
      const name_es = nm[1].trim();
      if (!name_es || seen.has(name_es)) continue;
      const type_es = tmplVal(lines[2]||'');
      const category_es = tmplVal(lines[3]||'');
      const name_en = (lines[5]||'').replace(/^\|/,'').trim();
      seen.add(name_es);
      moves.push({ name_es, name_en, type: type_es, category: category_es, champions_only: true });
    }
  } catch(e) { console.log('  (no Champions-specific move list found)'); }

  console.log(`  → ${moves.length} movimientos`);
  return moves;
}

// ── HABILIDADES ──────────────────────────────────────────────────
async function scrapeAbilities() {
  console.log('\n[Habilidades]');
  const wt = await fetchWT('Lista de habilidades');
  const abilities = [];
  const seen = new Set();
  const blocks = wt.split(/^\|-/m);
  for (const block of blocks) {
    const lines = block.split('\n').map(l=>l.trim()).filter(l=>l.startsWith('|') && !l.startsWith('|-') && !l.startsWith('!'));
    if (lines.length < 2) continue;
    const nameLine = lines[0].replace(/^\|/,'').trim();
    const nm = nameLine.match(/\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/);
    if (!nm) continue;
    const name = nm[1].trim();
    if (!name || seen.has(name)) continue;
    const desc = clean(lines[1].replace(/^\|/,'').trim()).slice(0,300);
    seen.add(name);
    abilities.push({ name, description: desc });
  }
  // fallback
  if (abilities.length < 50) {
    const linkRe = /\[\[(?:[^\]|]+\|)?([A-ZÁÉÍÓÚÑÜ][^\]|]{2,40})\]\]/g;
    let m;
    while ((m = linkRe.exec(wt)) !== null) {
      const name = m[1].trim();
      if (!seen.has(name) && name.length > 2) { seen.add(name); abilities.push({ name }); }
    }
  }
  console.log(`  → ${abilities.length} habilidades`);
  return abilities;
}

// ── CARACTERÍSTICAS ──────────────────────────────────────────────
async function scrapeStats() {
  console.log('\n[Características]');
  const stats = [
    { id: 'hp',  name_es: 'PS',               name_en: 'HP',  abbr_es: 'PS',  abbr_en: 'HP' },
    { id: 'atk', name_es: 'Ataque',           name_en: 'Atk', abbr_es: 'Atk', abbr_en: 'Atk' },
    { id: 'def', name_es: 'Defensa',          name_en: 'Def', abbr_es: 'Def', abbr_en: 'Def' },
    { id: 'spa', name_es: 'Ataque especial',  name_en: 'SpA', abbr_es: 'SpA', abbr_en: 'SpA' },
    { id: 'spd', name_es: 'Defensa especial', name_en: 'SpD', abbr_es: 'SpD', abbr_en: 'SpD' },
    { id: 'spe', name_es: 'Velocidad',        name_en: 'Spe', abbr_es: 'Vel', abbr_en: 'Spe' },
  ];
  const champions_ev_system = {
    total_points: 66,
    max_per_stat: 32,
    effect: 'Each point = +1 flat to the stat, applied before nature multiplier',
    level: 50,
    iv: 31,
    formula_hp:  'floor((2*base + 31) * 50 / 100) + 60 + ev',
    formula_stat: 'floor(floor((2*base + 31) * 50 / 100) + 5 + ev) * nature_modifier',
    nature_plus:  1.1,
    nature_minus: 0.9,
  };
  console.log(`  → ${stats.length} stats + sistema EV de Champions`);
  return { base_stats: stats, champions_ev_system };
}

// ── TIPOS ────────────────────────────────────────────────────────
async function scrapeTypes() {
  console.log('\n[Tipos]');
  const types = [
    { id: 'normal',   name_en: 'Normal',   name_es: 'Normal',     color: '#A8A878' },
    { id: 'fire',     name_en: 'Fire',     name_es: 'Fuego',      color: '#F08030' },
    { id: 'water',    name_en: 'Water',    name_es: 'Agua',       color: '#6890F0' },
    { id: 'electric', name_en: 'Electric', name_es: 'Eléctrico',  color: '#F8D030' },
    { id: 'grass',    name_en: 'Grass',    name_es: 'Planta',     color: '#78C850' },
    { id: 'ice',      name_en: 'Ice',      name_es: 'Hielo',      color: '#98D8D8' },
    { id: 'fighting', name_en: 'Fighting', name_es: 'Lucha',      color: '#C03028' },
    { id: 'poison',   name_en: 'Poison',   name_es: 'Veneno',     color: '#A040A0' },
    { id: 'ground',   name_en: 'Ground',   name_es: 'Tierra',     color: '#E0C068' },
    { id: 'flying',   name_en: 'Flying',   name_es: 'Volador',    color: '#A890F0' },
    { id: 'psychic',  name_en: 'Psychic',  name_es: 'Psíquico',   color: '#F85888' },
    { id: 'bug',      name_en: 'Bug',      name_es: 'Bicho',      color: '#A8B820' },
    { id: 'rock',     name_en: 'Rock',     name_es: 'Roca',       color: '#B8A038' },
    { id: 'ghost',    name_en: 'Ghost',    name_es: 'Fantasma',   color: '#705898' },
    { id: 'dragon',   name_en: 'Dragon',   name_es: 'Dragón',     color: '#7038F8' },
    { id: 'dark',     name_en: 'Dark',     name_es: 'Siniestro',  color: '#705848' },
    { id: 'steel',    name_en: 'Steel',    name_es: 'Acero',      color: '#B8B8D0' },
    { id: 'fairy',    name_en: 'Fairy',    name_es: 'Hada',       color: '#EE99AC' },
    { id: 'stellar',  name_en: 'Stellar',  name_es: 'Estelar',    color: '#40B5A5' },
  ];
  // Full type chart (attacker → defender → multiplier)
  const chart = {
    normal:   {rock:0.5, steel:0.5, ghost:0},
    fire:     {fire:0.5, water:0.5, grass:2, ice:2, bug:2, rock:0.5, dragon:0.5, steel:2},
    water:    {fire:2, water:0.5, grass:0.5, ground:2, rock:2, dragon:0.5},
    electric: {water:2, electric:0.5, grass:0.5, ground:0, flying:2, dragon:0.5},
    grass:    {fire:0.5, water:2, grass:0.5, poison:0.5, ground:2, flying:0.5, bug:0.5, rock:2, dragon:0.5, steel:0.5},
    ice:      {water:0.5, grass:2, ice:0.5, ground:2, flying:2, dragon:2, steel:0.5},
    fighting: {normal:2, ice:2, poison:0.5, flying:0.5, psychic:0.5, bug:0.5, rock:2, ghost:0, dark:2, steel:2, fairy:0.5},
    poison:   {grass:2, poison:0.5, ground:0.5, rock:0.5, ghost:0.5, steel:0, fairy:2},
    ground:   {fire:2, electric:2, grass:0.5, poison:2, flying:0, bug:0.5, rock:2, steel:2},
    flying:   {electric:0.5, grass:2, fighting:2, bug:2, rock:0.5, steel:0.5},
    psychic:  {fighting:2, poison:2, psychic:0.5, dark:0, steel:0.5},
    bug:      {fire:0.5, grass:2, fighting:0.5, flying:0.5, psychic:2, ghost:0.5, dark:2, steel:0.5, fairy:0.5},
    rock:     {fire:2, ice:2, fighting:0.5, ground:0.5, flying:2, bug:2, steel:0.5},
    ghost:    {normal:0, psychic:2, ghost:2, dark:0.5},
    dragon:   {dragon:2, steel:0.5, fairy:0},
    dark:     {fighting:0.5, psychic:2, ghost:2, dark:0.5, fairy:0.5},
    steel:    {fire:0.5, water:0.5, electric:0.5, ice:2, rock:2, steel:0.5, fairy:2},
    fairy:    {fire:0.5, fighting:2, poison:0.5, dragon:2, dark:2, steel:0.5},
    stellar:  {},
  };
  for (const t of types) t.as_attacker = chart[t.id] || {};
  console.log(`  → ${types.length} tipos con tabla de efectividad`);
  return types;
}

// ── OBJETOS ─────────────────────────────────────────────────────
async function scrapeItems() {
  console.log('\n[Objetos]');
  const wt = await fetchWT('Lista de objetos');
  const items = [];
  const seen = new Set();
  const blocks = wt.split(/^\|-/m);
  for (const block of blocks) {
    const lines = block.split('\n').map(l=>l.trim()).filter(l=>l.startsWith('|') && !l.startsWith('|-') && !l.startsWith('!'));
    if (lines.length < 1) continue;
    const nameLine = lines[0].replace(/^\|/,'').trim();
    const nm = nameLine.match(/\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/);
    if (!nm) continue;
    const name = nm[1].trim();
    if (!name || seen.has(name) || name.length < 2) continue;
    const desc = lines[1] ? clean(lines[1].replace(/^\|/,'').trim()).slice(0,250) : '';
    seen.add(name);
    items.push({ name, description: desc });
  }
  if (items.length < 100) {
    const linkRe = /\[\[(?:[^\]|]+\|)?([A-ZÁÉÍÓÚÑÜ][^\]|]{1,40})\]\]/g;
    let m;
    while ((m = linkRe.exec(wt)) !== null) {
      const name = m[1].trim();
      if (!seen.has(name) && name.length > 1) { seen.add(name); items.push({ name }); }
    }
  }
  console.log(`  → ${items.length} objetos`);
  return items;
}

// ── MAIN ─────────────────────────────────────────────────────────
async function main() {
  console.log('PKM Champions — WikiDex Scraper v2');
  console.log('====================================');
  const db = {};
  const errors = [];
  for (const [key, fn] of [
    ['moves', scrapeMoves],
    ['abilities', scrapeAbilities],
    ['stats', scrapeStats],
    ['types', scrapeTypes],
    ['items', scrapeItems],
  ]) {
    try {
      db[key] = await fn();
      await new Promise(r => setTimeout(r, 400));
    } catch(e) {
      console.error(`  ✗ Error en ${key}: ${e.message}`);
      errors.push({ key, error: e.message });
    }
  }
  db.metadata = {
    scraped_at: new Date().toISOString(),
    source: 'wikidex.net',
    game: 'Pokemon Champions',
    errors,
    counts: {
      moves: db.moves?.length ?? 0,
      abilities: db.abilities?.length ?? 0,
      types: db.types?.length ?? 0,
      items: db.items?.length ?? 0,
      stats: db.stats?.base_stats?.length ?? 0,
    }
  };
  writeFileSync('pkm_champions_db.json', JSON.stringify(db, null, 2));
  console.log('\n====================================');
  console.log('✓ Guardado en pkm_champions_db.json');
  console.log('Resumen:');
  for (const [k,v] of Object.entries(db.metadata.counts)) console.log(`  ${k}: ${v}`);
  if (errors.length) { console.log('\nErrores:'); errors.forEach(e=>console.log(`  ✗ ${e.key}: ${e.error}`)); }
}

main().catch(console.error);
