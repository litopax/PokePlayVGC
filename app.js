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

const ITEMS = ["Abomasnow", "Abomasnowita", "Abono Fijador", "Abono Lento", "Abono Rápido", "Abono del TMV", "Abono fructífero", "Abono fértil", "Abono insólito", "Abono sorpresa", "Absol", "Absolita", "Absolita Z", "Aceite de Arboliva", "Aceite de oliva", "Acopiobola", "Acris", "Acromáquina", "Aerobola", "Aerodactyl", "Aerodactylita", "Aerosol sigilo", "Aerostal Z", "Aggron", "Aggronita", "Agua Fresca", "Agua Mística", "Aguacate", "Akala", "Alabola", "Alakazam", "Alakazamita", "Albahaca", "Albora", "Alo-Raistal Z", "Alola", "Altaria", "Altarianita", "Amigobola", "Amorbola", "Ampharos", "Ampharosita", "Amuleto", "Amuleto captura", "Amuleto cristalino", "Amuleto de Naria azul", "Amuleto de Naria dorado", "Amuleto de Naria firmado", "Amuleto de Naria rojo", "Amuleto de Naria rosa", "Amuleto de Naria verde", "Amuleto emblema", "Amuleto experiencia", "Amuleto iris", "Amuleto oval", "Amuleto protector", "Amuleto puro", "Amuleto salud", "Amuleto sustituto", "Anillo preciado", "Antihielo", "Antiparabaya", "Antiparalizador", "Antiquemaduras", "Antiquembaya", "Antídoto", "Aperitivo elección", "Arca de Zygarde", "Arcanine", "Arceus", "Archi7", "Arena Fina", "Armadura auspiciosa", "Armadura maldita", "Arroz", "Articuno", "Ash-Pikastal Z", "Ataque Especial X", "Ataque X", "Audinita", "Audino", "Autógrafo", "Autógrafo del grupo", "Avalugg", "Azelf", "Bambú grande", "Bambú pequeño", "Banda aguante", "Banda atadura", "Banda recia", "Banette", "Banettita", "Barbaracle", "Barbaraclita", "Barra de pan", "Barrita Plus", "Base Galaxia", "Base secreta", "Basura suculenta", "Batik", "Baxcaliburita", "Baya", "Baya Acardo", "Baya Acardo D", "Baya Alcho", "Baya Alcho D", "Baya Algama", "Baya Algama D", "Baya Andano", "Baya Ango", "Baya Anjiro", "Baya Anjiro D", "Baya Aostan", "Baya Arabol", "Baya Aranja", "Baya Aranja D", "Baya Aricoc", "Baya Aslac", "Baya Atania", "Baya Atania D", "Baya Baribá", "Baya Baribá D", "Baya Biglia", "Baya Caoca", "Baya Caoca D", "Baya Caquic", "Baya Caquic D", "Baya Chilan", "Baya Chilan D", "Baya Chiri", "Baya Dillo", "Baya Dillo D", "Baya Drasi", "Baya Drasi D", "Baya Enigma", "Baya Frambu", "Baya Frambu dorada", "Baya Frambu plateada", "Baya Gonlan", "Baya Grana", "Baya Grana D", "Baya Gualot", "Baya Gualot D", "Baya Guaya", "Baya Hibis", "Baya Hibis D", "Baya Higog", "Baya Ispero", "Baya Ispero D", "Baya Jaboca", "Baya Kebia", "Baya Kebia D", "Baya Kouba", "Baya Kouba D", "Baya Lagro", "Baya Latano", "Baya Latano dorada", "Baya Latano plateada", "Baya Lichi", "Baya Lupu", "Baya Magua", "Baya Mais", "Baya Maranga", "Baya Meloc", "Baya Meloc D", "Baya Meloc singular", "Baya Meluce", "Baya Meluce D", "Baya Monli", "Baya Oram", "Baya Pabaya", "Baya Pasio", "Baya Pasio D", "Baya Payapa", "Baya Payapa D", "Baya Peragu", "Baya Perasi", "Baya Perasi D", "Baya Pinia", "Baya Pinia dorada", "Baya Pinia plateada", "Baya Plama", "Baya Pomaro", "Baya Pomaro D", "Baya Rautan", "Baya Rimoya", "Baya Rimoya D", "Baya Rudion", "Baya Safre", "Baya Safre D", "Baya Sambia", "Baya Tamar", "Baya Tamar D", "Baya Tamate", "Baya Tamate D", "Baya Uvav", "Baya Uvav D", "Baya Wikano", "Baya Wiki", "Baya Yapati", "Baya Yecana", "Baya Yecana D", "Baya Zanama", "Baya Zidra", "Baya Zidra D", "Baya Ziuela", "Baya Ziuela D", "Baya Zonlan", "Baya Zreza", "Baya Zreza D", "Baya dorada", "Baya hielo", "Baya menta", "Baya milagro", "Baya misterio", "Bayamarga", "Bayantídoto", "Beedrill", "Beedrillita", "Bellossom", "Berros", "Bici", "Bici Rotom", "Bici acrobática", "Bici de carreras", "Bicicleta", "Bisharp", "Bizcocho Jubileo", "Bizcocho clásico", "Blanco", "Blastoise", "Blastoisita", "Blaziken", "Blazikenita", "Bloc Unown", "Bloc de amigos", "Bloque de turba", "Bocadillo", "Bocadito inversión", "Bola Luminosa", "Bola de Humo", "Bola de arcilla", "Bola de lodo", "Bola de nieve", "Bola férrea", "Bola humareda", "Bola pegajosa", "Bola ruidosa", "Boleto Handsome", "Bolsa de sellos", "Bolsillo de Captura", "Bolsillo de Combate", "Bolsillo de Mejoras", "Bombona Devon", "Bonguri", "Bonguri amarillo", "Bonguri azul", "Bonguri blanco", "Bonguri negro", "Bonguri pocho", "Bonguri rojo", "Bonguri rosa", "Bonguri verde", "Bono bici", "Botas gruesas", "Bote polvos", "Botiquín", "Botón escape", "Brazal antiguo", "Brazal galanuez", "Brazal recio", "Brazalete Firme", "Brie", "Buceobola", "Buena", "Buscamontura", "Buscapelea", "Butifarra", "Bárbara", "Cadena roja", "Café Alma", "Caja bonguri", "Caja corazón", "Caja de Pokémon", "Caja de insignias", "Caja de sellos", "Caja grande", "Caja normal", "Calcio", "Calmasfera", "Calmasfera bosque", "Calmasfera espacio", "Calmasfera montaña", "Calmasfera nieve", "Calmasfera pantano", "Calmasfera tiempo", "Calmasfera volcán", "Calyrex", "Camerupt", "Cameruptita", "Canica", "Capa furtiva", "Caracola Cardumen", "Caramelo Dinamax", "Caramelo Raro", "Caramelo aguante", "Caramelo aguante +", "Caramelo aguante ++", "Caramelo experiencia L", "Caramelo experiencia M", "Caramelo experiencia S", "Caramelo experiencia XL", "Caramelo experiencia XS", "Caramelo furia", "Caramelo intelecto", "Caramelo intelecto +", "Caramelo intelecto ++", "Caramelo mente", "Caramelo mente +", "Caramelo mente ++", "Caramelo músculo", "Caramelo músculo +", "Caramelo músculo ++", "Caramelo vigor", "Caramelo vigor +", "Caramelo vigor ++", "Caramelo ímpetu", "Caramelo ímpetu +", "Caramelo ímpetu ++", "Caramelos chispeantes", "Carbohidratos", "Carbón", "Carné de socio", "Carta Favoritos", "Carta Gracias", "Carta Gustos", "Carta Importante", "Carta Inicial", "Carta Pregunta", "Carta Puente A", "Carta Puente F", "Carta Puente P", "Carta Puente S", "Carta Puente V", "Carta Respuesta", "Carta a Máximo", "Carta acero", "Carta ajada", "Carta amor", "Carta azul", "Carta aérea", "Carta brillo", "Carta celeste", "Carta corazón", "Carta del profesor Oak", "Carta espejismo", "Carta eón", "Carta fabulosa", "Carta flor", "Carta flores", "Carta fuego", "Carta hierba", "Carta imagen", "Carta imán", "Carta madera", "Carta mina", "Carta morfosis", "Carta mosaico", "Carta música", "Carta naranja", "Carta nieve", "Carta ola", "Carta pared", "Carta pompas", "Carta profesor", "Carta puerto", "Carta retrato", "Carta retro", "Carta sideral", "Carta sombra", "Carta sueño", "Carta surf", "Carta tropical", "Cartera de Fuco", "Cascabel Alivio", "Cascabel Nácar", "Cascabel claro", "Cascabel oleaje", "Cascada Meteoro", "Casco dentado", "Categoría:Objetos", "Catálogo Rotom", "Caña", "Caña buena", "Caña vieja", "Cebo Basculegion", "Cebo de grano", "Cebo de habas", "Cebo de setas", "Cebo meloso", "Cebo mineral", "Cebolla", "Cebolla roja", "Ceniza Sagrada", "Central Energía", "Centro Espacial de Algaria", "Centros Pokémon", "Chaleco asalto", "Chandelure", "Chandelurita", "Chansey", "Charizard", "Charizardita X", "Charizardita Y", "Chesnaught", "Chesnaughtita", "Chimechita", "Chorizo", "Chris", "Cinta Aguante", "Cinta Elección", "Cinta fuerte", "Cintalunares", "Cinto recio", "Cinturón Negro", "Cinturón de experto", "Ciudad Azafrán", "Ciudad Canal", "Ciudad Carmín", "Ciudad Cántara", "Ciudad Esmalte", "Ciudad Luminalia", "Ciudad Malvalona", "Ciudad Mayólica", "Ciudad Orquídea", "Ciudad Plateada", "Ciudad Porcelana", "Ciudad Rocavelo", "Ciudad Trigal", "Ciudad Verde", "Ciudad Yantra", "Clamperl", "Clefable", "Clefablita", "Clefairy", "Cobalion", "Cola Plúmbea", "Cola Skitty", "Cola Slowpoke", "Cola ahumada", "Colmillo Dragón", "Colmillo agudo", "Colonia", "Colonia máxima", "Competibola", "Concha tropical", "Concursos Pokémon", "Confite corazón", "Confite estrella", "Confite flor", "Confite fresa", "Confite fruto", "Confite lazo", "Confite trébol", "Confitura de bayas", "Construcciones Radix", "Copiona", "Corazón Dulce", "Cordón unión", "Corona antigua", "Corona galanuez", "Corona tallada", "Crabominablita", "Crema de cacahuete", "Crin blanca", "Crin negra", "CrioROM", "Criostal Z", "Cristal Dinamax", "Cristal Z (Liam)", "Cristal marino", "Cráneo dragón", "Crêpe Luminalia", "Crítico X", "Cuarta", "Cubone", "Cubresuelos", "Cuchara Torcida", "Cuenco exquisito", "Cuenco mediocre", "Cuerda de Huida", "Cueva Cardumen", "Cueva Granito", "Cueva Sotobosque", "Cupón 1", "Cupón 2", "Cupón 3", "Cupón PP", "Cupón PS", "Cupón amistad", "Cupón botín", "Cupón captura", "Cupón eclosión", "Cupón exp", "Cupón rebaja", "Cupón reclamo", "Cupón refuerzo", "Cupón sigilo", "Curación Total", "Curri de bote", "Curri en polvo", "Cámara lucha", "Cápsula candado", "Cápsula habilidad", "DBPR", "DPPt", "Dado trucado", "Damián", "Decidueye", "Defensa Especial X", "Defensa X", "Delphox", "Delphoxita", "Denio", "Dentadura de oro", "Despertar", "Detector Devon", "Devon S. A.", "Dialga", "Diamansfera", "Diancie", "Diancita", "Diario antiguo", "Diario rasgado", "Diente Marino", "Diente de Azelf", "Dinamax", "Disco Siniestro", "Disco acero", "Disco agua", "Disco bicho", "Disco dragón", "Disco eléctrico", "Disco extraño", "Disco fantasma", "Disco fuego", "Disco hada", "Disco hielo", "Disco lucha", "Disco planta", "Disco psíquico", "Disco roca", "Disco tierra", "Disco veneno", "Disco volador", "Disco índigo", "Distintivo de líder", "Ditto", "Dracofósil", "Dracostal Z", "Dragalge", "Dragalgita", "Dragonite", "Dragonitita", "Dragón", "Drampa", "Drampanita", "Dratini", "Dueyestal Z", "Dulce de nata", "Duralium", "Duskull", "Eelektross", "Eelektrossita", "Eevee", "Eeveestal Z", "Efigie antigua", "El tesoro oculto del Área Cero", "Electrizador", "Electrode", "Electrostal Z", "Elixir", "Elíxir Máximo", "Emblema de Kalos", "Emboar", "Emboarita", "Encurtidoble", "Energía potenciadora", "Ensaladilla", "Enseres de Bárbara", "Ensueñobola", "Entebola", "Entei", "Entrada para dos", "Envío 1", "Envío 2", "Envío 3", "EpEc", "Equipo", "Equipo Aqua", "Equipo Galaxia", "Equipo Magma", "Eriad", "Escama Corazón", "Escama Dragón", "Escama Marina", "Escama bella", "Escama roja", "Escudo habilidad", "Escudo oxidado", "Escáner", "Esfera verde", "Espada oxidada", "Especia negra", "Especia oculta amarga", "Especia oculta dulce", "Especia oculta picante", "Especia oculta salada", "Especia oculta ácida", "Especias", "Especias Gigamax", "Espectrostal Z", "Espejo veraz", "Espiga vivaz", "Espray bucal", "Esquirla extraña L", "Esquirla extraña S", "Estatuilla rara", "Estrella deseo", "Estuche de MT", "Excadrill", "Excadrillita", "Extrañabola", "Falinks", "Falinksita", "Farfetch’d", "Feeristal Z", "Fennekin", "Feraligatr", "Feraligatrita", "Festi Plaza", "Festicupón", "Fideos", "Fideos de bote", "Filete ahumado", "Filete frito", "Fitostal Z", "Flauta Amarilla", "Flauta Azul", "Flauta Blanca", "Flauta Negra", "Flauta Roja", "Flauta azur", "Flauta celestial", "Flauta eón", "Flauta lunar", "Flauta solar", "Flecha Venenosa", "Floette", "Floettita", "Flor irisada", "Fragata Plasma", "Fragmento Amarillo", "Fragmento Azul", "Fragmento Estrella", "Fragmento Rojo", "Fragmento Verde", "Fragmento de cometa", "Fragmento de cristal", "Fragmento meteorito", "Franja recia", "Fresa", "Frituras", "Froslass", "Froslassita", "Fruta tropical", "FulgoROM", "Fumibulbo", "Fósil", "Fósil Coraza", "Fósil Cráneo", "Fósil Domo", "Fósil Garra", "Fósil Hélix", "Fósil Raíz", "Fósil aleta", "Fósil mandíbula", "Fósil pluma", "Fósil tapa", "GS Ball", "Gafa protectora", "Gafas aislantes", "Gafas elección", "Gafas especiales", "Galar", "Gallade", "Galladita", "Galleta Articuno", "Galleta Cobalion", "Galleta Entei", "Galleta Glastrier", "Galleta Groudon", "Galleta Ho-Oh", "Galleta Kubfu", "Galleta Kyogre", "Galleta Kyurem", "Galleta Latias", "Galleta Latios", "Galleta Lava", "Galleta Lugia", "Galleta Lunala", "Galleta Moltres", "Galleta Necrozma", "Galleta Raikou", "Galleta Rayquaza", "Galleta Reshiram", "Galleta Solgaleo", "Galleta Spectrier", "Galleta Suicune", "Galleta Terrakion", "Galleta Virizion", "Galleta Yantra", "Galleta Zapdos", "Galleta Zekrom", "Garchomp", "Garchompita", "Garchompita Z", "Gardevoir", "Gardevoirita", "Garra Rápida", "Garra afilada", "Garra de Uxie", "Garra garfio", "Gema acero", "Gema agua", "Gema bicho", "Gema dragón", "Gema eléctrico", "Gema fantasma", "Gema fuego", "Gema hada", "Gema hielo", "Gema lucha", "Gema normal", "Gema planta", "Gema psíquico", "Gema roca", "Gema siniestro", "Gema tierra", "Gema veneno", "Gema volador", "Gen loco", "Genesect", "Gengar", "Gengarita", "Geostal Z", "Gimnasio de Ciudad Carmín", "Gimnasio de Ciudad Petalia", "Gimnasio de Kanto", "Giratina", "Glalie", "Glalita", "Glastrier", "Glimmoranita", "Globo helio", "Gloriabola", "Golisopodita", "Golurkita", "Gracídea", "Gragea crítica", "Gragea defensiva", "Gragea evasiva", "Gragea multi", "Gragea ofensiva", "Gran Concurso", "Gran Pantano", "Gran diamansfera", "Gran griseosfera", "Gran lustresfera", "Grava esfuerzo", "Greninja", "Greninjanita", "Griseosfera", "Groudon", "Guante de boxeo", "Guarida del Team Rocket", "Guijarro celeste", "Guijarro negro", "Guijarro rojo", "Guía de aventura", "Guía de viaje", "Gyarados", "Gyaradosita", "HGSS", "Haba suculenta", "Hamburguesa", "Hamburguesas", "Handsome", "Hawlucha", "Hawluchanita", "Hechizo", "Helecho rizado", "Heracross", "Heracrossita", "HidroROM", "Hidrostal Z", "Hielo Perpetuo", "Hielo eterno", "Hierba Blanca", "Hierba Mental", "Hierba Revivir", "Hierba copia", "Hierba intensa", "Hierba regia", "Hierba repelente", "Hierba éter", "Hierba única", "Hierro", "Hipermantequilla", "Hiperpoción", "Hiperremedio", "Hisui", "Ho-Oh", "Hoenn", "Hoja de oro", "Hoja de plata", "Hoja escrita", "Holomisor", "Hongo Grande", "Honorbola", "Hotel Z", "Houndoom", "Houndoomita", "Hueso Grueso", "Hueso Raro", "Huesos finos", "Huevo Suerte", "Huevo cocido", "Huevo duro", "Huevo misterioso", "Ictiofósil", "Imán", "Incienso Acua", "Incienso Duplo", "Incienso Floral", "Incienso Lento", "Incienso Marino", "Incienso Puro", "Incienso Raro", "Incienso Roca", "Incienso Suave", "Incineroar", "Incinostal Z", "Insectostal Z", "Iris-ticket", "Isla Canela", "Isla Libertad", "Isla Origen", "Isla Prima", "Isla de la Armadura", "Isla del Sur", "Jalapeño", "Jamón cocido", "Jamón serrano", "Jugo de Baya", "Jungla Umbría", "Kalos", "Kangaskhan", "Kangaskhanita", "Kiawe", "Kilobola", "Kit de Pokécubos", "Kit de acampada", "Kit de artesanía", "Kit de explorador", "Kit de pícnic", "Kit maquillaje", "Kiwi", "Klawf", "Kleavor", "Kommo-o", "Kommostal Z", "Koraidon", "Kubfu", "Kyogre", "Kyurem", "Kétchup", "LGPE", "LPA", "LPZA", "La isla de la armadura", "Laboratorios Lysandre", "Ladrillo", "Lago Agudeza", "Lago Cristalino", "Lago Valor", "Lago Veraz", "Lago de la Furia", "Lapras", "Lata de Bach", "Lata de Darren", "Lata de habas", "Latias", "Latiasita", "Latios", "Latiosita", "Lazo destino", "Lazo rosa", "Leche Mu-mu", "Leche de coco", "Lechuga", "Lente recia", "Lentes de Sol", "Leyenda (?)", "Leyenda 1", "Leyenda 2", "Leyenda 3", "Liam", "Libro Escarlata", "Libro Púrpura", "Libro de Brie", "Libro de Sonia", "Licuabayas", "Lilligant", "Limonada", "Lista por movimiento", "Litostal Z", "Lizastal Z", "Llamasfera", "Llave Galaxia", "Llave Laboratorio A", "Llave Laboratorio B", "Llave Laboratorio C", "Llave Laboratorio M", "Llave Laboratorio X", "Llave de la central", "Llave de la suite", "Llave del Sótano", "Llave del almacén", "Llave del ascensor", "Llave habitación 1", "Llave habitación 2", "Llave habitación 202", "Llave habitación 4", "Llave habitación 6", "Llave magnética", "Llave secreta", "Lodo negro", "Lopunnita", "Lopunny", "Losa Distorsión", "Lotad", "Lotadgadera", "Lucario", "Lucarita", "Lucarita Z", "Lugia", "Lujobola", "Lulú", "Luminalia", "Lunabola", "Lunala", "Lunalastal Z", "Lupa", "Lustroesfera", "Lycanroc", "Lycanrostal Z", "Madera", "Magearnita", "Magmatizador", "Magnemite", "Magnetopase", "Magnetotrén", "Malamar", "Malamarita", "Malasada maxi", "Maleta", "Mallabola", "Malvalanova", "Malvamar", "Manectric", "Manectricita", "Mantequilla", "Mantequilla de Luminalia", "Mantequilla dimensional", "Mantequilla máxima", "Manuscrito aguas", "Manuscrito sombras", "Manzana", "Manzana dulce", "Manzana melosa", "Manzana selecta", "Manzana ácida", "Mapa", "Mapa viejo", "Maquinaria", "Marimo ruidoso", "Marowak", "Marshadow", "Marshastal Z", "Masa para cebo", "Masterbola", "Material", "Mawile", "Mawilita", "Maxihongo", "Maximuñequera", "Maxinium", "Maxipanal", "Maxipepita de oro", "Maxisopa", "Mayonesa", "Medalla Fulgor", "Medicham", "Medichamita", "Medicina secreta", "Mega-aro", "Megaancla", "Megabrazalete", "Megabroche", "Megacolgante", "Megacollar", "Megaesquirla", "Megagafas", "Megaguante", "Meganium", "Meganiumita", "Megapulsera", "Megatiara", "Megatobillera", "Mejora", "Memorín", "Mena origen", "Menta activa", "Menta afable", "Menta agitada", "Menta alegre", "Menta alocada", "Menta amable", "Menta audaz", "Menta cauta", "Menta firme", "Menta floja", "Menta grosera", "Menta huraña", "Menta ingenua", "Menta mansa", "Menta miedosa", "Menta modesta", "Menta osada", "Menta plácida", "Menta pícara", "Menta serena", "Menta seria", "Meowsticita", "Mermelada", "Mesprit", "Metagross", "Metagrossita", "Metal compuesto", "Metalostal Z", "Meteorito", "Metrónomo", "Mew", "Mewstal Z", "Mewtwo", "Mewtwoita X", "Mewtwoita Y", "Miel", "Miel brillante", "Milcery", "Mime Jr.", "Mimikyu", "Mimikyustal Z", "Mineral crocante", "Mineral evolutivo", "Mineral negro", "Minihongo", "Miraidon", "Misti-ticket", "Misticristal", "Mochi aguante", "Mochi intelecto", "Mochi mente", "Mochi músculo", "Mochi reinicio", "Mochi vigor", "Mochi ímpetu", "Mochila escape", "Moltres", "Moneda", "Moneda Amuleto", "Moneda de Gimmighoul", "Monedero", "Monte Cenizo", "Mostaza", "Muda concha", "Muelle estirado", "Musgo brillante", "Máquinas ocultas (MO)", "Máquinas técnicas (MT)", "Más PP", "Más PS", "Máscara cimiento", "Máscara fuente", "Máscara horno", "Máscara profesor", "Máscara turquesa", "N2B2", "Naclstack", "Naria", "Nata fresca", "Nata montada", "Natu", "Neceser", "Necroluna", "Necrosol", "Necrozma", "Nereida", "Nerviosfera", "Nictostal Z", "Nidobola", "Nieves de la Corona", "Nivelabola", "Norman", "Normastal Z", "Nota intrigante", "Novena", "Néctar amarillo", "Néctar rojo", "Néctar rosa", "Néctar violeta", "OPC", "Objeto", "Objeto equipable", "Objeto oculto", "Objeto perdido", "Ocasobola", "Octava", "Ogerpon", "Orbe Teracristal", "Orbe claro", "Orbe oscuro", "Ori-ticket", "Origenbola", "Ornitofósil", "PP Máximos", "Paldea", "Palkia", "Paloselfi Rotom", "Pan de Naria", "Pan de molde", "Panceta", "Paquete", "Paracontacto", "Parasol multiuso", "Parche habilidad", "Parque Hansa", "Parquebola", "Pase", "Pase Armadura", "Pase Corona", "Pase de concurso", "Pase de la central", "Pasta", "Patatas", "Patines", "Pawniard", "Pañuelo Amarillo", "Pañuelo Azul", "Pañuelo Elección", "Pañuelo Esmeralda", "Pañuelo Mugriento", "Pañuelo Rojo", "Pañuelo Rosa", "Pañuelo de Seda", "Pañuelo sucio", "Pendiente", "Peony", "Pepinillo", "Pepino", "Pepita de Oro", "Pepita de hierro", "Periscopio", "Pesa recia", "Pesabola", "Pesabola", "Pico Afilado", "Pidgeot", "Pidgeotita", "Piedra Agua", "Piedra Alba", "Piedra Dura", "Piedra Día", "Piedra Espíritu", "Piedra Eterna", "Piedra Fuego", "Piedra Hoja", "Piedra Lunar", "Piedra Noche", "Piedra Oval", "Piedra Solar", "Piedra Trueno", "Piedra activadora", "Piedra brillante", "Piedra común", "Piedra dios", "Piedra esfuerzo", "Piedra hielo", "Piedra insólita", "Piedra magma", "Piedra pómez", "Piedrecita", "Piezas Devon", "Pikachu", "Pikastal Z", "Pila", "Pimienta", "Pimiento amarillo", "Pimiento rojo", "Pimiento verde", "Pinsir", "Pinsirita", "PiroROM", "Pirostal Z", "Piña", "Plantabayas", "Plesiofósil", "Pluma aguante", "Pluma arcoíris", "Pluma bella", "Pluma de Mesprit", "Pluma feérica", "Pluma intelecto", "Pluma lunar", "Pluma mente", "Pluma músculo", "Pluma plateada", "Pluma vigor", "Pluma ímpetu", "Plumabola", "Plátano", "Poción", "Poción Máxima", "Poder Rotom", "Poema antiguo", "Pokochera", "Poké Ball de Koraidon", "Poké Ball de Miraidon", "Poké Reloj", "Poké Tele", "Poké radar", "Pokéathlon", "Pokébola", "Pokébola", "Pokébola", "Pokébola Ajena", "Pokécubo", "Pokécubos", "Pokédex", "Pokéflauta", "Pokémuñeca", "Pokémuñeco", "Pokéseñuelo", "Polvo Brillo", "Polvo Curación", "Polvo Energía", "Polvo Estrella", "Polvo Metálico", "Polvo Plata", "Polvo Velocidad", "Polvo esfuerzo", "Porcehelado", "Portalentillas", "Precisión X", "Primarina", "Primastal Z", "Primera", "Prisma azul", "Prisma rojo", "Profesor Ciprés", "Profesor Lavender", "Profesor Oak", "Profesor Turo", "Profesora Albora", "Protección X", "Protector", "Proteína", "Psicostal Z", "Psyduck", "Psydugadera", "Pueblo Caelestis", "Pueblo Caoba", "Pueblo Hojaverde", "Pueblo Lavacalda", "Pueblo Marinada", "Pueblo Par", "Puerro", "Puerro grueso", "Puerro medicinal", "Pulsera Z", "Punta ADN", "Puño Suerte", "Pyroar", "Pyroarita", "Pétalo Amarillo", "Pétalo Azul", "Pétalo Naranja", "Pétalo Rojo", "Pétalo Rosa", "Pétalo Verde", "Pétalo Violeta", "Pétalo fulgor", "Queso", "Queso Mu-mu", "Queso crema", "Quinta", "Quintalbola", "RAAm", "RFVH", "ROZA", "RZE", "Raichu de Alola", "Raichunita X", "Raichunita Y", "Raikou", "Rama de galanuez", "Ramita revitalizante", "Ramo pequeño", "Rapibola", "Rayquaza", "Raíz Energía", "Raíz grande", "Real de cobre", "Real de oro", "Real de plata", "Receta", "Recomendación", "Refleluz", "Refresco", "Regalosfera", "Reglamento", "Remedio", "Repartir Experiencia", "Repelente", "Repelente Máximo", "Reproductor DS", "Reproductor GB", "Reserva Natural", "Reshiram", "Restauratodo", "Restos", "Revestimiento Metálico", "Revibrote", "Revivir", "Revivir Máximo", "Riendas unión", "Rika", "Roca Ombligo", "Roca calor", "Roca del Rey", "Roca esfuerzo", "Roca helada", "Roca lluvia", "Roca suave", "Rocío Bondad", "Rokikos", "Rotom", "Rubí", "Ruta 13", "Ruta 224", "Ruta 8", "Rábano arenero", "Rábano picante", "S. S. Anne", "S. S. Aqua", "Sableye", "Sableynita", "Saca botín", "Saco bayas", "Saco hollín", "Safaribola", "Sal", "Sal cardumen", "Sal gruesa de Hoenn", "Sala de Johto", "Sala de Juegos", "Sala de Kanto", "Sala de la Distorsión", "Sala de la Empatía", "Sala de la Genética", "Sala de la Tierra", "Sala de la Tormenta", "Sala del Arcoíris", "Sala del Cielo", "Sala del Inicio", "Sala del Mar", "Salamence", "Salamencita", "Salchichas", "Salsa picante", "Sanabola", "Saquito fragante", "Sarta de perlas", "Sceptile", "Sceptilita", "Scizor", "Scizorita", "Scolipede", "Scolipedita", "Scovillain", "Scovillainita", "Scraftita", "Scrafty", "Secunda", "Segunda", "Seguro debilidad", "Seguro fallo", "Semilla Milagro", "Semilla bruma", "Semilla dominio", "Semilla electro", "Semilla hierba", "Semilla psique", "Semillas de zanahoria", "Servicio raro", "Seta aroma", "Seta crítica", "Seta espada", "Seta esponjosa", "Seta evasiva", "Seta férrea", "Setas", "Sexta", "Señuelobola", "Sharpedo", "Sharpedonita", "Signo Magma", "Silph S. A.", "Sincromisor", "Sinnoh", "Skarmorita", "Skarmory", "Slakoth", "Slowbro", "Slowbronita", "Slowpoke", "Slowpoke de Galar", "SmartRotom", "Snorlastal Z", "Snorlax", "Solgaleo", "Solgaleostal Z", "Sonia", "Spectrier", "Squirgadera", "Sr. Pokémon", "Staraptorita", "Starmie", "Starmita", "Steelix", "Steelixita", "Subsuelo", "Suicune", "Superbola", "Superbola", "Supercaña", "Supercolonia", "Supergalette Luminalia", "Supermantequilla", "Supernido Dinamax", "Superpoción", "Superpulsera Z", "Superremedio", "Superrepelente", "Supertapones", "Surimi de Klawf", "Swampert", "Swampertita", "Séptima", "Tabla acero", "Tabla bicho", "Tabla cielo", "Tabla draco", "Tabla duende", "Tabla fuerte", "Tabla helada", "Tabla legendaria", "Tabla linfa", "Tabla llama", "Tabla mental", "Tabla neutra", "Tabla oscura", "Tabla pradal", "Tabla pétrea", "Tabla terrax", "Tabla terror", "Tabla trueno", "Tabla tóxica", "Tablilla Arcoíris", "Tablilla Cielo", "Tablilla Empatía", "Tablilla Genética", "Tablilla Inicio", "Tablilla Johto", "Tablilla Kanto", "Tablilla Mar", "Tablilla Tierra", "Tablilla Tormenta", "Taladro", "Talismán", "Tapa Dorada", "Tapa Plateada", "Tapistal Z", "Tapu", "Tarjeta Plasma", "Tarjeta azul", "Tarjeta chic", "Tarjeta chic azul", "Tarjeta chic verde", "Tarjeta de datos", "Tarjeta de puntos", "Tarjeta roja", "Tarro de Caramelos", "Tatsugirita", "Team Rocket", "Teatro Musical", "Tela terrible", "Telescopio", "Templo de Sinnoh", "Teniente Surge", "Tera", "Teralito acero", "Teralito agua", "Teralito astral", "Teralito bicho", "Teralito dragón", "Teralito eléctrico", "Teralito fantasma", "Teralito fuego", "Teralito hada", "Teralito hielo", "Teralito lucha", "Teralito normal", "Teralito planta", "Teralito psíquico", "Teralito roca", "Teralito siniestro", "Teralito tierra", "Teralito veneno", "Teralito volador", "Tercera", "Terrakion", "Teru-sama", "Teselia", "Tetera agrietada", "Tetera rota", "Ticket del barco", "Ticket eón", "Ticket huevo", "Ticket libertad", "Tienda Pokémon", "Tiendas Pokémon", "Tipo Insecto", "Tiza", "Tofu", "Tomate", "Tomate cherri", "Tornillo colorido", "Torre Radio", "Tortilla", "Toxiestrella", "Toxisfera", "Toxistal Z", "Traje Aqua", "Traje Magma", "Traje de gala", "Tri-ticket", "Trocito deseo", "Trozo de losa", "Trozo deseo", "Trufa dulce", "Tubo MT-MO", "Tubo Pokécubos", "Tubo pokécubos", "Tubérculo", "Turnobola", "Turo", "Tyranitar", "Tyranitarita", "Túnel Trigal", "USUL", "Ula-Ula", "Ultrabola", "Ultrabola", "Ultramantequilla", "Ultranecrostal Z", "Unown", "Uxie", "Vale de descuento", "Valle Eólico", "Vasija castigo", "Velocidad X", "Velozbola", "Venusaur", "Venusaurita", "Verduras", "Vespiquen", "Vestido de gala", "Victreebel", "Victreebelita", "Vidasfera", "Videomisor", "Vieja Mansión", "Villa Jubileo", "Vinagre", "Virizion", "Visor Silph", "Wailmegadera", "Wailmer", "Wasabi", "Wingull", "Yogur", "Zafiro", "Zahorí", "Zanahoria nívea", "Zanahoria oscura", "Zapdos", "Zekrom", "Zigzagoon", "Zinc", "Zona Safari", "Zona Safari de Kanto", "Zurrón", "Zygarde", "Zygardita", "Álbum", "Ámbar Viejo", "Ánfora antigua", "Área Cero", "Área Silvestre", "Éter", "Éter Máximo"];

// ─── PKM CHAMPIONS DATABASE (WikiDex) ────────────────────────
const DB_MOVE_NAMES = ["Abrecaminos", "Absorb", "Absorbefuerza", "Acid", "Acid Armor", "Acid Spray", "Acrobatics", "Acupressure", "Aerial Ace", "Aeroblast", "After You", "Agility", "Agua Fría", "Aguzar", "Air Cutter", "Air Slash", "Ala Aural", "Ala Bis", "Allanador Férreo", "Ally Switch", "Alquitranazo", "Alto Voltaje", "Amnesia", "Amplificador", "Ancient Power", "Anclaje", "Aqua Jet", "Aqua Ring", "Aqua Tail", "Arenas Ardientes", "Aria Burbuja", "Arm Thrust", "Aromatherapy", "Aromatic Mist", "Arremetida", "Asalto Barrera", "Asalto Espadón", "Asalto Estelar", "Assist", "Assurance", "Astonish", "Atiborramiento", "Attack Order", "Attract", "Aura Sphere", "Aurora Beam", "Autotomize", "Autotomía", "Avalanche", "Azote Torrencial", "Baby-Doll Eyes", "Balón Ígneo", "Barrage", "Barrier", "Bastión Final", "Batería Asalto", "Baton Pass", "Beat Up", "Belch", "Belly Drum", "Bestow", "Bide", "Bind", "Bite", "Blast Burn", "Blaze Kick", "Blizzard", "Block", "Blue Flare", "Body Slam", "Bola de Polen", "Bolt Strike", "Bomba Caramelo", "Bone Club", "Bone Rush", "Bonemerang", "Boomburst", "Bounce", "Bramido Dragón", "Branquibocado", "Brave Bird", "Brick Break", "Brinco", "Brine", "Bruma Explosiva", "Bubble", "Bubble Beam", "Bug Bite", "Bug Buzz", "Bulk Up", "Bulldoze", "Bullet Punch", "Bullet Seed", "Bálsamo Osado", "Búnker", "Cabeza Sorpresa", "Cadena Virulenta", "Calamidad", "Calm Mind", "Cambiapoder", "Cambiavelocidad", "Cambio de Cancha", "Camouflage", "Campo Psíquico", "Canto Ardiente", "Canto Encantador", "Captivate", "Cautivapor", "Cañón Armadura", "Cañón Batidor", "Cañón Dinamax", "Cañón Floral", "Celebrate", "Cepo", "Charge", "Charge Beam", "Charm", "Chatter", "Chip Away", "Choque Anímico", "Chulería", "Ciclón Primavera", "Circle Throw", "Clamp", "Clear Smog", "Clorofiláser", "Close Combat", "Coil", "Comet Punch", "Confide", "Confuse Ray", "Confusion", "Conjuro Funesto", "Constrict", "Conversion", "Conversion 2", "Copycat", "Coraza Trampa", "Cosmic Power", "Cotton Guard", "Cotton Spore", "Counter", "Covet", "Crabhammer", "Crafty Shield", "Cross Chop", "Cross Poison", "Crunch", "Crush Claw", "Crush Grip", "Cuchilla Solar", "Cuerno Certero", "Cura Floral", "Cura Selvática", "Curse", "Cut", "Cólera Ardiente", "Danza Acuática", "Danza Despertar", "Danza Triunfal", "Dark Pulse", "Dark Void", "Dazzling Gleam", "Decalcomanía", "Decoración", "Defend Order", "Defense Curl", "Defog", "Desahogo", "Deslome", "Destiny Bond", "Detect", "Diamond Storm", "Dig", "Disable", "Disarming Voice", "Discharge", "Disparo Certero", "Dive", "Dizzy Punch", "Doom Desire", "Double Hit", "Double Kick", "Double Slap", "Double Team", "Double-Edge", "Draco Meteor", "Dracoenergía", "Dracoflechas", "Dragon Ascent", "Dragon Breath", "Dragon Claw", "Dragon Dance", "Dragon Pulse", "Dragon Rage", "Dragon Rush", "Dragon Tail", "Drain Punch", "Draining Kiss", "Dream Eater", "Drill Peck", "Drill Run", "Dual Chop", "Dynamic Punch", "Earth Power", "Earthquake", "Echoed Voice", "Eerie Impulse", "Eevimpacto", "Egg Bomb", "Electormenta", "Electric Terrain", "Electrify", "Electro Ball", "Electroderrape", "Electrojaula", "Electropalmas", "Electropico", "Electropunzada", "Electrorrayo", "Electroweb", "Embargo", "Embate Supremo", "Ember", "Encore", "Endeavor", "Endure", "Energy Ball", "Entrainment", "Envidia Ardiente", "Envite Acuático", "Erupción de Ira", "Eruption", "Escaramuza", "Espada Lamento", "Espeaura", "Estruendo Escama", "Explosion", "Extracto Picante", "Extrasensory", "Extreme Speed", "Facade", "Fairy Lock", "Fairy Wind", "Fake Out", "Fake Tears", "False Swipe", "Feather Dance", "Feerichoque", "Feint", "Feint Attack", "Fell Stinger", "Ferropuño Doble", "Fiebre Dorada", "Fiery Dance", "Filo Potente", "Final Gambit", "Fire Blast", "Fire Fang", "Fire Pledge", "Fire Punch", "Fire Spin", "Fissure", "Fitoimpulso", "Flail", "Flame Burst", "Flame Charge", "Flame Wheel", "Flamethrower", "Flare Blitz", "Flarembestida", "Flash", "Flash Cannon", "Flatter", "Fling", "Flower Shield", "Fly", "Flying Press", "Foco", "Focus Blast", "Focus Energy", "Focus Punch", "Follaje", "Follow Me", "Force Palm", "Foresight", "Forest's Curse", "Fotocolisión", "Foul Play", "Fragor Escamas", "Freeze Shock", "Freeze-Dry", "Frenzy Plant", "Frost Breath", "Frustration", "Fría Acogida", "Fuerza Equina", "Fuerza G", "Furia Candente", "Furia Natural", "Furia Taurina", "Fury Attack", "Fury Cutter", "Fury Swipes", "Fusion Bolt", "Fusion Flare", "Future Sight", "Garra Nociva", "Garrote Liana", "Gas Corrosivo", "Gastro Acid", "Gear Grind", "Genufendiente", "Geomancy", "Giga Drain", "Giga Impact", "Giro Mortífero", "Giro Vil", "Glaceoprisma", "Glaciate", "Glare", "Golpe Mordaza", "Golpe Oscuro", "Golpe Rastrero", "Gota Vital", "Grass Knot", "Grass Pledge", "Grass Whistle", "Grassy Terrain", "Gravity", "Growl", "Growth", "Grudge", "Guard Split", "Guard Swap", "Guillotine", "Gunk Shot", "Gust", "Gyro Ball", "Géiser Fotónico", "Hachazo Pétreo", "Hail", "Hammer Arm", "Happy Hour", "Harden", "Haze", "Head Charge", "Head Smash", "Headbutt", "Heal Bell", "Heal Block", "Heal Order", "Heal Pulse", "Healing Wish", "Heart Stamp", "Heart Swap", "Heat Crash", "Heat Wave", "Heavy Slam", "Helping Hand", "Hex", "Hidden Power", "Hidroariete", "Hidrovapor", "High Jump Kick", "Hilo Venenoso", "Hipertaladro", "Hold Back", "Hold Hands", "Homenaje Póstumo", "Hone Claws", "Hora del Té", "Horn Attack", "Horn Drill", "Horn Leech", "Howl", "Hueso Sombrío", "Hurricane", "Hydro Cannon", "Hydro Pump", "Hyper Beam", "Hyper Fang", "Hyper Voice", "Hyperspace Fury", "Hyperspace Hole", "Hypnosis", "Ice Ball", "Ice Beam", "Ice Burn", "Ice Fang", "Ice Punch", "Ice Shard", "Icicle Crash", "Icicle Spear", "Icy Wind", "Imprison", "Incinerate", "Inferno", "Infestation", "Ingrain", "Ion Deluge", "Iron Defense", "Iron Head", "Iron Tail", "Irreverencia", "Joltioparálisis", "Judgment", "Jump Kick", "Karate Chop", "Kinesis", "King's Shield", "Knock Off", "Land's Wrath", "Lanza Glacial", "Lariat Oscuro", "Last Resort", "Lava Plume", "Leaf Blade", "Leaf Storm", "Leaf Tornado", "Leafitobombas", "Leech Life", "Leech Seed", "Leer", "Lick", "Light Screen", "Light of Ruin", "Limpieza General", "Llama Final", "Llama Protectora", "Lock-On", "Lovely Kiss", "Low Kick", "Low Sweep", "Lucky Chant", "Luna Roja", "Lunar Dance", "Luster Purge", "Luz Devastadora", "Láser Doble", "Láser Prisma", "Láser Veleidoso", "Látigo Ígneo", "Mach Punch", "Magic Coat", "Magic Room", "Magical Leaf", "Magma Storm", "Magnet Bomb", "Magnet Rise", "Magnetic Flux", "Magnitude", "Mandato", "Marcha Espectral", "Martillo Colosal", "Martillo Dragón", "Martillo Hielo", "Mat Block", "Me First", "Mean Look", "Meditate", "Mega Drain", "Mega Kick", "Mega Punch", "Megahorn", "Memento", "Metal Burst", "Metal Claw", "Metal Sound", "Metaláser", "Meteoimpacto", "Meteor Mash", "Metronome", "Mil Púas Tóxicas", "Milk Drink", "Mimic", "Mind Reader", "Minimize", "Miracle Eye", "Mirada Heladora", "Mirror Coat", "Mirror Move", "Mirror Shot", "Mist", "Mist Ball", "Misty Terrain", "Moluscañón", "Moonblast", "Moonlight", "Morning Sun", "Motivación", "Mud Bomb", "Mud Shot", "Mud Sport", "Mud-Slap", "Muddy Water", "Multiataque", "Mystical Fire", "Nasty Plot", "Natural Gift", "Nature Power", "Needle Arm", "Night Daze", "Night Shade", "Night Slash", "Nightmare", "Nitrochoque", "Noble Roar", "Nuzzle", "Núcleo Castigo", "Oblivion Wing", "Obstrucción", "Octazooka", "Octopresa", "Odor Sleuth", "Ojos Llorosos", "Ominochoque", "Ominous Wind", "Orbes Espectro", "Origin Pulse", "Outrage", "Overheat", "Oído Cocina", "Pain Split", "Paisaje Nevado", "Palma Rauda", "Parabolic Charge", "Parting Shot", "Patada Hacha", "Patada Relámpago", "Patada Tropical", "Pataleta", "Pay Day", "Payback", "Peck", "Perish Song", "Petal Blizzard", "Petal Dance", "Phantom Force", "Pico Cañón", "Pikatormenta", "Pikaturbo", "Pin Missile", "Pirochoque", "Pirueta Helada", "Piñón Auxiliar", "Plancha", "Plancha Corporal", "Plancha Voltaica", "Play Nice", "Play Rough", "Plegaria Lunar", "Plegaria Vital", "Pluck", "Poder Místico", "Poison Fang", "Poison Gas", "Poison Jab", "Poison Powder", "Poison Sting", "Poison Tail", "Poltergeist", "Polvo Mágico", "Pound", "Powder", "Powder Snow", "Power Gem", "Power Split", "Power Swap", "Power Trick", "Power Whip", "Power-Up Punch", "Precipice Blades", "Prensa Metálica", "Presa Maxilar", "Present", "Proliferación", "Protect", "Psicocolmillo", "Psicohojas", "Psicorruido", "Psybeam", "Psych Up", "Psychic", "Psycho Boost", "Psycho Cut", "Psycho Shift", "Psyshock", "Psystrike", "Psywave", "Pugnachoque", "Pulso de Campo", "Punishment", "Puntada Sombría", "Punzada Rama", "Purificación", "Pursuit", "Puño Furia", "Puño Jet", "Puños Plasma", "Quash", "Quemarrueda", "Quick Attack", "Quick Guard", "Quiver Dance", "Rage", "Rage Powder", "Rain Dance", "Rapid Spin", "Rayo Infinito", "Rayo Meteórico", "Rayo Umbrío", "Razor Leaf", "Razor Shell", "Razor Wind", "Recogearena", "Recover", "Recycle", "Reflect", "Reflect Type", "Refresh", "Relic Song", "Relámpago Súbito", "Rencor Reprimido", "Resarcimiento", "Rest", "Retaliate", "Retracción", "Return", "Revenge", "Reversal", "Roar", "Roar of Time", "Robasombra", "Roca Veloz", "Rock Blast", "Rock Climb", "Rock Polish", "Rock Slide", "Rock Smash", "Rock Throw", "Rock Tomb", "Rock Wrecker", "Role Play", "Rolling Kick", "Rollout", "Roost", "Rototiller", "Round", "Rueda Aural", "Ráfaga Escamas", "Sacred Fire", "Sacred Sword", "Safeguard", "Salazón", "Salpikasurf", "Sand Attack", "Sand Tomb", "Sandstorm", "Scald", "Scary Face", "Scratch", "Screech", "Searing Shot", "Secret Power", "Secret Sword", "Seed Bomb", "Seed Flare", "Seismic Toss", "Self-Destruct", "Shadow Ball", "Shadow Claw", "Shadow Force", "Shadow Punch", "Shadow Sneak", "Sharpen", "Sheer Cold", "Shell Smash", "Shift Gear", "Shock Wave", "Signal Beam", "Silver Wind", "Simple Beam", "Simún de Arena", "Sing", "Sketch", "Skill Swap", "Skull Bash", "Sky Attack", "Sky Drop", "Sky Uppercut", "Slack Off", "Slam", "Slash", "Sleep Powder", "Sleep Talk", "Sludge", "Sludge Bomb", "Sludge Wave", "Smack Down", "Smelling Salts", "Smog", "Smokescreen", "Snarl", "Snatch", "Snore", "Soak", "Soft-Boiled", "Solar Beam", "Sonic Boom", "Spacial Rend", "Spark", "Spider Web", "Spike Cannon", "Spikes", "Spiky Shield", "Spit Up", "Spite", "Splash", "Spore", "Stealth Rock", "Steam Eruption", "Steamroller", "Steel Wing", "Sticky Web", "Stockpile", "Stomp", "Stone Edge", "Stored Power", "Storm Throw", "Strength", "String Shot", "Struggle", "Struggle Bug", "Stun Spore", "Submission", "Substitute", "Sucker Punch", "Sunny Day", "Super Fang", "Superpower", "Supersonic", "Surf", "Swagger", "Swallow", "Sweet Kiss", "Sweet Scent", "Swift", "Switcheroo", "Swords Dance", "Sylveotornado", "Synchronoise", "Synthesis", "Tackle", "Tail Glow", "Tail Slap", "Tail Whip", "Tailwind", "Tajo Acuático", "Tajo Metralla", "Tajo Supremo", "Tajo Taquión", "Take Down", "Taunt", "Techno Blast", "Teeter Dance", "Telatrampa", "Telekinesis", "Teleport", "Teraclúster", "Teraexplosión", "Thief", "Thousand Arrows", "Thousand Waves", "Thrash", "Thunder", "Thunder Fang", "Thunder Punch", "Thunder Shock", "Thunder Wave", "Thunderbolt", "Tickle", "Topsy-Turvy", "Torment", "Toxic", "Toxic Spikes", "Transform", "Tri Attack", "Trick", "Trick Room", "Trick-or-Treat", "Triple Axel", "Triple Flecha", "Triple Inmersión", "Triple Kick", "Truco Floral", "Trump Card", "Twineedle", "Twister", "U-turn", "Umbreozona", "Uproar", "V-create", "Vacuum Wave", "Vapodrenaje", "Vasta Fuerza", "Vasto Impacto", "Velo Aurora", "Venom Drench", "Venoshock", "Viento Carámbano", "Vine Whip", "Viraje", "Vise Grip", "Vital Throw", "Volt Switch", "Volt Tackle", "Wake-Up Slap", "Water Gun", "Water Pledge", "Water Pulse", "Water Shuriken", "Water Sport", "Water Spout", "Waterfall", "Weather Ball", "Whirlpool", "Whirlwind", "Wide Guard", "Wild Charge", "Will-O-Wisp", "Wing Attack", "Wish", "Withdraw", "Wonder Room", "Wood Hammer", "Work Up", "Worry Seed", "Wrap", "Wring Out", "X-Scissor", "Yawn", "Zap Cannon", "Zen Headbutt", "}", "Ácido Málico"];
const DB_MOVE_META = {"Bubble": {"es": "Burbuja", "t": "Water", "c": "Special"}, "Waterfall": {"es": "Cascada", "t": "Water", "c": "Physical"}, "Hydro Pump": {"es": "Hidrobomba", "t": "Water", "c": "Special"}, "Crabhammer": {"es": "Martillazo", "t": "Water", "c": "Physical"}, "Water Gun": {"es": "Pistola Agua", "t": "Water", "c": "Special"}, "Bubble Beam": {"es": "Rayo Burbuja", "t": "Water", "c": "Special"}, "Withdraw": {"es": "Refugio", "t": "Water", "c": "Status"}, "Surf": {"es": "Surf", "t": "Water", "c": "Special"}, "Clamp": {"es": "Tenaza", "t": "Water", "c": "Physical"}, "Leech Life": {"es": "Chupavidas", "t": "Bug", "c": "Physical"}, "String Shot": {"es": "Disparo Demora", "t": "Bug", "c": "Status"}, "Twineedle": {"es": "Doble Ataque", "t": "Bug", "c": "Physical"}, "Pin Missile": {"es": "Pin Misil", "t": "Bug", "c": "Physical"}, "Dragon Rage": {"es": "Furia Dragón", "t": "Dragon", "c": "Special"}, "Thunder Shock": {"es": "Impactrueno", "t": "Electric", "c": "Special"}, "Thunder Wave": {"es": "Onda Trueno", "t": "Electric", "c": "Status"}, "Thunder Punch": {"es": "Puño Trueno", "t": "Electric", "c": "Physical"}, "Thunderbolt": {"es": "Rayo", "t": "Electric", "c": "Special"}, "Thunder": {"es": "Trueno", "t": "Electric", "c": "Special"}, "Lick": {"es": "Lengüetazo", "t": "Ghost", "c": "Physical"}, "Confuse Ray": {"es": "Rayo Confuso", "t": "Ghost", "c": "Status"}, "Night Shade": {"es": "Tinieblas", "t": "Ghost", "c": "Special"}, "Ember": {"es": "Ascuas", "t": "Fire", "c": "Special"}, "Fire Spin": {"es": "Giro Fuego", "t": "Fire", "c": "Special"}, "Flamethrower": {"es": "Lanzallamas", "t": "Fire", "c": "Special"}, "Fire Blast": {"es": "Llamarada", "t": "Fire", "c": "Special"}, "Fire Punch": {"es": "Puño Fuego", "t": "Fire", "c": "Physical"}, "Mist": {"es": "Neblina", "t": "Ice", "c": "Status"}, "Haze": {"es": "Niebla", "t": "Ice", "c": "Status"}, "Ice Punch": {"es": "Puño Hielo", "t": "Ice", "c": "Physical"}, "Aurora Beam": {"es": "Rayo Aurora", "t": "Ice", "c": "Special"}, "Ice Beam": {"es": "Rayo Hielo", "t": "Ice", "c": "Special"}, "Blizzard": {"es": "Ventisca", "t": "Ice", "c": "Special"}, "Counter": {"es": "Contraataque", "t": "Fighting", "c": "Physical"}, "Double Kick": {"es": "Doble Patada", "t": "Fighting", "c": "Physical"}, "Karate Chop": {"es": "Golpe Kárate", "t": "Fighting", "c": "Physical"}, "Low Kick": {"es": "Patada Baja", "t": "Fighting", "c": "Physical"}, "Rolling Kick": {"es": "Patada Giro", "t": "Fighting", "c": "Physical"}, "Jump Kick": {"es": "Patada Salto", "t": "Fighting", "c": "Physical"}, "High Jump Kick": {"es": "Patada Salto Alta", "t": "Fighting", "c": "Physical"}, "Seismic Toss": {"es": "Sísmico", "t": "Fighting", "c": "Physical"}, "Submission": {"es": "Sumisión", "t": "Fighting", "c": "Physical"}, "Sharpen": {"es": "Afilar", "t": "Normal", "c": "Status"}, "Vise Grip": {"es": "Agarre", "t": "Normal", "c": "Physical"}, "Disable": {"es": "Anulación", "t": "Normal", "c": "Status"}, "Scratch": {"es": "Arañazo", "t": "Normal", "c": "Physical"}, "Bind": {"es": "Atadura", "t": "Normal", "c": "Physical"}, "Fury Attack": {"es": "Ataque Furia", "t": "Normal", "c": "Physical"}, "Quick Attack": {"es": "Ataque Rápido", "t": "Normal", "c": "Physical"}, "Slam": {"es": "Atizar", "t": "Normal", "c": "Physical"}, "Self-Destruct": {"es": "Autodestrucción", "t": "Normal", "c": "Physical"}, "Lovely Kiss": {"es": "Beso Amoroso", "t": "Normal", "c": "Status"}, "Egg Bomb": {"es": "Bomba Huevo", "t": "Normal", "c": "Physical"}, "Sonic Boom": {"es": "Bomba Sónica", "t": "Normal", "c": "Special"}, "Barrage": {"es": "Bombardeo", "t": "Normal", "c": "Physical"}, "Skull Bash": {"es": "Cabezazo", "t": "Normal", "c": "Physical"}, "Sing": {"es": "Canto", "t": "Normal", "c": "Status"}, "Screech": {"es": "Chirrido", "t": "Normal", "c": "Status"}, "Spike Cannon": {"es": "Clavo Cañón", "t": "Normal", "c": "Physical"}, "Wrap": {"es": "Constricción", "t": "Normal", "c": "Physical"}, "Conversion": {"es": "Conversión", "t": "Normal", "c": "Status"}, "Horn Attack": {"es": "Cornada", "t": "Normal", "c": "Physical"}, "Cut": {"es": "Corte", "t": "Normal", "c": "Physical"}, "Slash": {"es": "Cuchillada", "t": "Normal", "c": "Physical"}, "Swords Dance": {"es": "Danza Espada", "t": "Normal", "c": "Status"}, "Take Down": {"es": "Derribo", "t": "Normal", "c": "Physical"}, "Growth": {"es": "Desarrollo", "t": "Normal", "c": "Status"}, "Glare": {"es": "Deslumbrar", "t": "Normal", "c": "Status"}, "Flash": {"es": "Destello", "t": "Normal", "c": "Status"}, "Pound": {"es": "Destructor", "t": "Normal", "c": "Physical"}, "Pay Day": {"es": "Día de Pago", "t": "Normal", "c": "Physical"}, "Double Slap": {"es": "Doble Bofetón", "t": "Normal", "c": "Physical"}, "Double Team": {"es": "Doble Equipo", "t": "Normal", "c": "Status"}, "Double-Edge": {"es": "Doble Filo", "t": "Normal", "c": "Physical"}, "Explosion": {"es": "Explosión", "t": "Normal", "c": "Physical"}, "Focus Energy": {"es": "Foco Energía", "t": "Normal", "c": "Status"}, "Struggle": {"es": "Forcejeo", "t": "Normal", "c": "Physical"}, "Harden": {"es": "Fortaleza", "t": "Normal", "c": "Status"}, "Strength": {"es": "Fuerza", "t": "Normal", "c": "Physical"}, "Rage": {"es": "Furia", "t": "Normal", "c": "Physical"}, "Headbutt": {"es": "Golpe Cabeza", "t": "Normal", "c": "Physical"}, "Body Slam": {"es": "Golpe Cuerpo", "t": "Normal", "c": "Physical"}, "Fury Swipes": {"es": "Golpes Furia", "t": "Normal", "c": "Physical"}, "Growl": {"es": "Gruñido", "t": "Normal", "c": "Status"}, "Guillotine": {"es": "Guillotina", "t": "Normal", "c": "Physical"}, "Hyper Fang": {"es": "Hipercolmillo", "t": "Normal", "c": "Physical"}, "Hyper Beam": {"es": "Hiperrayo", "t": "Normal", "c": "Special"}, "Tail Whip": {"es": "Látigo", "t": "Normal", "c": "Status"}, "Leer": {"es": "Malicioso", "t": "Normal", "c": "Status"}, "Mega Kick": {"es": "Megapatada", "t": "Normal", "c": "Physical"}, "Mega Punch": {"es": "Megapuño", "t": "Normal", "c": "Physical"}, "Swift": {"es": "Meteoros", "t": "Normal", "c": "Special"}, "Metronome": {"es": "Metrónomo", "t": "Normal", "c": "Status"}, "Mimic": {"es": "Mimético", "t": "Normal", "c": "Status"}, "Soft-Boiled": {"es": "Ovocuración", "t": "Normal", "c": "Status"}, "Smokescreen": {"es": "Pantalla de Humo", "t": "Normal", "c": "Status"}, "Horn Drill": {"es": "Perforador", "t": "Normal", "c": "Physical"}, "Stomp": {"es": "Pisotón", "t": "Normal", "c": "Physical"}, "Tackle": {"es": "Placaje", "t": "Normal", "c": "Physical"}, "Comet Punch": {"es": "Puño Cometa", "t": "Normal", "c": "Physical"}, "Dizzy Punch": {"es": "Puño Mareo", "t": "Normal", "c": "Physical"}, "Recover": {"es": "Recuperación", "t": "Normal", "c": "Status"}, "Minimize": {"es": "Reducción", "t": "Normal", "c": "Status"}, "Whirlwind": {"es": "Remolino", "t": "Normal", "c": "Status"}, "Constrict": {"es": "Restricción", "t": "Normal", "c": "Physical"}, "Defense Curl": {"es": "Rizo Defensa", "t": "Normal", "c": "Status"}, "Roar": {"es": "Rugido", "t": "Normal", "c": "Status"}, "Splash": {"es": "Salpicadura", "t": "Normal", "c": "Status"}, "Thrash": {"es": "Saña", "t": "Normal", "c": "Physical"}, "Super Fang": {"es": "Superdiente", "t": "Normal", "c": "Physical"}, "Supersonic": {"es": "Supersónico", "t": "Normal", "c": "Status"}, "Substitute": {"es": "Sustituto", "t": "Normal", "c": "Status"}, "Transform": {"es": "Transformación", "t": "Normal", "c": "Status"}, "Tri Attack": {"es": "Triataque", "t": "Normal", "c": "Special"}, "Bide": {"es": "Venganza", "t": "Normal", "c": "Physical"}, "Razor Wind": {"es": "Viento Cortante", "t": "Normal", "c": "Special"}, "Absorb": {"es": "Absorber", "t": "Grass", "c": "Special"}, "Petal Dance": {"es": "Danza Pétalo", "t": "Grass", "c": "Special"}, "Leech Seed": {"es": "Drenadoras", "t": "Grass", "c": "Status"}, "Spore": {"es": "Espora", "t": "Grass", "c": "Status"}, "Razor Leaf": {"es": "Hoja Afilada", "t": "Grass", "c": "Physical"}, "Vine Whip": {"es": "Látigo Cepa", "t": "Grass", "c": "Physical"}, "Mega Drain": {"es": "Megaagotar", "t": "Grass", "c": "Special"}, "Stun Spore": {"es": "Paralizador", "t": "Grass", "c": "Status"}, "Solar Beam": {"es": "Rayo Solar", "t": "Grass", "c": "Special"}, "Sleep Powder": {"es": "Somnífero", "t": "Grass", "c": "Status"}, "Agility": {"es": "Agilidad", "t": "Psychic", "c": "Status"}, "Amnesia": {"es": "Amnesia", "t": "Psychic", "c": "Status"}, "Barrier": {"es": "Barrera", "t": "Psychic", "c": "Status"}, "Dream Eater": {"es": "Comesueños", "t": "Psychic", "c": "Special"}, "Confusion": {"es": "Confusión", "t": "Psychic", "c": "Special"}, "Rest": {"es": "Descanso", "t": "Psychic", "c": "Status"}, "Hypnosis": {"es": "Hipnosis", "t": "Psychic", "c": "Status"}, "Kinesis": {"es": "Kinético", "t": "Psychic", "c": "Status"}, "Meditate": {"es": "Meditación", "t": "Psychic", "c": "Status"}, "Light Screen": {"es": "Pantalla de Luz", "t": "Psychic", "c": "Status"}, "Psywave": {"es": "Psicoonda", "t": "Psychic", "c": "Special"}, "Psybeam": {"es": "Psicorrayo", "t": "Psychic", "c": "Special"}, "Psychic": {"es": "Psíquico", "t": "Psychic", "c": "Special"}, "Reflect": {"es": "Reflejo", "t": "Psychic", "c": "Status"}, "Teleport": {"es": "Teletransporte", "t": "Psychic", "c": "Status"}, "Rock Slide": {"es": "Avalancha", "t": "Rock", "c": "Physical"}, "Rock Throw": {"es": "Lanzarrocas", "t": "Rock", "c": "Physical"}, "Bite": {"es": "Mordisco", "t": "Dark", "c": "Physical"}, "Sand Attack": {"es": "Ataque Arena", "t": "Ground", "c": "Status"}, "Dig": {"es": "Excavar", "t": "Ground", "c": "Physical"}, "Fissure": {"es": "Fisura", "t": "Ground", "c": "Physical"}, "Bone Club": {"es": "Hueso Palo", "t": "Ground", "c": "Physical"}, "Bonemerang": {"es": "Huesomerang", "t": "Ground", "c": "Physical"}, "Earthquake": {"es": "Terremoto", "t": "Ground", "c": "Physical"}, "Acid": {"es": "Ácido", "t": "Poison", "c": "Special"}, "Acid Armor": {"es": "Armadura Ácida", "t": "Poison", "c": "Status"}, "Poison Gas": {"es": "Gas Venenoso", "t": "Poison", "c": "Status"}, "Poison Sting": {"es": "Picotazo Veneno", "t": "Poison", "c": "Physical"}, "Smog": {"es": "Polución", "t": "Poison", "c": "Special"}, "Poison Powder": {"es": "Polvo Veneno", "t": "Poison", "c": "Status"}, "Sludge": {"es": "Residuos", "t": "Poison", "c": "Special"}, "Toxic": {"es": "Tóxico", "t": "Poison", "c": "Status"}, "Sky Attack": {"es": "Ataque Aéreo", "t": "Flying", "c": "Physical"}, "Wing Attack": {"es": "Ataque Ala", "t": "Flying", "c": "Physical"}, "Mirror Move": {"es": "Espejo", "t": "Flying", "c": "Status"}, "Drill Peck": {"es": "Pico Taladro", "t": "Flying", "c": "Physical"}, "Peck": {"es": "Picotazo", "t": "Flying", "c": "Physical"}, "Gust": {"es": "Tornado", "t": "Flying", "c": "Special"}, "Fly": {"es": "Vuelo", "t": "Flying", "c": "Physical"}, "Steel Wing": {"es": "Ala de Acero", "t": "Steel", "c": "Physical"}, "Iron Tail": {"es": "Cola Férrea", "t": "Steel", "c": "Physical"}, "Metal Claw": {"es": "Garra Metal", "t": "Steel", "c": "Physical"}, "Rain Dance": {"es": "Danza Lluvia", "t": "Water", "c": "Status"}, "Octazooka": {"es": "Pulpocañón", "t": "Water", "c": "Special"}, "Whirlpool": {"es": "Torbellino", "t": "Water", "c": "Special"}, "Fury Cutter": {"es": "Corte Furia", "t": "Bug", "c": "Physical"}, "Megahorn": {"es": "Megacuerno", "t": "Bug", "c": "Physical"}, "Spider Web": {"es": "Telaraña", "t": "Bug", "c": "Status"}, "Twister": {"es": "Ciclón", "t": "Dragon", "c": "Special"}, "Dragon Breath": {"es": "Dragoaliento", "t": "Dragon", "c": "Special"}, "Outrage": {"es": "Enfado", "t": "Dragon", "c": "Physical"}, "Spark": {"es": "Chispa", "t": "Electric", "c": "Physical"}, "Zap Cannon": {"es": "Electrocañón", "t": "Electric", "c": "Special"}, "Shadow Ball": {"es": "Bola Sombra", "t": "Ghost", "c": "Special"}, "Curse": {"es": "Maldición", "t": "Ghost", "c": "Status"}, "Destiny Bond": {"es": "Mismo Destino", "t": "Ghost", "c": "Status"}, "Nightmare": {"es": "Pesadilla", "t": "Ghost", "c": "Status"}, "Spite": {"es": "Rencor", "t": "Ghost", "c": "Status"}, "Sunny Day": {"es": "Día Soleado", "t": "Fire", "c": "Status"}, "Sacred Fire": {"es": "Fuego Sagrado", "t": "Fire", "c": "Physical"}, "Flame Wheel": {"es": "Rueda Fuego", "t": "Fire", "c": "Physical"}, "Sweet Kiss": {"es": "Beso Dulce", "t": "Fairy", "c": "Status"}, "Charm": {"es": "Encanto", "t": "Fairy", "c": "Status"}, "Moonlight": {"es": "Luz Lunar", "t": "Fairy", "c": "Status"}, "Powder Snow": {"es": "Nieve Polvo", "t": "Ice", "c": "Special"}, "Icy Wind": {"es": "Viento Hielo", "t": "Ice", "c": "Special"}, "Detect": {"es": "Detección", "t": "Fighting", "c": "Status"}, "Rock Smash": {"es": "Golpe Roca", "t": "Fighting", "c": "Physical"}, "Reversal": {"es": "Inversión", "t": "Fighting", "c": "Physical"}, "Vital Throw": {"es": "Llave Vital", "t": "Fighting", "c": "Physical"}, "Dynamic Punch": {"es": "Puño Dinámico", "t": "Fighting", "c": "Physical"}, "Cross Chop": {"es": "Tajo Cruzado", "t": "Fighting", "c": "Physical"}, "Triple Kick": {"es": "Triple Patada", "t": "Fighting", "c": "Physical"}, "Mach Punch": {"es": "Ultrapuño", "t": "Fighting", "c": "Physical"}, "Endure": {"es": "Aguante", "t": "Normal", "c": "Status"}, "Attract": {"es": "Atracción", "t": "Normal", "c": "Status"}, "Psych Up": {"es": "Autosugestión", "t": "Normal", "c": "Status"}, "Flail": {"es": "Azote", "t": "Normal", "c": "Physical"}, "Milk Drink": {"es": "Batido", "t": "Normal", "c": "Status"}, "Perish Song": {"es": "Canto Mortal", "t": "Normal", "c": "Status"}, "Scary Face": {"es": "Cara Susto", "t": "Normal", "c": "Status"}, "Heal Bell": {"es": "Cascabel Cura", "t": "Normal", "c": "Status"}, "Swagger": {"es": "Contoneo", "t": "Normal", "c": "Status"}, "Conversion 2": {"es": "Conversión2", "t": "Normal", "c": "Status"}, "Pain Split": {"es": "Divide Dolor", "t": "Normal", "c": "Status"}, "Sweet Scent": {"es": "Dulce Aroma", "t": "Normal", "c": "Status"}, "Sketch": {"es": "Esquema", "t": "Normal", "c": "Status"}, "False Swipe": {"es": "Falso Tortazo", "t": "Normal", "c": "Physical"}, "Lock-On": {"es": "Fijar Blanco", "t": "Normal", "c": "Status"}, "Frustration": {"es": "Frustración", "t": "Normal", "c": "Physical"}, "Rapid Spin": {"es": "Giro Rápido", "t": "Normal", "c": "Physical"}, "Mean Look": {"es": "Mal de Ojo", "t": "Normal", "c": "Status"}, "Encore": {"es": "Otra Vez", "t": "Normal", "c": "Status"}, "Hidden Power": {"es": "Poder Oculto", "t": "Normal", "c": "Special"}, "Present": {"es": "Presente", "t": "Normal", "c": "Physical"}, "Foresight": {"es": "Profecía", "t": "Normal", "c": "Status"}, "Protect": {"es": "Protección", "t": "Normal", "c": "Status"}, "Baton Pass": {"es": "Relevo", "t": "Normal", "c": "Status"}, "Return": {"es": "Retribución", "t": "Normal", "c": "Physical"}, "Snore": {"es": "Ronquido", "t": "Normal", "c": "Special"}, "Morning Sun": {"es": "Sol Matinal", "t": "Normal", "c": "Status"}, "Sleep Talk": {"es": "Sonámbulo", "t": "Normal", "c": "Status"}, "Belly Drum": {"es": "Tambor", "t": "Normal", "c": "Status"}, "Mind Reader": {"es": "Telépata", "t": "Normal", "c": "Status"}, "Safeguard": {"es": "Velo Sagrado", "t": "Normal", "c": "Status"}, "Extreme Speed": {"es": "Velocidad Extrema", "t": "Normal", "c": "Physical"}, "Cotton Spore": {"es": "Esporagodón", "t": "Grass", "c": "Status"}, "Giga Drain": {"es": "Gigadrenado", "t": "Grass", "c": "Special"}, "Synthesis": {"es": "Síntesis", "t": "Grass", "c": "Status"}, "Mirror Coat": {"es": "Manto Espejo", "t": "Psychic", "c": "Special"}, "Future Sight": {"es": "Premonición", "t": "Psychic", "c": "Special"}, "Ancient Power": {"es": "Poder Pasado", "t": "Rock", "c": "Special"}, "Rollout": {"es": "Rodar", "t": "Rock", "c": "Physical"}, "Sandstorm": {"es": "Tormenta de Arena", "t": "Rock", "c": "Status"}, "Feint Attack": {"es": "Finta", "t": "Dark", "c": "Physical"}, "Thief": {"es": "Ladrón", "t": "Dark", "c": "Physical"}, "Beat Up": {"es": "Paliza", "t": "Dark", "c": "Physical"}, "Pursuit": {"es": "Persecución", "t": "Dark", "c": "Physical"}, "Crunch": {"es": "Triturar", "t": "Dark", "c": "Physical"}, "Bone Rush": {"es": "Ataque Óseo", "t": "Ground", "c": "Physical"}, "Mud-Slap": {"es": "Bofetón Lodo", "t": "Ground", "c": "Special"}, "Magnitude": {"es": "Magnitud", "t": "Ground", "c": "Physical"}, "Spikes": {"es": "Púas", "t": "Ground", "c": "Status"}, "Sludge Bomb": {"es": "Bomba Lodo", "t": "Poison", "c": "Special"}, "Aeroblast": {"es": "Aerochorro", "t": "Flying", "c": "Special"}, "Iron Defense": {"es": "Defensa Férrea", "t": "Steel", "c": "Status"}, "Doom Desire": {"es": "Deseo Oculto", "t": "Steel", "c": "Special"}, "Metal Sound": {"es": "Eco Metálico", "t": "Steel", "c": "Status"}, "Meteor Mash": {"es": "Puño Meteoro", "t": "Steel", "c": "Physical"}, "Muddy Water": {"es": "Agua Lodosa", "t": "Water", "c": "Special"}, "Dive": {"es": "Buceo", "t": "Water", "c": "Physical"}, "Hydro Cannon": {"es": "Hidrocañón", "t": "Water", "c": "Special"}, "Water Sport": {"es": "Hidrochorro", "t": "Water", "c": "Status"}, "Water Pulse": {"es": "Hidropulso", "t": "Water", "c": "Special"}, "Water Spout": {"es": "Salpicar", "t": "Water", "c": "Special"}, "Tail Glow": {"es": "Luminicola", "t": "Bug", "c": "Status"}, "Signal Beam": {"es": "Rayo Señal", "t": "Bug", "c": "Special"}, "Silver Wind": {"es": "Viento Plata", "t": "Bug", "c": "Special"}, "Dragon Dance": {"es": "Danza Dragón", "t": "Dragon", "c": "Status"}, "Dragon Claw": {"es": "Garra Dragón", "t": "Dragon", "c": "Physical"}, "Charge": {"es": "Carga", "t": "Electric", "c": "Status"}, "Shock Wave": {"es": "Onda Voltio", "t": "Electric", "c": "Special"}, "Volt Tackle": {"es": "Placaje Eléctrico", "t": "Electric", "c": "Physical"}, "Astonish": {"es": "Impresionar", "t": "Ghost", "c": "Physical"}, "Shadow Punch": {"es": "Puño Sombra", "t": "Ghost", "c": "Physical"}, "Grudge": {"es": "Rabia", "t": "Ghost", "c": "Status"}, "Blast Burn": {"es": "Anillo Ígneo", "t": "Fire", "c": "Special"}, "Eruption": {"es": "Estallido", "t": "Fire", "c": "Special"}, "Will-O-Wisp": {"es": "Fuego Fatuo", "t": "Fire", "c": "Status"}, "Heat Wave": {"es": "Onda Ígnea", "t": "Fire", "c": "Special"}, "Blaze Kick": {"es": "Patada Ígnea", "t": "Fire", "c": "Physical"}, "Overheat": {"es": "Sofoco", "t": "Fire", "c": "Special"}, "Ice Ball": {"es": "Bola Hielo", "t": "Ice", "c": "Physical"}, "Icicle Spear": {"es": "Carámbano", "t": "Ice", "c": "Physical"}, "Sheer Cold": {"es": "Frío Polar", "t": "Ice", "c": "Special"}, "Hail": {"es": "Granizo", "t": "Ice", "c": "Status"}, "Bulk Up": {"es": "Corpulencia", "t": "Fighting", "c": "Status"}, "Brick Break": {"es": "Demolición", "t": "Fighting", "c": "Physical"}, "Revenge": {"es": "Desquite", "t": "Fighting", "c": "Physical"}, "Arm Thrust": {"es": "Empujón", "t": "Fighting", "c": "Physical"}, "Superpower": {"es": "Fuerza Bruta", "t": "Fighting", "c": "Physical"}, "Sky Uppercut": {"es": "Gancho Alto", "t": "Fighting", "c": "Physical"}, "Focus Punch": {"es": "Puño Certero", "t": "Fighting", "c": "Physical"}, "Nature Power": {"es": "Adaptación", "t": "Normal", "c": "Status"}, "Uproar": {"es": "Alboroto", "t": "Normal", "c": "Special"}, "Refresh": {"es": "Alivio", "t": "Normal", "c": "Status"}, "Covet": {"es": "Antojo", "t": "Normal", "c": "Physical"}, "Howl": {"es": "Aullido", "t": "Normal", "c": "Status"}, "Assist": {"es": "Ayuda", "t": "Normal", "c": "Status"}, "Block": {"es": "Bloqueo", "t": "Normal", "c": "Status"}, "Yawn": {"es": "Bostezo", "t": "Normal", "c": "Status"}, "Camouflage": {"es": "Camuflaje", "t": "Normal", "c": "Status"}, "Tickle": {"es": "Cosquillas", "t": "Normal", "c": "Status"}, "Teeter Dance": {"es": "Danza Caos", "t": "Normal", "c": "Status"}, "Secret Power": {"es": "Daño Secreto", "t": "Normal", "c": "Physical"}, "Wish": {"es": "Deseo", "t": "Normal", "c": "Status"}, "Spit Up": {"es": "Escupir", "t": "Normal", "c": "Special"}, "Endeavor": {"es": "Esfuerzo", "t": "Normal", "c": "Physical"}, "Smelling Salts": {"es": "Estímulo", "t": "Normal", "c": "Physical"}, "Crush Claw": {"es": "Garra Brutal", "t": "Normal", "c": "Physical"}, "Facade": {"es": "Imagen", "t": "Normal", "c": "Physical"}, "Weather Ball": {"es": "Meteorobola", "t": "Normal", "c": "Special"}, "Odor Sleuth": {"es": "Rastreo", "t": "Normal", "c": "Status"}, "Recycle": {"es": "Reciclaje", "t": "Normal", "c": "Status"}, "Helping Hand": {"es": "Refuerzo", "t": "Normal", "c": "Status"}, "Slack Off": {"es": "Relajo", "t": "Normal", "c": "Status"}, "Stockpile": {"es": "Reserva", "t": "Normal", "c": "Status"}, "Follow Me": {"es": "Señuelo", "t": "Normal", "c": "Status"}, "Fake Out": {"es": "Sorpresa", "t": "Normal", "c": "Physical"}, "Swallow": {"es": "Tragar", "t": "Normal", "c": "Status"}, "Hyper Voice": {"es": "Vozarrón", "t": "Normal", "c": "Special"}, "Aromatherapy": {"es": "Aromaterapia", "t": "Grass", "c": "Status"}, "Ingrain": {"es": "Arraigo", "t": "Grass", "c": "Status"}, "Needle Arm": {"es": "Brazo Pincho", "t": "Grass", "c": "Physical"}, "Leaf Blade": {"es": "Hoja Aguda", "t": "Grass", "c": "Physical"}, "Magical Leaf": {"es": "Hoja Mágica", "t": "Grass", "c": "Special"}, "Frenzy Plant": {"es": "Planta Feroz", "t": "Grass", "c": "Special"}, "Bullet Seed": {"es": "Semilladora", "t": "Grass", "c": "Physical"}, "Grass Whistle": {"es": "Silbato", "t": "Grass", "c": "Status"}, "Mist Ball": {"es": "Bola Neblina", "t": "Psychic", "c": "Special"}, "Magic Coat": {"es": "Capa Mágica", "t": "Psychic", "c": "Status"}, "Role Play": {"es": "Imitación", "t": "Psychic", "c": "Status"}, "Skill Swap": {"es": "Intercambio", "t": "Psychic", "c": "Status"}, "Cosmic Power": {"es": "Masa Cósmica", "t": "Psychic", "c": "Status"}, "Extrasensory": {"es": "Paranormal", "t": "Psychic", "c": "Special"}, "Calm Mind": {"es": "Paz Mental", "t": "Psychic", "c": "Status"}, "Psycho Boost": {"es": "Psicoataque", "t": "Psychic", "c": "Special"}, "Luster Purge": {"es": "Resplandor", "t": "Psychic", "c": "Special"}, "Imprison": {"es": "Sellar", "t": "Psychic", "c": "Status"}, "Trick": {"es": "Truco", "t": "Psychic", "c": "Status"}, "Rock Blast": {"es": "Pedrada", "t": "Rock", "c": "Physical"}, "Rock Tomb": {"es": "Tumba Rocas", "t": "Rock", "c": "Physical"}, "Flatter": {"es": "Camelo", "t": "Dark", "c": "Status"}, "Knock Off": {"es": "Desarme", "t": "Dark", "c": "Physical"}, "Memento": {"es": "Legado", "t": "Dark", "c": "Status"}, "Fake Tears": {"es": "Llanto Falso", "t": "Dark", "c": "Status"}, "Taunt": {"es": "Mofa", "t": "Dark", "c": "Status"}, "Snatch": {"es": "Robo", "t": "Dark", "c": "Status"}, "Torment": {"es": "Tormento", "t": "Dark", "c": "Status"}, "Sand Tomb": {"es": "Bucle Arena", "t": "Ground", "c": "Physical"}, "Mud Sport": {"es": "Chapoteo Lodo", "t": "Ground", "c": "Status"}, "Mud Shot": {"es": "Disparo Lodo", "t": "Ground", "c": "Special"}, "Poison Tail": {"es": "Cola Veneno", "t": "Poison", "c": "Physical"}, "Poison Fang": {"es": "Colmillo Veneno", "t": "Poison", "c": "Physical"}, "Air Cutter": {"es": "Aire Afilado", "t": "Flying", "c": "Special"}, "Bounce": {"es": "Bote", "t": "Flying", "c": "Physical"}, "Feather Dance": {"es": "Danza Pluma", "t": "Flying", "c": "Status"}, "Aerial Ace": {"es": "Golpe Aéreo", "t": "Flying", "c": "Physical"}, "Magnet Bomb": {"es": "Bomba Imán", "t": "Steel", "c": "Physical"}, "Iron Head": {"es": "Cabeza de Hierro", "t": "Steel", "c": "Physical"}, "Mirror Shot": {"es": "Disparo Espejo", "t": "Steel", "c": "Special"}, "Flash Cannon": {"es": "Cañón Resplandor", "t": "Steel", "c": "Special"}, "Gyro Ball": {"es": "Giro Bola", "t": "Steel", "c": "Physical"}, "Bullet Punch": {"es": "Puño Bala", "t": "Steel", "c": "Physical"}, "Metal Burst": {"es": "Represión Metal", "t": "Steel", "c": "Physical"}, "Aqua Ring": {"es": "Acua Aro", "t": "Water", "c": "Status"}, "Aqua Tail": {"es": "Acua Cola", "t": "Water", "c": "Physical"}, "Aqua Jet": {"es": "Acua Jet", "t": "Water", "c": "Physical"}, "Brine": {"es": "Salmuera", "t": "Water", "c": "Special"}, "Defend Order": {"es": "A Defender", "t": "Bug", "c": "Status"}, "Attack Order": {"es": "Al Ataque", "t": "Bug", "c": "Physical"}, "Heal Order": {"es": "Auxilio", "t": "Bug", "c": "Status"}, "U-turn": {"es": "Ida y Vuelta", "t": "Bug", "c": "Physical"}, "Bug Bite": {"es": "Picadura", "t": "Bug", "c": "Physical"}, "X-Scissor": {"es": "Tijera X", "t": "Bug", "c": "Physical"}, "Bug Buzz": {"es": "Zumbido", "t": "Bug", "c": "Special"}, "Dragon Rush": {"es": "Carga Dragón", "t": "Dragon", "c": "Physical"}, "Draco Meteor": {"es": "Cometa Draco", "t": "Dragon", "c": "Special"}, "Spacial Rend": {"es": "Corte Vacío", "t": "Dragon", "c": "Special"}, "Roar of Time": {"es": "Distorsión", "t": "Dragon", "c": "Special"}, "Dragon Pulse": {"es": "Pulso Dragón", "t": "Dragon", "c": "Special"}, "Discharge": {"es": "Chispazo", "t": "Electric", "c": "Special"}, "Thunder Fang": {"es": "Colmillo Rayo", "t": "Electric", "c": "Physical"}, "Magnet Rise": {"es": "Levitón", "t": "Electric", "c": "Status"}, "Charge Beam": {"es": "Rayo Carga", "t": "Electric", "c": "Special"}, "Shadow Claw": {"es": "Garra Umbría", "t": "Ghost", "c": "Physical"}, "Shadow Force": {"es": "Golpe Umbrío", "t": "Ghost", "c": "Physical"}, "Shadow Sneak": {"es": "Sombra Vil", "t": "Ghost", "c": "Physical"}, "Ominous Wind": {"es": "Viento Aciago", "t": "Ghost", "c": "Special"}, "Fire Fang": {"es": "Colmillo Ígneo", "t": "Fire", "c": "Physical"}, "Flare Blitz": {"es": "Envite Ígneo", "t": "Fire", "c": "Physical"}, "Lava Plume": {"es": "Humareda", "t": "Fire", "c": "Special"}, "Magma Storm": {"es": "Lluvia Ígnea", "t": "Fire", "c": "Special"}, "Avalanche": {"es": "Alud", "t": "Ice", "c": "Physical"}, "Ice Fang": {"es": "Colmillo Hielo", "t": "Ice", "c": "Physical"}, "Ice Shard": {"es": "Esquirla Helada", "t": "Ice", "c": "Physical"}, "Close Combat": {"es": "A Bocajarro", "t": "Fighting", "c": "Physical"}, "Aura Sphere": {"es": "Esfera Aural", "t": "Fighting", "c": "Special"}, "Wake-Up Slap": {"es": "Espabila", "t": "Fighting", "c": "Physical"}, "Hammer Arm": {"es": "Machada", "t": "Fighting", "c": "Physical"}, "Focus Blast": {"es": "Onda Certera", "t": "Fighting", "c": "Special"}, "Vacuum Wave": {"es": "Onda Vacío", "t": "Fighting", "c": "Special"}, "Force Palm": {"es": "Palmeo", "t": "Fighting", "c": "Physical"}, "Drain Punch": {"es": "Puño Drenaje", "t": "Fighting", "c": "Physical"}, "Acupressure": {"es": "Acupresión", "t": "Normal", "c": "Status"}, "Crush Grip": {"es": "Agarrón", "t": "Normal", "c": "Physical"}, "Feint": {"es": "Amago", "t": "Normal", "c": "Physical"}, "Trump Card": {"es": "As Oculto", "t": "Normal", "c": "Special"}, "Lucky Chant": {"es": "Conjuro", "t": "Normal", "c": "Status"}, "Copycat": {"es": "Copión", "t": "Normal", "c": "Status"}, "Double Hit": {"es": "Doble Golpe", "t": "Normal", "c": "Physical"}, "Natural Gift": {"es": "Don Natural", "t": "Normal", "c": "Physical"}, "Wring Out": {"es": "Estrujón", "t": "Normal", "c": "Special"}, "Giga Impact": {"es": "Gigaimpacto", "t": "Normal", "c": "Physical"}, "Captivate": {"es": "Seducción", "t": "Normal", "c": "Status"}, "Judgment": {"es": "Sentencia", "t": "Normal", "c": "Special"}, "Rock Climb": {"es": "Treparrocas", "t": "Normal", "c": "Physical"}, "Last Resort": {"es": "Última Baza", "t": "Normal", "c": "Physical"}, "Me First": {"es": "Yo Primero", "t": "Normal", "c": "Status"}, "Worry Seed": {"es": "Abatidoras", "t": "Grass", "c": "Status"}, "Seed Bomb": {"es": "Bomba Germen", "t": "Grass", "c": "Physical"}, "Energy Ball": {"es": "Energibola", "t": "Grass", "c": "Special"}, "Seed Flare": {"es": "Fulgor Semilla", "t": "Grass", "c": "Special"}, "Grass Knot": {"es": "Hierba Lazo", "t": "Grass", "c": "Special"}, "Power Whip": {"es": "Latigazo", "t": "Grass", "c": "Physical"}, "Leaf Storm": {"es": "Lluevehojas", "t": "Grass", "c": "Special"}, "Wood Hammer": {"es": "Mazazo", "t": "Grass", "c": "Physical"}, "Heal Block": {"es": "Anticura", "t": "Psychic", "c": "Status"}, "Zen Headbutt": {"es": "Cabezazo Zen", "t": "Psychic", "c": "Physical"}, "Heart Swap": {"es": "Cambiaalmas", "t": "Psychic", "c": "Status"}, "Guard Swap": {"es": "Cambiadefensa", "t": "Psychic", "c": "Status"}, "Power Swap": {"es": "Cambiafuerza", "t": "Psychic", "c": "Status"}, "Lunar Dance": {"es": "Danza Lunar", "t": "Psychic", "c": "Status"}, "Healing Wish": {"es": "Deseo Cura", "t": "Psychic", "c": "Status"}, "Trick Room": {"es": "Espacio Raro", "t": "Psychic", "c": "Status"}, "Miracle Eye": {"es": "Gran Ojo", "t": "Psychic", "c": "Status"}, "Gravity": {"es": "Gravedad", "t": "Psychic", "c": "Status"}, "Psycho Shift": {"es": "Psicocambio", "t": "Psychic", "c": "Status"}, "Psycho Cut": {"es": "Psicocorte", "t": "Psychic", "c": "Physical"}, "Power Trick": {"es": "Truco Fuerza", "t": "Psychic", "c": "Status"}, "Power Gem": {"es": "Joya de Luz", "t": "Rock", "c": "Special"}, "Rock Polish": {"es": "Pulimento", "t": "Rock", "c": "Status"}, "Stone Edge": {"es": "Roca Afilada", "t": "Rock", "c": "Physical"}, "Rock Wrecker": {"es": "Romperrocas", "t": "Rock", "c": "Physical"}, "Head Smash": {"es": "Testarazo", "t": "Rock", "c": "Physical"}, "Stealth Rock": {"es": "Trampa Rocas", "t": "Rock", "c": "Status"}, "Dark Void": {"es": "Brecha Negra", "t": "Dark", "c": "Status"}, "Assurance": {"es": "Buena Baza", "t": "Dark", "c": "Physical"}, "Punishment": {"es": "Castigo", "t": "Dark", "c": "Physical"}, "Embargo": {"es": "Embargo", "t": "Dark", "c": "Status"}, "Sucker Punch": {"es": "Golpe Bajo", "t": "Dark", "c": "Physical"}, "Fling": {"es": "Lanzamiento", "t": "Dark", "c": "Physical"}, "Nasty Plot": {"es": "Maquinación", "t": "Dark", "c": "Status"}, "Dark Pulse": {"es": "Pulso Umbrío", "t": "Dark", "c": "Special"}, "Night Slash": {"es": "Tajo Umbrío", "t": "Dark", "c": "Physical"}, "Switcheroo": {"es": "Trapicheo", "t": "Dark", "c": "Status"}, "Payback": {"es": "Vendetta", "t": "Dark", "c": "Physical"}, "Mud Bomb": {"es": "Bomba Fango", "t": "Ground", "c": "Special"}, "Earth Power": {"es": "Tierra Viva", "t": "Ground", "c": "Special"}, "Gastro Acid": {"es": "Bilis", "t": "Poison", "c": "Status"}, "Gunk Shot": {"es": "Lanzamugre", "t": "Poison", "c": "Physical"}, "Toxic Spikes": {"es": "Púas Tóxicas", "t": "Poison", "c": "Status"}, "Poison Jab": {"es": "Puya Nociva", "t": "Poison", "c": "Physical"}, "Cross Poison": {"es": "Veneno X", "t": "Poison", "c": "Physical"}, "Chatter": {"es": "Cháchara", "t": "Flying", "c": "Special"}, "Defog": {"es": "Despejar", "t": "Flying", "c": "Status"}, "Brave Bird": {"es": "Pájaro Osado", "t": "Flying", "c": "Physical"}, "Pluck": {"es": "Picoteo", "t": "Flying", "c": "Physical"}, "Roost": {"es": "Respiro", "t": "Flying", "c": "Status"}, "Air Slash": {"es": "Tajo Aéreo", "t": "Flying", "c": "Special"}, "Tailwind": {"es": "Viento Afín", "t": "Flying", "c": "Status"}, "Autotomize": {"es": "Aligerar", "t": "Steel", "c": "Status"}, "Shift Gear": {"es": "Cambio de Marcha", "t": "Steel", "c": "Status"}, "Heavy Slam": {"es": "Cuerpo Pesado", "t": "Steel", "c": "Physical"}, "Gear Grind": {"es": "Rueda Doble", "t": "Steel", "c": "Physical"}, "Razor Shell": {"es": "Concha Filo", "t": "Water", "c": "Physical"}, "Soak": {"es": "Empapar", "t": "Water", "c": "Status"}, "Scald": {"es": "Escaldar", "t": "Water", "c": "Special"}, "Water Pledge": {"es": "Voto Agua", "t": "Water", "c": "Special"}, "Quiver Dance": {"es": "Danza Aleteo", "t": "Bug", "c": "Status"}, "Struggle Bug": {"es": "Estoicismo", "t": "Bug", "c": "Special"}, "Rage Powder": {"es": "Polvo Ira", "t": "Bug", "c": "Status"}, "Steamroller": {"es": "Rodillo de Púas", "t": "Bug", "c": "Physical"}, "Dragon Tail": {"es": "Cola Dragón", "t": "Dragon", "c": "Physical"}, "Dual Chop": {"es": "Golpe Bis", "t": "Dragon", "c": "Physical"}, "Bolt Strike": {"es": "Ataque Fulgor", "t": "Electric", "c": "Physical"}, "Electro Ball": {"es": "Bola Voltio", "t": "Electric", "c": "Special"}, "Electroweb": {"es": "Electrotela", "t": "Electric", "c": "Special"}, "Fusion Bolt": {"es": "Rayo Fusión", "t": "Electric", "c": "Physical"}, "Wild Charge": {"es": "Voltio Cruel", "t": "Electric", "c": "Physical"}, "Volt Switch": {"es": "Voltiocambio", "t": "Electric", "c": "Special"}, "Hex": {"es": "Infortunio", "t": "Ghost", "c": "Special"}, "Searing Shot": {"es": "Bomba Ígnea", "t": "Fire", "c": "Special"}, "Incinerate": {"es": "Calcinación", "t": "Fire", "c": "Special"}, "Fiery Dance": {"es": "Danza Llama", "t": "Fire", "c": "Special"}, "Heat Crash": {"es": "Golpe Calor", "t": "Fire", "c": "Physical"}, "Inferno": {"es": "Infierno", "t": "Fire", "c": "Special"}, "Blue Flare": {"es": "Llama Azul", "t": "Fire", "c": "Special"}, "Fusion Flare": {"es": "Llama Fusión", "t": "Fire", "c": "Special"}, "Flame Charge": {"es": "Nitrocarga", "t": "Fire", "c": "Physical"}, "Flame Burst": {"es": "Pirotecnia", "t": "Fire", "c": "Special"}, "V-create": {"es": "V de Fuego", "t": "Fire", "c": "Physical"}, "Fire Pledge": {"es": "Voto Fuego", "t": "Fire", "c": "Special"}, "Icicle Crash": {"es": "Chuzos", "t": "Ice", "c": "Physical"}, "Ice Burn": {"es": "Llama Gélida", "t": "Ice", "c": "Special"}, "Glaciate": {"es": "Mundo Gélido", "t": "Ice", "c": "Special"}, "Freeze Shock": {"es": "Rayo Gélido", "t": "Ice", "c": "Physical"}, "Frost Breath": {"es": "Vaho Gélido", "t": "Ice", "c": "Special"}, "Quick Guard": {"es": "Anticipo", "t": "Fighting", "c": "Status"}, "Sacred Sword": {"es": "Espada Santa", "t": "Fighting", "c": "Physical"}, "Storm Throw": {"es": "Llave Corsé", "t": "Fighting", "c": "Physical"}, "Circle Throw": {"es": "Llave Giro", "t": "Fighting", "c": "Physical"}, "Low Sweep": {"es": "Puntapié", "t": "Fighting", "c": "Physical"}, "Secret Sword": {"es": "Sable Místico", "t": "Fighting", "c": "Special"}, "Final Gambit": {"es": "Sacrificio", "t": "Fighting", "c": "Special"}, "Head Charge": {"es": "Ariete", "t": "Normal", "c": "Physical"}, "Work Up": {"es": "Avivar", "t": "Normal", "c": "Status"}, "Round": {"es": "Canon", "t": "Normal", "c": "Special"}, "Relic Song": {"es": "Canto Arcaico", "t": "Normal", "c": "Special"}, "After You": {"es": "Cede Paso", "t": "Normal", "c": "Status"}, "Reflect Type": {"es": "Clonatipo", "t": "Normal", "c": "Status"}, "Entrainment": {"es": "Danza Amiga", "t": "Normal", "c": "Status"}, "Echoed Voice": {"es": "Eco Voz", "t": "Normal", "c": "Special"}, "Chip Away": {"es": "Guardia Baja", "t": "Normal", "c": "Physical"}, "Bestow": {"es": "Ofrenda", "t": "Normal", "c": "Status"}, "Simple Beam": {"es": "Onda Simple", "t": "Normal", "c": "Status"}, "Tail Slap": {"es": "Plumerazo", "t": "Normal", "c": "Physical"}, "Retaliate": {"es": "Represalia", "t": "Normal", "c": "Physical"}, "Shell Smash": {"es": "Rompecoraza", "t": "Normal", "c": "Status"}, "Techno Blast": {"es": "Tecno Shock", "t": "Normal", "c": "Special"}, "Horn Leech": {"es": "Asta Drenaje", "t": "Grass", "c": "Physical"}, "Leaf Tornado": {"es": "Ciclón de Hojas", "t": "Grass", "c": "Special"}, "Cotton Guard": {"es": "Rizo Algodón", "t": "Grass", "c": "Status"}, "Grass Pledge": {"es": "Voto Planta", "t": "Grass", "c": "Special"}, "Heart Stamp": {"es": "Arrumaco", "t": "Psychic", "c": "Physical"}, "Ally Switch": {"es": "Cambio de Banda", "t": "Psychic", "c": "Status"}, "Power Split": {"es": "Isofuerza", "t": "Psychic", "c": "Status"}, "Guard Split": {"es": "Isoguardia", "t": "Psychic", "c": "Status"}, "Psystrike": {"es": "Onda Mental", "t": "Psychic", "c": "Special"}, "Stored Power": {"es": "Poder Reserva", "t": "Psychic", "c": "Special"}, "Psyshock": {"es": "Psicocarga", "t": "Psychic", "c": "Special"}, "Heal Pulse": {"es": "Pulso Cura", "t": "Psychic", "c": "Status"}, "Synchronoise": {"es": "Sincrorruido", "t": "Psychic", "c": "Special"}, "Telekinesis": {"es": "Telequinesis", "t": "Psychic", "c": "Status"}, "Wonder Room": {"es": "Zona Extraña", "t": "Psychic", "c": "Status"}, "Magic Room": {"es": "Zona Mágica", "t": "Psychic", "c": "Status"}, "Smack Down": {"es": "Antiaéreo", "t": "Rock", "c": "Physical"}, "Wide Guard": {"es": "Vasta Guardia", "t": "Rock", "c": "Status"}, "Hone Claws": {"es": "Afilagarras", "t": "Dark", "c": "Status"}, "Snarl": {"es": "Alarido", "t": "Dark", "c": "Special"}, "Foul Play": {"es": "Juego Sucio", "t": "Dark", "c": "Physical"}, "Night Daze": {"es": "Pulso Noche", "t": "Dark", "c": "Special"}, "Quash": {"es": "Último Lugar", "t": "Dark", "c": "Status"}, "Drill Run": {"es": "Taladradora", "t": "Ground", "c": "Physical"}, "Bulldoze": {"es": "Terratemblor", "t": "Ground", "c": "Physical"}, "Acid Spray": {"es": "Bomba Ácida", "t": "Poison", "c": "Special"}, "Venoshock": {"es": "Carga Tóxica", "t": "Poison", "c": "Special"}, "Coil": {"es": "Enrosque", "t": "Poison", "c": "Status"}, "Clear Smog": {"es": "Niebla Clara", "t": "Poison", "c": "Special"}, "Sludge Wave": {"es": "Onda Tóxica", "t": "Poison", "c": "Special"}, "Acrobatics": {"es": "Acróbata", "t": "Flying", "c": "Physical"}, "Sky Drop": {"es": "Caída Libre", "t": "Flying", "c": "Physical"}, "Hurricane": {"es": "Vendaval", "t": "Flying", "c": "Special"}, "King's Shield": {"es": "Escudo Real", "t": "Steel", "c": "Status"}, "Steam Eruption": {"es": "Chorro de Vapor", "t": "Water", "c": "Special"}, "Origin Pulse": {"es": "Pulso Primigenio", "t": "Water", "c": "Special"}, "Water Shuriken": {"es": "Shuriken de Agua", "t": "Water", "c": "Special"}, "Infestation": {"es": "Acoso", "t": "Bug", "c": "Special"}, "Fell Stinger": {"es": "Aguijón Letal", "t": "Bug", "c": "Physical"}, "Powder": {"es": "Polvo Explosivo", "t": "Bug", "c": "Status"}, "Sticky Web": {"es": "Red Viscosa", "t": "Bug", "c": "Status"}, "Magnetic Flux": {"es": "Aura Magnética", "t": "Electric", "c": "Status"}, "Electric Terrain": {"es": "Campo Eléctrico", "t": "Electric", "c": "Status"}, "Parabolic Charge": {"es": "Carga Parábola", "t": "Electric", "c": "Special"}, "Ion Deluge": {"es": "Cortina Plasma", "t": "Electric", "c": "Status"}, "Electrify": {"es": "Electrificación", "t": "Electric", "c": "Status"}, "Nuzzle": {"es": "Moflete Estático", "t": "Electric", "c": "Physical"}, "Eerie Impulse": {"es": "Onda Anómala", "t": "Electric", "c": "Status"}, "Phantom Force": {"es": "Golpe Fantasma", "t": "Ghost", "c": "Physical"}, "Trick-or-Treat": {"es": "Halloween", "t": "Ghost", "c": "Status"}, "Mystical Fire": {"es": "Llama Embrujada", "t": "Fire", "c": "Special"}, "Draining Kiss": {"es": "Beso Drenaje", "t": "Fairy", "c": "Special"}, "Dazzling Gleam": {"es": "Brillo Mágico", "t": "Fairy", "c": "Special"}, "Misty Terrain": {"es": "Campo de Niebla", "t": "Fairy", "c": "Status"}, "Play Rough": {"es": "Carantoña", "t": "Fairy", "c": "Physical"}, "Fairy Lock": {"es": "Cerrojo Feérico", "t": "Fairy", "c": "Status"}, "Flower Shield": {"es": "Defensa Floral", "t": "Fairy", "c": "Status"}, "Moonblast": {"es": "Fuerza Lunar", "t": "Fairy", "c": "Special"}, "Geomancy": {"es": "Geocontrol", "t": "Fairy", "c": "Status"}, "Light of Ruin": {"es": "Luz Aniquiladora", "t": "Fairy", "c": "Special"}, "Aromatic Mist": {"es": "Niebla Aromática", "t": "Fairy", "c": "Status"}, "Baby-Doll Eyes": {"es": "Ojitos Tiernos", "t": "Fairy", "c": "Status"}, "Crafty Shield": {"es": "Truco Defensa", "t": "Fairy", "c": "Status"}, "Fairy Wind": {"es": "Viento Feérico", "t": "Fairy", "c": "Special"}, "Disarming Voice": {"es": "Voz Cautivadora", "t": "Fairy", "c": "Special"}, "Freeze-Dry": {"es": "Liofilización", "t": "Ice", "c": "Special"}, "Mat Block": {"es": "Escudo Tatami", "t": "Fighting", "c": "Status"}, "Flying Press": {"es": "Plancha Voladora", "t": "Fighting", "c": "Physical"}, "Power-Up Punch": {"es": "Puño Incremento", "t": "Fighting", "c": "Physical"}, "Play Nice": {"es": "Camaradería", "t": "Normal", "c": "Status"}, "Celebrate": {"es": "Celebración", "t": "Normal", "c": "Status"}, "Hold Back": {"es": "Clemencia", "t": "Normal", "c": "Physical"}, "Confide": {"es": "Confidencia", "t": "Normal", "c": "Status"}, "Boomburst": {"es": "Estruendo", "t": "Normal", "c": "Special"}, "Hold Hands": {"es": "Manos Juntas", "t": "Normal", "c": "Status"}, "Happy Hour": {"es": "Paga Extra", "t": "Normal", "c": "Status"}, "Noble Roar": {"es": "Rugido de Guerra", "t": "Normal", "c": "Status"}, "Spiky Shield": {"es": "Barrera Espinosa", "t": "Grass", "c": "Status"}, "Grassy Terrain": {"es": "Campo de Hierba", "t": "Grass", "c": "Status"}, "Forest's Curse": {"es": "Condena Silvana", "t": "Grass", "c": "Status"}, "Petal Blizzard": {"es": "Tormenta Floral", "t": "Grass", "c": "Physical"}, "Hyperspace Hole": {"es": "Paso Dimensional", "t": "Psychic", "c": "Special"}, "Diamond Storm": {"es": "Tormenta de Diamantes", "t": "Rock", "c": "Physical"}, "Hyperspace Fury": {"es": "Cerco Dimensión", "t": "Dark", "c": "Physical"}, "Topsy-Turvy": {"es": "Reversión", "t": "Dark", "c": "Status"}, "Parting Shot": {"es": "Última Palabra", "t": "Dark", "c": "Status"}, "Rototiller": {"es": "Fertilizante", "t": "Ground", "c": "Status"}, "Precipice Blades": {"es": "Filo del Abismo", "t": "Ground", "c": "Physical"}, "Land's Wrath": {"es": "Fuerza Telúrica", "t": "Ground", "c": "Physical"}, "Thousand Arrows": {"es": "Mil Flechas", "t": "Ground", "c": "Physical"}, "Thousand Waves": {"es": "Mil Temblores", "t": "Ground", "c": "Physical"}, "Belch": {"es": "Eructo", "t": "Poison", "c": "Special"}, "Venom Drench": {"es": "Trampa Venenosa", "t": "Poison", "c": "Status"}, "Oblivion Wing": {"es": "Ala Mortífera", "t": "Flying", "c": "Special"}, "Dragon Ascent": {"es": "Ascenso Draco", "t": "Flying", "c": "Physical"}, "Anclaje": {"es": "Anclaje", "t": "Steel", "c": "Physical"}, "Cuerno Certero": {"es": "Cuerno Certero", "t": "Steel", "c": "Physical"}, "Ferropuño Doble": {"es": "Ferropuño Doble", "t": "Steel", "c": "Physical"}, "Meteoimpacto": {"es": "Meteoimpacto", "t": "Steel", "c": "Physical"}, "Piñón Auxiliar": {"es": "Piñón Auxiliar", "t": "Steel", "c": "Status"}, "Aria Burbuja": {"es": "Aria Burbuja", "t": "Water", "c": "Special"}, "Hidroariete": {"es": "Hidroariete", "t": "Water", "c": "Physical"}, "Salpikasurf": {"es": "Salpikasurf", "t": "Water", "c": "Special"}, "Vapodrenaje": {"es": "Vapodrenaje", "t": "Water", "c": "Special"}, "Bola de Polen": {"es": "Bola de Polen", "t": "Bug", "c": "Special"}, "Escaramuza": {"es": "Escaramuza", "t": "Bug", "c": "Physical"}, "Plancha": {"es": "Plancha", "t": "Bug", "c": "Physical"}, "Fragor Escamas": {"es": "Fragor Escamas", "t": "Dragon", "c": "Special"}, "Martillo Dragón": {"es": "Martillo Dragón", "t": "Dragon", "c": "Physical"}, "Núcleo Castigo": {"es": "Núcleo Castigo", "t": "Dragon", "c": "Special"}, "Electropunzada": {"es": "Electropunzada", "t": "Electric", "c": "Physical"}, "Joltioparálisis": {"es": "Joltioparálisis", "t": "Electric", "c": "Special"}, "Pikatormenta": {"es": "Pikatormenta", "t": "Electric", "c": "Special"}, "Pikaturbo": {"es": "Pikaturbo", "t": "Electric", "c": "Physical"}, "Puños Plasma": {"es": "Puños Plasma", "t": "Electric", "c": "Physical"}, "Hueso Sombrío": {"es": "Hueso Sombrío", "t": "Ghost", "c": "Physical"}, "Puntada Sombría": {"es": "Puntada Sombría", "t": "Ghost", "c": "Physical"}, "Rayo Umbrío": {"es": "Rayo Umbrío", "t": "Ghost", "c": "Special"}, "Robasombra": {"es": "Robasombra", "t": "Ghost", "c": "Physical"}, "Cabeza Sorpresa": {"es": "Cabeza Sorpresa", "t": "Fire", "c": "Special"}, "Coraza Trampa": {"es": "Coraza Trampa", "t": "Fire", "c": "Special"}, "Flarembestida": {"es": "Flarembestida", "t": "Fire", "c": "Physical"}, "Látigo Ígneo": {"es": "Látigo Ígneo", "t": "Fire", "c": "Physical"}, "Llama Final": {"es": "Llama Final", "t": "Fire", "c": "Special"}, "Cañón Floral": {"es": "Cañón Floral", "t": "Fairy", "c": "Special"}, "Cura Floral": {"es": "Cura Floral", "t": "Fairy", "c": "Status"}, "Furia Natural": {"es": "Furia Natural", "t": "Fairy", "c": "Special"}, "Sylveotornado": {"es": "Sylveotornado", "t": "Fairy", "c": "Special"}, "Glaceoprisma": {"es": "Glaceoprisma", "t": "Ice", "c": "Special"}, "Martillo Hielo": {"es": "Martillo Hielo", "t": "Ice", "c": "Physical"}, "Velo Aurora": {"es": "Velo Aurora", "t": "Ice", "c": "Status"}, "Aguzar": {"es": "Aguzar", "t": "Normal", "c": "Status"}, "Danza Despertar": {"es": "Danza Despertar", "t": "Normal", "c": "Special"}, "Eevimpacto": {"es": "Eevimpacto", "t": "Normal", "c": "Physical"}, "Foco": {"es": "Foco", "t": "Normal", "c": "Status"}, "Multiataque": {"es": "Multiataque", "t": "Normal", "c": "Physical"}, "Ojos Llorosos": {"es": "Ojos Llorosos", "t": "Normal", "c": "Status"}, "Absorbefuerza": {"es": "Absorbefuerza", "t": "Grass", "c": "Status"}, "Cuchilla Solar": {"es": "Cuchilla Solar", "t": "Grass", "c": "Physical"}, "Follaje": {"es": "Follaje", "t": "Grass", "c": "Physical"}, "Leafitobombas": {"es": "Leafitobombas", "t": "Grass", "c": "Physical"}, "Patada Tropical": {"es": "Patada Tropical", "t": "Grass", "c": "Physical"}, "Cambiavelocidad": {"es": "Cambiavelocidad", "t": "Psychic", "c": "Status"}, "Campo Psíquico": {"es": "Campo Psíquico", "t": "Psychic", "c": "Status"}, "Espeaura": {"es": "Espeaura", "t": "Psychic", "c": "Special"}, "Géiser Fotónico": {"es": "Géiser Fotónico", "t": "Psychic", "c": "Special"}, "Láser Prisma": {"es": "Láser Prisma", "t": "Psychic", "c": "Special"}, "Mandato": {"es": "Mandato", "t": "Psychic", "c": "Status"}, "Psicocolmillo": {"es": "Psicocolmillo", "t": "Psychic", "c": "Physical"}, "Roca Veloz": {"es": "Roca Veloz", "t": "Rock", "c": "Physical"}, "Chulería": {"es": "Chulería", "t": "Dark", "c": "Physical"}, "Giro Vil": {"es": "Giro Vil", "t": "Dark", "c": "Physical"}, "Golpe Mordaza": {"es": "Golpe Mordaza", "t": "Dark", "c": "Physical"}, "Lariat Oscuro": {"es": "Lariat Oscuro", "t": "Dark", "c": "Physical"}, "Umbreozona": {"es": "Umbreozona", "t": "Dark", "c": "Special"}, "Fuerza Equina": {"es": "Fuerza Equina", "t": "Ground", "c": "Physical"}, "Pataleta": {"es": "Pataleta", "t": "Ground", "c": "Physical"}, "Recogearena": {"es": "Recogearena", "t": "Ground", "c": "Status"}, "Búnker": {"es": "Búnker", "t": "Poison", "c": "Status"}, "Hilo Venenoso": {"es": "Hilo Venenoso", "t": "Poison", "c": "Status"}, "Purificación": {"es": "Purificación", "t": "Poison", "c": "Status"}, "Pico Cañón": {"es": "Pico Cañón", "t": "Flying", "c": "Physical"}, "}": {"es": "Ponzochoque", "t": "Poison", "c": "Physical"}, "Allanador Férreo": {"es": "Allanador Férreo", "t": "Steel", "c": "Physical"}, "Embate Supremo": {"es": "Embate Supremo", "t": "Steel", "c": "Physical"}, "Metaláser": {"es": "Metaláser", "t": "Steel", "c": "Special"}, "Retracción": {"es": "Retracción", "t": "Steel", "c": "Status"}, "Tajo Supremo": {"es": "Tajo Supremo", "t": "Steel", "c": "Physical"}, "Azote Torrencial": {"es": "Azote Torrencial", "t": "Water", "c": "Physical"}, "Branquibocado": {"es": "Branquibocado", "t": "Water", "c": "Physical"}, "Disparo Certero": {"es": "Disparo Certero", "t": "Water", "c": "Special"}, "Envite Acuático": {"es": "Envite Acuático", "t": "Water", "c": "Physical"}, "Gota Vital": {"es": "Gota Vital", "t": "Water", "c": "Status"}, "Viraje": {"es": "Viraje", "t": "Water", "c": "Physical"}, "Golpe Rastrero": {"es": "Golpe Rastrero", "t": "Bug", "c": "Physical"}, "Cañón Dinamax": {"es": "Cañón Dinamax", "t": "Dragon", "c": "Special"}, "Dracoenergía": {"es": "Dracoenergía", "t": "Dragon", "c": "Special"}, "Dracoflechas": {"es": "Dracoflechas", "t": "Dragon", "c": "Physical"}, "Estruendo Escama": {"es": "Estruendo Escama", "t": "Dragon", "c": "Status"}, "Ráfaga Escamas": {"es": "Ráfaga Escamas", "t": "Dragon", "c": "Physical"}, "Rayo Infinito": {"es": "Rayo Infinito", "t": "Dragon", "c": "Special"}, "Vasto Impacto": {"es": "Vasto Impacto", "t": "Dragon", "c": "Physical"}, "Alto Voltaje": {"es": "Alto Voltaje", "t": "Electric", "c": "Special"}, "Amplificador": {"es": "Amplificador", "t": "Electric", "c": "Special"}, "Electormenta": {"es": "Electormenta", "t": "Electric", "c": "Special"}, "Electrojaula": {"es": "Electrojaula", "t": "Electric", "c": "Special"}, "Electropico": {"es": "Electropico", "t": "Electric", "c": "Physical"}, "Rueda Aural": {"es": "Rueda Aural", "t": "Electric", "c": "Physical"}, "Marcha Espectral": {"es": "Marcha Espectral", "t": "Ghost", "c": "Special"}, "Orbes Espectro": {"es": "Orbes Espectro", "t": "Ghost", "c": "Special"}, "Poltergeist": {"es": "Poltergeist", "t": "Ghost", "c": "Physical"}, "Rencor Reprimido": {"es": "Rencor Reprimido", "t": "Ghost", "c": "Special"}, "Balón Ígneo": {"es": "Balón Ígneo", "t": "Fire", "c": "Physical"}, "Envidia Ardiente": {"es": "Envidia Ardiente", "t": "Fire", "c": "Special"}, "Erupción de Ira": {"es": "Erupción de Ira", "t": "Fire", "c": "Physical"}, "Bruma Explosiva": {"es": "Bruma Explosiva", "t": "Fairy", "c": "Special"}, "Cautivapor": {"es": "Cautivapor", "t": "Fairy", "c": "Special"}, "Choque Anímico": {"es": "Choque Anímico", "t": "Fairy", "c": "Physical"}, "Ciclón Primavera": {"es": "Ciclón Primavera", "t": "Fairy", "c": "Special"}, "Decoración": {"es": "Decoración", "t": "Fairy", "c": "Status"}, "Lanza Glacial": {"es": "Lanza Glacial", "t": "Ice", "c": "Physical"}, "Triple Axel": {"es": "Triple Axel", "t": "Ice", "c": "Physical"}, "Viento Carámbano": {"es": "Viento Carámbano", "t": "Ice", "c": "Physical"}, "Asalto Estelar": {"es": "Asalto Estelar", "t": "Fighting", "c": "Physical"}, "Bastión Final": {"es": "Bastión Final", "t": "Fighting", "c": "Status"}, "Danza Triunfal": {"es": "Danza Triunfal", "t": "Fighting", "c": "Status"}, "Motivación": {"es": "Motivación", "t": "Fighting", "c": "Status"}, "Octopresa": {"es": "Octopresa", "t": "Fighting", "c": "Status"}, "Patada Relámpago": {"es": "Patada Relámpago", "t": "Fighting", "c": "Physical"}, "Plancha Corporal": {"es": "Plancha Corporal", "t": "Fighting", "c": "Physical"}, "Triple Flecha": {"es": "Triple Flecha", "t": "Fighting", "c": "Physical"}, "Atiborramiento": {"es": "Atiborramiento", "t": "Normal", "c": "Status"}, "Cambiapoder": {"es": "Cambiapoder", "t": "Normal", "c": "Status"}, "Cambio de Cancha": {"es": "Cambio de Cancha", "t": "Normal", "c": "Status"}, "Hora del Té": {"es": "Hora del Té", "t": "Normal", "c": "Status"}, "Pulso de Campo": {"es": "Pulso de Campo", "t": "Normal", "c": "Special"}, "Ácido Málico": {"es": "Ácido Málico", "t": "Grass", "c": "Special"}, "Batería Asalto": {"es": "Batería Asalto", "t": "Grass", "c": "Physical"}, "Cepo": {"es": "Cepo", "t": "Grass", "c": "Physical"}, "Clorofiláser": {"es": "Clorofiláser", "t": "Grass", "c": "Special"}, "Cura Selvática": {"es": "Cura Selvática", "t": "Grass", "c": "Status"}, "Fitoimpulso": {"es": "Fitoimpulso", "t": "Grass", "c": "Physical"}, "Fuerza G": {"es": "Fuerza G", "t": "Grass", "c": "Physical"}, "Punzada Rama": {"es": "Punzada Rama", "t": "Grass", "c": "Physical"}, "Ala Aural": {"es": "Ala Aural", "t": "Psychic", "c": "Special"}, "Asalto Barrera": {"es": "Asalto Barrera", "t": "Psychic", "c": "Physical"}, "Bálsamo Osado": {"es": "Bálsamo Osado", "t": "Psychic", "c": "Status"}, "Conjuro Funesto": {"es": "Conjuro Funesto", "t": "Psychic", "c": "Special"}, "Mirada Heladora": {"es": "Mirada Heladora", "t": "Psychic", "c": "Special"}, "Plegaria Lunar": {"es": "Plegaria Lunar", "t": "Psychic", "c": "Status"}, "Poder Místico": {"es": "Poder Místico", "t": "Psychic", "c": "Special"}, "Polvo Mágico": {"es": "Polvo Mágico", "t": "Psychic", "c": "Status"}, "Vasta Fuerza": {"es": "Vasta Fuerza", "t": "Psychic", "c": "Special"}, "Alquitranazo": {"es": "Alquitranazo", "t": "Rock", "c": "Status"}, "Hachazo Pétreo": {"es": "Hachazo Pétreo", "t": "Rock", "c": "Physical"}, "Rayo Meteórico": {"es": "Rayo Meteórico", "t": "Rock", "c": "Special"}, "Desahogo": {"es": "Desahogo", "t": "Dark", "c": "Physical"}, "Furia Candente": {"es": "Furia Candente", "t": "Dark", "c": "Special"}, "Golpe Oscuro": {"es": "Golpe Oscuro", "t": "Dark", "c": "Physical"}, "Irreverencia": {"es": "Irreverencia", "t": "Dark", "c": "Physical"}, "Obstrucción": {"es": "Obstrucción", "t": "Dark", "c": "Status"}, "Presa Maxilar": {"es": "Presa Maxilar", "t": "Dark", "c": "Physical"}, "Tajo Metralla": {"es": "Tajo Metralla", "t": "Dark", "c": "Physical"}, "Arenas Ardientes": {"es": "Arenas Ardientes", "t": "Ground", "c": "Special"}, "Arremetida": {"es": "Arremetida", "t": "Ground", "c": "Physical"}, "Simún de Arena": {"es": "Simún de Arena", "t": "Ground", "c": "Special"}, "Garra Nociva": {"es": "Garra Nociva", "t": "Poison", "c": "Physical"}, "Gas Corrosivo": {"es": "Gas Corrosivo", "t": "Poison", "c": "Status"}, "Mil Púas Tóxicas": {"es": "Mil Púas Tóxicas", "t": "Poison", "c": "Physical"}, "Moluscañón": {"es": "Moluscañón", "t": "Poison", "c": "Special"}, "Ala Bis": {"es": "Ala Bis", "t": "Flying", "c": "Physical"}, "Fiebre Dorada": {"es": "Fiebre Dorada", "t": "Steel", "c": "Special"}, "Martillo Colosal": {"es": "Martillo Colosal", "t": "Steel", "c": "Physical"}, "Prensa Metálica": {"es": "Prensa Metálica", "t": "Steel", "c": "Physical"}, "Quemarrueda": {"es": "Quemarrueda", "t": "Steel", "c": "Physical"}, "Tajo Taquión": {"es": "Tajo Taquión", "t": "Steel", "c": "Special"}, "Agua Fría": {"es": "Agua Fría", "t": "Water", "c": "Special"}, "Danza Acuática": {"es": "Danza Acuática", "t": "Water", "c": "Physical"}, "Hidrovapor": {"es": "Hidrovapor", "t": "Water", "c": "Special"}, "Puño Jet": {"es": "Puño Jet", "t": "Water", "c": "Physical"}, "Tajo Acuático": {"es": "Tajo Acuático", "t": "Water", "c": "Physical"}, "Triple Inmersión": {"es": "Triple Inmersión", "t": "Water", "c": "Physical"}, "Brinco": {"es": "Brinco", "t": "Bug", "c": "Physical"}, "Telatrampa": {"es": "Telatrampa", "t": "Bug", "c": "Status"}, "Asalto Espadón": {"es": "Asalto Espadón", "t": "Dragon", "c": "Physical"}, "Bramido Dragón": {"es": "Bramido Dragón", "t": "Dragon", "c": "Status"}, "Láser Veleidoso": {"es": "Láser Veleidoso", "t": "Dragon", "c": "Special"}, "Luz Devastadora": {"es": "Luz Devastadora", "t": "Dragon", "c": "Special"}, "Oído Cocina": {"es": "Oído Cocina", "t": "Dragon", "c": "Physical"}, "Electroderrape": {"es": "Electroderrape", "t": "Electric", "c": "Special"}, "Electropalmas": {"es": "Electropalmas", "t": "Electric", "c": "Physical"}, "Electrorrayo": {"es": "Electrorrayo", "t": "Electric", "c": "Special"}, "Plancha Voltaica": {"es": "Plancha Voltaica", "t": "Electric", "c": "Physical"}, "Relámpago Súbito": {"es": "Relámpago Súbito", "t": "Electric", "c": "Special"}, "Homenaje Póstumo": {"es": "Homenaje Póstumo", "t": "Ghost", "c": "Physical"}, "Puño Furia": {"es": "Puño Furia", "t": "Ghost", "c": "Physical"}, "Canto Ardiente": {"es": "Canto Ardiente", "t": "Fire", "c": "Special"}, "Cañón Armadura": {"es": "Cañón Armadura", "t": "Fire", "c": "Special"}, "Cólera Ardiente": {"es": "Cólera Ardiente", "t": "Fire", "c": "Physical"}, "Espada Lamento": {"es": "Espada Lamento", "t": "Fire", "c": "Physical"}, "Llama Protectora": {"es": "Llama Protectora", "t": "Fire", "c": "Status"}, "Pirochoque": {"es": "Pirochoque", "t": "Fire", "c": "Physical"}, "Canto Encantador": {"es": "Canto Encantador", "t": "Fairy", "c": "Special"}, "Feerichoque": {"es": "Feerichoque", "t": "Fairy", "c": "Physical"}, "Fría Acogida": {"es": "Fría Acogida", "t": "Ice", "c": "Status"}, "Paisaje Nevado": {"es": "Paisaje Nevado", "t": "Ice", "c": "Status"}, "Pirueta Helada": {"es": "Pirueta Helada", "t": "Ice", "c": "Physical"}, "Nitrochoque": {"es": "Nitrochoque", "t": "Fighting", "c": "Physical"}, "Palma Rauda": {"es": "Palma Rauda", "t": "Fighting", "c": "Physical"}, "Patada Hacha": {"es": "Patada Hacha", "t": "Fighting", "c": "Physical"}, "Pugnachoque": {"es": "Pugnachoque", "t": "Fighting", "c": "Physical"}, "Autotomía": {"es": "Autotomía", "t": "Normal", "c": "Status"}, "Decalcomanía": {"es": "Decalcomanía", "t": "Normal", "c": "Status"}, "Deslome": {"es": "Deslome", "t": "Normal", "c": "Status"}, "Furia Taurina": {"es": "Furia Taurina", "t": "Normal", "c": "Physical"}, "Hipertaladro": {"es": "Hipertaladro", "t": "Normal", "c": "Physical"}, "Limpieza General": {"es": "Limpieza General", "t": "Normal", "c": "Status"}, "Luna Roja": {"es": "Luna Roja", "t": "Normal", "c": "Special"}, "Plegaria Vital": {"es": "Plegaria Vital", "t": "Normal", "c": "Status"}, "Proliferación": {"es": "Proliferación", "t": "Normal", "c": "Physical"}, "Teraclúster": {"es": "Teraclúster", "t": "Normal", "c": "Special"}, "Teraexplosión": {"es": "Teraexplosión", "t": "Normal", "c": "Special"}, "Abrecaminos": {"es": "Abrecaminos", "t": "Grass", "c": "Physical"}, "Bomba Caramelo": {"es": "Bomba Caramelo", "t": "Grass", "c": "Special"}, "Cañón Batidor": {"es": "Cañón Batidor", "t": "Grass", "c": "Special"}, "Extracto Picante": {"es": "Extracto Picante", "t": "Grass", "c": "Status"}, "Garrote Liana": {"es": "Garrote Liana", "t": "Grass", "c": "Physical"}, "Truco Floral": {"es": "Truco Floral", "t": "Grass", "c": "Physical"}, "Fotocolisión": {"es": "Fotocolisión", "t": "Psychic", "c": "Special"}, "Láser Doble": {"es": "Láser Doble", "t": "Psychic", "c": "Special"}, "Psicohojas": {"es": "Psicohojas", "t": "Psychic", "c": "Physical"}, "Psicorruido": {"es": "Psicorruido", "t": "Psychic", "c": "Special"}, "Filo Potente": {"es": "Filo Potente", "t": "Rock", "c": "Physical"}, "Salazón": {"es": "Salazón", "t": "Rock", "c": "Physical"}, "Calamidad": {"es": "Calamidad", "t": "Dark", "c": "Special"}, "Genufendiente": {"es": "Genufendiente", "t": "Dark", "c": "Physical"}, "Ominochoque": {"es": "Ominochoque", "t": "Dark", "c": "Physical"}, "Resarcimiento": {"es": "Resarcimiento", "t": "Dark", "c": "Physical"}, "Cadena Virulenta": {"es": "Cadena Virulenta", "t": "Poison", "c": "Special"}, "Giro Mortífero": {"es": "Giro Mortífero", "t": "Poison", "c": "Physical"}};
const DB_ABILITIES = ["Abalorio Debacle", "Absorbe Agua", "Absorbe Electricidad", "Absorbe Fuego", "Acero", "Acero Templado", "Aclimatación", "Acérrimo", "Adaptable", "Afortunado", "Agallas", "Agrupamiento", "Alas Vendaval", "Alerta", "Allanamiento", "Alma Acerada", "Alma Cura", "Alma Errante", "Amor Filial", "Antibalas", "Antibarrera", "Anticipación", "Antídoto", "Armadura Batalla", "Armadura Frágil", "Armadura Prisma", "Audaz", "Aura Feérica", "Aura Oscura", "Autoestima", "Baba", "Banco", "Batería", "Bromista", "Cabeza Roca", "Cacheo", "Cacofonía", "Cadena Tóxica", "Calco", "Caldero Debacle", "Calyrex", "Cambio Color", "Cambio Heroico", "Cambio Táctico", "Capa Tóxica", "Caparazón", "Cara de Hielo", "Carga Cuark", "Carrillo", "Chorro Arena", "Clorofila", "Cobardía", "Cola Armadura", "Cola Surf", "Colector", "Comandar", "Combustible", "Competitivo", "Compiescolta", "Coraza Ira", "Coraza Reflejo", "Corrosión", "Cortante", "Corte Fuerte", "Coránima", "Cosecha", "Cromolente", "Cuerpo Horneado", "Cuerpo Llama", "Cuerpo Maldito", "Cuerpo Mortal", "Cuerpo Puro", "Cuerpo Vívido", "Cuerpo Áureo", "Cura Lluvia", "Cura Natural", "Cálculo Final", "Cólera", "Defensa Hoja", "Descarga", "Despiste", "Detonación", "Dicha", "Dinamo", "Disemillar", "Disfraz", "Don Floral", "Dondozo", "Efecto Espora", "Electricidad Estática", "Electrogénesis", "Electromotor", "Encadenado", "Energía Eólica", "Energía Pura", "Enjambre", "Ensañamiento", "Entusiasmo", "Escama Especial", "Escama de Hielo", "Esclusa de Aire", "Escudo Limitado", "Escudo Magma", "Escudo Recio", "Espada Debacle", "Espada Indómita", "Espejo Mágico", "Espesura", "Espíritu Vital", "Evocarrecuerdos", "Experto", "Expulsarena", "Fantasma", "Filtro", "Firmeza", "Flaqueza", "Flexibilidad", "Francotirador", "Fuego", "Fuente Energía", "Fuerte Afecto", "Fuerza Cerebral", "Fuerza Mental", "Fuga", "Funda", "Garra Dura", "Gas Reactivo", "General Supremo", "Geofagia", "Glastrier", "Gran Encanto", "Guardia Espectro", "Guardia Metálica", "Gula", "Gélido", "Habilidades", "Hedor", "Herbogénesis", "Herbívoro", "Hidratación", "Hidrorrefuerzo", "Hielo", "Hospitalidad", "Huida", "Humedad", "Humo Blanco", "Hurto", "Hélice Caudal", "Ignorante", "Ignífugo", "Iluminación", "Ilusión", "Impasible", "Impostor", "Impulso", "Imán", "Indefenso", "Inicio Lento", "Inmunidad", "Insomnio", "Insonorizar", "Intimidación", "Intrépido", "Irascible", "Justiciero", "Latido Oricalco", "Letargo Perenne", "Levitación", "Lista de habilidades en todos los idiomas", "Liviano", "Llovizna", "Líbero", "Madrugar", "Maduración", "Mal Sueño", "Mandíbula Dragón", "Mandíbula Fuerte", "Mano Rápida", "Manto Frondoso", "Manto Níveo", "Mar Llamas", "Mar del Albor", "Medicina Extraña", "Megadisparador", "Megasolar", "Menos", "Metal Liviano", "Metal Pesado", "Mimetismo", "Modo Daruma", "Momia", "Monotema", "Motor Hadrónico", "Mudar", "Multiescamas", "Multitipo", "Muro Mágico", "Mutapetito", "Mutatipo", "Más", "Nado Rápido", "Nebulogénesis", "Nerviosismo", "Nevada", "Normalidad", "Néctar Dulce", "Ojo Compuesto", "Ojo Mental", "Olor Persistente", "Oportunista", "Paleosíntesis", "Pararrayos", "Pareja de Baile", "Pecharunt", "Pelaje Recio", "Peluche", "Pelusa", "Pereza", "Perro Guardián", "Piel Celeste", "Piel Dragontina", "Piel Eléctrica", "Piel Feérica", "Piel Helada", "Piel Milagro", "Piel Seca", "Piel Tosca", "Pies Rápidos", "Poder Arena", "Poder Fúngico", "Poder Solar", "Poké Ball", "Polvo Escudo", "Pompa", "Potencia", "Potencia Bruta", "Predicción", "Presión", "Prestidigitador", "Primer auxilio", "Psicogénesis", "Punk Rock", "Punta Acero", "Punto Tóxico", "Puño Férreo", "Puño Invisible", "Quema", "Quitanieves", "Reacción Química", "Receptor", "Recogebolas", "Recogemiel", "Recogida", "Regia Presencia", "Relincho Blanco", "Relincho Negro", "Remoto", "Respondón", "Retirada", "Revés", "Rezagado", "Ritmo Propio", "Rivalidad", "Rizos Rebeldes", "Robustez", "Roca", "Roca Sólida", "Rompeaura", "Rompemoldes", "Rumia", "Ráfaga Delta", "Sacapecho", "Sal Purificadora", "Salpicante", "Sebo", "Sequía", "Simbiosis", "Simple", "Sincronía", "Sistema Alfa", "Sombra Trampa", "Spectrier", "Superguarda", "Surcavientos", "Tablilla Debacle", "Telepatía", "Tenacidad", "Teracambio", "Teracaparazón", "Teraformación 0", "Terapagos", "Termoconversión", "Terravoltaje", "Tierra del Ocaso", "Tinovictoria", "Toque Tóxico", "Torrente", "Tragamisil", "Trampa Arena", "Transistor", "Transportarrocas", "Tumbos", "Turbollama", "Turbotaladro", "Títere Tóxico", "Ultraimpulso", "Unidad Ecuestre", "Unísono", "Veleta", "Velo Agua", "Velo Arena", "Velo Aroma", "Velo Dulce", "Velo Flor", "Velo Pastel", "Veneno", "Ventosas", "Vigilante", "Viscosecreción", "Viscosidad", "Vista Lince", "Voz Fluida", "Zoquete", "Ímpetu Ardiente", "Ímpetu Arena", "Ímpetu Tóxico"];

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
    teraType: '', moves: ['','','',''],
    evs: { HP:0, Atk:0, Def:0, SpA:0, SpD:0, Spe:0 },
    types: [], sprite: '', abilities: [], legalMoves: []
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
  dd.style.top = (rect.bottom + 2) + 'px';
  dd.style.width = Math.max(rect.width, 200) + 'px';
}

function showDropdown(inputEl, items, onSelect, selectedIdx = 0) {
  createACDropdown();
  const dd = document.getElementById('ac-dropdown');
  if (!items.length) { hideDropdown(); return; }
  dd.innerHTML = items.slice(0,12).map((item, i) => {
    const label = typeof item === 'object' ? item.label : item;
    const sub = typeof item === 'object' && item.sub ? `<span class="ac-sub">${item.sub}</span>` : '';
    return `<div class="ac-item ${i === selectedIdx ? 'ac-selected' : ''}" data-idx="${i}">${escHtml(label)}${sub}</div>`;
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
    (val) => { const p = getActivePokemon(); if (p) p.nature = val; }
  );
}

function setupAbilityAC(inputEl, abilities) {
  setupAutocomplete(inputEl,
    async (val) => {
      const v = val.toLowerCase();
      // Use pokemon-specific abilities if available, else full DB
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
      // Use pokemon-specific legal moves if loaded, else full DB
      const source = (legalMoves && legalMoves.length > 0) ? legalMoves : DB_MOVE_NAMES;
      const exact = source.filter(m => m.toLowerCase().startsWith(v));
      const fuzzy = source.filter(m => !m.toLowerCase().startsWith(v) && m.toLowerCase().includes(v));
      return [...exact, ...fuzzy]
        .slice(0, 12)
        .map(m => {
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

  if (state.activeSlotIdx !== null && getActivePokemon()?.name) renderEditor();
}

function renderFilledSlot(p, idx) {
  const isActive = state.activeSlotIdx === idx;
  const typeBar = p.types.length
    ? `background:linear-gradient(90deg,${p.types.map((t,i)=>`${TYPE_COLORS[t]||'#888'} ${i*50}%`).join(',')})`
    : 'background:var(--border)';
  const evPips = STATS.map(s => {
    const pct = (p.evs[s]||0)/252;
    return `<div class="ev-pip" style="opacity:${0.15+pct*0.85};background:${pct>0.9?'var(--gold)':'var(--red)'}"></div>`;
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
      <span class="nature-tag">${p.nature} · Lv${p.level}</span>
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
            <div class="field-group">
              <label class="field-label">Tipo Tera</label>
              <input id="ac-tera" class="field-input" value="${escHtml(p.teraType)}" placeholder="ej. Fire" autocomplete="off">
            </div>
            <div class="field-group">
              <label class="field-label">Nivel</label>
              <input class="field-input" type="number" min="1" max="100" value="${p.level||50}"
                oninput="updatePokemonFieldSilent('level',parseInt(this.value)||50)">
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
            <div class="section-label">EVs</div>
            <span class="ev-total ${total>510?'over':'ok'}">${total}/510</span>
          </div>
          ${STATS.map(s=>`
            <div class="ev-row">
              <span class="ev-stat-name">${s}</span>
              <div class="ev-track" data-ev-stat="${s}" onclick="handleEvTrackClick(event,'${s}')">
                <div class="ev-fill${p.evs[s]>=252?' maxed':''}" style="width:${(p.evs[s]/252)*100}%"></div>
              </div>
              <input class="ev-input" type="number" min="0" max="252" value="${p.evs[s]}"
                oninput="updateEV('${s}',parseInt(this.value)||0)">
            </div>`).join('')}
          <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
            <button class="btn btn-ghost btn-sm" onclick="spreadEVs()">252 Atk/Spe</button>
            <button class="btn btn-ghost btn-sm" onclick="spreadEVsSpecial()">252 SpA/Spe</button>
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
  const teraEl = document.getElementById('ac-tera');

  if (nameEl) setupPokemonAC(nameEl);
  if (itemEl) setupItemAC(itemEl);
  if (abilityEl && p.abilities.length) setupAbilityAC(abilityEl, p.abilities);
  if (natureEl) setupNatureAC(natureEl);
  if (teraEl) setupTeraAC(teraEl);

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
  while (team.pokemon.length <= idx) team.pokemon.push(null);
  team.pokemon[idx] = makePokemon();
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
    p.abilities = data.abilities; p.legalMoves = data.legalMoves;
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
  p.evs[stat] = Math.max(0, Math.min(252, parseInt(value)||0));
  // Update just the EV track in-place without full re-render
  const fill = document.querySelector(`[data-ev-stat="${stat}"] .ev-fill`);
  const total = Object.values(p.evs).reduce((a,b)=>a+b,0);
  const totalEl = document.querySelector('.ev-total');
  if (totalEl) { totalEl.textContent = `${total}/510`; totalEl.className = `ev-total ${total>510?'over':'ok'}`; }
  // Re-render EVs section only if fill not found (first render)
  if (!fill) {
    const evSection = document.querySelector('.evs-section');
    if (evSection) {
      const evsHtml = STATS.map(s=>`
        <div class="ev-row">
          <span class="ev-stat-name">${s}</span>
          <div class="ev-track" data-ev-stat="${s}" onclick="handleEvTrackClick(event,'${s}')">
            <div class="ev-fill${p.evs[s]>=252?' maxed':''}" style="width:${(p.evs[s]/252)*100}%"></div>
          </div>
          <input class="ev-input" type="number" min="0" max="252" value="${p.evs[s]}"
            oninput="updateEV('${s}',parseInt(this.value)||0)">
        </div>`).join('');
      // replace just the rows
    }
  } else {
    fill.style.width = `${(p.evs[stat]/252)*100}%`;
    fill.className = `ev-fill${p.evs[stat]>=252?' maxed':''}`;
  }
};

window.handleEvTrackClick = (e, stat) => {
  const r = e.currentTarget.getBoundingClientRect();
  updateEV(stat, Math.round((e.clientX-r.left)/r.width*252/4)*4);
};

window.spreadEVs = () => { const p = getActivePokemon(); if (!p) return; STATS.forEach(s => p.evs[s]=0); p.evs.Atk=252; p.evs.Spe=252; p.evs.HP=4; renderEditor(); };
window.spreadEVsSpecial = () => { const p = getActivePokemon(); if (!p) return; STATS.forEach(s => p.evs[s]=0); p.evs.SpA=252; p.evs.Spe=252; p.evs.HP=4; renderEditor(); };
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

function escHtml(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── INIT ─────────────────────────────────────────────────────
async function init() {
  createACDropdown();
  getAllPokemonList(); // preload en background

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
