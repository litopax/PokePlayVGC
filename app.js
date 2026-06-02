import { supabase } from './supabase-client.js';

// ─── CONSTANTS ───────────────────────────────────────────────
const NATURES = [
  'Hardy','Lonely','Brave','Adamant','Naughty','Bold','Docile','Relaxed','Impish','Lax',
  'Timid','Hasty','Serious','Jolly','Naive','Modest','Mild','Quiet','Bashful','Rash',
  'Calm','Gentle','Sassy','Careful','Quirky'
];

const NATURE_EFFECTS = {
  Lonely:'+Atk/-Def', Brave:'+Atk/-Spe', Adamant:'+Atk/-SpA', Naughty:'+Atk/-SpD',
  Bold:'+Def/-Atk', Relaxed:'+Def/-Spe', Impish:'+Def/-SpA', Lax:'+Def/-SpD',
  Timid:'+Spe/-Atk', Hasty:'+Spe/-Def', Jolly:'+Spe/-SpA', Naive:'+Spe/-SpD',
  Modest:'+SpA/-Atk', Mild:'+SpA/-Def', Quiet:'+SpA/-Spe', Rash:'+SpA/-SpD',
  Calm:'+SpD/-Atk', Gentle:'+SpD/-Def', Sassy:'+SpD/-Spe', Careful:'+SpD/-SpA',
};

const STATS = ['HP','Atk','Def','SpA','SpD','Spe'];

// Champions EV system: 66 total, max 32 per stat, each point = +1 to that stat
const EV_TOTAL_MAX = 66;
const EV_STAT_MAX = 32;

const TYPE_COLORS = {
  normal:'#A8A878',fire:'#F08030',water:'#6890F0',electric:'#F8D030',grass:'#78C850',
  ice:'#98D8D8',fighting:'#C03028',poison:'#A040A0',ground:'#E0C068',flying:'#A890F0',
  psychic:'#F85888',bug:'#A8B820',rock:'#B8A038',ghost:'#705898',dragon:'#7038F8',
  dark:'#705848',steel:'#B8B8D0',fairy:'#EE99AC',stellar:'#40B5A5'
};

const FORMAT_NAME = 'Pokémon Champions – Lv 50';
const FORMAT_SHORT = 'Champions';

const ITEMS = [
  // Mega Stones
  'Abomasite','Absolite','Aerodactylite','Aggronite','Alakazite','Altarianite','Ampharosite',
  'Audinite','Banettite','Beedrillite','Blastoisinite','Blazikenite','Cameruptite',
  'Charizardite X','Charizardite Y','Diancite','Galladite','Garchompite','Gardevoirite',
  'Gengarite','Glalitite','Gyaradosite','Heracronite','Houndoominite','Kangaskhanite',
  'Latiasite','Latiosite','Lopunnite','Lucarionite','Manectite','Mawilite','Medichamite',
  'Metagrossite','Mewtwonite X','Mewtwonite Y','Pidgeotite','Pinsirite','Sablenite',
  'Salamencite','Sceptilite','Scizorite','Sharpedonite','Slowbronite','Steelixite',
  'Swampertite','Tyranitarite','Venusaurite',
  // Z-Crystals
  'Buginium Z','Darkinium Z','Dragonium Z','Electrium Z','Fairium Z','Fightinium Z',
  'Firium Z','Flyinium Z','Ghostium Z','Grassium Z','Groundium Z','Icium Z',
  'Normalium Z','Poisonium Z','Psychium Z','Rockium Z','Steelium Z','Tapunium Z','Waterium Z',
  // Regular competitive items
  'Ability Shield','Assault Vest','Berry Juice','Black Glasses','Booster Energy',
  'Bright Powder','Choice Band','Choice Scarf','Choice Specs','Clear Amulet',
  'Covert Cloak','Dragon Fang','Eject Button','Eject Pack',
  'Expert Belt','Focus Sash','Grassy Seed','Heavy-Duty Boots','Helping Hand',
  "King's Rock",'Lax Incense','Leftovers','Life Orb','Light Clay','Lum Berry',
  'Mental Herb','Metal Coat','Metronome','Miracle Seed','Misty Seed','Muscle Band',
  'Never-Melt Ice','Occa Berry','Passho Berry','Payapa Berry','Power Herb',
  'Quick Claw','Rocky Helmet','Room Service','Rindo Berry',
  'Safety Goggles','Shell Bell','Shed Shell','Sitrus Berry','Soft Sand','Spell Tag',
  'Terrain Extender','Toxic Orb','Twisted Spoon','Wacan Berry','White Herb','Wide Lens',
  'Yache Berry','Aguav Berry','Black Belt','Black Sludge','Chesto Berry','Coba Berry',
  'Colbur Berry','Custap Berry','Figy Berry','Float Stone','Haban Berry',
  'Jaboca Berry','Kasib Berry','Kebia Berry','Chople Berry','Babiri Berry',
  'Rowap Berry','Salac Berry','Tanga Berry','Charti Berry','Shuca Berry',
  'Roseli Berry','Enigma Berry','Micle Berry','Lansat Berry','Starf Berry',
  'Liechi Berry','Petaya Berry','Apicot Berry','Leppa Berry','Aspear Berry',
  'Persim Berry','Pecha Berry','Rawst Berry','Mago Berry','Iapapa Berry','Wiki Berry'
].sort();

// ─── STAT CALCULATION ─────────────────────────────────────────
// Champions: stat = floor(base * level / 50) + EV bonus (each EV = +1)
// HP formula differs from standard, but we'll use standard Lv50 approximation + EV as flat bonus
function calcStat(base, ev, isHP, nature = null) {
  const level = 50;
  let stat;
  if (isHP) {
    stat = Math.floor((2 * base * level) / 100) + level + 10 + ev;
  } else {
    stat = Math.floor((2 * base * level) / 100) + 5 + ev;
    if (nature) {
      if (nature.startsWith('+')) stat = Math.floor(stat * 1.1);
      else if (nature.startsWith('-')) stat = Math.floor(stat * 0.9);
    }
  }
  return stat;
}

function getNatureModifiers(natureName) {
  const effect = NATURE_EFFECTS[natureName] || '';
  const mods = {};
  STATS.forEach(s => mods[s] = null);
  if (!effect) return mods;
  const plusMatch = effect.match(/\+(\w+)/);
  const minusMatch = effect.match(/-(\w+)/);
  if (plusMatch) mods[plusMatch[1]] = '+';
  if (minusMatch) mods[minusMatch[1]] = '-';
  return mods;
}

// ─── STATE ───────────────────────────────────────────────────
let state = {
  user: null,
  teams: [],
  activeTeamId: null,
  activeSlotIdx: null,
};

const POKEMON_CACHE = {};

function getActiveTeam() { return state.teams.find(t => t.id === state.activeTeamId) || null; }
function getActivePokemon() {
  const team = getActiveTeam();
  if (!team || state.activeSlotIdx === null) return null;
  return team.pokemon[state.activeSlotIdx] || null;
}

function makePokemon(name = '') {
  return {
    name, nickname: '', item: '', ability: '', nature: 'Jolly',
    shiny: false, gender: 'M', level: 50,
    moves: ['','','',''],
    evs: { HP:0, Atk:0, Def:0, SpA:0, SpD:0, Spe:0 },
    types: [], sprite: '', abilities: [], legalMoves: [],
    baseStats: null
  };
}

function makeTeam(name = 'New Team') {
  return { id: 'local_' + Date.now(), name, format: FORMAT_SHORT, pokemon: [], unsaved: true };
}

// ─── POKEAPI ─────────────────────────────────────────────────
function slugify(name) {
  return name.toLowerCase().replace(/\s+/g,'-').replace(/['.♀♂]/g,'')
    .replace(/é/g,'e').replace(/[^a-z0-9-]/g,'');
}

async function fetchPokemonData(name) {
  if (!name || name.length < 2) return null;
  const key = slugify(name);
  if (POKEMON_CACHE[key]) return POKEMON_CACHE[key];
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${key}`);
    if (!res.ok) return null;
    const data = await res.json();
    const result = {
      id: data.id,
      types: data.types.map(t => t.type.name),
      sprite: data.sprites.front_default || data.sprites.other?.['official-artwork']?.front_default || '',
      shinySprite: data.sprites.front_shiny || '',
      abilities: data.abilities.map(a => ({
        name: a.ability.name.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
        hidden: a.is_hidden
      })),
      baseStats: {
        HP: data.stats[0].base_stat, Atk: data.stats[1].base_stat,
        Def: data.stats[2].base_stat, SpA: data.stats[3].base_stat,
        SpD: data.stats[4].base_stat, Spe: data.stats[5].base_stat,
      },
      legalMoves: data.moves.map(m => m.move.name.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()))
    };
    POKEMON_CACHE[key] = result;
    return result;
  } catch(e) { return null; }
}

let ALL_POKEMON_LIST = null;
async function getAllPokemonList() {
  if (ALL_POKEMON_LIST) return ALL_POKEMON_LIST;
  try {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
    const data = await res.json();
    ALL_POKEMON_LIST = data.results.map(p => p.name.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()));
    return ALL_POKEMON_LIST;
  } catch { return []; }
}

// ─── SUPABASE ─────────────────────────────────────────────────
async function loadTeams() {
  if (!state.user) return;
  const { data, error } = await supabase.from('teams').select('*').order('updated_at', { ascending: false });
  if (error) { toast('Error loading teams', 'error'); return; }
  state.teams = data.map(t => ({ ...t, pokemon: t.pokemon || [] }));
  if (state.teams.length > 0 && !state.activeTeamId) state.activeTeamId = state.teams[0].id;
  renderAll();
}

async function saveTeam(team) {
  if (!state.user) { toast('Log in to save teams', 'error'); return; }
  const payload = { name: team.name, format: team.format, pokemon: team.pokemon,
    user_id: state.user.id, updated_at: new Date().toISOString() };
  if (team.id && !String(team.id).startsWith('local_')) {
    const { error } = await supabase.from('teams').update(payload).eq('id', team.id);
    if (error) { toast('Save failed: ' + error.message, 'error'); return; }
  } else {
    const { data, error } = await supabase.from('teams').insert(payload).select().single();
    if (error) { toast('Save failed: ' + error.message, 'error'); return; }
    const idx = state.teams.findIndex(t => t.id === team.id);
    if (idx !== -1) { state.teams[idx] = { ...data, pokemon: data.pokemon || [] }; state.activeTeamId = data.id; }
  }
  toast('Team saved!', 'success');
  renderSidebar();
}

async function deleteTeam(id) {
  if (!state.user) return;
  if (!String(id).startsWith('local_')) {
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (error) { toast('Delete failed', 'error'); return; }
  }
  state.teams = state.teams.filter(t => t.id !== id);
  if (state.activeTeamId === id) { state.activeTeamId = state.teams[0]?.id || null; state.activeSlotIdx = null; }
  renderAll();
  toast('Team deleted', 'info');
}

// ─── IMPORT/EXPORT ────────────────────────────────────────────
function exportTeam(team) {
  return team.pokemon.map(p => {
    if (!p.name) return '';
    const display = p.nickname ? `${p.nickname} (${p.name})` : p.name;
    const lines = [display + (p.gender ? ` (${p.gender})` : '') + (p.item ? ` @ ${p.item}` : '')];
    if (p.ability) lines.push(`Ability: ${p.ability}`);
    lines.push(`Level: 50`);
    if (p.shiny) lines.push('Shiny: Yes');
    const evArr = STATS.filter(s => p.evs[s] > 0).map(s => `${p.evs[s]} ${s}`);
    if (evArr.length) lines.push(`EVs: ${evArr.join(' / ')}`);
    if (p.nature) lines.push(`${p.nature} Nature`);
    p.moves.filter(Boolean).forEach(m => lines.push(`- ${m}`));
    return lines.join('\n');
  }).filter(Boolean).join('\n\n');
}

function importTeam(text) {
  return text.trim().split(/\n\n+/).map(block => {
    const lines = block.trim().split('\n');
    const p = makePokemon();
    const atMatch = lines[0].match(/^(.+?)(?:\s+@\s+(.+))?$/);
    if (atMatch) {
      let nameStr = atMatch[1].trim();
      if (atMatch[2]) p.item = atMatch[2].trim();
      const parenMatch = nameStr.match(/^(.+?)\s+\(([A-Z][a-z].+?)\)\s*(\([MF]\))?$/);
      if (parenMatch) { p.nickname = parenMatch[1].trim(); p.name = parenMatch[2].trim(); if (parenMatch[3]) p.gender = parenMatch[3].replace(/[()]/g,''); }
      else { const gm = nameStr.match(/^(.+?)\s+\(([MF])\)$/); if (gm) { p.name = gm[1].trim(); p.gender = gm[2]; } else p.name = nameStr; }
    }
    lines.slice(1).forEach(line => {
      if (line.startsWith('Ability:')) p.ability = line.replace('Ability:','').trim();
      else if (line.startsWith('Shiny: Yes')) p.shiny = true;
      else if (line.startsWith('EVs:')) line.replace('EVs:','').trim().split('/').forEach(part => { const m = part.trim().match(/(\d+)\s+(\w+)/); if (m && p.evs[m[2]] !== undefined) p.evs[m[2]] = parseInt(m[1]); });
      else if (line.match(/Nature$/)) p.nature = line.replace('Nature','').trim();
      else if (line.startsWith('- ')) { const mi = p.moves.indexOf(''); if (mi !== -1) p.moves[mi] = line.replace('- ','').trim(); }
    });
    p.level = 50;
    return p;
  }).filter(p => p.name);
}

// ─── MODALS ───────────────────────────────────────────────────
window.openImportModal = () => {
  document.getElementById('import-modal-textarea').value = '';
  document.getElementById('import-modal').classList.add('open');
};
window.closeImportModal = () => document.getElementById('import-modal').classList.remove('open');

window.openExportModal = () => {
  const team = getActiveTeam(); if (!team) return;
  document.getElementById('export-modal-textarea').value = exportTeam(team);
  document.getElementById('export-modal').classList.add('open');
};
window.closeExportModal = () => document.getElementById('export-modal').classList.remove('open');

window.doImport = async () => {
  const text = document.getElementById('import-modal-textarea').value || '';
  if (!text.trim()) return;
  const team = getActiveTeam(); if (!team) return;
  const imported = importTeam(text);
  if (!imported.length) { toast('Nada para importar', 'error'); return; }
  team.pokemon = imported.slice(0,6);
  await Promise.all(team.pokemon.map(async p => {
    if (p.name) {
      const data = await fetchPokemonData(p.name);
      if (data) { p.types = data.types; p.sprite = data.sprite; p.shinySprite = data.shinySprite; p.abilities = data.abilities; p.legalMoves = data.legalMoves; p.baseStats = data.baseStats; }
    }
  }));
  state.activeSlotIdx = null;
  closeImportModal();
  renderAll();
  toast(`Importados ${team.pokemon.length} Pokémon!`, 'success');
};

window.copyExportModal = () => {
  const ta = document.getElementById('export-modal-textarea');
  if (ta) navigator.clipboard.writeText(ta.value).then(() => toast('Copiado!', 'success'));
};

// ─── AUTOCOMPLETE ─────────────────────────────────────────────
function createACDropdown() {
  if (document.getElementById('ac-dropdown')) return;
  const el = document.createElement('div');
  el.id = 'ac-dropdown';
  el.className = 'ac-dropdown';
  document.body.appendChild(el);
}

function positionDropdown(inputEl) {
  const rect = inputEl.getBoundingClientRect();
  const dd = document.getElementById('ac-dropdown');
  if (!dd) return;
  dd.style.left = rect.left + 'px';
  dd.style.top = (rect.bottom + 2) + 'px';
  dd.style.width = rect.width + 'px';
  // don't set right — let width control it
}

function showDropdown(inputEl, items, onSelect, selectedIdx = 0) {
  createACDropdown();
  const dd = document.getElementById('ac-dropdown');
  if (!items.length) { hideDropdown(); return; }
  dd.innerHTML = items.slice(0,12).map((item, i) => {
    const label = typeof item === 'object' ? item.label : item;
    const sub = typeof item === 'object' && item.sub ? `<span class="ac-sub">${escHtml(item.sub)}</span>` : '';
    return `<div class="ac-item${i === selectedIdx ? ' ac-selected' : ''}" data-idx="${i}">${escHtml(label)}${sub}</div>`;
  }).join('');
  positionDropdown(inputEl);
  dd.style.display = 'block';
  dd.querySelectorAll('.ac-item').forEach(el => {
    el.addEventListener('mousedown', e => { e.preventDefault(); onSelect(items[parseInt(el.dataset.idx)]); });
  });
}

function hideDropdown() {
  const dd = document.getElementById('ac-dropdown');
  if (dd) dd.style.display = 'none';
}

function updateDropdownSelection(idx) {
  const dd = document.getElementById('ac-dropdown');
  if (!dd) return;
  dd.querySelectorAll('.ac-item').forEach((el, i) => el.classList.toggle('ac-selected', i === idx));
  const sel = dd.querySelector('.ac-selected');
  if (sel) sel.scrollIntoView({ block: 'nearest' });
}

function setupAutocomplete(inputEl, getItems, onSelect, opts = {}) {
  let selectedIdx = -1;
  let currentItems = [];
  let debounceTimer;

  async function refresh(val) {
    currentItems = await getItems(val);
    selectedIdx = currentItems.length > 0 ? 0 : -1;
    showDropdown(inputEl, currentItems, item => {
      const v = typeof item === 'object' ? item.label : item;
      inputEl.value = v;
      onSelect(v, item);
      hideDropdown();
      selectedIdx = -1;
    }, selectedIdx);
  }

  inputEl.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => refresh(inputEl.value), opts.debounce || 120);
  });
  inputEl.addEventListener('focus', () => refresh(inputEl.value));
  inputEl.addEventListener('keydown', e => {
    const dd = document.getElementById('ac-dropdown');
    if (!dd || dd.style.display === 'none') {
      if (e.key === 'ArrowDown' || e.key === 'Enter') refresh(inputEl.value);
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx = Math.min(selectedIdx+1, Math.min(currentItems.length,12)-1); updateDropdownSelection(selectedIdx); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIdx = Math.max(selectedIdx-1, 0); updateDropdownSelection(selectedIdx); }
    else if (e.key === 'Enter' || e.key === 'Tab') {
      if (selectedIdx >= 0 && currentItems[selectedIdx]) {
        e.preventDefault();
        const item = currentItems[selectedIdx];
        const v = typeof item === 'object' ? item.label : item;
        inputEl.value = v; onSelect(v, item); hideDropdown(); selectedIdx = -1;
      }
    } else if (e.key === 'Escape') hideDropdown();
  });
  inputEl.addEventListener('blur', () => setTimeout(hideDropdown, 150));
}

function setupItemAC(inputEl) {
  setupAutocomplete(inputEl, async (val) => {
    const v = val.toLowerCase();
    const exact = ITEMS.filter(i => i.toLowerCase().startsWith(v));
    const fuzzy = ITEMS.filter(i => !i.toLowerCase().startsWith(v) && i.toLowerCase().includes(v));
    return [...exact, ...fuzzy].slice(0, 12);
  }, (val) => { const p = getActivePokemon(); if (p) p.item = val; });
}

function setupNatureAC(inputEl) {
  setupAutocomplete(inputEl, async (val) => {
    const v = val.toLowerCase();
    const all = NATURES.map(n => ({ label: n, sub: NATURE_EFFECTS[n] || 'Neutral' }));
    const exact = all.filter(n => n.label.toLowerCase().startsWith(v));
    const fuzzy = all.filter(n => !n.label.toLowerCase().startsWith(v) && n.label.toLowerCase().includes(v));
    return [...exact, ...fuzzy];
  }, (val) => { const p = getActivePokemon(); if (p) { p.nature = val; renderEditor(); } });
}

function setupAbilityAC(inputEl, abilities) {
  setupAutocomplete(inputEl, async (val) => {
    const v = val.toLowerCase();
    const items = abilities.map(a => ({ label: typeof a === 'object' ? a.name : a, sub: typeof a === 'object' && a.hidden ? 'Hidden' : '' }));
    return [...items.filter(i => i.label.toLowerCase().startsWith(v)), ...items.filter(i => !i.label.toLowerCase().startsWith(v))];
  }, (val) => { const p = getActivePokemon(); if (p) p.ability = val; });
}

function setupPokemonAC(inputEl) {
  setupAutocomplete(inputEl, async (val) => {
    if (!val || val.length < 1) return [];
    const list = await getAllPokemonList();
    const v = val.toLowerCase();
    return [...list.filter(p => p.toLowerCase().startsWith(v)), ...list.filter(p => !p.toLowerCase().startsWith(v) && p.toLowerCase().includes(v))].slice(0, 12);
  }, (val) => handlePokemonNameChange(val), { debounce: 80 });
}

function setupMoveAC(inputEl, moveIdx, legalMoves) {
  setupAutocomplete(inputEl, async (val) => {
    const v = val.toLowerCase();
    return (legalMoves || []).filter(m => !v || m.toLowerCase().includes(v)).map(m => ({ label: m })).slice(0, 12);
  }, (val) => { const p = getActivePokemon(); if (p) p.moves[moveIdx] = val; }, { debounce: 80 });
}

// ─── RENDER ───────────────────────────────────────────────────
function renderAll() { renderSidebar(); renderContent(); }

function renderSidebar() {
  const list = document.getElementById('team-list');
  if (!list) return;
  if (!state.teams.length) { list.innerHTML = `<div class="no-teams">No hay equipos.<br>Crea uno para empezar.</div>`; return; }
  list.innerHTML = state.teams.map(team => {
    const isActive = team.id === state.activeTeamId;
    const count = team.pokemon.filter(p => p && p.name).length;
    return `<div class="team-item ${isActive?'active':''}" onclick="handleTeamSelect('${team.id}')">
      <div class="team-item-icon">⚔️</div>
      <div class="team-item-info">
        <div class="team-item-name">${escHtml(team.name)}</div>
        <div class="team-item-meta">${FORMAT_SHORT} · ${count}/6</div>
      </div>
      <div class="team-item-actions">
        <button class="btn btn-icon btn-danger" onclick="handleDeleteTeam('${team.id}',event)">🗑</button>
      </div>
    </div>`;
  }).join('');
}

function renderContent() {
  const content = document.getElementById('content-area');
  if (!content) return;
  const team = getActiveTeam();
  if (!team) {
    content.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🏆</div><h3>NINGÚN EQUIPO<br>SELECCIONADO</h3><p>Crea un equipo desde el sidebar.</p></div>`;
    return;
  }
  const slots = Array.from({length:6}, (_,i) => {
    const p = team.pokemon[i];
    return (p && p.name) ? renderFilledSlot(p, i) : `
      <div class="pokemon-slot empty" onclick="handleAddPokemon(${i})">
        <div class="empty-icon">➕</div><span>Agregar Pokémon</span>
      </div>`;
  });

  content.innerHTML = `
    <div class="team-header">
      <div class="team-name-row">
        <input class="team-name-input" value="${escHtml(team.name)}" placeholder="Nombre del equipo" onchange="handleTeamNameChange(this.value)">
        <span class="format-badge">${FORMAT_NAME}</span>
      </div>
      <div class="team-actions">
        <button class="btn btn-ghost" onclick="openImportModal()">📥 Importar</button>
        <button class="btn btn-ghost" onclick="openExportModal()">📋 Exportar</button>
        <button class="btn btn-gold" onclick="handleSaveTeam()">💾 Guardar</button>
      </div>
    </div>
    <div id="editor-container"></div>
    <div class="pokemon-grid" id="pokemon-grid">${slots.join('')}</div>`;

  if (state.activeSlotIdx !== null && getActivePokemon()) renderEditor();
}

function renderFilledSlot(p, idx) {
  const isActive = state.activeSlotIdx === idx;
  const typeBar = p.types.length
    ? `background:linear-gradient(90deg,${p.types.map((t,i)=>`${TYPE_COLORS[t]||'#888'} ${i*50}%`).join(',')})`
    : 'background:var(--border)';
  const evTotal = Object.values(p.evs).reduce((a,b)=>a+b,0);
  const evPips = STATS.map(s => {
    const pct = (p.evs[s]||0)/EV_STAT_MAX;
    return `<div class="ev-pip" style="opacity:${0.15+pct*0.85};background:${pct>=1?'var(--gold)':'var(--red)'}"></div>`;
  }).join('');
  return `<div class="pokemon-slot${isActive?' active':''}" onclick="handleSlotClick(${idx})">
    <div class="slot-type-bar" style="${typeBar}"></div>
    <div class="slot-header">
      <div class="slot-sprite-wrap">
        ${p.sprite?`<img class="slot-sprite" src="${p.shiny?(p.shinySprite||p.sprite):p.sprite}" alt="${p.name}" loading="lazy">`
          :'<div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center;font-size:24px">🔴</div>'}
      </div>
      <div class="slot-info">
        <div class="slot-name">${p.nickname||p.name}${p.shiny?' <span class="shiny-star">✦</span>':''}</div>
        <div class="slot-types">
          ${p.types.map(t=>`<span class="type-chip" style="background:${TYPE_COLORS[t]||'#888'}">${t}</span>`).join('')}
        </div>
        ${p.item?`<div class="slot-item">⚙ ${escHtml(p.item)}</div>`:''}
      </div>
      <button class="btn btn-icon btn-danger" style="position:absolute;top:6px;right:6px" onclick="handleRemovePokemon(${idx},event)">✕</button>
    </div>
    <div class="slot-moves">
      ${p.moves.map(m=>`<div class="move-chip">${m||'—'}</div>`).join('')}
    </div>
    <div class="slot-footer">
      <div class="ev-mini">${evPips}</div>
      <span class="nature-tag">${p.nature} · ${evTotal}pts</span>
    </div>
  </div>`;
}

function renderEditor() {
  const container = document.getElementById('editor-container');
  if (!container) return;
  const p = getActivePokemon();
  if (!p) { container.innerHTML = ''; return; }

  const total = Object.values(p.evs).reduce((a,b)=>a+b,0);
  const remaining = EV_TOTAL_MAX - total;
  const natureMods = getNatureModifiers(p.nature);
  const bs = p.baseStats;

  container.innerHTML = `
    <div class="editor-panel">
      <div class="editor-tabs">
        <span class="editor-tab-title">Editando: <strong>${escHtml(p.name||'Pokémon')}</strong></span>
        <div style="flex:1"></div>
        <button class="btn btn-danger btn-sm" onclick="handleRemovePokemon(${state.activeSlotIdx})">✕ Quitar</button>
      </div>
      <div class="editor-body">
        <div class="editor-top">
          <div class="editor-sprite-zone">
            ${p.sprite
              ? `<img class="editor-sprite" src="${p.shiny&&p.shinySprite?p.shinySprite:p.sprite}" alt="${p.name}">`
              : `<div class="sprite-placeholder">🔴</div>`}
            <label style="display:flex;align-items:center;gap:6px;margin-top:8px;cursor:pointer;font-size:12px;color:var(--text-muted);justify-content:center">
              <input type="checkbox" ${p.shiny?'checked':''} onchange="updatePokemonField('shiny',this.checked);renderContent()"> <span class="shiny-star">✦</span> Shiny
            </label>
          </div>
          <div class="editor-fields">
            <div class="field-group" style="grid-column:span 2">
              <label class="field-label">Pokémon</label>
              <input id="ac-pokemon-name" class="field-input" value="${escHtml(p.name)}" placeholder="ej. Garchomp" autocomplete="off">
            </div>
            <div class="field-group">
              <label class="field-label">Apodo</label>
              <input class="field-input" value="${escHtml(p.nickname)}" placeholder="Opcional" oninput="updatePokemonFieldSilent('nickname',this.value)">
            </div>
            <div class="field-group">
              <label class="field-label">Género</label>
              <select class="field-select" onchange="updatePokemonField('gender',this.value)">
                <option${p.gender==='M'?' selected':''}>M</option>
                <option${p.gender==='F'?' selected':''}>F</option>
                <option${p.gender===''?' selected':''} value="">—</option>
              </select>
            </div>
            <div class="field-group" style="grid-column:span 2">
              <label class="field-label">Objeto</label>
              <input id="ac-item" class="field-input" value="${escHtml(p.item)}" placeholder="ej. Choice Scarf" autocomplete="off">
            </div>
            <div class="field-group">
              <label class="field-label">Habilidad</label>
              <input id="ac-ability" class="field-input" value="${escHtml(p.ability)}" placeholder="${p.abilities.length?'Seleccionar':'Elige un Pokémon primero'}" autocomplete="off" ${!p.abilities.length?'readonly':''}>
            </div>
            <div class="field-group">
              <label class="field-label">Naturaleza</label>
              <input id="ac-nature" class="field-input" value="${escHtml(p.nature)}" placeholder="ej. Jolly" autocomplete="off">
            </div>
          </div>
        </div>

        <div class="moves-section">
          <div class="section-label">Movimientos</div>
          <div class="moves-grid">
            ${p.moves.map((m,i)=>`
              <div class="move-input-wrap">
                <span class="move-num">${i+1}</span>
                <input id="ac-move-${i}" class="move-input" value="${escHtml(m)}" placeholder="Movimiento ${i+1}" autocomplete="off">
              </div>`).join('')}
          </div>
        </div>

        <div class="evs-section">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
            <div class="section-label">Puntos de esfuerzo</div>
            <span class="ev-total ${total>EV_TOTAL_MAX?'over':'ok'}">${total}/${EV_TOTAL_MAX} <span style="color:var(--text-muted);font-size:10px">(${remaining>=0?remaining:0} restantes)</span></span>
          </div>
          ${STATS.map(s => {
            const natMod = natureMods[s];
            const statVal = bs ? calcStat(bs[s], p.evs[s], s==='HP', natMod) : '—';
            const natClass = natMod==='+' ? 'stat-plus' : natMod==='-' ? 'stat-minus' : '';
            return `
            <div class="ev-row">
              <span class="ev-stat-name ${natClass}">${s}</span>
              <div class="ev-track" data-ev-stat="${s}" onclick="handleEvTrackClick(event,'${s}')">
                <div class="ev-fill${p.evs[s]>=EV_STAT_MAX?' maxed':''}" style="width:${(p.evs[s]/EV_STAT_MAX)*100}%"></div>
              </div>
              <input class="ev-input" type="number" min="0" max="${EV_STAT_MAX}" value="${p.evs[s]}"
                oninput="updateEV('${s}',parseInt(this.value)||0)">
              <span class="stat-final ${natClass}">${statVal}</span>
            </div>`;
          }).join('')}
          <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
            <button class="btn btn-ghost btn-sm" onclick="spreadEVs()">Atk/Spe</button>
            <button class="btn btn-ghost btn-sm" onclick="spreadEVsSpecial()">SpA/Spe</button>
            <button class="btn btn-ghost btn-sm" onclick="clearEVs()">Limpiar</button>
          </div>
        </div>
      </div>
    </div>`;

  setupEditorAutocompletes(p);
}

function setupEditorAutocompletes(p) {
  const nameEl = document.getElementById('ac-pokemon-name');
  const itemEl = document.getElementById('ac-item');
  const abilityEl = document.getElementById('ac-ability');
  const natureEl = document.getElementById('ac-nature');

  if (nameEl) setupPokemonAC(nameEl);
  if (itemEl) setupItemAC(itemEl);
  if (abilityEl && p.abilities.length) setupAbilityAC(abilityEl, p.abilities);
  if (natureEl) setupNatureAC(natureEl);

  p.moves.forEach((_,i) => {
    const el = document.getElementById(`ac-move-${i}`);
    if (el) setupMoveAC(el, i, p.legalMoves);
  });
}

// ─── EVENT HANDLERS ───────────────────────────────────────────
window.handleTeamSelect = (id) => { state.activeTeamId = id; state.activeSlotIdx = null; renderAll(); };
window.handleDeleteTeam = (id, e) => { e?.stopPropagation(); if (confirm('¿Eliminar este equipo?')) deleteTeam(id); };

window.handleSlotClick = (idx) => {
  state.activeSlotIdx = state.activeSlotIdx === idx ? null : idx;
  renderContent();
};

window.handleAddPokemon = (idx) => {
  const team = getActiveTeam();
  if (!team) return;
  while (team.pokemon.length <= idx) team.pokemon.push(makePokemon());
  if (!team.pokemon[idx] || !team.pokemon[idx].moves) team.pokemon[idx] = makePokemon();
  state.activeSlotIdx = idx;
  renderContent();
};

window.handleRemovePokemon = (idx, e) => {
  e?.stopPropagation();
  const team = getActiveTeam(); if (!team) return;
  team.pokemon.splice(idx, 1);
  if (state.activeSlotIdx === idx) state.activeSlotIdx = null;
  renderContent();
};

window.handleTeamNameChange = (val) => { const t = getActiveTeam(); if (t) { t.name = val; renderSidebar(); } };
window.handleSaveTeam = async () => { const t = getActiveTeam(); if (t) await saveTeam(t); };

window.handlePokemonNameChange = async (name) => {
  const team = getActiveTeam(); if (!team || state.activeSlotIdx === null) return;
  const p = team.pokemon[state.activeSlotIdx];
  p.name = name;
  const data = await fetchPokemonData(name);
  if (data) {
    p.types = data.types; p.sprite = data.sprite; p.shinySprite = data.shinySprite;
    p.abilities = data.abilities; p.legalMoves = data.legalMoves; p.baseStats = data.baseStats;
    if (!p.ability && data.abilities.length) p.ability = data.abilities[0].name;
  }
  renderContent();
};

window.updatePokemonFieldSilent = (field, value) => { const p = getActivePokemon(); if (p) p[field] = value; };

window.updatePokemonField = (field, value) => {
  const p = getActivePokemon(); if (!p) return;
  p[field] = value;
  const grid = document.getElementById('pokemon-grid');
  if (grid) {
    const team = getActiveTeam();
    grid.innerHTML = Array.from({length:6}, (_,i) => {
      const sp = team.pokemon[i];
      return (sp && sp.name) ? renderFilledSlot(sp, i) : `<div class="pokemon-slot empty" onclick="handleAddPokemon(${i})"><div class="empty-icon">➕</div><span>Agregar Pokémon</span></div>`;
    }).join('');
  }
};

window.updateEV = (stat, value) => {
  const p = getActivePokemon(); if (!p) return;
  const total = Object.values(p.evs).reduce((a,b)=>a+b,0);
  const newVal = Math.max(0, Math.min(EV_STAT_MAX, parseInt(value)||0));
  // Enforce total cap
  const otherTotal = total - p.evs[stat];
  p.evs[stat] = Math.min(newVal, EV_TOTAL_MAX - otherTotal);

  // Update DOM in-place
  const fill = document.querySelector(`[data-ev-stat="${stat}"] .ev-fill`);
  if (fill) {
    fill.style.width = `${(p.evs[stat]/EV_STAT_MAX)*100}%`;
    fill.className = `ev-fill${p.evs[stat]>=EV_STAT_MAX?' maxed':''}`;
  }
  const newTotal = Object.values(p.evs).reduce((a,b)=>a+b,0);
  const totalEl = document.querySelector('.ev-total');
  if (totalEl) {
    const rem = EV_TOTAL_MAX - newTotal;
    totalEl.className = `ev-total ${newTotal>EV_TOTAL_MAX?'over':'ok'}`;
    totalEl.innerHTML = `${newTotal}/${EV_TOTAL_MAX} <span style="color:var(--text-muted);font-size:10px">(${rem>=0?rem:0} restantes)</span>`;
  }
  // Update stat final value
  const natureMods = getNatureModifiers(p.nature);
  const bs = p.baseStats;
  if (bs) {
    const natMod = natureMods[stat];
    const statVal = calcStat(bs[stat], p.evs[stat], stat==='HP', natMod);
    const finalEl = document.querySelector(`.ev-row [data-ev-stat="${stat}"] ~ .stat-final`);
    // simpler: find all ev-rows and update the right one
    document.querySelectorAll('.ev-row').forEach(row => {
      const track = row.querySelector('[data-ev-stat]');
      if (track && track.dataset.evStat === stat) {
        const sf = row.querySelector('.stat-final');
        if (sf) sf.textContent = statVal;
        // also update input value if capped
        const inp = row.querySelector('.ev-input');
        if (inp && parseInt(inp.value) !== p.evs[stat]) inp.value = p.evs[stat];
      }
    });
  }
};

window.handleEvTrackClick = (e, stat) => {
  const r = e.currentTarget.getBoundingClientRect();
  updateEV(stat, Math.round((e.clientX-r.left)/r.width * EV_STAT_MAX));
};

window.spreadEVs = () => {
  const p = getActivePokemon(); if (!p) return;
  STATS.forEach(s => p.evs[s]=0);
  p.evs.Atk = Math.min(32, EV_TOTAL_MAX);
  p.evs.Spe = Math.min(32, EV_TOTAL_MAX - p.evs.Atk);
  p.evs.HP = Math.min(2, EV_TOTAL_MAX - p.evs.Atk - p.evs.Spe);
  renderEditor();
};
window.spreadEVsSpecial = () => {
  const p = getActivePokemon(); if (!p) return;
  STATS.forEach(s => p.evs[s]=0);
  p.evs.SpA = Math.min(32, EV_TOTAL_MAX);
  p.evs.Spe = Math.min(32, EV_TOTAL_MAX - p.evs.SpA);
  p.evs.HP = Math.min(2, EV_TOTAL_MAX - p.evs.SpA - p.evs.Spe);
  renderEditor();
};
window.clearEVs = () => { const p = getActivePokemon(); if (!p) return; STATS.forEach(s => p.evs[s]=0); renderEditor(); };

window.handleNewTeam = () => {
  const team = makeTeam(); state.teams.unshift(team);
  state.activeTeamId = team.id; state.activeSlotIdx = null; renderAll();
};

// ─── AUTH ─────────────────────────────────────────────────────
window.handleAuthSubmit = async () => {
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const tab = document.querySelector('.auth-tab.active')?.dataset.tab || 'login';
  const errEl = document.getElementById('auth-error');
  if (!email || !password) return;
  if (tab === 'login') {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { errEl.textContent = error.message; errEl.classList.add('visible'); }
  } else {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) { errEl.textContent = error.message; errEl.classList.add('visible'); }
    else { errEl.textContent = '¡Revisá tu email para confirmar!'; errEl.style.color = 'var(--green)'; errEl.classList.add('visible'); }
  }
};
window.handleAuthTabSwitch = (tab) => { document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab)); };
window.handleLogout = async () => await supabase.auth.signOut();

// ─── TOAST ───────────────────────────────────────────────────
function toast(msg, type = 'info') {
  const c = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${{success:'✓',error:'✕',info:'ℹ'}[type]}</span> ${escHtml(msg)}`;
  c.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function escHtml(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── INIT ─────────────────────────────────────────────────────
async function init() {
  createACDropdown();
  getAllPokemonList();

  supabase.auth.onAuthStateChange(async (event, session) => {
    state.user = session?.user || null;
    const overlay = document.getElementById('auth-overlay');
    const userInfo = document.getElementById('user-info');
    if (state.user) {
      overlay.style.display = 'none';
      userInfo.innerHTML = `<div class="user-avatar">👤</div><span>${escHtml(state.user.email.split('@')[0])}</span><button class="btn btn-ghost btn-sm" onclick="handleLogout()">Salir</button>`;
      await loadTeams();
    } else {
      overlay.style.display = 'flex';
      userInfo.innerHTML = '';
      state.teams = []; state.activeTeamId = null;
      renderAll();
    }
  });

  document.getElementById('auth-password')?.addEventListener('keydown', e => { if (e.key === 'Enter') handleAuthSubmit(); });
  document.addEventListener('click', e => {
    const dd = document.getElementById('ac-dropdown');
    if (dd && !dd.contains(e.target) && !e.target.matches('.field-input,.move-input')) hideDropdown();
  });
}

init();
