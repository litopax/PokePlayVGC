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

const TYPE_COLORS = {
  normal:'#A8A878',fire:'#F08030',water:'#6890F0',electric:'#F8D030',grass:'#78C850',
  ice:'#98D8D8',fighting:'#C03028',poison:'#A040A0',ground:'#E0C068',flying:'#A890F0',
  psychic:'#F85888',bug:'#A8B820',rock:'#B8A038',ghost:'#705898',dragon:'#7038F8',
  dark:'#705848',steel:'#B8B8D0',fairy:'#EE99AC',stellar:'#40B5A5'
};

const TYPES = ['Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison',
  'Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy','Stellar'];

const FORMAT_NAME = 'Pokémon Champions – Lv 50';
const FORMAT_SHORT = 'Champions';

const ITEMS = ["Ability Shield", "Abomasite", "Absolite", "Aerodactylite", "Aggronite", "Aguav Berry", "Alakazite", "Altarianite", "Ampharosite", "Apicot Berry", "Aspear Berry", "Assault Vest", "Audinite", "Babiri Berry", "Banettite", "Beedrillite", "Black Belt", "Black Glasses", "Black Sludge", "Blastoisinite", "Blazikenite", "Booster Energy", "Bright Powder", "Cameruptite", "Charizardite X", "Charizardite Y", "Charti Berry", "Chesto Berry", "Chilan Berry", "Choice Band", "Choice Scarf", "Choice Specs", "Chople Berry", "Clear Amulet", "Coba Berry", "Colbur Berry", "Covert Cloak", "Custap Berry", "Diancite", "Dragon Fang", "Eject Button", "Eject Pack", "Enigma Berry", "Expert Belt", "Figy Berry", "Float Stone", "Focus Sash", "Galladite", "Ganlon Berry", "Garchompite", "Gardevoirite", "Gengarite", "Glalitite", "Grassy Seed", "Grepa Berry", "Gyaradosite", "Haban Berry", "Heavy-Duty Boots", "Heracronite", "Houndoominite", "Iapapa Berry", "Jaboca Berry", "Kangaskhanite", "Kasib Berry", "Kebia Berry", "Kee Berry", "King's Rock", "Lansat Berry", "Latiasite", "Latiosite", "Lax Incense", "Leftovers", "Leppa Berry", "Liechi Berry", "Life Orb", "Light Ball", "Light Clay", "Loaded Dice", "Lopunnite", "Lucarionite", "Lum Berry", "Mago Berry", "Manectite", "Maranga Berry", "Mawilite", "Medichamite", "Mental Herb", "Metagrossite", "Metal Coat", "Metronome", "Mewtwonite X", "Mewtwonite Y", "Micle Berry", "Miracle Seed", "Misty Seed", "Muscle Band", "Never-Melt Ice", "Occa Berry", "Oran Berry", "Passho Berry", "Payapa Berry", "Pecha Berry", "Persim Berry", "Petaya Berry", "Pidgeotite", "Pinsirite", "Power Herb", "Protective Pads", "Quick Claw", "Rawst Berry", "Rindo Berry", "Rocky Helmet", "Room Service", "Roseli Berry", "Rowap Berry", "Sablenite", "Safety Goggles", "Salac Berry", "Salamencite", "Sceptilite", "Scizorite", "Sharpedonite", "Shed Shell", "Shell Bell", "Shuca Berry", "Silk Scarf", "Silver Powder", "Sitrus Berry", "Slowbronite", "Smooth Rock", "Soft Sand", "Spell Tag", "Starf Berry", "Steelixite", "Swampertite", "Tanga Berry", "Terrain Extender", "Thick Club", "Toxic Orb", "Twisted Spoon", "Tyranitarite", "Venusaurite", "Wacan Berry", "White Herb", "Wide Lens", "Wiki Berry", "Wise Glasses", "Yache Berry", "Zoom Lens"];

// ─── PKM CHAMPIONS DATABASE (WikiDex) ────────────────────────
const EV_TOTAL_MAX = 66;
const EV_STAT_MAX = 32;
const DB_MOVE_NAMES = ["Abrecaminos", "Absorb", "Absorbefuerza", "Acid", "Acid Armor", "Acid Spray", "Acrobatics", "Acupressure", "Aerial Ace", "Aeroblast", "After You", "Agility", "Agua Fría", "Aguzar", "Air Cutter", "Air Slash", "Ala Aural", "Ala Bis", "Allanador Férreo", "Ally Switch", "Alquitranazo", "Alto Voltaje", "Amnesia", "Amplificador", "Ancient Power", "Anclaje", "Aqua Jet", "Aqua Ring", "Aqua Tail", "Arenas Ardientes", "Aria Burbuja", "Arm Thrust", "Aromatherapy", "Aromatic Mist", "Arremetida", "Asalto Barrera", "Asalto Espadón", "Asalto Estelar", "Assist", "Assurance", "Astonish", "Atiborramiento", "Attack Order", "Attract", "Aura Sphere", "Aurora Beam", "Autotomize", "Autotomía", "Avalanche", "Azote Torrencial", "Baby-Doll Eyes", "Balón Ígneo", "Barrage", "Barrier", "Bastión Final", "Batería Asalto", "Baton Pass", "Beat Up", "Belch", "Belly Drum", "Bestow", "Bide", "Bind", "Bite", "Blast Burn", "Blaze Kick", "Blizzard", "Block", "Blue Flare", "Body Slam", "Bola de Polen", "Bolt Strike", "Bomba Caramelo", "Bone Club", "Bone Rush", "Bonemerang", "Boomburst", "Bounce", "Bramido Dragón", "Branquibocado", "Brave Bird", "Brick Break", "Brinco", "Brine", "Bruma Explosiva", "Bubble", "Bubble Beam", "Bug Bite", "Bug Buzz", "Bulk Up", "Bulldoze", "Bullet Punch", "Bullet Seed", "Bálsamo Osado", "Búnker", "Cabeza Sorpresa", "Cadena Virulenta", "Calamidad", "Calm Mind", "Cambiapoder", "Cambiavelocidad", "Cambio de Cancha", "Camouflage", "Campo Psíquico", "Canto Ardiente", "Canto Encantador", "Captivate", "Cautivapor", "Cañón Armadura", "Cañón Batidor", "Cañón Dinamax", "Cañón Floral", "Celebrate", "Cepo", "Charge", "Charge Beam", "Charm", "Chatter", "Chip Away", "Choque Anímico", "Chulería", "Ciclón Primavera", "Circle Throw", "Clamp", "Clear Smog", "Clorofiláser", "Close Combat", "Coil", "Comet Punch", "Confide", "Confuse Ray", "Confusion", "Conjuro Funesto", "Constrict", "Conversion", "Conversion 2", "Copycat", "Coraza Trampa", "Cosmic Power", "Cotton Guard", "Cotton Spore", "Counter", "Covet", "Crabhammer", "Crafty Shield", "Cross Chop", "Cross Poison", "Crunch", "Crush Claw", "Crush Grip", "Cuchilla Solar", "Cuerno Certero", "Cura Floral", "Cura Selvática", "Curse", "Cut", "Cólera Ardiente", "Danza Acuática", "Danza Despertar", "Danza Triunfal", "Dark Pulse", "Dark Void", "Dazzling Gleam", "Decalcomanía", "Decoración", "Defend Order", "Defense Curl", "Defog", "Desahogo", "Deslome", "Destiny Bond", "Detect", "Diamond Storm", "Dig", "Disable", "Disarming Voice", "Discharge", "Disparo Certero", "Dive", "Dizzy Punch", "Doom Desire", "Double Hit", "Double Kick", "Double Slap", "Double Team", "Double-Edge", "Draco Meteor", "Dracoenergía", "Dracoflechas", "Dragon Ascent", "Dragon Breath", "Dragon Claw", "Dragon Dance", "Dragon Pulse", "Dragon Rage", "Dragon Rush", "Dragon Tail", "Drain Punch", "Draining Kiss", "Dream Eater", "Drill Peck", "Drill Run", "Dual Chop", "Dynamic Punch", "Earth Power", "Earthquake", "Echoed Voice", "Eerie Impulse", "Eevimpacto", "Egg Bomb", "Electormenta", "Electric Terrain", "Electrify", "Electro Ball", "Electroderrape", "Electrojaula", "Electropalmas", "Electropico", "Electropunzada", "Electrorrayo", "Electroweb", "Embargo", "Embate Supremo", "Ember", "Encore", "Endeavor", "Endure", "Energy Ball", "Entrainment", "Envidia Ardiente", "Envite Acuático", "Erupción de Ira", "Eruption", "Escaramuza", "Espada Lamento", "Espeaura", "Estruendo Escama", "Explosion", "Extracto Picante", "Extrasensory", "Extreme Speed", "Facade", "Fairy Lock", "Fairy Wind", "Fake Out", "Fake Tears", "False Swipe", "Feather Dance", "Feerichoque", "Feint", "Feint Attack", "Fell Stinger", "Ferropuño Doble", "Fiebre Dorada", "Fiery Dance", "Filo Potente", "Final Gambit", "Fire Blast", "Fire Fang", "Fire Pledge", "Fire Punch", "Fire Spin", "Fissure", "Fitoimpulso", "Flail", "Flame Burst", "Flame Charge", "Flame Wheel", "Flamethrower", "Flare Blitz", "Flarembestida", "Flash", "Flash Cannon", "Flatter", "Fling", "Flower Shield", "Fly", "Flying Press", "Foco", "Focus Blast", "Focus Energy", "Focus Punch", "Follaje", "Follow Me", "Force Palm", "Foresight", "Forest's Curse", "Fotocolisión", "Foul Play", "Fragor Escamas", "Freeze Shock", "Freeze-Dry", "Frenzy Plant", "Frost Breath", "Frustration", "Fría Acogida", "Fuerza Equina", "Fuerza G", "Furia Candente", "Furia Natural", "Furia Taurina", "Fury Attack", "Fury Cutter", "Fury Swipes", "Fusion Bolt", "Fusion Flare", "Future Sight", "Garra Nociva", "Garrote Liana", "Gas Corrosivo", "Gastro Acid", "Gear Grind", "Genufendiente", "Geomancy", "Giga Drain", "Giga Impact", "Giro Mortífero", "Giro Vil", "Glaceoprisma", "Glaciate", "Glare", "Golpe Mordaza", "Golpe Oscuro", "Golpe Rastrero", "Gota Vital", "Grass Knot", "Grass Pledge", "Grass Whistle", "Grassy Terrain", "Gravity", "Growl", "Growth", "Grudge", "Guard Split", "Guard Swap", "Guillotine", "Gunk Shot", "Gust", "Gyro Ball", "Géiser Fotónico", "Hachazo Pétreo", "Hail", "Hammer Arm", "Happy Hour", "Harden", "Haze", "Head Charge", "Head Smash", "Headbutt", "Heal Bell", "Heal Block", "Heal Order", "Heal Pulse", "Healing Wish", "Heart Stamp", "Heart Swap", "Heat Crash", "Heat Wave", "Heavy Slam", "Helping Hand", "Hex", "Hidden Power", "Hidroariete", "Hidrovapor", "High Jump Kick", "Hilo Venenoso", "Hipertaladro", "Hold Back", "Hold Hands", "Homenaje Póstumo", "Hone Claws", "Hora del Té", "Horn Attack", "Horn Drill", "Horn Leech", "Howl", "Hueso Sombrío", "Hurricane", "Hydro Cannon", "Hydro Pump", "Hyper Beam", "Hyper Fang", "Hyper Voice", "Hyperspace Fury", "Hyperspace Hole", "Hypnosis", "Ice Ball", "Ice Beam", "Ice Burn", "Ice Fang", "Ice Punch", "Ice Shard", "Icicle Crash", "Icicle Spear", "Icy Wind", "Imprison", "Incinerate", "Inferno", "Infestation", "Ingrain", "Ion Deluge", "Iron Defense", "Iron Head", "Iron Tail", "Irreverencia", "Joltioparálisis", "Judgment", "Jump Kick", "Karate Chop", "Kinesis", "King's Shield", "Knock Off", "Land's Wrath", "Lanza Glacial", "Lariat Oscuro", "Last Resort", "Lava Plume", "Leaf Blade", "Leaf Storm", "Leaf Tornado", "Leafitobombas", "Leech Life", "Leech Seed", "Leer", "Lick", "Light Screen", "Light of Ruin", "Limpieza General", "Llama Final", "Llama Protectora", "Lock-On", "Lovely Kiss", "Low Kick", "Low Sweep", "Lucky Chant", "Luna Roja", "Lunar Dance", "Luster Purge", "Luz Devastadora", "Láser Doble", "Láser Prisma", "Láser Veleidoso", "Látigo Ígneo", "Mach Punch", "Magic Coat", "Magic Room", "Magical Leaf", "Magma Storm", "Magnet Bomb", "Magnet Rise", "Magnetic Flux", "Magnitude", "Mandato", "Marcha Espectral", "Martillo Colosal", "Martillo Dragón", "Martillo Hielo", "Mat Block", "Me First", "Mean Look", "Meditate", "Mega Drain", "Mega Kick", "Mega Punch", "Megahorn", "Memento", "Metal Burst", "Metal Claw", "Metal Sound", "Metaláser", "Meteoimpacto", "Meteor Mash", "Metronome", "Mil Púas Tóxicas", "Milk Drink", "Mimic", "Mind Reader", "Minimize", "Miracle Eye", "Mirada Heladora", "Mirror Coat", "Mirror Move", "Mirror Shot", "Mist", "Mist Ball", "Misty Terrain", "Moluscañón", "Moonblast", "Moonlight", "Morning Sun", "Motivación", "Mud Bomb", "Mud Shot", "Mud Sport", "Mud-Slap", "Muddy Water", "Multiataque", "Mystical Fire", "Nasty Plot", "Natural Gift", "Nature Power", "Needle Arm", "Night Daze", "Night Shade", "Night Slash", "Nightmare", "Nitrochoque", "Noble Roar", "Nuzzle", "Núcleo Castigo", "Oblivion Wing", "Obstrucción", "Octazooka", "Octopresa", "Odor Sleuth", "Ojos Llorosos", "Ominochoque", "Ominous Wind", "Orbes Espectro", "Origin Pulse", "Outrage", "Overheat", "Oído Cocina", "Pain Split", "Paisaje Nevado", "Palma Rauda", "Parabolic Charge", "Parting Shot", "Patada Hacha", "Patada Relámpago", "Patada Tropical", "Pataleta", "Pay Day", "Payback", "Peck", "Perish Song", "Petal Blizzard", "Petal Dance", "Phantom Force", "Pico Cañón", "Pikatormenta", "Pikaturbo", "Pin Missile", "Pirochoque", "Pirueta Helada", "Piñón Auxiliar", "Plancha", "Plancha Corporal", "Plancha Voltaica", "Play Nice", "Play Rough", "Plegaria Lunar", "Plegaria Vital", "Pluck", "Poder Místico", "Poison Fang", "Poison Gas", "Poison Jab", "Poison Powder", "Poison Sting", "Poison Tail", "Poltergeist", "Polvo Mágico", "Pound", "Powder", "Powder Snow", "Power Gem", "Power Split", "Power Swap", "Power Trick", "Power Whip", "Power-Up Punch", "Precipice Blades", "Prensa Metálica", "Presa Maxilar", "Present", "Proliferación", "Protect", "Psicocolmillo", "Psicohojas", "Psicorruido", "Psybeam", "Psych Up", "Psychic", "Psycho Boost", "Psycho Cut", "Psycho Shift", "Psyshock", "Psystrike", "Psywave", "Pugnachoque", "Pulso de Campo", "Punishment", "Puntada Sombría", "Punzada Rama", "Purificación", "Pursuit", "Puño Furia", "Puño Jet", "Puños Plasma", "Quash", "Quemarrueda", "Quick Attack", "Quick Guard", "Quiver Dance", "Rage", "Rage Powder", "Rain Dance", "Rapid Spin", "Rayo Infinito", "Rayo Meteórico", "Rayo Umbrío", "Razor Leaf", "Razor Shell", "Razor Wind", "Recogearena", "Recover", "Recycle", "Reflect", "Reflect Type", "Refresh", "Relic Song", "Relámpago Súbito", "Rencor Reprimido", "Resarcimiento", "Rest", "Retaliate", "Retracción", "Return", "Revenge", "Reversal", "Roar", "Roar of Time", "Robasombra", "Roca Veloz", "Rock Blast", "Rock Climb", "Rock Polish", "Rock Slide", "Rock Smash", "Rock Throw", "Rock Tomb", "Rock Wrecker", "Role Play", "Rolling Kick", "Rollout", "Roost", "Rototiller", "Round", "Rueda Aural", "Ráfaga Escamas", "Sacred Fire", "Sacred Sword", "Safeguard", "Salazón", "Salpikasurf", "Sand Attack", "Sand Tomb", "Sandstorm", "Scald", "Scary Face", "Scratch", "Screech", "Searing Shot", "Secret Power", "Secret Sword", "Seed Bomb", "Seed Flare", "Seismic Toss", "Self-Destruct", "Shadow Ball", "Shadow Claw", "Shadow Force", "Shadow Punch", "Shadow Sneak", "Sharpen", "Sheer Cold", "Shell Smash", "Shift Gear", "Shock Wave", "Signal Beam", "Silver Wind", "Simple Beam", "Simún de Arena", "Sing", "Sketch", "Skill Swap", "Skull Bash", "Sky Attack", "Sky Drop", "Sky Uppercut", "Slack Off", "Slam", "Slash", "Sleep Powder", "Sleep Talk", "Sludge", "Sludge Bomb", "Sludge Wave", "Smack Down", "Smelling Salts", "Smog", "Smokescreen", "Snarl", "Snatch", "Snore", "Soak", "Soft-Boiled", "Solar Beam", "Sonic Boom", "Spacial Rend", "Spark", "Spider Web", "Spike Cannon", "Spikes", "Spiky Shield", "Spit Up", "Spite", "Splash", "Spore", "Stealth Rock", "Steam Eruption", "Steamroller", "Steel Wing", "Sticky Web", "Stockpile", "Stomp", "Stone Edge", "Stored Power", "Storm Throw", "Strength", "String Shot", "Struggle", "Struggle Bug", "Stun Spore", "Submission", "Substitute", "Sucker Punch", "Sunny Day", "Super Fang", "Superpower", "Supersonic", "Surf", "Swagger", "Swallow", "Sweet Kiss", "Sweet Scent", "Swift", "Switcheroo", "Swords Dance", "Sylveotornado", "Synchronoise", "Synthesis", "Tackle", "Tail Glow", "Tail Slap", "Tail Whip", "Tailwind", "Tajo Acuático", "Tajo Metralla", "Tajo Supremo", "Tajo Taquión", "Take Down", "Taunt", "Techno Blast", "Teeter Dance", "Telatrampa", "Telekinesis", "Teleport", "Teraclúster", "Teraexplosión", "Thief", "Thousand Arrows", "Thousand Waves", "Thrash", "Thunder", "Thunder Fang", "Thunder Punch", "Thunder Shock", "Thunder Wave", "Thunderbolt", "Tickle", "Topsy-Turvy", "Torment", "Toxic", "Toxic Spikes", "Transform", "Tri Attack", "Trick", "Trick Room", "Trick-or-Treat", "Triple Axel", "Triple Flecha", "Triple Inmersión", "Triple Kick", "Truco Floral", "Trump Card", "Twineedle", "Twister", "U-turn", "Umbreozona", "Uproar", "V-create", "Vacuum Wave", "Vapodrenaje", "Vasta Fuerza", "Vasto Impacto", "Velo Aurora", "Venom Drench", "Venoshock", "Viento Carámbano", "Vine Whip", "Viraje", "Vise Grip", "Vital Throw", "Volt Switch", "Volt Tackle", "Wake-Up Slap", "Water Gun", "Water Pledge", "Water Pulse", "Water Shuriken", "Water Sport", "Water Spout", "Waterfall", "Weather Ball", "Whirlpool", "Whirlwind", "Wide Guard", "Wild Charge", "Will-O-Wisp", "Wing Attack", "Wish", "Withdraw", "Wonder Room", "Wood Hammer", "Work Up", "Worry Seed", "Wrap", "Wring Out", "X-Scissor", "Yawn", "Zap Cannon", "Zen Headbutt", "}", "Ácido Málico"];
const DB_MOVE_META = {"Bubble": {"es": "Burbuja", "t": "Water"}, "Waterfall": {"es": "Cascada", "t": "Water"}, "Hydro Pump": {"es": "Hidrobomba", "t": "Water"}, "Crabhammer": {"es": "Martillazo", "t": "Water"}, "Water Gun": {"es": "Pistola Agua", "t": "Water"}, "Bubble Beam": {"es": "Rayo Burbuja", "t": "Water"}, "Withdraw": {"es": "Refugio", "t": "Water"}, "Surf": {"es": "Surf", "t": "Water"}, "Clamp": {"es": "Tenaza", "t": "Water"}, "Leech Life": {"es": "Chupavidas", "t": "Bug"}, "String Shot": {"es": "Disparo Demora", "t": "Bug"}, "Twineedle": {"es": "Doble Ataque", "t": "Bug"}, "Pin Missile": {"es": "Pin Misil", "t": "Bug"}, "Dragon Rage": {"es": "Furia Dragón", "t": "Dragon"}, "Thunder Shock": {"es": "Impactrueno", "t": "Electric"}, "Thunder Wave": {"es": "Onda Trueno", "t": "Electric"}, "Thunder Punch": {"es": "Puño Trueno", "t": "Electric"}, "Thunderbolt": {"es": "Rayo", "t": "Electric"}, "Thunder": {"es": "Trueno", "t": "Electric"}, "Lick": {"es": "Lengüetazo", "t": "Ghost"}, "Confuse Ray": {"es": "Rayo Confuso", "t": "Ghost"}, "Night Shade": {"es": "Tinieblas", "t": "Ghost"}, "Ember": {"es": "Ascuas", "t": "Fire"}, "Fire Spin": {"es": "Giro Fuego", "t": "Fire"}, "Flamethrower": {"es": "Lanzallamas", "t": "Fire"}, "Fire Blast": {"es": "Llamarada", "t": "Fire"}, "Fire Punch": {"es": "Puño Fuego", "t": "Fire"}, "Mist": {"es": "Neblina", "t": "Ice"}, "Haze": {"es": "Niebla", "t": "Ice"}, "Ice Punch": {"es": "Puño Hielo", "t": "Ice"}, "Aurora Beam": {"es": "Rayo Aurora", "t": "Ice"}, "Ice Beam": {"es": "Rayo Hielo", "t": "Ice"}, "Blizzard": {"es": "Ventisca", "t": "Ice"}, "Counter": {"es": "Contraataque", "t": "Fighting"}, "Double Kick": {"es": "Doble Patada", "t": "Fighting"}, "Karate Chop": {"es": "Golpe Kárate", "t": "Fighting"}, "Low Kick": {"es": "Patada Baja", "t": "Fighting"}, "Rolling Kick": {"es": "Patada Giro", "t": "Fighting"}, "Jump Kick": {"es": "Patada Salto", "t": "Fighting"}, "High Jump Kick": {"es": "Patada Salto Alta", "t": "Fighting"}, "Seismic Toss": {"es": "Sísmico", "t": "Fighting"}, "Submission": {"es": "Sumisión", "t": "Fighting"}, "Sharpen": {"es": "Afilar", "t": "Normal"}, "Vise Grip": {"es": "Agarre", "t": "Normal"}, "Disable": {"es": "Anulación", "t": "Normal"}, "Scratch": {"es": "Arañazo", "t": "Normal"}, "Bind": {"es": "Atadura", "t": "Normal"}, "Fury Attack": {"es": "Ataque Furia", "t": "Normal"}, "Quick Attack": {"es": "Ataque Rápido", "t": "Normal"}, "Slam": {"es": "Atizar", "t": "Normal"}, "Self-Destruct": {"es": "Autodestrucción", "t": "Normal"}, "Lovely Kiss": {"es": "Beso Amoroso", "t": "Normal"}, "Egg Bomb": {"es": "Bomba Huevo", "t": "Normal"}, "Sonic Boom": {"es": "Bomba Sónica", "t": "Normal"}, "Barrage": {"es": "Bombardeo", "t": "Normal"}, "Skull Bash": {"es": "Cabezazo", "t": "Normal"}, "Sing": {"es": "Canto", "t": "Normal"}, "Screech": {"es": "Chirrido", "t": "Normal"}, "Spike Cannon": {"es": "Clavo Cañón", "t": "Normal"}, "Wrap": {"es": "Constricción", "t": "Normal"}, "Conversion": {"es": "Conversión", "t": "Normal"}, "Horn Attack": {"es": "Cornada", "t": "Normal"}, "Cut": {"es": "Corte", "t": "Normal"}, "Slash": {"es": "Cuchillada", "t": "Normal"}, "Swords Dance": {"es": "Danza Espada", "t": "Normal"}, "Take Down": {"es": "Derribo", "t": "Normal"}, "Growth": {"es": "Desarrollo", "t": "Normal"}, "Glare": {"es": "Deslumbrar", "t": "Normal"}, "Flash": {"es": "Destello", "t": "Normal"}, "Pound": {"es": "Destructor", "t": "Normal"}, "Pay Day": {"es": "Día de Pago", "t": "Normal"}, "Double Slap": {"es": "Doble Bofetón", "t": "Normal"}, "Double Team": {"es": "Doble Equipo", "t": "Normal"}, "Double-Edge": {"es": "Doble Filo", "t": "Normal"}, "Explosion": {"es": "Explosión", "t": "Normal"}, "Focus Energy": {"es": "Foco Energía", "t": "Normal"}, "Struggle": {"es": "Forcejeo", "t": "Normal"}, "Harden": {"es": "Fortaleza", "t": "Normal"}, "Strength": {"es": "Fuerza", "t": "Normal"}, "Rage": {"es": "Furia", "t": "Normal"}, "Headbutt": {"es": "Golpe Cabeza", "t": "Normal"}, "Body Slam": {"es": "Golpe Cuerpo", "t": "Normal"}, "Fury Swipes": {"es": "Golpes Furia", "t": "Normal"}, "Growl": {"es": "Gruñido", "t": "Normal"}, "Guillotine": {"es": "Guillotina", "t": "Normal"}, "Hyper Fang": {"es": "Hipercolmillo", "t": "Normal"}, "Hyper Beam": {"es": "Hiperrayo", "t": "Normal"}, "Tail Whip": {"es": "Látigo", "t": "Normal"}, "Leer": {"es": "Malicioso", "t": "Normal"}, "Mega Kick": {"es": "Megapatada", "t": "Normal"}, "Mega Punch": {"es": "Megapuño", "t": "Normal"}, "Swift": {"es": "Meteoros", "t": "Normal"}, "Metronome": {"es": "Metrónomo", "t": "Normal"}, "Mimic": {"es": "Mimético", "t": "Normal"}, "Soft-Boiled": {"es": "Ovocuración", "t": "Normal"}, "Smokescreen": {"es": "Pantalla de Humo", "t": "Normal"}, "Horn Drill": {"es": "Perforador", "t": "Normal"}, "Stomp": {"es": "Pisotón", "t": "Normal"}, "Tackle": {"es": "Placaje", "t": "Normal"}, "Comet Punch": {"es": "Puño Cometa", "t": "Normal"}, "Dizzy Punch": {"es": "Puño Mareo", "t": "Normal"}, "Recover": {"es": "Recuperación", "t": "Normal"}, "Minimize": {"es": "Reducción", "t": "Normal"}, "Whirlwind": {"es": "Remolino", "t": "Normal"}, "Constrict": {"es": "Restricción", "t": "Normal"}, "Defense Curl": {"es": "Rizo Defensa", "t": "Normal"}, "Roar": {"es": "Rugido", "t": "Normal"}, "Splash": {"es": "Salpicadura", "t": "Normal"}, "Thrash": {"es": "Saña", "t": "Normal"}, "Super Fang": {"es": "Superdiente", "t": "Normal"}, "Supersonic": {"es": "Supersónico", "t": "Normal"}, "Substitute": {"es": "Sustituto", "t": "Normal"}, "Transform": {"es": "Transformación", "t": "Normal"}, "Tri Attack": {"es": "Triataque", "t": "Normal"}, "Bide": {"es": "Venganza", "t": "Normal"}, "Razor Wind": {"es": "Viento Cortante", "t": "Normal"}, "Absorb": {"es": "Absorber", "t": "Grass"}, "Petal Dance": {"es": "Danza Pétalo", "t": "Grass"}, "Leech Seed": {"es": "Drenadoras", "t": "Grass"}, "Spore": {"es": "Espora", "t": "Grass"}, "Razor Leaf": {"es": "Hoja Afilada", "t": "Grass"}, "Vine Whip": {"es": "Látigo Cepa", "t": "Grass"}, "Mega Drain": {"es": "Megaagotar", "t": "Grass"}, "Stun Spore": {"es": "Paralizador", "t": "Grass"}, "Solar Beam": {"es": "Rayo Solar", "t": "Grass"}, "Sleep Powder": {"es": "Somnífero", "t": "Grass"}, "Agility": {"es": "Agilidad", "t": "Psychic"}, "Amnesia": {"es": "Amnesia", "t": "Psychic"}, "Barrier": {"es": "Barrera", "t": "Psychic"}, "Dream Eater": {"es": "Comesueños", "t": "Psychic"}, "Confusion": {"es": "Confusión", "t": "Psychic"}, "Rest": {"es": "Descanso", "t": "Psychic"}, "Hypnosis": {"es": "Hipnosis", "t": "Psychic"}, "Kinesis": {"es": "Kinético", "t": "Psychic"}, "Meditate": {"es": "Meditación", "t": "Psychic"}, "Light Screen": {"es": "Pantalla de Luz", "t": "Psychic"}, "Psywave": {"es": "Psicoonda", "t": "Psychic"}, "Psybeam": {"es": "Psicorrayo", "t": "Psychic"}, "Psychic": {"es": "Psíquico", "t": "Psychic"}, "Reflect": {"es": "Reflejo", "t": "Psychic"}, "Teleport": {"es": "Teletransporte", "t": "Psychic"}, "Rock Slide": {"es": "Avalancha", "t": "Rock"}, "Rock Throw": {"es": "Lanzarrocas", "t": "Rock"}, "Bite": {"es": "Mordisco", "t": "Dark"}, "Sand Attack": {"es": "Ataque Arena", "t": "Ground"}, "Dig": {"es": "Excavar", "t": "Ground"}, "Fissure": {"es": "Fisura", "t": "Ground"}, "Bone Club": {"es": "Hueso Palo", "t": "Ground"}, "Bonemerang": {"es": "Huesomerang", "t": "Ground"}, "Earthquake": {"es": "Terremoto", "t": "Ground"}, "Acid": {"es": "Ácido", "t": "Poison"}, "Acid Armor": {"es": "Armadura Ácida", "t": "Poison"}, "Poison Gas": {"es": "Gas Venenoso", "t": "Poison"}, "Poison Sting": {"es": "Picotazo Veneno", "t": "Poison"}, "Smog": {"es": "Polución", "t": "Poison"}, "Poison Powder": {"es": "Polvo Veneno", "t": "Poison"}, "Sludge": {"es": "Residuos", "t": "Poison"}, "Toxic": {"es": "Tóxico", "t": "Poison"}, "Sky Attack": {"es": "Ataque Aéreo", "t": "Flying"}, "Wing Attack": {"es": "Ataque Ala", "t": "Flying"}, "Mirror Move": {"es": "Espejo", "t": "Flying"}, "Drill Peck": {"es": "Pico Taladro", "t": "Flying"}, "Peck": {"es": "Picotazo", "t": "Flying"}, "Gust": {"es": "Tornado", "t": "Flying"}, "Fly": {"es": "Vuelo", "t": "Flying"}, "Steel Wing": {"es": "Ala de Acero", "t": "Steel"}, "Iron Tail": {"es": "Cola Férrea", "t": "Steel"}, "Metal Claw": {"es": "Garra Metal", "t": "Steel"}, "Rain Dance": {"es": "Danza Lluvia", "t": "Water"}, "Octazooka": {"es": "Pulpocañón", "t": "Water"}, "Whirlpool": {"es": "Torbellino", "t": "Water"}, "Fury Cutter": {"es": "Corte Furia", "t": "Bug"}, "Megahorn": {"es": "Megacuerno", "t": "Bug"}, "Spider Web": {"es": "Telaraña", "t": "Bug"}, "Twister": {"es": "Ciclón", "t": "Dragon"}, "Dragon Breath": {"es": "Dragoaliento", "t": "Dragon"}, "Outrage": {"es": "Enfado", "t": "Dragon"}, "Spark": {"es": "Chispa", "t": "Electric"}, "Zap Cannon": {"es": "Electrocañón", "t": "Electric"}, "Shadow Ball": {"es": "Bola Sombra", "t": "Ghost"}, "Curse": {"es": "Maldición", "t": "Ghost"}, "Destiny Bond": {"es": "Mismo Destino", "t": "Ghost"}, "Nightmare": {"es": "Pesadilla", "t": "Ghost"}, "Spite": {"es": "Rencor", "t": "Ghost"}, "Sunny Day": {"es": "Día Soleado", "t": "Fire"}, "Sacred Fire": {"es": "Fuego Sagrado", "t": "Fire"}, "Flame Wheel": {"es": "Rueda Fuego", "t": "Fire"}, "Sweet Kiss": {"es": "Beso Dulce", "t": "Fairy"}, "Charm": {"es": "Encanto", "t": "Fairy"}, "Moonlight": {"es": "Luz Lunar", "t": "Fairy"}, "Powder Snow": {"es": "Nieve Polvo", "t": "Ice"}, "Icy Wind": {"es": "Viento Hielo", "t": "Ice"}, "Detect": {"es": "Detección", "t": "Fighting"}, "Rock Smash": {"es": "Golpe Roca", "t": "Fighting"}, "Reversal": {"es": "Inversión", "t": "Fighting"}, "Vital Throw": {"es": "Llave Vital", "t": "Fighting"}, "Dynamic Punch": {"es": "Puño Dinámico", "t": "Fighting"}, "Cross Chop": {"es": "Tajo Cruzado", "t": "Fighting"}, "Triple Kick": {"es": "Triple Patada", "t": "Fighting"}, "Mach Punch": {"es": "Ultrapuño", "t": "Fighting"}, "Endure": {"es": "Aguante", "t": "Normal"}, "Attract": {"es": "Atracción", "t": "Normal"}, "Psych Up": {"es": "Autosugestión", "t": "Normal"}, "Flail": {"es": "Azote", "t": "Normal"}, "Milk Drink": {"es": "Batido", "t": "Normal"}, "Perish Song": {"es": "Canto Mortal", "t": "Normal"}, "Scary Face": {"es": "Cara Susto", "t": "Normal"}, "Heal Bell": {"es": "Cascabel Cura", "t": "Normal"}, "Swagger": {"es": "Contoneo", "t": "Normal"}, "Conversion 2": {"es": "Conversión2", "t": "Normal"}, "Pain Split": {"es": "Divide Dolor", "t": "Normal"}, "Sweet Scent": {"es": "Dulce Aroma", "t": "Normal"}, "Sketch": {"es": "Esquema", "t": "Normal"}, "False Swipe": {"es": "Falso Tortazo", "t": "Normal"}, "Lock-On": {"es": "Fijar Blanco", "t": "Normal"}, "Frustration": {"es": "Frustración", "t": "Normal"}, "Rapid Spin": {"es": "Giro Rápido", "t": "Normal"}, "Mean Look": {"es": "Mal de Ojo", "t": "Normal"}, "Encore": {"es": "Otra Vez", "t": "Normal"}, "Hidden Power": {"es": "Poder Oculto", "t": "Normal"}, "Present": {"es": "Presente", "t": "Normal"}, "Foresight": {"es": "Profecía", "t": "Normal"}, "Protect": {"es": "Protección", "t": "Normal"}, "Baton Pass": {"es": "Relevo", "t": "Normal"}, "Return": {"es": "Retribución", "t": "Normal"}, "Snore": {"es": "Ronquido", "t": "Normal"}, "Morning Sun": {"es": "Sol Matinal", "t": "Normal"}, "Sleep Talk": {"es": "Sonámbulo", "t": "Normal"}, "Belly Drum": {"es": "Tambor", "t": "Normal"}, "Mind Reader": {"es": "Telépata", "t": "Normal"}, "Safeguard": {"es": "Velo Sagrado", "t": "Normal"}, "Extreme Speed": {"es": "Velocidad Extrema", "t": "Normal"}, "Cotton Spore": {"es": "Esporagodón", "t": "Grass"}, "Giga Drain": {"es": "Gigadrenado", "t": "Grass"}, "Synthesis": {"es": "Síntesis", "t": "Grass"}, "Mirror Coat": {"es": "Manto Espejo", "t": "Psychic"}, "Future Sight": {"es": "Premonición", "t": "Psychic"}, "Ancient Power": {"es": "Poder Pasado", "t": "Rock"}, "Rollout": {"es": "Rodar", "t": "Rock"}, "Sandstorm": {"es": "Tormenta de Arena", "t": "Rock"}, "Feint Attack": {"es": "Finta", "t": "Dark"}, "Thief": {"es": "Ladrón", "t": "Dark"}, "Beat Up": {"es": "Paliza", "t": "Dark"}, "Pursuit": {"es": "Persecución", "t": "Dark"}, "Crunch": {"es": "Triturar", "t": "Dark"}, "Bone Rush": {"es": "Ataque Óseo", "t": "Ground"}, "Mud-Slap": {"es": "Bofetón Lodo", "t": "Ground"}, "Magnitude": {"es": "Magnitud", "t": "Ground"}, "Spikes": {"es": "Púas", "t": "Ground"}, "Sludge Bomb": {"es": "Bomba Lodo", "t": "Poison"}, "Aeroblast": {"es": "Aerochorro", "t": "Flying"}, "Iron Defense": {"es": "Defensa Férrea", "t": "Steel"}, "Doom Desire": {"es": "Deseo Oculto", "t": "Steel"}, "Metal Sound": {"es": "Eco Metálico", "t": "Steel"}, "Meteor Mash": {"es": "Puño Meteoro", "t": "Steel"}, "Muddy Water": {"es": "Agua Lodosa", "t": "Water"}, "Dive": {"es": "Buceo", "t": "Water"}, "Hydro Cannon": {"es": "Hidrocañón", "t": "Water"}, "Water Sport": {"es": "Hidrochorro", "t": "Water"}, "Water Pulse": {"es": "Hidropulso", "t": "Water"}, "Water Spout": {"es": "Salpicar", "t": "Water"}, "Tail Glow": {"es": "Luminicola", "t": "Bug"}, "Signal Beam": {"es": "Rayo Señal", "t": "Bug"}, "Silver Wind": {"es": "Viento Plata", "t": "Bug"}, "Dragon Dance": {"es": "Danza Dragón", "t": "Dragon"}, "Dragon Claw": {"es": "Garra Dragón", "t": "Dragon"}, "Charge": {"es": "Carga", "t": "Electric"}, "Shock Wave": {"es": "Onda Voltio", "t": "Electric"}, "Volt Tackle": {"es": "Placaje Eléctrico", "t": "Electric"}, "Astonish": {"es": "Impresionar", "t": "Ghost"}, "Shadow Punch": {"es": "Puño Sombra", "t": "Ghost"}, "Grudge": {"es": "Rabia", "t": "Ghost"}, "Blast Burn": {"es": "Anillo Ígneo", "t": "Fire"}, "Eruption": {"es": "Estallido", "t": "Fire"}, "Will-O-Wisp": {"es": "Fuego Fatuo", "t": "Fire"}, "Heat Wave": {"es": "Onda Ígnea", "t": "Fire"}, "Blaze Kick": {"es": "Patada Ígnea", "t": "Fire"}, "Overheat": {"es": "Sofoco", "t": "Fire"}, "Ice Ball": {"es": "Bola Hielo", "t": "Ice"}, "Icicle Spear": {"es": "Carámbano", "t": "Ice"}, "Sheer Cold": {"es": "Frío Polar", "t": "Ice"}, "Hail": {"es": "Granizo", "t": "Ice"}, "Bulk Up": {"es": "Corpulencia", "t": "Fighting"}, "Brick Break": {"es": "Demolición", "t": "Fighting"}, "Revenge": {"es": "Desquite", "t": "Fighting"}, "Arm Thrust": {"es": "Empujón", "t": "Fighting"}, "Superpower": {"es": "Fuerza Bruta", "t": "Fighting"}, "Sky Uppercut": {"es": "Gancho Alto", "t": "Fighting"}, "Focus Punch": {"es": "Puño Certero", "t": "Fighting"}, "Nature Power": {"es": "Adaptación", "t": "Normal"}, "Uproar": {"es": "Alboroto", "t": "Normal"}, "Refresh": {"es": "Alivio", "t": "Normal"}, "Covet": {"es": "Antojo", "t": "Normal"}, "Howl": {"es": "Aullido", "t": "Normal"}, "Assist": {"es": "Ayuda", "t": "Normal"}, "Block": {"es": "Bloqueo", "t": "Normal"}, "Yawn": {"es": "Bostezo", "t": "Normal"}, "Camouflage": {"es": "Camuflaje", "t": "Normal"}, "Tickle": {"es": "Cosquillas", "t": "Normal"}, "Teeter Dance": {"es": "Danza Caos", "t": "Normal"}, "Secret Power": {"es": "Daño Secreto", "t": "Normal"}, "Wish": {"es": "Deseo", "t": "Normal"}, "Spit Up": {"es": "Escupir", "t": "Normal"}, "Endeavor": {"es": "Esfuerzo", "t": "Normal"}, "Smelling Salts": {"es": "Estímulo", "t": "Normal"}, "Crush Claw": {"es": "Garra Brutal", "t": "Normal"}, "Facade": {"es": "Imagen", "t": "Normal"}, "Weather Ball": {"es": "Meteorobola", "t": "Normal"}, "Odor Sleuth": {"es": "Rastreo", "t": "Normal"}, "Recycle": {"es": "Reciclaje", "t": "Normal"}, "Helping Hand": {"es": "Refuerzo", "t": "Normal"}, "Slack Off": {"es": "Relajo", "t": "Normal"}, "Stockpile": {"es": "Reserva", "t": "Normal"}, "Follow Me": {"es": "Señuelo", "t": "Normal"}, "Fake Out": {"es": "Sorpresa", "t": "Normal"}, "Swallow": {"es": "Tragar", "t": "Normal"}, "Hyper Voice": {"es": "Vozarrón", "t": "Normal"}, "Aromatherapy": {"es": "Aromaterapia", "t": "Grass"}, "Ingrain": {"es": "Arraigo", "t": "Grass"}, "Needle Arm": {"es": "Brazo Pincho", "t": "Grass"}, "Leaf Blade": {"es": "Hoja Aguda", "t": "Grass"}, "Magical Leaf": {"es": "Hoja Mágica", "t": "Grass"}, "Frenzy Plant": {"es": "Planta Feroz", "t": "Grass"}, "Bullet Seed": {"es": "Semilladora", "t": "Grass"}, "Grass Whistle": {"es": "Silbato", "t": "Grass"}, "Mist Ball": {"es": "Bola Neblina", "t": "Psychic"}, "Magic Coat": {"es": "Capa Mágica", "t": "Psychic"}, "Role Play": {"es": "Imitación", "t": "Psychic"}, "Skill Swap": {"es": "Intercambio", "t": "Psychic"}, "Cosmic Power": {"es": "Masa Cósmica", "t": "Psychic"}, "Extrasensory": {"es": "Paranormal", "t": "Psychic"}, "Calm Mind": {"es": "Paz Mental", "t": "Psychic"}, "Psycho Boost": {"es": "Psicoataque", "t": "Psychic"}, "Luster Purge": {"es": "Resplandor", "t": "Psychic"}, "Imprison": {"es": "Sellar", "t": "Psychic"}, "Trick": {"es": "Truco", "t": "Psychic"}, "Rock Blast": {"es": "Pedrada", "t": "Rock"}, "Rock Tomb": {"es": "Tumba Rocas", "t": "Rock"}, "Flatter": {"es": "Camelo", "t": "Dark"}, "Knock Off": {"es": "Desarme", "t": "Dark"}, "Memento": {"es": "Legado", "t": "Dark"}, "Fake Tears": {"es": "Llanto Falso", "t": "Dark"}, "Taunt": {"es": "Mofa", "t": "Dark"}, "Snatch": {"es": "Robo", "t": "Dark"}, "Torment": {"es": "Tormento", "t": "Dark"}, "Sand Tomb": {"es": "Bucle Arena", "t": "Ground"}, "Mud Sport": {"es": "Chapoteo Lodo", "t": "Ground"}, "Mud Shot": {"es": "Disparo Lodo", "t": "Ground"}, "Poison Tail": {"es": "Cola Veneno", "t": "Poison"}, "Poison Fang": {"es": "Colmillo Veneno", "t": "Poison"}, "Air Cutter": {"es": "Aire Afilado", "t": "Flying"}, "Bounce": {"es": "Bote", "t": "Flying"}, "Feather Dance": {"es": "Danza Pluma", "t": "Flying"}, "Aerial Ace": {"es": "Golpe Aéreo", "t": "Flying"}, "Magnet Bomb": {"es": "Bomba Imán", "t": "Steel"}, "Iron Head": {"es": "Cabeza de Hierro", "t": "Steel"}, "Mirror Shot": {"es": "Disparo Espejo", "t": "Steel"}, "Flash Cannon": {"es": "Cañón Resplandor", "t": "Steel"}, "Gyro Ball": {"es": "Giro Bola", "t": "Steel"}, "Bullet Punch": {"es": "Puño Bala", "t": "Steel"}, "Metal Burst": {"es": "Represión Metal", "t": "Steel"}, "Aqua Ring": {"es": "Acua Aro", "t": "Water"}, "Aqua Tail": {"es": "Acua Cola", "t": "Water"}, "Aqua Jet": {"es": "Acua Jet", "t": "Water"}, "Brine": {"es": "Salmuera", "t": "Water"}, "Defend Order": {"es": "A Defender", "t": "Bug"}, "Attack Order": {"es": "Al Ataque", "t": "Bug"}, "Heal Order": {"es": "Auxilio", "t": "Bug"}, "U-turn": {"es": "Ida y Vuelta", "t": "Bug"}, "Bug Bite": {"es": "Picadura", "t": "Bug"}, "X-Scissor": {"es": "Tijera X", "t": "Bug"}, "Bug Buzz": {"es": "Zumbido", "t": "Bug"}, "Dragon Rush": {"es": "Carga Dragón", "t": "Dragon"}, "Draco Meteor": {"es": "Cometa Draco", "t": "Dragon"}, "Spacial Rend": {"es": "Corte Vacío", "t": "Dragon"}, "Roar of Time": {"es": "Distorsión", "t": "Dragon"}, "Dragon Pulse": {"es": "Pulso Dragón", "t": "Dragon"}, "Discharge": {"es": "Chispazo", "t": "Electric"}, "Thunder Fang": {"es": "Colmillo Rayo", "t": "Electric"}, "Magnet Rise": {"es": "Levitón", "t": "Electric"}, "Charge Beam": {"es": "Rayo Carga", "t": "Electric"}, "Shadow Claw": {"es": "Garra Umbría", "t": "Ghost"}, "Shadow Force": {"es": "Golpe Umbrío", "t": "Ghost"}, "Shadow Sneak": {"es": "Sombra Vil", "t": "Ghost"}, "Ominous Wind": {"es": "Viento Aciago", "t": "Ghost"}, "Fire Fang": {"es": "Colmillo Ígneo", "t": "Fire"}, "Flare Blitz": {"es": "Envite Ígneo", "t": "Fire"}, "Lava Plume": {"es": "Humareda", "t": "Fire"}, "Magma Storm": {"es": "Lluvia Ígnea", "t": "Fire"}, "Avalanche": {"es": "Alud", "t": "Ice"}, "Ice Fang": {"es": "Colmillo Hielo", "t": "Ice"}, "Ice Shard": {"es": "Esquirla Helada", "t": "Ice"}, "Close Combat": {"es": "A Bocajarro", "t": "Fighting"}, "Aura Sphere": {"es": "Esfera Aural", "t": "Fighting"}, "Wake-Up Slap": {"es": "Espabila", "t": "Fighting"}, "Hammer Arm": {"es": "Machada", "t": "Fighting"}, "Focus Blast": {"es": "Onda Certera", "t": "Fighting"}, "Vacuum Wave": {"es": "Onda Vacío", "t": "Fighting"}, "Force Palm": {"es": "Palmeo", "t": "Fighting"}, "Drain Punch": {"es": "Puño Drenaje", "t": "Fighting"}, "Acupressure": {"es": "Acupresión", "t": "Normal"}, "Crush Grip": {"es": "Agarrón", "t": "Normal"}, "Feint": {"es": "Amago", "t": "Normal"}, "Trump Card": {"es": "As Oculto", "t": "Normal"}, "Lucky Chant": {"es": "Conjuro", "t": "Normal"}, "Copycat": {"es": "Copión", "t": "Normal"}, "Double Hit": {"es": "Doble Golpe", "t": "Normal"}, "Natural Gift": {"es": "Don Natural", "t": "Normal"}, "Wring Out": {"es": "Estrujón", "t": "Normal"}, "Giga Impact": {"es": "Gigaimpacto", "t": "Normal"}, "Captivate": {"es": "Seducción", "t": "Normal"}, "Judgment": {"es": "Sentencia", "t": "Normal"}, "Rock Climb": {"es": "Treparrocas", "t": "Normal"}, "Last Resort": {"es": "Última Baza", "t": "Normal"}, "Me First": {"es": "Yo Primero", "t": "Normal"}, "Worry Seed": {"es": "Abatidoras", "t": "Grass"}, "Seed Bomb": {"es": "Bomba Germen", "t": "Grass"}, "Energy Ball": {"es": "Energibola", "t": "Grass"}, "Seed Flare": {"es": "Fulgor Semilla", "t": "Grass"}, "Grass Knot": {"es": "Hierba Lazo", "t": "Grass"}, "Power Whip": {"es": "Latigazo", "t": "Grass"}, "Leaf Storm": {"es": "Lluevehojas", "t": "Grass"}, "Wood Hammer": {"es": "Mazazo", "t": "Grass"}, "Heal Block": {"es": "Anticura", "t": "Psychic"}, "Zen Headbutt": {"es": "Cabezazo Zen", "t": "Psychic"}, "Heart Swap": {"es": "Cambiaalmas", "t": "Psychic"}, "Guard Swap": {"es": "Cambiadefensa", "t": "Psychic"}, "Power Swap": {"es": "Cambiafuerza", "t": "Psychic"}, "Lunar Dance": {"es": "Danza Lunar", "t": "Psychic"}, "Healing Wish": {"es": "Deseo Cura", "t": "Psychic"}, "Trick Room": {"es": "Espacio Raro", "t": "Psychic"}, "Miracle Eye": {"es": "Gran Ojo", "t": "Psychic"}, "Gravity": {"es": "Gravedad", "t": "Psychic"}, "Psycho Shift": {"es": "Psicocambio", "t": "Psychic"}, "Psycho Cut": {"es": "Psicocorte", "t": "Psychic"}, "Power Trick": {"es": "Truco Fuerza", "t": "Psychic"}, "Power Gem": {"es": "Joya de Luz", "t": "Rock"}, "Rock Polish": {"es": "Pulimento", "t": "Rock"}, "Stone Edge": {"es": "Roca Afilada", "t": "Rock"}, "Rock Wrecker": {"es": "Romperrocas", "t": "Rock"}, "Head Smash": {"es": "Testarazo", "t": "Rock"}, "Stealth Rock": {"es": "Trampa Rocas", "t": "Rock"}, "Dark Void": {"es": "Brecha Negra", "t": "Dark"}, "Assurance": {"es": "Buena Baza", "t": "Dark"}, "Punishment": {"es": "Castigo", "t": "Dark"}, "Embargo": {"es": "Embargo", "t": "Dark"}, "Sucker Punch": {"es": "Golpe Bajo", "t": "Dark"}, "Fling": {"es": "Lanzamiento", "t": "Dark"}, "Nasty Plot": {"es": "Maquinación", "t": "Dark"}, "Dark Pulse": {"es": "Pulso Umbrío", "t": "Dark"}, "Night Slash": {"es": "Tajo Umbrío", "t": "Dark"}, "Switcheroo": {"es": "Trapicheo", "t": "Dark"}, "Payback": {"es": "Vendetta", "t": "Dark"}, "Mud Bomb": {"es": "Bomba Fango", "t": "Ground"}, "Earth Power": {"es": "Tierra Viva", "t": "Ground"}, "Gastro Acid": {"es": "Bilis", "t": "Poison"}, "Gunk Shot": {"es": "Lanzamugre", "t": "Poison"}, "Toxic Spikes": {"es": "Púas Tóxicas", "t": "Poison"}, "Poison Jab": {"es": "Puya Nociva", "t": "Poison"}, "Cross Poison": {"es": "Veneno X", "t": "Poison"}, "Chatter": {"es": "Cháchara", "t": "Flying"}, "Defog": {"es": "Despejar", "t": "Flying"}, "Brave Bird": {"es": "Pájaro Osado", "t": "Flying"}, "Pluck": {"es": "Picoteo", "t": "Flying"}, "Roost": {"es": "Respiro", "t": "Flying"}, "Air Slash": {"es": "Tajo Aéreo", "t": "Flying"}, "Tailwind": {"es": "Viento Afín", "t": "Flying"}, "Autotomize": {"es": "Aligerar", "t": "Steel"}, "Shift Gear": {"es": "Cambio de Marcha", "t": "Steel"}, "Heavy Slam": {"es": "Cuerpo Pesado", "t": "Steel"}, "Gear Grind": {"es": "Rueda Doble", "t": "Steel"}, "Razor Shell": {"es": "Concha Filo", "t": "Water"}, "Soak": {"es": "Empapar", "t": "Water"}, "Scald": {"es": "Escaldar", "t": "Water"}, "Water Pledge": {"es": "Voto Agua", "t": "Water"}, "Quiver Dance": {"es": "Danza Aleteo", "t": "Bug"}, "Struggle Bug": {"es": "Estoicismo", "t": "Bug"}, "Rage Powder": {"es": "Polvo Ira", "t": "Bug"}, "Steamroller": {"es": "Rodillo de Púas", "t": "Bug"}, "Dragon Tail": {"es": "Cola Dragón", "t": "Dragon"}, "Dual Chop": {"es": "Golpe Bis", "t": "Dragon"}, "Bolt Strike": {"es": "Ataque Fulgor", "t": "Electric"}, "Electro Ball": {"es": "Bola Voltio", "t": "Electric"}, "Electroweb": {"es": "Electrotela", "t": "Electric"}, "Fusion Bolt": {"es": "Rayo Fusión", "t": "Electric"}, "Wild Charge": {"es": "Voltio Cruel", "t": "Electric"}, "Volt Switch": {"es": "Voltiocambio", "t": "Electric"}, "Hex": {"es": "Infortunio", "t": "Ghost"}, "Searing Shot": {"es": "Bomba Ígnea", "t": "Fire"}, "Incinerate": {"es": "Calcinación", "t": "Fire"}, "Fiery Dance": {"es": "Danza Llama", "t": "Fire"}, "Heat Crash": {"es": "Golpe Calor", "t": "Fire"}, "Inferno": {"es": "Infierno", "t": "Fire"}, "Blue Flare": {"es": "Llama Azul", "t": "Fire"}, "Fusion Flare": {"es": "Llama Fusión", "t": "Fire"}, "Flame Charge": {"es": "Nitrocarga", "t": "Fire"}, "Flame Burst": {"es": "Pirotecnia", "t": "Fire"}, "V-create": {"es": "V de Fuego", "t": "Fire"}, "Fire Pledge": {"es": "Voto Fuego", "t": "Fire"}, "Icicle Crash": {"es": "Chuzos", "t": "Ice"}, "Ice Burn": {"es": "Llama Gélida", "t": "Ice"}, "Glaciate": {"es": "Mundo Gélido", "t": "Ice"}, "Freeze Shock": {"es": "Rayo Gélido", "t": "Ice"}, "Frost Breath": {"es": "Vaho Gélido", "t": "Ice"}, "Quick Guard": {"es": "Anticipo", "t": "Fighting"}, "Sacred Sword": {"es": "Espada Santa", "t": "Fighting"}, "Storm Throw": {"es": "Llave Corsé", "t": "Fighting"}, "Circle Throw": {"es": "Llave Giro", "t": "Fighting"}, "Low Sweep": {"es": "Puntapié", "t": "Fighting"}, "Secret Sword": {"es": "Sable Místico", "t": "Fighting"}, "Final Gambit": {"es": "Sacrificio", "t": "Fighting"}, "Head Charge": {"es": "Ariete", "t": "Normal"}, "Work Up": {"es": "Avivar", "t": "Normal"}, "Round": {"es": "Canon", "t": "Normal"}, "Relic Song": {"es": "Canto Arcaico", "t": "Normal"}, "After You": {"es": "Cede Paso", "t": "Normal"}, "Reflect Type": {"es": "Clonatipo", "t": "Normal"}, "Entrainment": {"es": "Danza Amiga", "t": "Normal"}, "Echoed Voice": {"es": "Eco Voz", "t": "Normal"}, "Chip Away": {"es": "Guardia Baja", "t": "Normal"}, "Bestow": {"es": "Ofrenda", "t": "Normal"}, "Simple Beam": {"es": "Onda Simple", "t": "Normal"}, "Tail Slap": {"es": "Plumerazo", "t": "Normal"}, "Retaliate": {"es": "Represalia", "t": "Normal"}, "Shell Smash": {"es": "Rompecoraza", "t": "Normal"}, "Techno Blast": {"es": "Tecno Shock", "t": "Normal"}, "Horn Leech": {"es": "Asta Drenaje", "t": "Grass"}, "Leaf Tornado": {"es": "Ciclón de Hojas", "t": "Grass"}, "Cotton Guard": {"es": "Rizo Algodón", "t": "Grass"}, "Grass Pledge": {"es": "Voto Planta", "t": "Grass"}, "Heart Stamp": {"es": "Arrumaco", "t": "Psychic"}, "Ally Switch": {"es": "Cambio de Banda", "t": "Psychic"}, "Power Split": {"es": "Isofuerza", "t": "Psychic"}, "Guard Split": {"es": "Isoguardia", "t": "Psychic"}, "Psystrike": {"es": "Onda Mental", "t": "Psychic"}, "Stored Power": {"es": "Poder Reserva", "t": "Psychic"}, "Psyshock": {"es": "Psicocarga", "t": "Psychic"}, "Heal Pulse": {"es": "Pulso Cura", "t": "Psychic"}, "Synchronoise": {"es": "Sincrorruido", "t": "Psychic"}, "Telekinesis": {"es": "Telequinesis", "t": "Psychic"}, "Wonder Room": {"es": "Zona Extraña", "t": "Psychic"}, "Magic Room": {"es": "Zona Mágica", "t": "Psychic"}, "Smack Down": {"es": "Antiaéreo", "t": "Rock"}, "Wide Guard": {"es": "Vasta Guardia", "t": "Rock"}, "Hone Claws": {"es": "Afilagarras", "t": "Dark"}, "Snarl": {"es": "Alarido", "t": "Dark"}, "Foul Play": {"es": "Juego Sucio", "t": "Dark"}, "Night Daze": {"es": "Pulso Noche", "t": "Dark"}, "Quash": {"es": "Último Lugar", "t": "Dark"}, "Drill Run": {"es": "Taladradora", "t": "Ground"}, "Bulldoze": {"es": "Terratemblor", "t": "Ground"}, "Acid Spray": {"es": "Bomba Ácida", "t": "Poison"}, "Venoshock": {"es": "Carga Tóxica", "t": "Poison"}, "Coil": {"es": "Enrosque", "t": "Poison"}, "Clear Smog": {"es": "Niebla Clara", "t": "Poison"}, "Sludge Wave": {"es": "Onda Tóxica", "t": "Poison"}, "Acrobatics": {"es": "Acróbata", "t": "Flying"}, "Sky Drop": {"es": "Caída Libre", "t": "Flying"}, "Hurricane": {"es": "Vendaval", "t": "Flying"}, "King's Shield": {"es": "Escudo Real", "t": "Steel"}, "Steam Eruption": {"es": "Chorro de Vapor", "t": "Water"}, "Origin Pulse": {"es": "Pulso Primigenio", "t": "Water"}, "Water Shuriken": {"es": "Shuriken de Agua", "t": "Water"}, "Infestation": {"es": "Acoso", "t": "Bug"}, "Fell Stinger": {"es": "Aguijón Letal", "t": "Bug"}, "Powder": {"es": "Polvo Explosivo", "t": "Bug"}, "Sticky Web": {"es": "Red Viscosa", "t": "Bug"}, "Magnetic Flux": {"es": "Aura Magnética", "t": "Electric"}, "Electric Terrain": {"es": "Campo Eléctrico", "t": "Electric"}, "Parabolic Charge": {"es": "Carga Parábola", "t": "Electric"}, "Ion Deluge": {"es": "Cortina Plasma", "t": "Electric"}, "Electrify": {"es": "Electrificación", "t": "Electric"}, "Nuzzle": {"es": "Moflete Estático", "t": "Electric"}, "Eerie Impulse": {"es": "Onda Anómala", "t": "Electric"}, "Phantom Force": {"es": "Golpe Fantasma", "t": "Ghost"}, "Trick-or-Treat": {"es": "Halloween", "t": "Ghost"}, "Mystical Fire": {"es": "Llama Embrujada", "t": "Fire"}, "Draining Kiss": {"es": "Beso Drenaje", "t": "Fairy"}, "Dazzling Gleam": {"es": "Brillo Mágico", "t": "Fairy"}, "Misty Terrain": {"es": "Campo de Niebla", "t": "Fairy"}, "Play Rough": {"es": "Carantoña", "t": "Fairy"}, "Fairy Lock": {"es": "Cerrojo Feérico", "t": "Fairy"}, "Flower Shield": {"es": "Defensa Floral", "t": "Fairy"}, "Moonblast": {"es": "Fuerza Lunar", "t": "Fairy"}, "Geomancy": {"es": "Geocontrol", "t": "Fairy"}, "Light of Ruin": {"es": "Luz Aniquiladora", "t": "Fairy"}, "Aromatic Mist": {"es": "Niebla Aromática", "t": "Fairy"}, "Baby-Doll Eyes": {"es": "Ojitos Tiernos", "t": "Fairy"}, "Crafty Shield": {"es": "Truco Defensa", "t": "Fairy"}, "Fairy Wind": {"es": "Viento Feérico", "t": "Fairy"}, "Disarming Voice": {"es": "Voz Cautivadora", "t": "Fairy"}, "Freeze-Dry": {"es": "Liofilización", "t": "Ice"}, "Mat Block": {"es": "Escudo Tatami", "t": "Fighting"}, "Flying Press": {"es": "Plancha Voladora", "t": "Fighting"}, "Power-Up Punch": {"es": "Puño Incremento", "t": "Fighting"}, "Play Nice": {"es": "Camaradería", "t": "Normal"}, "Celebrate": {"es": "Celebración", "t": "Normal"}, "Hold Back": {"es": "Clemencia", "t": "Normal"}, "Confide": {"es": "Confidencia", "t": "Normal"}, "Boomburst": {"es": "Estruendo", "t": "Normal"}, "Hold Hands": {"es": "Manos Juntas", "t": "Normal"}, "Happy Hour": {"es": "Paga Extra", "t": "Normal"}, "Noble Roar": {"es": "Rugido de Guerra", "t": "Normal"}, "Spiky Shield": {"es": "Barrera Espinosa", "t": "Grass"}, "Grassy Terrain": {"es": "Campo de Hierba", "t": "Grass"}, "Forest's Curse": {"es": "Condena Silvana", "t": "Grass"}, "Petal Blizzard": {"es": "Tormenta Floral", "t": "Grass"}, "Hyperspace Hole": {"es": "Paso Dimensional", "t": "Psychic"}, "Diamond Storm": {"es": "Tormenta de Diamantes", "t": "Rock"}, "Hyperspace Fury": {"es": "Cerco Dimensión", "t": "Dark"}, "Topsy-Turvy": {"es": "Reversión", "t": "Dark"}, "Parting Shot": {"es": "Última Palabra", "t": "Dark"}, "Rototiller": {"es": "Fertilizante", "t": "Ground"}, "Precipice Blades": {"es": "Filo del Abismo", "t": "Ground"}, "Land's Wrath": {"es": "Fuerza Telúrica", "t": "Ground"}, "Thousand Arrows": {"es": "Mil Flechas", "t": "Ground"}, "Thousand Waves": {"es": "Mil Temblores", "t": "Ground"}, "Belch": {"es": "Eructo", "t": "Poison"}, "Venom Drench": {"es": "Trampa Venenosa", "t": "Poison"}, "Oblivion Wing": {"es": "Ala Mortífera", "t": "Flying"}, "Dragon Ascent": {"es": "Ascenso Draco", "t": "Flying"}, "Anclaje": {"es": "Anclaje", "t": "Steel"}, "Cuerno Certero": {"es": "Cuerno Certero", "t": "Steel"}, "Ferropuño Doble": {"es": "Ferropuño Doble", "t": "Steel"}, "Meteoimpacto": {"es": "Meteoimpacto", "t": "Steel"}, "Piñón Auxiliar": {"es": "Piñón Auxiliar", "t": "Steel"}, "Aria Burbuja": {"es": "Aria Burbuja", "t": "Water"}, "Hidroariete": {"es": "Hidroariete", "t": "Water"}, "Salpikasurf": {"es": "Salpikasurf", "t": "Water"}, "Vapodrenaje": {"es": "Vapodrenaje", "t": "Water"}, "Bola de Polen": {"es": "Bola de Polen", "t": "Bug"}, "Escaramuza": {"es": "Escaramuza", "t": "Bug"}, "Plancha": {"es": "Plancha", "t": "Bug"}, "Fragor Escamas": {"es": "Fragor Escamas", "t": "Dragon"}, "Martillo Dragón": {"es": "Martillo Dragón", "t": "Dragon"}, "Núcleo Castigo": {"es": "Núcleo Castigo", "t": "Dragon"}, "Electropunzada": {"es": "Electropunzada", "t": "Electric"}, "Joltioparálisis": {"es": "Joltioparálisis", "t": "Electric"}, "Pikatormenta": {"es": "Pikatormenta", "t": "Electric"}, "Pikaturbo": {"es": "Pikaturbo", "t": "Electric"}, "Puños Plasma": {"es": "Puños Plasma", "t": "Electric"}, "Hueso Sombrío": {"es": "Hueso Sombrío", "t": "Ghost"}, "Puntada Sombría": {"es": "Puntada Sombría", "t": "Ghost"}, "Rayo Umbrío": {"es": "Rayo Umbrío", "t": "Ghost"}, "Robasombra": {"es": "Robasombra", "t": "Ghost"}, "Cabeza Sorpresa": {"es": "Cabeza Sorpresa", "t": "Fire"}, "Coraza Trampa": {"es": "Coraza Trampa", "t": "Fire"}, "Flarembestida": {"es": "Flarembestida", "t": "Fire"}, "Látigo Ígneo": {"es": "Látigo Ígneo", "t": "Fire"}, "Llama Final": {"es": "Llama Final", "t": "Fire"}, "Cañón Floral": {"es": "Cañón Floral", "t": "Fairy"}, "Cura Floral": {"es": "Cura Floral", "t": "Fairy"}, "Furia Natural": {"es": "Furia Natural", "t": "Fairy"}, "Sylveotornado": {"es": "Sylveotornado", "t": "Fairy"}, "Glaceoprisma": {"es": "Glaceoprisma", "t": "Ice"}, "Martillo Hielo": {"es": "Martillo Hielo", "t": "Ice"}, "Velo Aurora": {"es": "Velo Aurora", "t": "Ice"}, "Aguzar": {"es": "Aguzar", "t": "Normal"}, "Danza Despertar": {"es": "Danza Despertar", "t": "Normal"}, "Eevimpacto": {"es": "Eevimpacto", "t": "Normal"}, "Foco": {"es": "Foco", "t": "Normal"}, "Multiataque": {"es": "Multiataque", "t": "Normal"}, "Ojos Llorosos": {"es": "Ojos Llorosos", "t": "Normal"}, "Absorbefuerza": {"es": "Absorbefuerza", "t": "Grass"}, "Cuchilla Solar": {"es": "Cuchilla Solar", "t": "Grass"}, "Follaje": {"es": "Follaje", "t": "Grass"}, "Leafitobombas": {"es": "Leafitobombas", "t": "Grass"}, "Patada Tropical": {"es": "Patada Tropical", "t": "Grass"}, "Cambiavelocidad": {"es": "Cambiavelocidad", "t": "Psychic"}, "Campo Psíquico": {"es": "Campo Psíquico", "t": "Psychic"}, "Espeaura": {"es": "Espeaura", "t": "Psychic"}, "Géiser Fotónico": {"es": "Géiser Fotónico", "t": "Psychic"}, "Láser Prisma": {"es": "Láser Prisma", "t": "Psychic"}, "Mandato": {"es": "Mandato", "t": "Psychic"}, "Psicocolmillo": {"es": "Psicocolmillo", "t": "Psychic"}, "Roca Veloz": {"es": "Roca Veloz", "t": "Rock"}, "Chulería": {"es": "Chulería", "t": "Dark"}, "Giro Vil": {"es": "Giro Vil", "t": "Dark"}, "Golpe Mordaza": {"es": "Golpe Mordaza", "t": "Dark"}, "Lariat Oscuro": {"es": "Lariat Oscuro", "t": "Dark"}, "Umbreozona": {"es": "Umbreozona", "t": "Dark"}, "Fuerza Equina": {"es": "Fuerza Equina", "t": "Ground"}, "Pataleta": {"es": "Pataleta", "t": "Ground"}, "Recogearena": {"es": "Recogearena", "t": "Ground"}, "Búnker": {"es": "Búnker", "t": "Poison"}, "Hilo Venenoso": {"es": "Hilo Venenoso", "t": "Poison"}, "Purificación": {"es": "Purificación", "t": "Poison"}, "Pico Cañón": {"es": "Pico Cañón", "t": "Flying"}, "}": {"es": "Ponzochoque", "t": "Poison"}, "Allanador Férreo": {"es": "Allanador Férreo", "t": "Steel"}, "Embate Supremo": {"es": "Embate Supremo", "t": "Steel"}, "Metaláser": {"es": "Metaláser", "t": "Steel"}, "Retracción": {"es": "Retracción", "t": "Steel"}, "Tajo Supremo": {"es": "Tajo Supremo", "t": "Steel"}, "Azote Torrencial": {"es": "Azote Torrencial", "t": "Water"}, "Branquibocado": {"es": "Branquibocado", "t": "Water"}, "Disparo Certero": {"es": "Disparo Certero", "t": "Water"}, "Envite Acuático": {"es": "Envite Acuático", "t": "Water"}, "Gota Vital": {"es": "Gota Vital", "t": "Water"}, "Viraje": {"es": "Viraje", "t": "Water"}, "Golpe Rastrero": {"es": "Golpe Rastrero", "t": "Bug"}, "Cañón Dinamax": {"es": "Cañón Dinamax", "t": "Dragon"}, "Dracoenergía": {"es": "Dracoenergía", "t": "Dragon"}, "Dracoflechas": {"es": "Dracoflechas", "t": "Dragon"}, "Estruendo Escama": {"es": "Estruendo Escama", "t": "Dragon"}, "Ráfaga Escamas": {"es": "Ráfaga Escamas", "t": "Dragon"}, "Rayo Infinito": {"es": "Rayo Infinito", "t": "Dragon"}, "Vasto Impacto": {"es": "Vasto Impacto", "t": "Dragon"}, "Alto Voltaje": {"es": "Alto Voltaje", "t": "Electric"}, "Amplificador": {"es": "Amplificador", "t": "Electric"}, "Electormenta": {"es": "Electormenta", "t": "Electric"}, "Electrojaula": {"es": "Electrojaula", "t": "Electric"}, "Electropico": {"es": "Electropico", "t": "Electric"}, "Rueda Aural": {"es": "Rueda Aural", "t": "Electric"}, "Marcha Espectral": {"es": "Marcha Espectral", "t": "Ghost"}, "Orbes Espectro": {"es": "Orbes Espectro", "t": "Ghost"}, "Poltergeist": {"es": "Poltergeist", "t": "Ghost"}, "Rencor Reprimido": {"es": "Rencor Reprimido", "t": "Ghost"}, "Balón Ígneo": {"es": "Balón Ígneo", "t": "Fire"}, "Envidia Ardiente": {"es": "Envidia Ardiente", "t": "Fire"}, "Erupción de Ira": {"es": "Erupción de Ira", "t": "Fire"}, "Bruma Explosiva": {"es": "Bruma Explosiva", "t": "Fairy"}, "Cautivapor": {"es": "Cautivapor", "t": "Fairy"}, "Choque Anímico": {"es": "Choque Anímico", "t": "Fairy"}, "Ciclón Primavera": {"es": "Ciclón Primavera", "t": "Fairy"}, "Decoración": {"es": "Decoración", "t": "Fairy"}, "Lanza Glacial": {"es": "Lanza Glacial", "t": "Ice"}, "Triple Axel": {"es": "Triple Axel", "t": "Ice"}, "Viento Carámbano": {"es": "Viento Carámbano", "t": "Ice"}, "Asalto Estelar": {"es": "Asalto Estelar", "t": "Fighting"}, "Bastión Final": {"es": "Bastión Final", "t": "Fighting"}, "Danza Triunfal": {"es": "Danza Triunfal", "t": "Fighting"}, "Motivación": {"es": "Motivación", "t": "Fighting"}, "Octopresa": {"es": "Octopresa", "t": "Fighting"}, "Patada Relámpago": {"es": "Patada Relámpago", "t": "Fighting"}, "Plancha Corporal": {"es": "Plancha Corporal", "t": "Fighting"}, "Triple Flecha": {"es": "Triple Flecha", "t": "Fighting"}, "Atiborramiento": {"es": "Atiborramiento", "t": "Normal"}, "Cambiapoder": {"es": "Cambiapoder", "t": "Normal"}, "Cambio de Cancha": {"es": "Cambio de Cancha", "t": "Normal"}, "Hora del Té": {"es": "Hora del Té", "t": "Normal"}, "Pulso de Campo": {"es": "Pulso de Campo", "t": "Normal"}, "Ácido Málico": {"es": "Ácido Málico", "t": "Grass"}, "Batería Asalto": {"es": "Batería Asalto", "t": "Grass"}, "Cepo": {"es": "Cepo", "t": "Grass"}, "Clorofiláser": {"es": "Clorofiláser", "t": "Grass"}, "Cura Selvática": {"es": "Cura Selvática", "t": "Grass"}, "Fitoimpulso": {"es": "Fitoimpulso", "t": "Grass"}, "Fuerza G": {"es": "Fuerza G", "t": "Grass"}, "Punzada Rama": {"es": "Punzada Rama", "t": "Grass"}, "Ala Aural": {"es": "Ala Aural", "t": "Psychic"}, "Asalto Barrera": {"es": "Asalto Barrera", "t": "Psychic"}, "Bálsamo Osado": {"es": "Bálsamo Osado", "t": "Psychic"}, "Conjuro Funesto": {"es": "Conjuro Funesto", "t": "Psychic"}, "Mirada Heladora": {"es": "Mirada Heladora", "t": "Psychic"}, "Plegaria Lunar": {"es": "Plegaria Lunar", "t": "Psychic"}, "Poder Místico": {"es": "Poder Místico", "t": "Psychic"}, "Polvo Mágico": {"es": "Polvo Mágico", "t": "Psychic"}, "Vasta Fuerza": {"es": "Vasta Fuerza", "t": "Psychic"}, "Alquitranazo": {"es": "Alquitranazo", "t": "Rock"}, "Hachazo Pétreo": {"es": "Hachazo Pétreo", "t": "Rock"}, "Rayo Meteórico": {"es": "Rayo Meteórico", "t": "Rock"}, "Desahogo": {"es": "Desahogo", "t": "Dark"}, "Furia Candente": {"es": "Furia Candente", "t": "Dark"}, "Golpe Oscuro": {"es": "Golpe Oscuro", "t": "Dark"}, "Irreverencia": {"es": "Irreverencia", "t": "Dark"}, "Obstrucción": {"es": "Obstrucción", "t": "Dark"}, "Presa Maxilar": {"es": "Presa Maxilar", "t": "Dark"}, "Tajo Metralla": {"es": "Tajo Metralla", "t": "Dark"}, "Arenas Ardientes": {"es": "Arenas Ardientes", "t": "Ground"}, "Arremetida": {"es": "Arremetida", "t": "Ground"}, "Simún de Arena": {"es": "Simún de Arena", "t": "Ground"}, "Garra Nociva": {"es": "Garra Nociva", "t": "Poison"}, "Gas Corrosivo": {"es": "Gas Corrosivo", "t": "Poison"}, "Mil Púas Tóxicas": {"es": "Mil Púas Tóxicas", "t": "Poison"}, "Moluscañón": {"es": "Moluscañón", "t": "Poison"}, "Ala Bis": {"es": "Ala Bis", "t": "Flying"}, "Fiebre Dorada": {"es": "Fiebre Dorada", "t": "Steel"}, "Martillo Colosal": {"es": "Martillo Colosal", "t": "Steel"}, "Prensa Metálica": {"es": "Prensa Metálica", "t": "Steel"}, "Quemarrueda": {"es": "Quemarrueda", "t": "Steel"}, "Tajo Taquión": {"es": "Tajo Taquión", "t": "Steel"}, "Agua Fría": {"es": "Agua Fría", "t": "Water"}, "Danza Acuática": {"es": "Danza Acuática", "t": "Water"}, "Hidrovapor": {"es": "Hidrovapor", "t": "Water"}, "Puño Jet": {"es": "Puño Jet", "t": "Water"}, "Tajo Acuático": {"es": "Tajo Acuático", "t": "Water"}, "Triple Inmersión": {"es": "Triple Inmersión", "t": "Water"}, "Brinco": {"es": "Brinco", "t": "Bug"}, "Telatrampa": {"es": "Telatrampa", "t": "Bug"}, "Asalto Espadón": {"es": "Asalto Espadón", "t": "Dragon"}, "Bramido Dragón": {"es": "Bramido Dragón", "t": "Dragon"}, "Láser Veleidoso": {"es": "Láser Veleidoso", "t": "Dragon"}, "Luz Devastadora": {"es": "Luz Devastadora", "t": "Dragon"}, "Oído Cocina": {"es": "Oído Cocina", "t": "Dragon"}, "Electroderrape": {"es": "Electroderrape", "t": "Electric"}, "Electropalmas": {"es": "Electropalmas", "t": "Electric"}, "Electrorrayo": {"es": "Electrorrayo", "t": "Electric"}, "Plancha Voltaica": {"es": "Plancha Voltaica", "t": "Electric"}, "Relámpago Súbito": {"es": "Relámpago Súbito", "t": "Electric"}, "Homenaje Póstumo": {"es": "Homenaje Póstumo", "t": "Ghost"}, "Puño Furia": {"es": "Puño Furia", "t": "Ghost"}, "Canto Ardiente": {"es": "Canto Ardiente", "t": "Fire"}, "Cañón Armadura": {"es": "Cañón Armadura", "t": "Fire"}, "Cólera Ardiente": {"es": "Cólera Ardiente", "t": "Fire"}, "Espada Lamento": {"es": "Espada Lamento", "t": "Fire"}, "Llama Protectora": {"es": "Llama Protectora", "t": "Fire"}, "Pirochoque": {"es": "Pirochoque", "t": "Fire"}, "Canto Encantador": {"es": "Canto Encantador", "t": "Fairy"}, "Feerichoque": {"es": "Feerichoque", "t": "Fairy"}, "Fría Acogida": {"es": "Fría Acogida", "t": "Ice"}, "Paisaje Nevado": {"es": "Paisaje Nevado", "t": "Ice"}, "Pirueta Helada": {"es": "Pirueta Helada", "t": "Ice"}, "Nitrochoque": {"es": "Nitrochoque", "t": "Fighting"}, "Palma Rauda": {"es": "Palma Rauda", "t": "Fighting"}, "Patada Hacha": {"es": "Patada Hacha", "t": "Fighting"}, "Pugnachoque": {"es": "Pugnachoque", "t": "Fighting"}, "Autotomía": {"es": "Autotomía", "t": "Normal"}, "Decalcomanía": {"es": "Decalcomanía", "t": "Normal"}, "Deslome": {"es": "Deslome", "t": "Normal"}, "Furia Taurina": {"es": "Furia Taurina", "t": "Normal"}, "Hipertaladro": {"es": "Hipertaladro", "t": "Normal"}, "Limpieza General": {"es": "Limpieza General", "t": "Normal"}, "Luna Roja": {"es": "Luna Roja", "t": "Normal"}, "Plegaria Vital": {"es": "Plegaria Vital", "t": "Normal"}, "Proliferación": {"es": "Proliferación", "t": "Normal"}, "Teraclúster": {"es": "Teraclúster", "t": "Normal"}, "Teraexplosión": {"es": "Teraexplosión", "t": "Normal"}, "Abrecaminos": {"es": "Abrecaminos", "t": "Grass"}, "Bomba Caramelo": {"es": "Bomba Caramelo", "t": "Grass"}, "Cañón Batidor": {"es": "Cañón Batidor", "t": "Grass"}, "Extracto Picante": {"es": "Extracto Picante", "t": "Grass"}, "Garrote Liana": {"es": "Garrote Liana", "t": "Grass"}, "Truco Floral": {"es": "Truco Floral", "t": "Grass"}, "Fotocolisión": {"es": "Fotocolisión", "t": "Psychic"}, "Láser Doble": {"es": "Láser Doble", "t": "Psychic"}, "Psicohojas": {"es": "Psicohojas", "t": "Psychic"}, "Psicorruido": {"es": "Psicorruido", "t": "Psychic"}, "Filo Potente": {"es": "Filo Potente", "t": "Rock"}, "Salazón": {"es": "Salazón", "t": "Rock"}, "Calamidad": {"es": "Calamidad", "t": "Dark"}, "Genufendiente": {"es": "Genufendiente", "t": "Dark"}, "Ominochoque": {"es": "Ominochoque", "t": "Dark"}, "Resarcimiento": {"es": "Resarcimiento", "t": "Dark"}, "Cadena Virulenta": {"es": "Cadena Virulenta", "t": "Poison"}, "Giro Mortífero": {"es": "Giro Mortífero", "t": "Poison"}};
const DB_ABILITIES = ["Abalorio Debacle", "Absorbe Agua", "Absorbe Electricidad", "Absorbe Fuego", "Acero", "Acero Templado", "Aclimatación", "Acérrimo", "Adaptable", "Afortunado", "Agallas", "Agrupamiento", "Alas Vendaval", "Alerta", "Allanamiento", "Alma Acerada", "Alma Cura", "Alma Errante", "Amor Filial", "Antibalas", "Antibarrera", "Anticipación", "Antídoto", "Armadura Batalla", "Armadura Frágil", "Armadura Prisma", "Audaz", "Aura Feérica", "Aura Oscura", "Autoestima", "Baba", "Banco", "Batería", "Bromista", "Cabeza Roca", "Cacheo", "Cacofonía", "Cadena Tóxica", "Calco", "Caldero Debacle", "Calyrex", "Cambio Color", "Cambio Heroico", "Cambio Táctico", "Capa Tóxica", "Caparazón", "Cara de Hielo", "Carga Cuark", "Carrillo", "Chorro Arena", "Clorofila", "Cobardía", "Cola Armadura", "Cola Surf", "Colector", "Comandar", "Combustible", "Competitivo", "Compiescolta", "Coraza Ira", "Coraza Reflejo", "Corrosión", "Cortante", "Corte Fuerte", "Coránima", "Cosecha", "Cromolente", "Cuerpo Horneado", "Cuerpo Llama", "Cuerpo Maldito", "Cuerpo Mortal", "Cuerpo Puro", "Cuerpo Vívido", "Cuerpo Áureo", "Cura Lluvia", "Cura Natural", "Cálculo Final", "Cólera", "Defensa Hoja", "Descarga", "Despiste", "Detonación", "Dicha", "Dinamo", "Disemillar", "Disfraz", "Don Floral", "Dondozo", "Efecto Espora", "Electricidad Estática", "Electrogénesis", "Electromotor", "Encadenado", "Energía Eólica", "Energía Pura", "Enjambre", "Ensañamiento", "Entusiasmo", "Escama Especial", "Escama de Hielo", "Esclusa de Aire", "Escudo Limitado", "Escudo Magma", "Escudo Recio", "Espada Debacle", "Espada Indómita", "Espejo Mágico", "Espesura", "Espíritu Vital", "Evocarrecuerdos", "Experto", "Expulsarena", "Fantasma", "Filtro", "Firmeza", "Flaqueza", "Flexibilidad", "Francotirador", "Fuego", "Fuente Energía", "Fuerte Afecto", "Fuerza Cerebral", "Fuerza Mental", "Fuga", "Funda", "Garra Dura", "Gas Reactivo", "General Supremo", "Geofagia", "Glastrier", "Gran Encanto", "Guardia Espectro", "Guardia Metálica", "Gula", "Gélido", "Habilidades", "Hedor", "Herbogénesis", "Herbívoro", "Hidratación", "Hidrorrefuerzo", "Hielo", "Hospitalidad", "Huida", "Humedad", "Humo Blanco", "Hurto", "Hélice Caudal", "Ignorante", "Ignífugo", "Iluminación", "Ilusión", "Impasible", "Impostor", "Impulso", "Imán", "Indefenso", "Inicio Lento", "Inmunidad", "Insomnio", "Insonorizar", "Intimidación", "Intrépido", "Irascible", "Justiciero", "Latido Oricalco", "Letargo Perenne", "Levitación", "Lista de habilidades en todos los idiomas", "Liviano", "Llovizna", "Líbero", "Madrugar", "Maduración", "Mal Sueño", "Mandíbula Dragón", "Mandíbula Fuerte", "Mano Rápida", "Manto Frondoso", "Manto Níveo", "Mar Llamas", "Mar del Albor", "Medicina Extraña", "Megadisparador", "Megasolar", "Menos", "Metal Liviano", "Metal Pesado", "Mimetismo", "Modo Daruma", "Momia", "Monotema", "Motor Hadrónico", "Mudar", "Multiescamas", "Multitipo", "Muro Mágico", "Mutapetito", "Mutatipo", "Más", "Nado Rápido", "Nebulogénesis", "Nerviosismo", "Nevada", "Normalidad", "Néctar Dulce", "Ojo Compuesto", "Ojo Mental", "Olor Persistente", "Oportunista", "Paleosíntesis", "Pararrayos", "Pareja de Baile", "Pecharunt", "Pelaje Recio", "Peluche", "Pelusa", "Pereza", "Perro Guardián", "Piel Celeste", "Piel Dragontina", "Piel Eléctrica", "Piel Feérica", "Piel Helada", "Piel Milagro", "Piel Seca", "Piel Tosca", "Pies Rápidos", "Poder Arena", "Poder Fúngico", "Poder Solar", "Poké Ball", "Polvo Escudo", "Pompa", "Potencia", "Potencia Bruta", "Predicción", "Presión", "Prestidigitador", "Primer auxilio", "Psicogénesis", "Punk Rock", "Punta Acero", "Punto Tóxico", "Puño Férreo", "Puño Invisible", "Quema", "Quitanieves", "Reacción Química", "Receptor", "Recogebolas", "Recogemiel", "Recogida", "Regia Presencia", "Relincho Blanco", "Relincho Negro", "Remoto", "Respondón", "Retirada", "Revés", "Rezagado", "Ritmo Propio", "Rivalidad", "Rizos Rebeldes", "Robustez", "Roca", "Roca Sólida", "Rompeaura", "Rompemoldes", "Rumia", "Ráfaga Delta", "Sacapecho", "Sal Purificadora", "Salpicante", "Sebo", "Sequía", "Simbiosis", "Simple", "Sincronía", "Sistema Alfa", "Sombra Trampa", "Spectrier", "Superguarda", "Surcavientos", "Tablilla Debacle", "Telepatía", "Tenacidad", "Teracambio", "Teracaparazón", "Teraformación 0", "Terapagos", "Termoconversión", "Terravoltaje", "Tierra del Ocaso", "Tinovictoria", "Toque Tóxico", "Torrente", "Tragamisil", "Trampa Arena", "Transistor", "Transportarrocas", "Tumbos", "Turbollama", "Turbotaladro", "Títere Tóxico", "Ultraimpulso", "Unidad Ecuestre", "Unísono", "Veleta", "Velo Agua", "Velo Arena", "Velo Aroma", "Velo Dulce", "Velo Flor", "Velo Pastel", "Veneno", "Ventosas", "Vigilante", "Viscosecreción", "Viscosidad", "Vista Lince", "Voz Fluida", "Zoquete", "Ímpetu Ardiente", "Ímpetu Arena", "Ímpetu Tóxico"];
// Learnsets loaded from pkm_champions_learnsets.json at runtime
let DB_LEARNSETS = {};
fetch('./pkm_champions_learnsets.json').then(r=>r.json()).then(d=>{ DB_LEARNSETS = d.learnsets || {}; }).catch(()=>{});

// ─── STATE ───────────────────────────────────────────────────
let state = {
  user: null,
  teams: [],
  activeTeamId: null,
  activeSlotIdx: null,
  // No more editorTab — only Main (with EVs inline)
};

// ─── POKEMON DATA CACHE ───────────────────────────────────────
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
    types: [], sprite: '', shinySprite: '', abilities: [], legalMoves: [], baseStats: null
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

// WikiDex learnset lookup — matches Spanish or English name
function getLearnsetMoves(name) {
  // Try exact match first
  if (DB_LEARNSETS[name]) return DB_LEARNSETS[name].map(m => m.name);
  // Try case-insensitive
  const key = Object.keys(DB_LEARNSETS).find(k => k.toLowerCase() === name.toLowerCase());
  if (key) return DB_LEARNSETS[key].map(m => m.name);
  // Fallback to full DB move list
  return DB_MOVE_NAMES;
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
      legalMoves: getLearnsetMoves(name),
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

// ─── IMPORT/EXPORT (Showdown format) ─────────────────────────
function exportTeam(team) {
  return team.pokemon.map(p => {
    if (!p.name) return '';
    const display = p.nickname ? `${p.nickname} (${p.name})` : p.name;
    const lines = [display + (p.gender ? ` (${p.gender})` : '') + (p.item ? ` @ ${p.item}` : '')];
    if (p.ability) lines.push(`Ability: ${p.ability}`);
    if (p.level && p.level !== 50) lines.push(`Level: ${p.level}`);
    if (p.shiny) lines.push('Shiny: Yes');
    if (p.teraType) lines.push(`Tera Type: ${p.teraType}`);
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
      else if (line.startsWith('Level:')) p.level = parseInt(line.replace('Level:','').trim()) || 50;
      else if (line.startsWith('Shiny: Yes')) p.shiny = true;
      else if (line.startsWith('Tera Type:')) p.teraType = line.replace('Tera Type:','').trim();
      else if (line.startsWith('EVs:')) line.replace('EVs:','').trim().split('/').forEach(part => { const m = part.trim().match(/(\d+)\s+(\w+)/); if (m && p.evs[m[2]] !== undefined) p.evs[m[2]] = parseInt(m[1]); });
      else if (line.match(/Nature$/)) p.nature = line.replace('Nature','').trim();
      else if (line.startsWith('- ')) { const mi = p.moves.indexOf(''); if (mi !== -1) p.moves[mi] = line.replace('- ','').trim(); }
    });
    return p;
  }).filter(p => p.name);
}

// ─── IMPORT/EXPORT MODALS ─────────────────────────────────────
window.openImportModal = () => {
  document.getElementById('import-modal-textarea').value = '';
  document.getElementById('import-modal').classList.add('open');
};
window.closeImportModal = () => document.getElementById('import-modal').classList.remove('open');

window.openExportModal = () => {
  const team = getActiveTeam();
  if (!team) return;
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
      if (data) { p.types = data.types; p.sprite = data.sprite; p.shinySprite = data.shinySprite; p.abilities = data.abilities; p.legalMoves = data.legalMoves; }
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
let acDropdownEl = null;

function createACDropdown() {
  if (document.getElementById('ac-dropdown')) return;
  const el = document.createElement('div');
  el.id = 'ac-dropdown';
  el.className = 'ac-dropdown';
  document.body.appendChild(el);
  acDropdownEl = el;
}

function positionDropdown(inputEl) {
  const rect = inputEl.getBoundingClientRect();
  const dd = document.getElementById('ac-dropdown');
  if (!dd) return;
  dd.style.left = rect.left + 'px';
  dd.style.top = (rect.bottom + window.scrollY + 2) + 'px';
  dd.style.width = rect.width + 'px';
}

function showDropdown(inputEl, items, onSelect, selectedIdx = 0) {
  createACDropdown();
  const dd = document.getElementById('ac-dropdown');
  if (!items.length) { hideDropdown(); return; }
  dd.innerHTML = items.slice(0,12).map((item, i) => {
    const label = typeof item === 'object' ? item.label : item;
    const sub = typeof item === 'object' && item.sub ? ` <span class="ac-sub">${escHtml(item.sub)}</span>` : '';
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
      const val = typeof item === 'object' ? item.label : item;
      inputEl.value = val;
      onSelect(val, item);
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
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIdx = Math.min(selectedIdx + 1, Math.min(currentItems.length, 12) - 1);
      updateDropdownSelection(selectedIdx);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIdx = Math.max(selectedIdx - 1, 0);
      updateDropdownSelection(selectedIdx);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (selectedIdx >= 0 && currentItems[selectedIdx]) {
        e.preventDefault();
        const item = currentItems[selectedIdx];
        const val = typeof item === 'object' ? item.label : item;
        inputEl.value = val;
        onSelect(val, item);
        hideDropdown();
        selectedIdx = -1;
      }
    } else if (e.key === 'Escape') {
      hideDropdown();
    }
  });

  inputEl.addEventListener('blur', () => setTimeout(hideDropdown, 150));
}

function setupItemAC(inputEl) {
  setupAutocomplete(inputEl,
    async (val) => {
      if (!val) return ITEMS.slice(0, 12);
      const v = val.toLowerCase();
      const exact = ITEMS.filter(i => i.toLowerCase().startsWith(v));
      const fuzzy = ITEMS.filter(i => !i.toLowerCase().startsWith(v) && i.toLowerCase().includes(v));
      return [...exact, ...fuzzy].slice(0, 12);
    },
    (val) => { const p = getActivePokemon(); if (p) p.item = val; }
  );
}

function setupNatureAC(inputEl) {
  setupAutocomplete(inputEl,
    async (val) => {
      const v = val.toLowerCase();
      const all = NATURES.map(n => ({ label: n, sub: NATURE_EFFECTS[n] || 'Neutral' }));
      const exact = all.filter(n => n.label.toLowerCase().startsWith(v));
      const fuzzy = all.filter(n => !n.label.toLowerCase().startsWith(v) && n.label.toLowerCase().includes(v));
      return [...exact, ...fuzzy];
    },
    (val) => { const p = getActivePokemon(); if (p) { p.nature = val; renderEditor(); } }
  );
}

function setupAbilityAC(inputEl, abilities) {
  setupAutocomplete(inputEl,
    async (val) => {
      const v = val.toLowerCase();
      const source = (abilities && abilities.length > 0)
        ? abilities.map(a => ({ label: typeof a === 'object' ? a.name : a, sub: typeof a === 'object' && a.hidden ? 'Oculta' : '' }))
        : DB_ABILITIES.map(a => ({ label: a, sub: '' }));
      const exact = source.filter(i => i.label.toLowerCase().startsWith(v));
      const fuzzy = source.filter(i => !i.label.toLowerCase().startsWith(v) && i.label.toLowerCase().includes(v));
      return [...exact, ...fuzzy].slice(0, 12);
    },
    (val) => { const p = getActivePokemon(); if (p) p.ability = val; }
  );
}

function setupPokemonAC(inputEl) {
  setupAutocomplete(inputEl,
    async (val) => {
      if (!val || val.length < 1) return [];
      const list = await getAllPokemonList();
      const v = val.toLowerCase();
      const exact = list.filter(p => p.toLowerCase().startsWith(v));
      const fuzzy = list.filter(p => !p.toLowerCase().startsWith(v) && p.toLowerCase().includes(v));
      return [...exact, ...fuzzy].slice(0, 12);
    },
    (val) => handlePokemonNameChange(val),
    { debounce: 80 }
  );
}

function setupMoveAC(inputEl, moveIdx, legalMoves) {
  setupAutocomplete(inputEl,
    async (val) => {
      const v = val.toLowerCase();
      const source = (legalMoves && legalMoves.length > 0) ? legalMoves : DB_MOVE_NAMES;
      const exact = source.filter(m => m.toLowerCase().startsWith(v));
      const fuzzy = source.filter(m => !m.toLowerCase().startsWith(v) && m.toLowerCase().includes(v));
      return [...exact, ...fuzzy].slice(0, 12).map(m => {
        const meta = DB_MOVE_META[m];
        return { label: m, sub: meta ? meta.t : '' };
      });
    },
    (val) => { const p = getActivePokemon(); if (p) p.moves[moveIdx] = val; },
    { debounce: 80 }
  );
}

function setupTeraAC(inputEl) {
  setupAutocomplete(inputEl,
    async (val) => {
      const v = val.toLowerCase();
      return TYPES.filter(t => t.toLowerCase().startsWith(v) || t.toLowerCase().includes(v));
    },
    (val) => { const p = getActivePokemon(); if (p) p.teraType = val; }
  );
}


// ─── STAT CALCULATION (Champions formula) ────────────────────
function calcStat(base, ev, isHP, natMod) {
  const iv = 31;
  if (isHP) return Math.floor(((2 * base + iv) * 50) / 100) + 60 + (ev || 0);
  const s = Math.floor(((2 * base + iv) * 50) / 100) + 5 + (ev || 0);
  if (natMod === '+') return Math.floor(s * 1.1);
  if (natMod === '-') return Math.floor(s * 0.9);
  return s;
}

function getNatureMods(natureName) {
  const effect = NATURE_EFFECTS[natureName] || '';
  const mods = { HP: null, Atk: null, Def: null, SpA: null, SpD: null, Spe: null };
  const plus = effect.match(/\+(\w+)/);
  const minus = effect.match(/-(\w+)/);
  if (plus) mods[plus[1]] = '+';
  if (minus) mods[minus[1]] = '-';
  return mods;
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
    return `<div class="team-item ${isActive ? 'active' : ''}" data-id="${team.id}" onclick="handleTeamSelect('${team.id}')">
      <div class="team-item-icon">⚔️</div>
      <div class="team-item-info">
        <div class="team-item-name">${escHtml(team.name)}</div>
        <div class="team-item-meta">${FORMAT_SHORT} · ${count}/6</div>
      </div>
      <div class="team-item-actions">
        <button class="btn btn-icon btn-danger" onclick="handleDeleteTeam('${team.id}',event)" title="Eliminar">🗑</button>
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
  const slots = Array.from({length: 6}, (_, i) => {
    const p = team.pokemon[i];
    return p && p.name ? renderFilledSlot(p, i) : `
      <div class="pokemon-slot empty" onclick="handleAddPokemon(${i})">
        <div class="empty-icon">➕</div><span>Agregar Pokémon</span>
      </div>`;
  });

  // Editor goes ABOVE grid
  content.innerHTML = `
    <div class="team-header">
      <div class="team-name-row">
        <input class="team-name-input" value="${escHtml(team.name)}" placeholder="Nombre del equipo"
          onchange="handleTeamNameChange(this.value)">
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
  const evPips = STATS.map(s => {
    const pct = (p.evs[s]||0)/EV_STAT_MAX;
    return `<div class="ev-pip" style="opacity:${0.15+pct*0.85};background:${pct>=1?'var(--gold)':'var(--red)'}"></div>`;
  }).join('');
  return `<div class="pokemon-slot${isActive?' active':''}" onclick="handleSlotClick(${idx})">
    <div class="slot-type-bar" style="${typeBar}"></div>
    <div class="slot-header">
      <div class="slot-sprite-wrap">
        ${p.sprite ? `<img class="slot-sprite" src="${p.shiny ? (p.shinySprite||p.sprite) : p.sprite}" alt="${p.name}" loading="lazy">`
          : '<div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center;font-size:24px">🔴</div>'}
      </div>
      <div class="slot-info">
        <div class="slot-name">${p.nickname||p.name}${p.shiny?' <span class="shiny-star">✦</span>':''}</div>
        <div class="slot-types">
          ${p.types.map(t=>`<span class="type-chip" style="background:${TYPE_COLORS[t]||'#888'}">${t}</span>`).join('')}
          ${p.teraType?`<span class="tera-badge">◈ ${p.teraType}</span>`:''}
        </div>
        ${p.item?`<div class="slot-item">⚙ ${escHtml(p.item)}</div>`:''}
      </div>
      <button class="btn btn-icon btn-danger" style="position:absolute;top:6px;right:6px"
        onclick="handleRemovePokemon(${idx},event)">✕</button>
    </div>
    <div class="slot-moves">
      ${p.moves.map(m=>`<div class="move-chip">${m||'—'}</div>`).join('')}
    </div>
    <div class="slot-footer">
      <div class="ev-mini">${evPips}</div>
      <span class="nature-tag">${p.nature} · ${Object.values(p.evs).reduce((a,b)=>a+b,0)}pts</span>
    </div>
  </div>`;
}

function renderEditor() {
  const container = document.getElementById('editor-container');
  if (!container) return;
  const p = getActivePokemon();
  if (!p) { container.innerHTML = ''; return; }

  const total = Object.values(p.evs).reduce((a,b)=>a+b,0);

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
              ? `<img class="editor-sprite" src="${p.shiny&&p.shinySprite ? p.shinySprite : p.sprite}" alt="${p.name}">`
              : `<div class="sprite-placeholder">🔴</div>`}
            <label style="display:flex;align-items:center;gap:6px;margin-top:8px;cursor:pointer;font-size:12px;color:var(--text-muted);justify-content:center">
              <input type="checkbox" ${p.shiny?'checked':''} onchange="handleShinyToggle(this.checked)"> <span class="shiny-star">✦</span> Shiny
            </label>
          </div>
          <div class="editor-fields">
            <div class="field-group" style="grid-column:span 2">
              <label class="field-label">Pokémon</label>
              <input id="ac-pokemon-name" class="field-input" value="${escHtml(p.name)}" placeholder="ej. Garchomp" autocomplete="off">
            </div>
            <div class="field-group">
              <label class="field-label">Apodo</label>
              <input class="field-input" value="${escHtml(p.nickname)}" placeholder="Opcional"
                oninput="updatePokemonFieldSilent('nickname',this.value)">
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
              <input id="ac-ability" class="field-input" value="${escHtml(p.ability)}" placeholder="${p.abilities.length ? 'Seleccionar' : 'Elige un Pokémon primero'}" autocomplete="off" ${!p.abilities.length ? 'readonly' : ''}>
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
            ${p.moves.map((m,i) => `
              <div class="move-input-wrap">
                <span class="move-num">${i+1}</span>
                <input id="ac-move-${i}" class="move-input" value="${escHtml(m)}" placeholder="Movimiento ${i+1}" autocomplete="off">
              </div>`).join('')}
          </div>
        </div>

        <div class="evs-section">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
            <div class="section-label">Puntos de esfuerzo</div>
            <span class="ev-total ${total>EV_TOTAL_MAX?'over':'ok'}">${total}/${EV_TOTAL_MAX} <span style="font-size:10px;color:var(--text-muted)">(${Math.max(0,EV_TOTAL_MAX-total)} rest.)</span></span>
          </div>
          ${STATS.map(s=>{
            const nm = getNatureMods(p.nature);
            const natMod = nm[s];
            const natClass = natMod==='+'?'stat-plus':natMod==='-'?'stat-minus':'';
            const statVal = p.baseStats ? calcStat(p.baseStats[s], p.evs[s], s==='HP', natMod) : '—';
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
  if (abilityEl) setupAbilityAC(abilityEl, p.abilities);
  if (natureEl) setupNatureAC(natureEl);

  p.moves.forEach((_, i) => {
    const moveEl = document.getElementById(`ac-move-${i}`);
    if (moveEl) setupMoveAC(moveEl, i, p.legalMoves);
  });
}

// ─── EVENT HANDLERS ───────────────────────────────────────────
window.handleTeamSelect = (id) => { state.activeTeamId = id; state.activeSlotIdx = null; renderAll(); };
window.handleDeleteTeam = (id, e) => { e?.stopPropagation(); if (confirm('¿Eliminar este equipo?')) deleteTeam(id); };
window.handleSlotClick = (idx) => {
  state.activeSlotIdx = state.activeSlotIdx === idx ? null : idx;
  // Targeted re-render: update slot active states + editor only
  renderContent();
};
window.handleAddPokemon = (idx) => {
  const team = getActiveTeam(); if (!team) return;
  while (team.pokemon.length <= idx) team.pokemon.push(makePokemon());
  if (!team.pokemon[idx] || !team.pokemon[idx].moves) team.pokemon[idx] = makePokemon();
  state.activeSlotIdx = idx; renderContent();
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

// Silent update — doesn't trigger full re-render (for text inputs being typed)
window.updatePokemonFieldSilent = (field, value) => {
  const p = getActivePokemon(); if (!p) return;
  p[field] = value;
};

// Full update — triggers re-render of slot grid
window.updatePokemonField = (field, value) => {
  const p = getActivePokemon(); if (!p) return;
  p[field] = value;
  // Only re-render the grid slots, not the full content (avoids losing focus on editor)
  const grid = document.getElementById('pokemon-grid');
  if (grid && state.activeSlotIdx !== null) {
    const team = getActiveTeam();
    const slots = Array.from({length: 6}, (_, i) => {
      const sp = team.pokemon[i];
      return sp && sp.name ? renderFilledSlot(sp, i) : `
        <div class="pokemon-slot empty" onclick="handleAddPokemon(${i})">
          <div class="empty-icon">➕</div><span>Agregar Pokémon</span>
        </div>`;
    });
    grid.innerHTML = slots.join('');
  }
};

window.updateMove = (idx, value) => {
  const p = getActivePokemon(); if (!p) return;
  p.moves[idx] = value;
};

window.updateEV = (stat, value) => {
  const p = getActivePokemon(); if (!p) return;
  const newVal = Math.max(0, Math.min(EV_STAT_MAX, parseInt(value)||0));
  const otherTotal = Object.entries(p.evs).filter(([k])=>k!==stat).reduce((a,[,v])=>a+v,0);
  p.evs[stat] = Math.min(newVal, EV_TOTAL_MAX - otherTotal);
  const total = Object.values(p.evs).reduce((a,b)=>a+b,0);
  // Update total display
  const totalEl = document.querySelector('.ev-total');
  if (totalEl) {
    totalEl.innerHTML = `${total}/${EV_TOTAL_MAX} <span style="font-size:10px;color:var(--text-muted)">(${Math.max(0,EV_TOTAL_MAX-total)} rest.)</span>`;
    totalEl.className = `ev-total ${total>EV_TOTAL_MAX?'over':'ok'}`;
  }
  // Update track fill
  const fill = document.querySelector(`[data-ev-stat="${stat}"] .ev-fill`);
  if (fill) {
    fill.style.width = `${(p.evs[stat]/EV_STAT_MAX)*100}%`;
    fill.className = `ev-fill${p.evs[stat]>=EV_STAT_MAX?' maxed':''}`;
  }
  // Update input if capped
  const inp = document.querySelector(`[data-ev-stat="${stat}"] ~ .ev-input`);
  // Update stat final value
  const nm = getNatureMods(p.nature);
  if (p.baseStats) {
    document.querySelectorAll('.ev-row').forEach(row => {
      const track = row.querySelector('[data-ev-stat]');
      if (track && track.dataset.evStat === stat) {
        const sf = row.querySelector('.stat-final');
        if (sf) sf.textContent = calcStat(p.baseStats[stat], p.evs[stat], stat==='HP', nm[stat]);
        const input = row.querySelector('.ev-input');
        if (input && parseInt(input.value) !== p.evs[stat]) input.value = p.evs[stat];
      }
    });
  }
};

window.handleEvTrackClick = (e, stat) => {
  const r = e.currentTarget.getBoundingClientRect();
  updateEV(stat, Math.round((e.clientX-r.left)/r.width*EV_STAT_MAX));
};

window.spreadEVs = () => { const p = getActivePokemon(); if (!p) return; STATS.forEach(s => p.evs[s]=0); p.evs.Atk=32; p.evs.Spe=32; p.evs.HP=2; renderEditor(); };
window.spreadEVsSpecial = () => { const p = getActivePokemon(); if (!p) return; STATS.forEach(s => p.evs[s]=0); p.evs.SpA=32; p.evs.Spe=32; p.evs.HP=2; renderEditor(); };
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
    else { errEl.textContent = '¡Revisá tu email para confirmar tu cuenta!'; errEl.style.color = 'var(--green)'; errEl.classList.add('visible'); }
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

window.handleShinyToggle = (val) => {
  const p = getActivePokemon(); if (!p) return;
  p.shiny = val;
  // Update just the sprite without full re-render
  const sprite = document.querySelector('.editor-sprite');
  if (sprite && p.sprite) sprite.src = val && p.shinySprite ? p.shinySprite : p.sprite;
  const gridSprite = document.querySelector(`.pokemon-slot.active .slot-sprite`);
  if (gridSprite && p.sprite) gridSprite.src = val && p.shinySprite ? p.shinySprite : p.sprite;
};

function escHtml(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── INIT ─────────────────────────────────────────────────────
async function init() {
  createACDropdown();
  getAllPokemonList();
  // Learnsets already loading via top-level fetch

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
