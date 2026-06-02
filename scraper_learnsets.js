import { writeFileSync, readFileSync } from 'fs';

const API = 'https://www.wikidex.net/api.php';
const H = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Referer': 'https://www.wikidex.net/' };

async function fetchWT(page) {
  const url = `${API}?action=parse&page=${encodeURIComponent(page)}&prop=wikitext&format=json`;
  const r = await fetch(url, { headers: H });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const d = await r.json();
  if (d.error) throw new Error(d.error.info);
  return d.parse.wikitext['*'];
}

// Parse moves from "Anexo:Pokemon/Movimientos Champions" wikitext
// Format per block:
// |-
// | [[Move name]] or [[Alt/Primary name]]
// | {{t|type|LPZA}}
// | {{clase|category|Champions}}
function parseMoveList(wt) {
  const moves = [];
  const seen = new Set();
  const blocks = wt.split(/^\|-/m);

  for (const block of blocks) {
    const lines = block.split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('|') && !l.startsWith('|-') && !l.startsWith('!'));

    if (lines.length < 2) continue;

    // Line 0: | [[Name]] or | [[Alt/Primary]]
    const nameLine = lines[0].replace(/^\|/, '').trim();
    // Handle [[Alt name/Primary name]] — take last part after /
    const linkMatch = nameLine.match(/\[\[([^\]]+)\]\]/);
    if (!linkMatch) continue;

    let name = linkMatch[1];
    // If "Alt/Primary" format, take the last part
    if (name.includes('/')) name = name.split('/').pop().trim();
    // Strip pipe: [[Link|Display]] -> Display
    if (name.includes('|')) name = name.split('|').pop().trim();
    name = name.trim();

    if (!name || name.length < 2 || seen.has(name)) continue;

    // Line 1: {{t|type|...}}
    const typeMatch = (lines[1] || '').match(/\{\{t\|([^|]+)\|/);
    const type = typeMatch ? typeMatch[1].trim() : '';

    // Line 2: {{clase|category|...}}
    const catMatch = (lines[2] || '').match(/\{\{clase\|([^|]+)\|/);
    const category = catMatch ? catMatch[1].trim() : '';

    seen.add(name);
    moves.push({ name, type, category });
  }

  return moves;
}

// Get list of all Pokemon from the existing db
function getPokemonList() {
  // We'll scrape from the Champions pokemon list page
  return [];
}

// Main: scrape learnsets for a list of pokemon
async function scrapeLearnsets(pokemonNames) {
  const learnsets = {};
  let done = 0;

  for (const name of pokemonNames) {
    const page = `Anexo:${name}/Movimientos Champions`;
    try {
      const wt = await fetchWT(page);
      const moves = parseMoveList(wt);
      if (moves.length > 0) {
        learnsets[name] = moves;
        console.log(`  ✓ ${name}: ${moves.length} movimientos`);
      } else {
        console.log(`  - ${name}: página existe pero sin movimientos`);
      }
    } catch(e) {
      if (e.message.includes('missingtitle') || e.message.includes('HTTP 4')) {
        // Page doesn't exist — skip silently
      } else {
        console.log(`  ✗ ${name}: ${e.message}`);
      }
    }
    done++;
    if (done % 20 === 0) console.log(`  [${done}/${pokemonNames.length}]`);
    // Polite delay
    await new Promise(r => setTimeout(r, 200));
  }

  return learnsets;
}

// Get all Champions pokemon from the tier list page
async function getChampionsPokemon() {
  console.log('Fetching Champions pokemon list...');
  try {
    const wt = await fetchWT('Pokémon Champions');
    const names = new Set();
    // Extract all pokemon names from links
    const linkRe = /\[\[(?:Anexo:)?([^\]|/]+)(?:\/[^\]|]+)?(?:\|[^\]]+)?\]\]/g;
    let m;
    while ((m = linkRe.exec(wt)) !== null) {
      const n = m[1].trim();
      if (n && n.length > 2 && !n.includes(':') && !n.includes('Pokémon') 
          && !n.includes('movimiento') && !n.includes('Champions')) {
        names.add(n);
      }
    }
    return [...names];
  } catch(e) {
    console.log('Could not fetch Champions page:', e.message);
    return [];
  }
}

async function main() {
  console.log('PKM Champions — Learnset Scraper');
  console.log('==================================');

  // Get pokemon list from Champions page
  let pokemonNames = await getChampionsPokemon();
  console.log(`Found ${pokemonNames.length} pokemon names to check`);

  if (pokemonNames.length === 0) {
    // Fallback: use a known list of Champions pokemon
    pokemonNames = [
      'Sneasler','Charizard','Garchomp','Incineroar','Kingambit','Basculegion',
      'Sinistcha','Aerodactyl','Whimsicott','Dragonite','Tyranitar','Milotic',
      'Gyarados','Corviknight','Scizor','Sylveon','Gengar','Kommo-o','Primarina',
      'Gallade','Tsareena','Venusaur','Blastoise','Talonflame','Pelipper',
      'Wash Rotom','Kleavor','Glimmora','Archaludon','Farigiraf','Sableye',
      'Meowscarada','Dragapult','Mega Charizard Y','Mega Charizard X',
      'Mega Gengar','Mega Gardevoir','Mega Dragonite','Mega Greninja',
      'Mega Blastoise','Mega Tyranitar','Mega Lopunny','Mega Froslass',
      'Mega Golurk','Mega Floette','Mega Scovillain','Mega Clefable',
      'Hisuian Arcanine','Hisuian Zoroark','Alolan Ninetales',
      'Lucario','Weavile','Tinkaton','Maushold','Aegislash','Froslass',
      'Mimikyu','Togekiss','Arcanine','Ninetales','Lycanroc','Hawlucha',
      'Toxapex','Ferrothorn','Landorus','Thundurus','Tornadus',
      'Urshifu','Calyrex','Spectrier','Glastrier',
      'Sneasel de Hisui','Basculin de Hisui','Overqwil',
      'Ursaluna','Kleavor','Wyrdeer','Braviary de Hisui',
    ];
  }

  const learnsets = await scrapeLearnsets(pokemonNames);

  const output = {
    scraped_at: new Date().toISOString(),
    total_pokemon: Object.keys(learnsets).length,
    learnsets,
  };

  writeFileSync('pkm_champions_learnsets.json', JSON.stringify(output, null, 2));
  console.log(`\n✓ Saved pkm_champions_learnsets.json`);
  console.log(`  Pokemon with learnsets: ${Object.keys(learnsets).length}`);

  // Show sample
  const sample = Object.entries(learnsets)[0];
  if (sample) {
    console.log(`\nSample - ${sample[0]}:`, sample[1].map(m => m.name).join(', '));
  }
}

main().catch(console.error);
