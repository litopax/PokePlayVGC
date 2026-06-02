import { supabase } from './supabase-client.js';

// ─── CONSTANTS ───────────────────────────────────────────────
const NATURES = [
  'Hardy','Lonely','Brave','Adamant','Naughty','Bold','Docile','Relaxed','Impish','Lax',
  'Timid','Hasty','Serious','Jolly','Naive','Modest','Mild','Quiet','Bashful','Rash',
  'Calm','Gentle','Sassy','Careful','Quirky'
];

const FORMATS = ['OU','Ubers','UU','RU','NU','PU','LC','Doubles OU','VGC 2024','National Dex','Monotype','Random Battle'];

const STATS = ['HP','Atk','Def','SpA','SpD','Spe'];

const TYPE_COLORS = {
  normal:'#A8A878',fire:'#F08030',water:'#6890F0',electric:'#F8D030',grass:'#78C850',
  ice:'#98D8D8',fighting:'#C03028',poison:'#A040A0',ground:'#E0C068',flying:'#A890F0',
  psychic:'#F85888',bug:'#A8B820',rock:'#B8A038',ghost:'#705898',dragon:'#7038F8',
  dark:'#705848',steel:'#B8B8D0',fairy:'#EE99AC',stellar:'#40B5A5'
};

const POKEMON_DATA_CACHE = {};

// ─── STATE ───────────────────────────────────────────────────
let state = {
  user: null,
  teams: [],
  activeTeamId: null,
  activeSlotIdx: null,
  editorTab: 'main',
  loading: false,
};

function getActiveTeam() {
  return state.teams.find(t => t.id === state.activeTeamId) || null;
}

function getActivePokemon() {
  const team = getActiveTeam();
  if (!team || state.activeSlotIdx === null) return null;
  return team.pokemon[state.activeSlotIdx] || null;
}

function makePokemon(name = '') {
  return {
    name, nickname: '', item: '', ability: '', nature: 'Hardy',
    shiny: false, gender: 'M', level: 100,
    teraType: '', moves: ['','','',''],
    evs: { HP:0, Atk:0, Def:0, SpA:0, SpD:0, Spe:0 },
    ivs: { HP:31, Atk:31, Def:31, SpA:31, SpD:31, Spe:31 },
    types: [], sprite: '', abilities: []
  };
}

function makeTeam(name = 'New Team') {
  return {
    id: 'local_' + Date.now(),
    name, format: 'OU',
    pokemon: [],
    unsaved: true,
  };
}

// ─── POKEAPI ─────────────────────────────────────────────────
async function fetchPokemonData(name) {
  if (!name) return null;
  const key = name.toLowerCase().replace(/\s+/g,'-').replace(/['.]/g,'');
  if (POKEMON_DATA_CACHE[key]) return POKEMON_DATA_CACHE[key];
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${key}`);
    if (!res.ok) return null;
    const data = await res.json();
    const result = {
      types: data.types.map(t => t.type.name),
      sprite: data.sprites.front_default || data.sprites.other?.['official-artwork']?.front_default || '',
      abilities: data.abilities.map(a => a.ability.name.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())),
      baseStats: {
        HP: data.stats[0].base_stat, Atk: data.stats[1].base_stat,
        Def: data.stats[2].base_stat, SpA: data.stats[3].base_stat,
        SpD: data.stats[4].base_stat, Spe: data.stats[5].base_stat,
      }
    };
    POKEMON_DATA_CACHE[key] = result;
    return result;
  } catch { return null; }
}

// ─── SUPABASE HELPERS ─────────────────────────────────────────
async function loadTeams() {
  if (!state.user) return;
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) { toast('Error loading teams', 'error'); return; }
  state.teams = data.map(t => ({ ...t, pokemon: t.pokemon || [] }));
  if (state.teams.length > 0 && !state.activeTeamId) {
    state.activeTeamId = state.teams[0].id;
  }
  renderAll();
}

async function saveTeam(team) {
  if (!state.user) { toast('Log in to save teams', 'error'); return; }
  const payload = {
    name: team.name,
    format: team.format,
    pokemon: team.pokemon,
    user_id: state.user.id,
    updated_at: new Date().toISOString(),
  };

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
  if (state.activeTeamId === id) {
    state.activeTeamId = state.teams[0]?.id || null;
    state.activeSlotIdx = null;
  }
  renderAll();
  toast('Team deleted', 'info');
}

// ─── IMPORT/EXPORT (Showdown format) ─────────────────────────
function exportTeam(team) {
  return team.pokemon.map(p => {
    if (!p.name) return '';
    let lines = [];
    const display = p.nickname ? `${p.nickname} (${p.name})` : p.name;
    lines.push(display + (p.gender ? ` (${p.gender})` : '') + (p.item ? ` @ ${p.item}` : ''));
    if (p.ability) lines.push(`Ability: ${p.ability}`);
    if (p.level !== 100) lines.push(`Level: ${p.level}`);
    if (p.shiny) lines.push('Shiny: Yes');
    if (p.teraType) lines.push(`Tera Type: ${p.teraType}`);
    const evArr = STATS.filter(s => p.evs[s] > 0).map(s => `${p.evs[s]} ${s}`);
    if (evArr.length) lines.push(`EVs: ${evArr.join(' / ')}`);
    if (p.nature) lines.push(`${p.nature} Nature`);
    const ivArr = STATS.filter(s => p.ivs[s] !== 31).map(s => `${p.ivs[s]} ${s}`);
    if (ivArr.length) lines.push(`IVs: ${ivArr.join(' / ')}`);
    p.moves.filter(Boolean).forEach(m => lines.push(`- ${m}`));
    return lines.join('\n');
  }).filter(Boolean).join('\n\n');
}

function importTeam(text) {
  const blocks = text.trim().split(/\n\n+/);
  return blocks.map(block => {
    const lines = block.trim().split('\n');
    const p = makePokemon();
    const firstLine = lines[0];
    const atMatch = firstLine.match(/^(.+?)(?:\s+@\s+(.+))?$/);
    if (atMatch) {
      let nameStr = atMatch[1].trim();
      if (atMatch[2]) p.item = atMatch[2].trim();
      const parenMatch = nameStr.match(/^(.+?)\s+\(([A-Z][a-z]+)\)\s*(\([MF]\))?$/);
      if (parenMatch) {
        p.nickname = parenMatch[1].trim();
        p.name = parenMatch[2].trim();
        if (parenMatch[3]) p.gender = parenMatch[3].replace(/[()]/g,'');
      } else {
        const genderMatch = nameStr.match(/^(.+?)\s+\(([MF])\)$/);
        if (genderMatch) { p.name = genderMatch[1].trim(); p.gender = genderMatch[2]; }
        else p.name = nameStr;
      }
    }
    lines.slice(1).forEach(line => {
      if (line.startsWith('Ability:')) p.ability = line.replace('Ability:','').trim();
      else if (line.startsWith('Level:')) p.level = parseInt(line.replace('Level:','').trim()) || 100;
      else if (line.startsWith('Shiny: Yes')) p.shiny = true;
      else if (line.startsWith('Tera Type:')) p.teraType = line.replace('Tera Type:','').trim();
      else if (line.startsWith('EVs:')) {
        line.replace('EVs:','').trim().split('/').forEach(part => {
          const m = part.trim().match(/(\d+)\s+(\w+)/);
          if (m && p.evs[m[2]] !== undefined) p.evs[m[2]] = parseInt(m[1]);
        });
      } else if (line.startsWith('IVs:')) {
        line.replace('IVs:','').trim().split('/').forEach(part => {
          const m = part.trim().match(/(\d+)\s+(\w+)/);
          if (m && p.ivs[m[2]] !== undefined) p.ivs[m[2]] = parseInt(m[1]);
        });
      } else if (line.match(/Nature$/)) {
        p.nature = line.replace('Nature','').trim();
      } else if (line.startsWith('- ')) {
        const mi = p.moves.indexOf('');
        if (mi !== -1) p.moves[mi] = line.replace('- ','').trim();
      }
    });
    return p;
  }).filter(p => p.name);
}

// ─── RENDER ───────────────────────────────────────────────────
function renderAll() {
  renderSidebar();
  renderContent();
}

function renderSidebar() {
  const list = document.getElementById('team-list');
  if (!list) return;

  if (state.teams.length === 0) {
    list.innerHTML = `<div class="no-teams">No teams yet.<br>Create one to get started.</div>`;
    return;
  }

  list.innerHTML = state.teams.map(team => {
    const count = team.pokemon.length;
    const isActive = team.id === state.activeTeamId;
    return `
      <div class="team-item ${isActive ? 'active' : ''}" data-id="${team.id}">
        <div class="team-item-icon">⚔️</div>
        <div class="team-item-info">
          <div class="team-item-name">${escHtml(team.name)}</div>
          <div class="team-item-meta">${team.format} · ${count}/6 PKM</div>
        </div>
        <div class="team-item-actions">
          <button class="btn btn-icon btn-ghost" title="Delete" onclick="handleDeleteTeam('${team.id}',event)">🗑</button>
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.team-item').forEach(el => {
    el.addEventListener('click', () => {
      state.activeTeamId = el.dataset.id;
      state.activeSlotIdx = null;
      renderAll();
    });
  });
}

function renderContent() {
  const content = document.getElementById('content-area');
  if (!content) return;

  const team = getActiveTeam();
  if (!team) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🏆</div>
        <h3>NO TEAM SELECTED</h3>
        <p>Create a new team from the sidebar to get started.</p>
      </div>`;
    return;
  }

  const slots = [];
  for (let i = 0; i < 6; i++) {
    const p = team.pokemon[i];
    if (p && p.name) {
      slots.push(renderFilledSlot(p, i));
    } else {
      slots.push(`
        <div class="pokemon-slot empty" data-slot="${i}" onclick="handleAddPokemon(${i})">
          <div class="empty-icon">➕</div>
          <span>Add Pokémon</span>
        </div>`);
    }
  }

  content.innerHTML = `
    <div class="team-header">
      <div>
        <div class="team-name-row">
          <input class="team-name-input" id="team-name-input" value="${escHtml(team.name)}"
            placeholder="Team Name" onchange="handleTeamNameChange(this.value)" />
          <span class="format-badge" onclick="openFormatModal()">${team.format}</span>
        </div>
      </div>
      <div class="team-actions">
        <button class="btn btn-ghost" onclick="handleExportTeam()">📋 Export</button>
        <button class="btn btn-ghost" onclick="handleImportPrompt()">📥 Import</button>
        <button class="btn btn-gold" onclick="handleSaveTeam()">💾 Save</button>
      </div>
    </div>
    <div class="pokemon-grid" id="pokemon-grid">
      ${slots.join('')}
    </div>
    <div id="editor-container"></div>
  `;

  if (state.activeSlotIdx !== null && getActivePokemon()) {
    renderEditor();
  }
}

function renderFilledSlot(p, idx) {
  const isActive = state.activeSlotIdx === idx;
  const typeBar = p.types.length > 0
    ? `background: linear-gradient(90deg, ${p.types.map((t,i) => `var(--type-${t}) ${i*50}%`).join(',')})`
    : 'background: var(--border)';

  const evTotal = Object.values(p.evs).reduce((a,b)=>a+b,0);
  const evPips = STATS.map((s,i) => {
    const pct = (p.evs[s]||0) / 252;
    return `<div class="ev-pip ${pct > 0.8 ? 'filled' : pct > 0 ? 'filled' : ''}" style="opacity:${0.2 + pct*0.8}"></div>`;
  }).join('');

  return `
    <div class="pokemon-slot ${isActive ? 'active' : ''}" data-slot="${idx}" onclick="handleSlotClick(${idx})">
      <div class="slot-type-bar" style="${typeBar}"></div>
      <div class="slot-header">
        <div class="slot-sprite-wrap">
          ${p.sprite ? `<img class="slot-sprite" src="${p.sprite}" alt="${p.name}" loading="lazy">` : '<div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center;font-size:24px;">🔴</div>'}
        </div>
        <div class="slot-info">
          <div class="slot-name">${p.nickname || p.name} ${p.shiny ? '<span class="shiny-star">✦</span>' : ''}</div>
          <div class="slot-types">
            ${p.types.map(t => `<span class="type-chip" style="background:${TYPE_COLORS[t]||'#888'}">${t}</span>`).join('')}
            ${p.teraType ? `<span class="tera-badge">◈ ${p.teraType}</span>` : ''}
          </div>
          ${p.item ? `<div class="slot-item">⚙ ${escHtml(p.item)}</div>` : ''}
        </div>
        <button class="btn btn-icon btn-danger" style="position:absolute;top:6px;right:6px"
          onclick="handleRemovePokemon(${idx}, event)">✕</button>
      </div>
      <div class="slot-moves">
        ${p.moves.map(m => `<div class="move-chip">${m || '—'}</div>`).join('')}
      </div>
      <div class="slot-footer">
        <div class="ev-mini">${evPips}</div>
        <span class="nature-tag">${p.nature}</span>
      </div>
    </div>`;
}

function renderEditor() {
  const container = document.getElementById('editor-container');
  if (!container) return;
  const p = getActivePokemon();
  if (!p) { container.innerHTML = ''; return; }

  container.innerHTML = `
    <div class="editor-panel">
      <div class="editor-tabs">
        ${['main','evs','ivs','import'].map(t => `
          <button class="editor-tab ${state.editorTab === t ? 'active' : ''}"
            onclick="switchEditorTab('${t}')">${{main:'Main',evs:'EVs',ivs:'IVs',import:'Import/Export'}[t]}</button>
        `).join('')}
        <div style="flex:1"></div>
        <button class="btn btn-danger btn-sm" style="align-self:center;margin-right:8px"
          onclick="handleRemovePokemon(${state.activeSlotIdx})">Remove</button>
      </div>
      <div class="editor-body">
        ${renderEditorTab(p)}
      </div>
    </div>`;
}

function renderEditorTab(p) {
  if (state.editorTab === 'main') return renderMainTab(p);
  if (state.editorTab === 'evs') return renderEVsTab(p);
  if (state.editorTab === 'ivs') return renderIVsTab(p);
  if (state.editorTab === 'import') return renderImportExportTab();
  return '';
}

function renderMainTab(p) {
  const abilityOptions = p.abilities.length
    ? p.abilities.map(a => `<option ${p.ability === a ? 'selected' : ''}>${a}</option>`).join('')
    : `<option>${p.ability || ''}</option>`;

  const typeOptions = ['','Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison',
    'Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy','Stellar']
    .map(t => `<option ${p.teraType === t ? 'selected' : ''}>${t}</option>`).join('');

  return `
    <div class="editor-top">
      <div class="editor-sprite-zone">
        ${p.sprite
          ? `<img class="editor-sprite" src="${p.sprite}" alt="${p.name}">`
          : `<div class="sprite-placeholder">🔴</div>`}
        <label style="display:flex;align-items:center;gap:6px;margin-top:8px;cursor:pointer;font-size:12px;color:var(--text-muted);justify-content:center">
          <input type="checkbox" ${p.shiny ? 'checked' : ''} onchange="updatePokemonField('shiny',this.checked)">
          <span class="shiny-star">✦</span> Shiny
        </label>
      </div>
      <div class="editor-fields">
        <div class="field-group" style="grid-column:span 2">
          <label class="field-label">Pokémon</label>
          <input class="field-input" id="pokemon-name-input" value="${escHtml(p.name)}"
            placeholder="e.g. Garchomp" onchange="handlePokemonNameChange(this.value)">
        </div>
        <div class="field-group">
          <label class="field-label">Nickname</label>
          <input class="field-input" value="${escHtml(p.nickname)}"
            placeholder="Optional" onchange="updatePokemonField('nickname',this.value)">
        </div>
        <div class="field-group">
          <label class="field-label">Gender</label>
          <select class="field-select" onchange="updatePokemonField('gender',this.value)">
            <option ${p.gender==='M'?'selected':''}>M</option>
            <option ${p.gender==='F'?'selected':''}>F</option>
            <option ${p.gender===''?'selected':''} value="">—</option>
          </select>
        </div>
        <div class="field-group">
          <label class="field-label">Held Item</label>
          <input class="field-input" value="${escHtml(p.item)}"
            placeholder="e.g. Choice Scarf" onchange="updatePokemonField('item',this.value)">
        </div>
        <div class="field-group">
          <label class="field-label">Ability</label>
          <select class="field-select" onchange="updatePokemonField('ability',this.value)">
            ${abilityOptions}
            <option value="" disabled>— type to add —</option>
          </select>
        </div>
        <div class="field-group">
          <label class="field-label">Nature</label>
          <select class="field-select" onchange="updatePokemonField('nature',this.value)">
            ${NATURES.map(n => `<option ${p.nature===n?'selected':''}>${n}</option>`).join('')}
          </select>
        </div>
        <div class="field-group">
          <label class="field-label">Tera Type</label>
          <select class="field-select" onchange="updatePokemonField('teraType',this.value)">
            ${typeOptions}
          </select>
        </div>
        <div class="field-group">
          <label class="field-label">Level</label>
          <input class="field-input" type="number" min="1" max="100" value="${p.level}"
            onchange="updatePokemonField('level',parseInt(this.value)||100)">
        </div>
      </div>
    </div>
    <div class="moves-section">
      <div class="section-label">Moves</div>
      <div class="moves-grid">
        ${p.moves.map((m, i) => `
          <div class="move-input-wrap">
            <span class="move-num">${i+1}</span>
            <input class="move-input" value="${escHtml(m)}" placeholder="Move ${i+1}"
              onchange="updateMove(${i}, this.value)">
          </div>`).join('')}
      </div>
    </div>`;
}

function renderEVsTab(p) {
  const total = Object.values(p.evs).reduce((a,b)=>a+b,0);
  const remaining = 510 - total;
  return `
    <div class="evs-section">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div class="section-label">EVs</div>
        <span class="ev-total ${total > 510 ? 'over' : 'ok'}">${total}/510 (${remaining >= 0 ? remaining : 0} left)</span>
      </div>
      ${STATS.map(s => `
        <div class="ev-row">
          <span class="ev-stat-name">${s}</span>
          <div class="ev-track" onclick="handleEvTrackClick(event, '${s}')">
            <div class="ev-fill ${p.evs[s] >= 252 ? 'maxed' : ''}" style="width:${(p.evs[s]/252)*100}%"></div>
          </div>
          <input class="ev-input" type="number" min="0" max="252" value="${p.evs[s]}"
            onchange="updateEV('${s}', parseInt(this.value)||0)">
        </div>`).join('')}
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn btn-ghost btn-sm" onclick="spreadEVs()">Auto Spread (252/252/4)</button>
        <button class="btn btn-ghost btn-sm" onclick="clearEVs()">Clear All</button>
      </div>
    </div>`;
}

function renderIVsTab(p) {
  return `
    <div class="evs-section">
      <div class="section-label" style="margin-bottom:14px">IVs</div>
      ${STATS.map(s => `
        <div class="ev-row">
          <span class="ev-stat-name">${s}</span>
          <div class="ev-track" onclick="handleIvTrackClick(event,'${s}')">
            <div class="ev-fill ${p.ivs[s] >= 31 ? 'maxed' : ''}" style="width:${(p.ivs[s]/31)*100}%"></div>
          </div>
          <input class="ev-input" type="number" min="0" max="31" value="${p.ivs[s]}"
            onchange="updateIV('${s}',parseInt(this.value)||0)">
        </div>`).join('')}
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn btn-ghost btn-sm" onclick="maxIVs()">Max All (31)</button>
        <button class="btn btn-ghost btn-sm" onclick="zeroIVs()">Zero All (0)</button>
      </div>
    </div>`;
}

function renderImportExportTab() {
  const team = getActiveTeam();
  const text = team ? exportTeam(team) : '';
  return `
    <div class="importexport-section">
      <div class="section-label" style="margin-bottom:10px">Import / Export (Showdown Format)</div>
      <textarea id="import-export-text" placeholder="Paste Showdown team here to import, or export your team below...">${text}</textarea>
      <div class="importexport-actions">
        <button class="btn btn-primary" onclick="handleImportFromTextarea()">📥 Import</button>
        <button class="btn btn-ghost" onclick="handleExportToTextarea()">📋 Refresh Export</button>
        <button class="btn btn-ghost" onclick="copyExport()">📄 Copy</button>
      </div>
    </div>`;
}

// ─── EVENT HANDLERS ───────────────────────────────────────────
window.handleDeleteTeam = (id, e) => {
  e?.stopPropagation();
  if (confirm('Delete this team?')) deleteTeam(id);
};

window.handleSlotClick = (idx) => {
  state.activeSlotIdx = state.activeSlotIdx === idx ? null : idx;
  state.editorTab = 'main';
  renderContent();
};

window.handleAddPokemon = (idx) => {
  const team = getActiveTeam();
  if (!team) return;
  while (team.pokemon.length <= idx) team.pokemon.push(null);
  team.pokemon[idx] = makePokemon();
  state.activeSlotIdx = idx;
  state.editorTab = 'main';
  renderContent();
};

window.handleRemovePokemon = (idx, e) => {
  e?.stopPropagation();
  const team = getActiveTeam();
  if (!team) return;
  team.pokemon.splice(idx, 1);
  if (state.activeSlotIdx === idx) state.activeSlotIdx = null;
  renderContent();
};

window.handleTeamNameChange = (val) => {
  const team = getActiveTeam();
  if (team) { team.name = val; renderSidebar(); }
};

window.switchEditorTab = (tab) => {
  state.editorTab = tab;
  renderEditor();
};

window.handlePokemonNameChange = async (name) => {
  const team = getActiveTeam();
  if (!team || state.activeSlotIdx === null) return;
  team.pokemon[state.activeSlotIdx].name = name;
  const data = await fetchPokemonData(name);
  if (data) {
    const p = team.pokemon[state.activeSlotIdx];
    p.types = data.types;
    p.sprite = data.sprite;
    p.abilities = data.abilities;
    if (!p.ability && data.abilities.length) p.ability = data.abilities[0];
  }
  renderContent();
  // Scroll to editor
  setTimeout(() => document.getElementById('editor-container')?.scrollIntoView({behavior:'smooth'}), 100);
};

window.updatePokemonField = (field, value) => {
  const team = getActiveTeam();
  if (!team || state.activeSlotIdx === null) return;
  team.pokemon[state.activeSlotIdx][field] = value;
  renderContent();
};

window.updateMove = (idx, value) => {
  const team = getActiveTeam();
  if (!team || state.activeSlotIdx === null) return;
  team.pokemon[state.activeSlotIdx].moves[idx] = value;
  // Update slot display without full re-render
  renderFilledSlotInGrid(state.activeSlotIdx);
};

window.updateEV = (stat, value) => {
  const team = getActiveTeam();
  if (!team || state.activeSlotIdx === null) return;
  const p = team.pokemon[state.activeSlotIdx];
  const clamped = Math.max(0, Math.min(252, value));
  p.evs[stat] = clamped;
  renderEditor();
  renderFilledSlotInGrid(state.activeSlotIdx);
};

window.updateIV = (stat, value) => {
  const team = getActiveTeam();
  if (!team || state.activeSlotIdx === null) return;
  team.pokemon[state.activeSlotIdx].ivs[stat] = Math.max(0, Math.min(31, value));
  renderEditor();
};

window.handleEvTrackClick = (e, stat) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  updateEV(stat, Math.round(pct * 252 / 4) * 4);
};

window.handleIvTrackClick = (e, stat) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  updateIV(stat, Math.round(pct * 31));
};

window.spreadEVs = () => {
  const team = getActiveTeam();
  if (!team || state.activeSlotIdx === null) return;
  const p = team.pokemon[state.activeSlotIdx];
  STATS.forEach(s => p.evs[s] = 0);
  // Default: 252 Atk, 252 Spe, 4 HP (physical sweeper template)
  p.evs.Atk = 252; p.evs.Spe = 252; p.evs.HP = 4;
  renderEditor();
};

window.clearEVs = () => {
  const team = getActiveTeam();
  if (!team || state.activeSlotIdx === null) return;
  STATS.forEach(s => team.pokemon[state.activeSlotIdx].evs[s] = 0);
  renderEditor();
};

window.maxIVs = () => {
  const team = getActiveTeam();
  if (!team || state.activeSlotIdx === null) return;
  STATS.forEach(s => team.pokemon[state.activeSlotIdx].ivs[s] = 31);
  renderEditor();
};

window.zeroIVs = () => {
  const team = getActiveTeam();
  if (!team || state.activeSlotIdx === null) return;
  STATS.forEach(s => team.pokemon[state.activeSlotIdx].ivs[s] = 0);
  renderEditor();
};

function renderFilledSlotInGrid(idx) {
  const grid = document.getElementById('pokemon-grid');
  if (!grid) return;
  const team = getActiveTeam();
  if (!team) return;
  const p = team.pokemon[idx];
  if (!p) return;
  const slots = grid.querySelectorAll('[data-slot]');
  slots.forEach(el => {
    if (parseInt(el.dataset.slot) === idx) {
      el.outerHTML; // force re-render via content
    }
  });
}

window.handleSaveTeam = async () => {
  const team = getActiveTeam();
  if (!team) return;
  await saveTeam(team);
};

window.handleExportTeam = () => {
  const team = getActiveTeam();
  if (!team) return;
  const text = exportTeam(team);
  navigator.clipboard.writeText(text).then(() => toast('Copied to clipboard!', 'success'));
  state.editorTab = 'import';
  state.activeSlotIdx = state.activeSlotIdx ?? 0;
  renderContent();
};

window.handleImportPrompt = () => {
  state.editorTab = 'import';
  renderContent();
  setTimeout(() => document.getElementById('editor-container')?.scrollIntoView({behavior:'smooth'}), 100);
};

window.handleImportFromTextarea = async () => {
  const text = document.getElementById('import-export-text')?.value || '';
  if (!text.trim()) return;
  const team = getActiveTeam();
  if (!team) return;
  const imported = importTeam(text);
  if (!imported.length) { toast('Nothing to import', 'error'); return; }
  team.pokemon = imported.slice(0, 6);
  // Fetch sprites for all
  await Promise.all(team.pokemon.map(async p => {
    if (p.name) {
      const data = await fetchPokemonData(p.name);
      if (data) { p.types = data.types; p.sprite = data.sprite; p.abilities = data.abilities; }
    }
  }));
  state.activeSlotIdx = null;
  renderAll();
  toast(`Imported ${team.pokemon.length} Pokémon!`, 'success');
};

window.handleExportToTextarea = () => {
  const ta = document.getElementById('import-export-text');
  if (ta) ta.value = exportTeam(getActiveTeam());
};

window.copyExport = () => {
  const ta = document.getElementById('import-export-text');
  if (ta) {
    navigator.clipboard.writeText(ta.value).then(() => toast('Copied!', 'success'));
  }
};

// ─── FORMAT MODAL ─────────────────────────────────────────────
window.openFormatModal = () => {
  document.getElementById('format-modal').classList.add('open');
};

window.closeFormatModal = () => {
  document.getElementById('format-modal').classList.remove('open');
};

window.selectFormat = (fmt) => {
  const team = getActiveTeam();
  if (team) { team.format = fmt; renderAll(); }
  closeFormatModal();
};

// ─── AUTH ─────────────────────────────────────────────────────
async function handleLogin(email, password) {
  const errEl = document.getElementById('auth-error');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) { errEl.textContent = error.message; errEl.classList.add('visible'); return; }
  errEl.classList.remove('visible');
}

async function handleSignup(email, password) {
  const errEl = document.getElementById('auth-error');
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) { errEl.textContent = error.message; errEl.classList.add('visible'); return; }
  errEl.textContent = 'Check your email to confirm your account!';
  errEl.style.color = 'var(--green)';
  errEl.classList.add('visible');
}

window.handleAuthSubmit = async () => {
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const tab = document.querySelector('.auth-tab.active')?.dataset.tab || 'login';
  if (!email || !password) return;
  if (tab === 'login') await handleLogin(email, password);
  else await handleSignup(email, password);
};

window.handleAuthTabSwitch = (tab) => {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
};

window.handleLogout = async () => {
  await supabase.auth.signOut();
};

window.handleNewTeam = () => {
  const team = makeTeam('New Team');
  state.teams.unshift(team);
  state.activeTeamId = team.id;
  state.activeSlotIdx = null;
  renderAll();
};

// ─── TOAST ───────────────────────────────────────────────────
function toast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${{success:'✓',error:'✕',info:'ℹ'}[type]}</span> ${escHtml(msg)}`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ─── UTILS ───────────────────────────────────────────────────
function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── INIT ─────────────────────────────────────────────────────
async function init() {
  // Auth state
  supabase.auth.onAuthStateChange(async (event, session) => {
    state.user = session?.user || null;
    const overlay = document.getElementById('auth-overlay');
    const userInfo = document.getElementById('user-info');

    if (state.user) {
      overlay.style.display = 'none';
      userInfo.innerHTML = `
        <div class="user-avatar">👤</div>
        <span>${escHtml(state.user.email.split('@')[0])}</span>
        <button class="btn btn-ghost btn-sm" onclick="handleLogout()">Sign out</button>`;
      await loadTeams();
    } else {
      overlay.style.display = 'flex';
      userInfo.innerHTML = '';
      state.teams = [];
      state.activeTeamId = null;
      renderAll();
    }
  });

  // Enter key on auth
  document.getElementById('auth-password')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleAuthSubmit();
  });
}

init();
