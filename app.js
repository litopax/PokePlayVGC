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

// Showdown move key -> display name (generated from Showdown moves.ts)
const MOVE_NAMES = {"absorb":"Absorb","accelerock":"Accelerock","acid":"Acid","acidarmor":"Acid Armor","aciddownpour":"Acid Downpour","acidspray":"Acid Spray","acrobatics":"Acrobatics","acupressure":"Acupressure","aerialace":"Aerial Ace","aeroblast":"Aeroblast","afteryou":"After You","agility":"Agility","aircutter":"Air Cutter","airslash":"Air Slash","alloutpummeling":"All-Out Pummeling","alluringvoice":"Alluring Voice","allyswitch":"Ally Switch","amnesia":"Amnesia","anchorshot":"Anchor Shot","ancientpower":"Ancient Power","appleacid":"Apple Acid","aquacutter":"Aqua Cutter","aquajet":"Aqua Jet","aquaring":"Aqua Ring","aquastep":"Aqua Step","aquatail":"Aqua Tail","armorcannon":"Armor Cannon","armthrust":"Arm Thrust","aromatherapy":"Aromatherapy","aromaticmist":"Aromatic Mist","assist":"Assist","assurance":"Assurance","astonish":"Astonish","astralbarrage":"Astral Barrage","attackorder":"Attack Order","attract":"Attract","aurasphere":"Aura Sphere","aurawheel":"Aura Wheel","aurorabeam":"Aurora Beam","auroraveil":"Aurora Veil","autotomize":"Autotomize","avalanche":"Avalanche","axekick":"Axe Kick","babydolleyes":"Baby-Doll Eyes","baddybad":"Baddy Bad","banefulbunker":"Baneful Bunker","barbbarrage":"Barb Barrage","barrage":"Barrage","barrier":"Barrier","batonpass":"Baton Pass","beakblast":"Beak Blast","beatup":"Beat Up","behemothbash":"Behemoth Bash","behemothblade":"Behemoth Blade","belch":"Belch","bellydrum":"Belly Drum","bestow":"Bestow","bide":"Bide","bind":"Bind","bite":"Bite","bitterblade":"Bitter Blade","bittermalice":"Bitter Malice","blackholeeclipse":"Black Hole Eclipse","blastburn":"Blast Burn","blazekick":"Blaze Kick","blazingtorque":"Blazing Torque","bleakwindstorm":"Bleakwind Storm","blizzard":"Blizzard","block":"Block","bloodmoon":"Blood Moon","bloomdoom":"Bloom Doom","blueflare":"Blue Flare","bodypress":"Body Press","bodyslam":"Body Slam","boltbeak":"Bolt Beak","boltstrike":"Bolt Strike","boneclub":"Bone Club","bonemerang":"Bonemerang","bonerush":"Bone Rush","boomburst":"Boomburst","bounce":"Bounce","bouncybubble":"Bouncy Bubble","branchpoke":"Branch Poke","bravebird":"Brave Bird","breakingswipe":"Breaking Swipe","breakneckblitz":"Breakneck Blitz","brickbreak":"Brick Break","brine":"Brine","brutalswing":"Brutal Swing","bubble":"Bubble","bubblebeam":"Bubble Beam","bugbite":"Bug Bite","bugbuzz":"Bug Buzz","bulkup":"Bulk Up","bulldoze":"Bulldoze","bulletpunch":"Bullet Punch","bulletseed":"Bullet Seed","burningbulwark":"Burning Bulwark","burningjealousy":"Burning Jealousy","burnup":"Burn Up","buzzybuzz":"Buzzy Buzz","calmmind":"Calm Mind","camouflage":"Camouflage","captivate":"Captivate","catastropika":"Catastropika","ceaselessedge":"Ceaseless Edge","celebrate":"Celebrate","charge":"Charge","chargebeam":"Charge Beam","charm":"Charm","chatter":"Chatter","chillingwater":"Chilling Water","chillyreception":"Chilly Reception","chipaway":"Chip Away","chloroblast":"Chloroblast","circlethrow":"Circle Throw","clamp":"Clamp","clangingscales":"Clanging Scales","clangoroussoul":"Clangorous Soul","clangoroussoulblaze":"Clangorous Soulblaze","clearsmog":"Clear Smog","closecombat":"Close Combat","coaching":"Coaching","coil":"Coil","collisioncourse":"Collision Course","combattorque":"Combat Torque","cometpunch":"Comet Punch","comeuppance":"Comeuppance","confide":"Confide","confuseray":"Confuse Ray","confusion":"Confusion","constrict":"Constrict","continentalcrush":"Continental Crush","conversion":"Conversion","conversion2":"Conversion 2","copycat":"Copycat","coreenforcer":"Core Enforcer","corkscrewcrash":"Corkscrew Crash","corrosivegas":"Corrosive Gas","cosmicpower":"Cosmic Power","cottonguard":"Cotton Guard","cottonspore":"Cotton Spore","counter":"Counter","courtchange":"Court Change","covet":"Covet","crabhammer":"Crabhammer","craftyshield":"Crafty Shield","crosschop":"Cross Chop","crosspoison":"Cross Poison","crunch":"Crunch","crushclaw":"Crush Claw","crushgrip":"Crush Grip","curse":"Curse","cut":"Cut","darkestlariat":"Darkest Lariat","darkpulse":"Dark Pulse","darkvoid":"Dark Void","dazzlinggleam":"Dazzling Gleam","decorate":"Decorate","defendorder":"Defend Order","defensecurl":"Defense Curl","defog":"Defog","destinybond":"Destiny Bond","detect":"Detect","devastatingdrake":"Devastating Drake","diamondstorm":"Diamond Storm","dig":"Dig","direclaw":"Dire Claw","disable":"Disable","disarmingvoice":"Disarming Voice","discharge":"Discharge","dive":"Dive","dizzypunch":"Dizzy Punch","doodle":"Doodle","doomdesire":"Doom Desire","doubleedge":"Double-Edge","doublehit":"Double Hit","doubleironbash":"Double Iron Bash","doublekick":"Double Kick","doubleshock":"Double Shock","doubleslap":"Double Slap","doubleteam":"Double Team","dracometeor":"Draco Meteor","dragonascent":"Dragon Ascent","dragonbreath":"Dragon Breath","dragoncheer":"Dragon Cheer","dragonclaw":"Dragon Claw","dragondance":"Dragon Dance","dragondarts":"Dragon Darts","dragonenergy":"Dragon Energy","dragonhammer":"Dragon Hammer","dragonpulse":"Dragon Pulse","dragonrage":"Dragon Rage","dragonrush":"Dragon Rush","dragontail":"Dragon Tail","drainingkiss":"Draining Kiss","drainpunch":"Drain Punch","dreameater":"Dream Eater","drillpeck":"Drill Peck","drillrun":"Drill Run","drumbeating":"Drum Beating","dualchop":"Dual Chop","dualwingbeat":"Dual Wingbeat","dynamaxcannon":"Dynamax Cannon","dynamicpunch":"Dynamic Punch","earthpower":"Earth Power","earthquake":"Earthquake","echoedvoice":"Echoed Voice","eerieimpulse":"Eerie Impulse","eeriespell":"Eerie Spell","eggbomb":"Egg Bomb","electricterrain":"Electric Terrain","electrify":"Electrify","electroball":"Electro Ball","electrodrift":"Electro Drift","electroshot":"Electro Shot","electroweb":"Electroweb","embargo":"Embargo","ember":"Ember","encore":"Encore","endeavor":"Endeavor","endure":"Endure","energyball":"Energy Ball","entrainment":"Entrainment","eruption":"Eruption","esperwing":"Esper Wing","eternabeam":"Eternabeam","expandingforce":"Expanding Force","explosion":"Explosion","extrasensory":"Extrasensory","extremeevoboost":"Extreme Evoboost","extremespeed":"Extreme Speed","facade":"Facade","fairylock":"Fairy Lock","fairywind":"Fairy Wind","fakeout":"Fake Out","faketears":"Fake Tears","falsesurrender":"False Surrender","falseswipe":"False Swipe","featherdance":"Feather Dance","feint":"Feint","feintattack":"Feint Attack","fellstinger":"Fell Stinger","ficklebeam":"Fickle Beam","fierydance":"Fiery Dance","fierywrath":"Fiery Wrath","filletaway":"Fillet Away","finalgambit":"Final Gambit","fireblast":"Fire Blast","firefang":"Fire Fang","firelash":"Fire Lash","firepledge":"Fire Pledge","firepunch":"Fire Punch","firespin":"Fire Spin","firstimpression":"First Impression","fishiousrend":"Fishious Rend","fissure":"Fissure","flail":"Flail","flameburst":"Flame Burst","flamecharge":"Flame Charge","flamethrower":"Flamethrower","flamewheel":"Flame Wheel","flareblitz":"Flare Blitz","flash":"Flash","flashcannon":"Flash Cannon","flatter":"Flatter","fleurcannon":"Fleur Cannon","fling":"Fling","flipturn":"Flip Turn","floatyfall":"Floaty Fall","floralhealing":"Floral Healing","flowershield":"Flower Shield","flowertrick":"Flower Trick","fly":"Fly","flyingpress":"Flying Press","focusblast":"Focus Blast","focusenergy":"Focus Energy","focuspunch":"Focus Punch","followme":"Follow Me","forcepalm":"Force Palm","foresight":"Foresight","forestscurse":"Forest's Curse","foulplay":"Foul Play","freezedry":"Freeze-Dry","freezeshock":"Freeze Shock","freezingglare":"Freezing Glare","freezyfrost":"Freezy Frost","frenzyplant":"Frenzy Plant","frostbreath":"Frost Breath","frustration":"Frustration","furyattack":"Fury Attack","furycutter":"Fury Cutter","furyswipes":"Fury Swipes","fusionbolt":"Fusion Bolt","fusionflare":"Fusion Flare","futuresight":"Future Sight","gastroacid":"Gastro Acid","geargrind":"Gear Grind","gearup":"Gear Up","genesissupernova":"Genesis Supernova","geomancy":"Geomancy","gigadrain":"Giga Drain","gigaimpact":"Giga Impact","gigatonhammer":"Gigaton Hammer","gigavolthavoc":"Gigavolt Havoc","glaciallance":"Glacial Lance","glaciate":"Glaciate","glaiverush":"Glaive Rush","glare":"Glare","glitzyglow":"Glitzy Glow","gmaxbefuddle":"G-Max Befuddle","gmaxcannonade":"G-Max Cannonade","gmaxcentiferno":"G-Max Centiferno","gmaxchistrike":"G-Max Chi Strike","gmaxcuddle":"G-Max Cuddle","gmaxdepletion":"G-Max Depletion","gmaxdrumsolo":"G-Max Drum Solo","gmaxfinale":"G-Max Finale","gmaxfireball":"G-Max Fireball","gmaxfoamburst":"G-Max Foam Burst","gmaxgoldrush":"G-Max Gold Rush","gmaxgravitas":"G-Max Gravitas","gmaxhydrosnipe":"G-Max Hydrosnipe","gmaxmalodor":"G-Max Malodor","gmaxmeltdown":"G-Max Meltdown","gmaxoneblow":"G-Max One Blow","gmaxrapidflow":"G-Max Rapid Flow","gmaxreplenish":"G-Max Replenish","gmaxresonance":"G-Max Resonance","gmaxsandblast":"G-Max Sandblast","gmaxsmite":"G-Max Smite","gmaxsnooze":"G-Max Snooze","gmaxsteelsurge":"G-Max Steelsurge","gmaxstonesurge":"G-Max Stonesurge","gmaxstunshock":"G-Max Stun Shock","gmaxsweetness":"G-Max Sweetness","gmaxtartness":"G-Max Tartness","gmaxterror":"G-Max Terror","gmaxvinelash":"G-Max Vine Lash","gmaxvolcalith":"G-Max Volcalith","gmaxvoltcrash":"G-Max Volt Crash","gmaxwildfire":"G-Max Wildfire","gmaxwindrage":"G-Max Wind Rage","grassknot":"Grass Knot","grasspledge":"Grass Pledge","grasswhistle":"Grass Whistle","grassyglide":"Grassy Glide","grassyterrain":"Grassy Terrain","gravapple":"Grav Apple","gravity":"Gravity","growl":"Growl","growth":"Growth","grudge":"Grudge","guardianofalola":"Guardian of Alola","guardsplit":"Guard Split","guardswap":"Guard Swap","guillotine":"Guillotine","gunkshot":"Gunk Shot","gust":"Gust","gyroball":"Gyro Ball","hail":"Hail","hammerarm":"Hammer Arm","happyhour":"Happy Hour","harden":"Harden","hardpress":"Hard Press","haze":"Haze","headbutt":"Headbutt","headcharge":"Head Charge","headlongrush":"Headlong Rush","headsmash":"Head Smash","healbell":"Heal Bell","healblock":"Heal Block","healingwish":"Healing Wish","healorder":"Heal Order","healpulse":"Heal Pulse","heartstamp":"Heart Stamp","heartswap":"Heart Swap","heatcrash":"Heat Crash","heatwave":"Heat Wave","heavyslam":"Heavy Slam","helpinghand":"Helping Hand","hex":"Hex","hiddenpower":"Hidden Power","hiddenpowerbug":"Hidden Power Bug","hiddenpowerdark":"Hidden Power Dark","hiddenpowerdragon":"Hidden Power Dragon","hiddenpowerelectric":"Hidden Power Electric","hiddenpowerfighting":"Hidden Power Fighting","hiddenpowerfire":"Hidden Power Fire","hiddenpowerflying":"Hidden Power Flying","hiddenpowerghost":"Hidden Power Ghost","hiddenpowergrass":"Hidden Power Grass","hiddenpowerground":"Hidden Power Ground","hiddenpowerice":"Hidden Power Ice","hiddenpowerpoison":"Hidden Power Poison","hiddenpowerpsychic":"Hidden Power Psychic","hiddenpowerrock":"Hidden Power Rock","hiddenpowersteel":"Hidden Power Steel","hiddenpowerwater":"Hidden Power Water","highhorsepower":"High Horsepower","highjumpkick":"High Jump Kick","holdback":"Hold Back","holdhands":"Hold Hands","honeclaws":"Hone Claws","hornattack":"Horn Attack","horndrill":"Horn Drill","hornleech":"Horn Leech","howl":"Howl","hurricane":"Hurricane","hydrocannon":"Hydro Cannon","hydropump":"Hydro Pump","hydrosteam":"Hydro Steam","hydrovortex":"Hydro Vortex","hyperbeam":"Hyper Beam","hyperdrill":"Hyper Drill","hyperfang":"Hyper Fang","hyperspacefury":"Hyperspace Fury","hyperspacehole":"Hyperspace Hole","hypervoice":"Hyper Voice","hypnosis":"Hypnosis","iceball":"Ice Ball","icebeam":"Ice Beam","iceburn":"Ice Burn","icefang":"Ice Fang","icehammer":"Ice Hammer","icepunch":"Ice Punch","iceshard":"Ice Shard","icespinner":"Ice Spinner","iciclecrash":"Icicle Crash","iciclespear":"Icicle Spear","icywind":"Icy Wind","imprison":"Imprison","incinerate":"Incinerate","infernalparade":"Infernal Parade","inferno":"Inferno","infernooverdrive":"Inferno Overdrive","infestation":"Infestation","ingrain":"Ingrain","instruct":"Instruct","iondeluge":"Ion Deluge","irondefense":"Iron Defense","ironhead":"Iron Head","irontail":"Iron Tail","ivycudgel":"Ivy Cudgel","jawlock":"Jaw Lock","jetpunch":"Jet Punch","judgment":"Judgment","jumpkick":"Jump Kick","junglehealing":"Jungle Healing","karatechop":"Karate Chop","kinesis":"Kinesis","kingsshield":"King's Shield","knockoff":"Knock Off","kowtowcleave":"Kowtow Cleave","landswrath":"Land's Wrath","laserfocus":"Laser Focus","lashout":"Lash Out","lastresort":"Last Resort","lastrespects":"Last Respects","lavaplume":"Lava Plume","leafage":"Leafage","leafblade":"Leaf Blade","leafstorm":"Leaf Storm","leaftornado":"Leaf Tornado","leechlife":"Leech Life","leechseed":"Leech Seed","leer":"Leer","letssnuggleforever":"Let's Snuggle Forever","lick":"Lick","lifedew":"Life Dew","lightofruin":"Light of Ruin","lightscreen":"Light Screen","lightthatburnsthesky":"Light That Burns the Sky","liquidation":"Liquidation","lockon":"Lock-On","lovelykiss":"Lovely Kiss","lowkick":"Low Kick","lowsweep":"Low Sweep","luckychant":"Lucky Chant","luminacrash":"Lumina Crash","lunarblessing":"Lunar Blessing","lunardance":"Lunar Dance","lunge":"Lunge","lusterpurge":"Luster Purge","machpunch":"Mach Punch","magicalleaf":"Magical Leaf","magicaltorque":"Magical Torque","magiccoat":"Magic Coat","magicpowder":"Magic Powder","magicroom":"Magic Room","magmastorm":"Magma Storm","magnetbomb":"Magnet Bomb","magneticflux":"Magnetic Flux","magnetrise":"Magnet Rise","magnitude":"Magnitude","makeitrain":"Make It Rain","maliciousmoonsault":"Malicious Moonsault","malignantchain":"Malignant Chain","matblock":"Mat Block","matchagotcha":"Matcha Gotcha","maxairstream":"Max Airstream","maxdarkness":"Max Darkness","maxflare":"Max Flare","maxflutterby":"Max Flutterby","maxgeyser":"Max Geyser","maxguard":"Max Guard","maxhailstorm":"Max Hailstorm","maxknuckle":"Max Knuckle","maxlightning":"Max Lightning","maxmindstorm":"Max Mindstorm","maxooze":"Max Ooze","maxovergrowth":"Max Overgrowth","maxphantasm":"Max Phantasm","maxquake":"Max Quake","maxrockfall":"Max Rockfall","maxstarfall":"Max Starfall","maxsteelspike":"Max Steelspike","maxstrike":"Max Strike","maxwyrmwind":"Max Wyrmwind","meanlook":"Mean Look","meditate":"Meditate","mefirst":"Me First","megadrain":"Mega Drain","megahorn":"Megahorn","megakick":"Mega Kick","megapunch":"Mega Punch","memento":"Memento","menacingmoonrazemaelstrom":"Menacing Moonraze Maelstrom","metalburst":"Metal Burst","metalclaw":"Metal Claw","metalsound":"Metal Sound","meteorassault":"Meteor Assault","meteorbeam":"Meteor Beam","meteormash":"Meteor Mash","metronome":"Metronome","mightycleave":"Mighty Cleave","milkdrink":"Milk Drink","mimic":"Mimic","mindblown":"Mind Blown","mindreader":"Mind Reader","minimize":"Minimize","miracleeye":"Miracle Eye","mirrorcoat":"Mirror Coat","mirrormove":"Mirror Move","mirrorshot":"Mirror Shot","mist":"Mist","mistball":"Mist Ball","mistyexplosion":"Misty Explosion","mistyterrain":"Misty Terrain","moonblast":"Moonblast","moongeistbeam":"Moongeist Beam","moonlight":"Moonlight","morningsun":"Morning Sun","mortalspin":"Mortal Spin","mountaingale":"Mountain Gale","mudbomb":"Mud Bomb","muddywater":"Muddy Water","mudshot":"Mud Shot","mudslap":"Mud-Slap","mudsport":"Mud Sport","multiattack":"Multi-Attack","mysticalfire":"Mystical Fire","mysticalpower":"Mystical Power","nastyplot":"Nasty Plot","naturalgift":"Natural Gift","naturepower":"Nature Power","naturesmadness":"Nature's Madness","needlearm":"Needle Arm","neverendingnightmare":"Never-Ending Nightmare","nightdaze":"Night Daze","nightmare":"Nightmare","nightshade":"Night Shade","nightslash":"Night Slash","nihillight":"Nihil Light","nobleroar":"Noble Roar","noretreat":"No Retreat","noxioustorque":"Noxious Torque","nuzzle":"Nuzzle","oblivionwing":"Oblivion Wing","obstruct":"Obstruct","oceanicoperetta":"Oceanic Operetta","octazooka":"Octazooka","octolock":"Octolock","odorsleuth":"Odor Sleuth","ominouswind":"Ominous Wind","orderup":"Order Up","originpulse":"Origin Pulse","outrage":"Outrage","overdrive":"Overdrive","overheat":"Overheat","painsplit":"Pain Split","paraboliccharge":"Parabolic Charge","partingshot":"Parting Shot","payback":"Payback","payday":"Pay Day","peck":"Peck","perishsong":"Perish Song","petalblizzard":"Petal Blizzard","petaldance":"Petal Dance","phantomforce":"Phantom Force","photongeyser":"Photon Geyser","pikapapow":"Pika Papow","pinmissile":"Pin Missile","plasmafists":"Plasma Fists","playnice":"Play Nice","playrough":"Play Rough","pluck":"Pluck","poisonfang":"Poison Fang","poisongas":"Poison Gas","poisonjab":"Poison Jab","poisonpowder":"Poison Powder","poisonsting":"Poison Sting","poisontail":"Poison Tail","pollenpuff":"Pollen Puff","poltergeist":"Poltergeist","populationbomb":"Population Bomb","pounce":"Pounce","pound":"Pound","powder":"Powder","powdersnow":"Powder Snow","powergem":"Power Gem","powershift":"Power Shift","powersplit":"Power Split","powerswap":"Power Swap","powertrick":"Power Trick","powertrip":"Power Trip","poweruppunch":"Power-Up Punch","powerwhip":"Power Whip","precipiceblades":"Precipice Blades","present":"Present","prismaticlaser":"Prismatic Laser","protect":"Protect","psybeam":"Psybeam","psyblade":"Psyblade","psychic":"Psychic","psychicfangs":"Psychic Fangs","psychicnoise":"Psychic Noise","psychicterrain":"Psychic Terrain","psychoboost":"Psycho Boost","psychocut":"Psycho Cut","psychoshift":"Psycho Shift","psychup":"Psych Up","psyshieldbash":"Psyshield Bash","psyshock":"Psyshock","psystrike":"Psystrike","psywave":"Psywave","pulverizingpancake":"Pulverizing Pancake","punishment":"Punishment","purify":"Purify","pursuit":"Pursuit","pyroball":"Pyro Ball","quash":"Quash","quickattack":"Quick Attack","quickguard":"Quick Guard","quiverdance":"Quiver Dance","rage":"Rage","ragefist":"Rage Fist","ragepowder":"Rage Powder","ragingbull":"Raging Bull","ragingfury":"Raging Fury","raindance":"Rain Dance","rapidspin":"Rapid Spin","razorleaf":"Razor Leaf","razorshell":"Razor Shell","razorwind":"Razor Wind","recover":"Recover","recycle":"Recycle","reflect":"Reflect","reflecttype":"Reflect Type","refresh":"Refresh","relicsong":"Relic Song","rest":"Rest","retaliate":"Retaliate","return":"Return","revelationdance":"Revelation Dance","revenge":"Revenge","reversal":"Reversal","revivalblessing":"Revival Blessing","risingvoltage":"Rising Voltage","roar":"Roar","roaroftime":"Roar of Time","rockblast":"Rock Blast","rockclimb":"Rock Climb","rockpolish":"Rock Polish","rockslide":"Rock Slide","rocksmash":"Rock Smash","rockthrow":"Rock Throw","rocktomb":"Rock Tomb","rockwrecker":"Rock Wrecker","roleplay":"Role Play","rollingkick":"Rolling Kick","rollout":"Rollout","roost":"Roost","rototiller":"Rototiller","round":"Round","ruination":"Ruination","sacredfire":"Sacred Fire","sacredsword":"Sacred Sword","safeguard":"Safeguard","saltcure":"Salt Cure","sandattack":"Sand Attack","sandsearstorm":"Sandsear Storm","sandstorm":"Sandstorm","sandtomb":"Sand Tomb","sappyseed":"Sappy Seed","savagespinout":"Savage Spin-Out","scald":"Scald","scaleshot":"Scale Shot","scaryface":"Scary Face","scorchingsands":"Scorching Sands","scratch":"Scratch","screech":"Screech","searingshot":"Searing Shot","searingsunrazesmash":"Searing Sunraze Smash","secretpower":"Secret Power","secretsword":"Secret Sword","seedbomb":"Seed Bomb","seedflare":"Seed Flare","seismictoss":"Seismic Toss","selfdestruct":"Self-Destruct","shadowball":"Shadow Ball","shadowbone":"Shadow Bone","shadowclaw":"Shadow Claw","shadowforce":"Shadow Force","shadowpunch":"Shadow Punch","shadowsneak":"Shadow Sneak","sharpen":"Sharpen","shatteredpsyche":"Shattered Psyche","shedtail":"Shed Tail","sheercold":"Sheer Cold","shellsidearm":"Shell Side Arm","shellsmash":"Shell Smash","shelltrap":"Shell Trap","shelter":"Shelter","shiftgear":"Shift Gear","shockwave":"Shock Wave","shoreup":"Shore Up","signalbeam":"Signal Beam","silktrap":"Silk Trap","silverwind":"Silver Wind","simplebeam":"Simple Beam","sing":"Sing","sinisterarrowraid":"Sinister Arrow Raid","sizzlyslide":"Sizzly Slide","sketch":"Sketch","skillswap":"Skill Swap","skittersmack":"Skitter Smack","skullbash":"Skull Bash","skyattack":"Sky Attack","skydrop":"Sky Drop","skyuppercut":"Sky Uppercut","slackoff":"Slack Off","slam":"Slam","slash":"Slash","sleeppowder":"Sleep Powder","sleeptalk":"Sleep Talk","sludge":"Sludge","sludgebomb":"Sludge Bomb","sludgewave":"Sludge Wave","smackdown":"Smack Down","smartstrike":"Smart Strike","smellingsalts":"Smelling Salts","smog":"Smog","smokescreen":"Smokescreen","snaptrap":"Snap Trap","snarl":"Snarl","snatch":"Snatch","snipeshot":"Snipe Shot","snore":"Snore","snowscape":"Snowscape","soak":"Soak","softboiled":"Soft-Boiled","solarbeam":"Solar Beam","solarblade":"Solar Blade","sonicboom":"Sonic Boom","soulstealing7starstrike":"Soul-Stealing 7-Star Strike","spacialrend":"Spacial Rend","spark":"Spark","sparklingaria":"Sparkling Aria","sparklyswirl":"Sparkly Swirl","spectralthief":"Spectral Thief","speedswap":"Speed Swap","spicyextract":"Spicy Extract","spiderweb":"Spider Web","spikecannon":"Spike Cannon","spikes":"Spikes","spikyshield":"Spiky Shield","spinout":"Spin Out","spiritbreak":"Spirit Break","spiritshackle":"Spirit Shackle","spite":"Spite","spitup":"Spit Up","splash":"Splash","splinteredstormshards":"Splintered Stormshards","splishysplash":"Splishy Splash","spore":"Spore","spotlight":"Spotlight","springtidestorm":"Springtide Storm","stealthrock":"Stealth Rock","steameruption":"Steam Eruption","steamroller":"Steamroller","steelbeam":"Steel Beam","steelroller":"Steel Roller","steelwing":"Steel Wing","stickyweb":"Sticky Web","stockpile":"Stockpile","stokedsparksurfer":"Stoked Sparksurfer","stomp":"Stomp","stompingtantrum":"Stomping Tantrum","stoneaxe":"Stone Axe","stoneedge":"Stone Edge","storedpower":"Stored Power","stormthrow":"Storm Throw","strangesteam":"Strange Steam","strength":"Strength","strengthsap":"Strength Sap","stringshot":"String Shot","struggle":"Struggle","strugglebug":"Struggle Bug","stuffcheeks":"Stuff Cheeks","stunspore":"Stun Spore","submission":"Submission","substitute":"Substitute","subzeroslammer":"Subzero Slammer","suckerpunch":"Sucker Punch","sunnyday":"Sunny Day","sunsteelstrike":"Sunsteel Strike","supercellslam":"Supercell Slam","superfang":"Super Fang","superpower":"Superpower","supersonic":"Supersonic","supersonicskystrike":"Supersonic Skystrike","surf":"Surf","surgingstrikes":"Surging Strikes","swagger":"Swagger","swallow":"Swallow","sweetkiss":"Sweet Kiss","sweetscent":"Sweet Scent","swift":"Swift","switcheroo":"Switcheroo","swordsdance":"Swords Dance","synchronoise":"Synchronoise","synthesis":"Synthesis","syrupbomb":"Syrup Bomb","tachyoncutter":"Tachyon Cutter","tackle":"Tackle","tailglow":"Tail Glow","tailslap":"Tail Slap","tailwhip":"Tail Whip","tailwind":"Tailwind","takedown":"Take Down","takeheart":"Take Heart","tarshot":"Tar Shot","taunt":"Taunt","tearfullook":"Tearful Look","teatime":"Teatime","technoblast":"Techno Blast","tectonicrage":"Tectonic Rage","teeterdance":"Teeter Dance","telekinesis":"Telekinesis","teleport":"Teleport","temperflare":"Temper Flare","terablast":"Tera Blast","terastarstorm":"Tera Starstorm","terrainpulse":"Terrain Pulse","thief":"Thief","thousandarrows":"Thousand Arrows","thousandwaves":"Thousand Waves","thrash":"Thrash","throatchop":"Throat Chop","thunder":"Thunder","thunderbolt":"Thunderbolt","thundercage":"Thunder Cage","thunderclap":"Thunderclap","thunderfang":"Thunder Fang","thunderouskick":"Thunderous Kick","thunderpunch":"Thunder Punch","thundershock":"Thunder Shock","thunderwave":"Thunder Wave","tickle":"Tickle","tidyup":"Tidy Up","topsyturvy":"Topsy-Turvy","torchsong":"Torch Song","torment":"Torment","toxic":"Toxic","toxicspikes":"Toxic Spikes","toxicthread":"Toxic Thread","trailblaze":"Trailblaze","transform":"Transform","triattack":"Tri Attack","trick":"Trick","trickortreat":"Trick-or-Treat","trickroom":"Trick Room","triplearrows":"Triple Arrows","tripleaxel":"Triple Axel","tripledive":"Triple Dive","triplekick":"Triple Kick","tropkick":"Trop Kick","trumpcard":"Trump Card","twinbeam":"Twin Beam","twineedle":"Twineedle","twinkletackle":"Twinkle Tackle","twister":"Twister","upperhand":"Upper Hand","uproar":"Uproar","uturn":"U-turn","vacuumwave":"Vacuum Wave","vcreate":"V-create","veeveevolley":"Veevee Volley","venomdrench":"Venom Drench","venoshock":"Venoshock","victorydance":"Victory Dance","vinewhip":"Vine Whip","visegrip":"Vise Grip","vitalthrow":"Vital Throw","voltswitch":"Volt Switch","volttackle":"Volt Tackle","wakeupslap":"Wake-Up Slap","waterfall":"Waterfall","watergun":"Water Gun","waterpledge":"Water Pledge","waterpulse":"Water Pulse","watershuriken":"Water Shuriken","watersport":"Water Sport","waterspout":"Water Spout","wavecrash":"Wave Crash","weatherball":"Weather Ball","whirlpool":"Whirlpool","whirlwind":"Whirlwind","wickedblow":"Wicked Blow","wickedtorque":"Wicked Torque","wideguard":"Wide Guard","wildboltstorm":"Wildbolt Storm","wildcharge":"Wild Charge","willowisp":"Will-O-Wisp","wingattack":"Wing Attack","wish":"Wish","withdraw":"Withdraw","wonderroom":"Wonder Room","woodhammer":"Wood Hammer","workup":"Work Up","worryseed":"Worry Seed","wrap":"Wrap","wringout":"Wring Out","xscissor":"X-Scissor","yawn":"Yawn","zapcannon":"Zap Cannon","zenheadbutt":"Zen Headbutt","zingzap":"Zing Zap","zippyzap":"Zippy Zap","paleowave":"Paleo Wave","shadowstrike":"Shadow Strike","polarflare":"Polar Flare"};

// ─── STAT CALCULATION ─────────────────────────────────────────
// Champions: stat = floor(base * level / 50) + EV bonus (each EV = +1)
// HP formula differs from standard, but we'll use standard Lv50 approximation + EV as flat bonus
function calcStat(base, ev, isHP, nature) {
  const iv = 31;
  if (isHP) {
    return Math.floor(((2 * base + iv) * 50) / 100) + 60 + ev;
  } else {
    const s = Math.floor(((2 * base + iv) * 50) / 100) + 5 + ev;
    if (nature === '+') return Math.floor(s * 1.1);
    if (nature === '-') return Math.floor(s * 0.9);
    return s;
  }
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

// ─── POKEAPI + SHOWDOWN LEARNSETS ────────────────────────────
function slugify(name) {
  return name.toLowerCase().replace(/\s+/g,'-').replace(/[''.♀♂]/g,'')
    .replace(/é/g,'e').replace(/[^a-z0-9-]/g,'');
}

// Showdown key: lowercase, no spaces/hyphens/punctuation
function showdownKey(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g,'');
}

const SHOWDOWN_LEARNSET_URL = 'https://raw.githubusercontent.com/smogon/pokemon-showdown/master/data/learnsets.ts';
let showdownLearnsetRaw = null;
let showdownLearnsetPromise = null; // singleton promise — never fetch twice

async function getShowdownLearnsetRaw() {
  if (showdownLearnsetRaw) return showdownLearnsetRaw;
  if (!showdownLearnsetPromise) {
    showdownLearnsetPromise = fetch(SHOWDOWN_LEARNSET_URL)
      .then(r => r.ok ? r.text() : null)
      .then(text => { showdownLearnsetRaw = text; return text; })
      .catch(() => null);
  }
  return showdownLearnsetPromise;
}

// Extract learnset for a single pokemon key from raw TS text
function parseLearnsetBlock(raw, key) {
  const startRe = new RegExp(`\\t${key}:\\s*\\{`);
  const startMatch = raw.match(startRe);
  if (!startMatch) return null;
  const after = raw.slice(startMatch.index);
  const learnsetMatch = after.match(/learnset:\s*\{/);
  if (!learnsetMatch) return null;
  const learnStart = learnsetMatch.index + learnsetMatch[0].length;
  const learnSection = after.slice(learnStart);
  const closeBrace = learnSection.indexOf('\n\t\t},');
  const block = closeBrace >= 0 ? learnSection.slice(0, closeBrace) : learnSection.slice(0, 5000);
  const moves = {};
  const lineRe = /(\w+):\s*\[([^\]]+)\]/g;
  let lm;
  while ((lm = lineRe.exec(block)) !== null) {
    moves[lm[1]] = lm[2].replace(/"/g,'').split(',').map(s=>s.trim());
  }
  return moves;
}

// Get all moves for a pokemon + its pre-evolutions, filtered to Gen 9
async function fetchShowdownMoves(pokeApiData) {
  const raw = await getShowdownLearnsetRaw();
  if (!raw) return null;

  const chain = [];
  // Walk evolution chain from PokéAPI to get pre-evolutions
  try {
    const speciesRes = await fetch(pokeApiData.speciesUrl);
    const speciesData = await speciesRes.json();
    const chainRes = await fetch(speciesData.evolution_chain.url);
    const chainData = await chainRes.json();
    // Flatten chain
    function walk(node) {
      chain.push(node.species.name);
      node.evolves_to.forEach(walk);
    }
    walk(chainData.chain);
  } catch { /* skip chain, use only current */ }

  // Find current pokemon position and take it + all pre-evolutions
  const currentIdx = chain.indexOf(pokeApiData.speciesName);
  const relevant = currentIdx >= 0 ? chain.slice(0, currentIdx + 1) : [pokeApiData.speciesName];

  const allMoves = new Set();
  for (const specName of relevant) {
    const key = showdownKey(specName);
    const learnset = parseLearnsetBlock(raw, key);
    if (!learnset) continue;
    // Filter to gen 9 (keys starting with "9")
    for (const [move, codes] of Object.entries(learnset)) {
      if (codes.some(c => c.startsWith('9'))) {
        allMoves.add(move);
      }
    }
  }

  // Convert to display names using Showdown's own name map
  return Array.from(allMoves)
    .map(key => MOVE_NAMES[key] || key.replace(/^./, c => c.toUpperCase()))
    .sort();
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
      speciesName: data.species.name,
      speciesUrl: data.species.url,
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
      legalMoves: [] // will be filled async below
    };

    // Fallback: PokéAPI moves
    result.legalMoves = data.moves.map(m => m.move.name.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()));
    POKEMON_CACHE[key] = result;

    // Await Showdown learnset — this is the accurate source
    try {
      const showdownMoves = await fetchShowdownMoves(result);
      if (showdownMoves && showdownMoves.length > 0) {
        result.legalMoves = showdownMoves;
      }
    } catch { /* keep PokéAPI fallback */ }

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
  // Show loading state in move inputs
  const movesSection = document.querySelector('.moves-section');
  if (movesSection) movesSection.style.opacity = '0.4';
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
  getShowdownLearnsetRaw(); // preload in background

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
