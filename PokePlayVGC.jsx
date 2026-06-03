import { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://altfgsmuwbifuojirugg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdGZnc211d2JpZnVvamlydWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNTc2NjksImV4cCI6MjA5NTgzMzY2OX0.2Xf4hOr8aXW9Qa5e-oS3KKg3ojuedbE5VFDFwEpJz44"
);

const TYPE_COLORS = { Bug:"#92A119",Dark:"#4F4747",Dragon:"#4924A1",Electric:"#EDD53F",Fairy:"#EF70EF",Fighting:"#FF8000",Fire:"#E62829",Flying:"#81B9EF",Ghost:"#70559B",Grass:"#4DAF3B",Ground:"#915121",Ice:"#61CEC0",Normal:"#9FA19F",Poison:"#9141CB",Psychic:"#EF4179",Rock:"#AFA981",Steel:"#60A1B8",Stellar:"#40B4A4",Water:"#2980EF" };
const STAT_KEYS = ["hp","atk","def","spa","spd","spe"];
const STAT_NAMES = { hp:"HP",atk:"Atk",def:"Def",spa:"SpA",spd:"SpD",spe:"Spe" };
const RAW_TYPES = ["Bug","Dark","Dragon","Electric","Fairy","Fighting","Fire","Flying","Ghost","Grass","Ground","Ice","Normal","Poison","Psychic","Rock","Steel","Stellar","Water"];
const RAW_NATURES = [{"id":"adamant","name":"Adamant","plus":"atk","minus":"spa"},{"id":"bashful","name":"Bashful","plus":null,"minus":null},{"id":"bold","name":"Bold","plus":"def","minus":"atk"},{"id":"brave","name":"Brave","plus":"atk","minus":"spe"},{"id":"calm","name":"Calm","plus":"spd","minus":"atk"},{"id":"careful","name":"Careful","plus":"spd","minus":"spa"},{"id":"docile","name":"Docile","plus":null,"minus":null},{"id":"gentle","name":"Gentle","plus":"spd","minus":"def"},{"id":"hardy","name":"Hardy","plus":null,"minus":null},{"id":"hasty","name":"Hasty","plus":"spe","minus":"def"},{"id":"impish","name":"Impish","plus":"def","minus":"spa"},{"id":"jolly","name":"Jolly","plus":"spe","minus":"spa"},{"id":"lax","name":"Lax","plus":"def","minus":"spd"},{"id":"lonely","name":"Lonely","plus":"atk","minus":"def"},{"id":"mild","name":"Mild","plus":"spa","minus":"def"},{"id":"modest","name":"Modest","plus":"spa","minus":"atk"},{"id":"naive","name":"Naive","plus":"spe","minus":"spd"},{"id":"naughty","name":"Naughty","plus":"atk","minus":"spd"},{"id":"quiet","name":"Quiet","plus":"spa","minus":"spe"},{"id":"quirky","name":"Quirky","plus":null,"minus":null},{"id":"rash","name":"Rash","plus":"spa","minus":"spd"},{"id":"relaxed","name":"Relaxed","plus":"def","minus":"spe"},{"id":"sassy","name":"Sassy","plus":"spd","minus":"spe"},{"id":"serious","name":"Serious","plus":null,"minus":null},{"id":"timid","name":"Timid","plus":"spe","minus":"atk"}];

// Compact species: [id, name, num, [types], isMega, requiredItem, battleOnly]
const SPECIES = [["bulbasaur","Bulbasaur",1,["Grass","Poison"]],["ivysaur","Ivysaur",2,["Grass","Poison"]],["venusaur","Venusaur",3,["Grass","Poison"]],["venusaurmega","Venusaur-Mega",3,["Grass","Poison"],1,"Venusaurite"],["charmander","Charmander",4,["Fire"]],["charmeleon","Charmeleon",5,["Fire"]],["charizard","Charizard",6,["Fire","Flying"]],["charizardmegax","Charizard-Mega-X",6,["Fire","Dragon"],1,"Charizardite X"],["charizardmegay","Charizard-Mega-Y",6,["Fire","Flying"],1,"Charizardite Y"],["squirtle","Squirtle",7,["Water"]],["wartortle","Wartortle",8,["Water"]],["blastoise","Blastoise",9,["Water"]],["blastoisemega","Blastoise-Mega",9,["Water"],1,"Blastoisinite"],["caterpie","Caterpie",10,["Bug"]],["metapod","Metapod",11,["Bug"]],["butterfree","Butterfree",12,["Bug","Flying"]],["weedle","Weedle",13,["Bug","Poison"]],["kakuna","Kakuna",14,["Bug","Poison"]],["beedrill","Beedrill",15,["Bug","Poison"]],["beedrillmega","Beedrill-Mega",15,["Bug","Poison"],1,"Beedrillite"],["pidgey","Pidgey",16,["Normal","Flying"]],["pidgeotto","Pidgeotto",17,["Normal","Flying"]],["pidgeot","Pidgeot",18,["Normal","Flying"]],["pidgeotmega","Pidgeot-Mega",18,["Normal","Flying"],1,"Pidgeotite"],["rattata","Rattata",19,["Normal"]],["rattataalola","Rattata-Alola",19,["Dark","Normal"]],["raticate","Raticate",20,["Normal"]],["raticatealola","Raticate-Alola",20,["Dark","Normal"]],["spearow","Spearow",21,["Normal","Flying"]],["fearow","Fearow",22,["Normal","Flying"]],["ekans","Ekans",23,["Poison"]],["arbok","Arbok",24,["Poison"]],["pikachu","Pikachu",25,["Electric"]],["raichu","Raichu",26,["Electric"]],["raichualola","Raichu-Alola",26,["Electric","Psychic"]],["sandshrew","Sandshrew",27,["Ground"]],["sandshrewalola","Sandshrew-Alola",27,["Ice","Steel"]],["sandslash","Sandslash",28,["Ground"]],["sandslashalola","Sandslash-Alola",28,["Ice","Steel"]],["nidoranf","Nidoran-F",29,["Poison"]],["nidorina","Nidorina",30,["Poison"]],["nidoqueen","Nidoqueen",31,["Poison","Ground"]],["nidoranm","Nidoran-M",32,["Poison"]],["nidorino","Nidorino",33,["Poison"]],["nidoking","Nidoking",34,["Poison","Ground"]],["clefairy","Clefairy",35,["Fairy"]],["clefable","Clefable",36,["Fairy"]],["vulpix","Vulpix",37,["Fire"]],["vulpixalola","Vulpix-Alola",37,["Ice"]],["ninetales","Ninetales",38,["Fire"]],["ninetalesalola","Ninetales-Alola",38,["Ice","Fairy"]],["jigglypuff","Jigglypuff",39,["Normal","Fairy"]],["wigglytuff","Wigglytuff",40,["Normal","Fairy"]],["zubat","Zubat",41,["Poison","Flying"]],["golbat","Golbat",42,["Poison","Flying"]],["oddish","Oddish",43,["Grass","Poison"]],["gloom","Gloom",44,["Grass","Poison"]],["vileplume","Vileplume",45,["Grass","Poison"]],["paras","Paras",46,["Bug","Grass"]],["parasect","Parasect",47,["Bug","Grass"]],["venonat","Venonat",48,["Bug","Poison"]],["venomoth","Venomoth",49,["Bug","Poison"]],["diglett","Diglett",50,["Ground"]],["diglettalola","Diglett-Alola",50,["Ground","Steel"]],["dugtrio","Dugtrio",51,["Ground"]],["dugtrioalola","Dugtrio-Alola",51,["Ground","Steel"]],["meowth","Meowth",52,["Normal"]],["meowthalola","Meowth-Alola",52,["Dark"]],["meowthgalar","Meowth-Galar",52,["Steel"]],["persian","Persian",53,["Normal"]],["persianalola","Persian-Alola",53,["Dark"]],["psyduck","Psyduck",54,["Water"]],["golduck","Golduck",55,["Water"]],["mankey","Mankey",56,["Fighting"]],["primeape","Primeape",57,["Fighting"]],["growlithe","Growlithe",58,["Fire"]],["growlithehisui","Growlithe-Hisui",58,["Fire","Rock"]],["arcanine","Arcanine",59,["Fire"]],["arcaninehisui","Arcanine-Hisui",59,["Fire","Rock"]],["poliwag","Poliwag",60,["Water"]],["poliwhirl","Poliwhirl",61,["Water"]],["poliwrath","Poliwrath",62,["Water","Fighting"]],["abra","Abra",63,["Psychic"]],["kadabra","Kadabra",64,["Psychic"]],["alakazam","Alakazam",65,["Psychic"]],["alakazammega","Alakazam-Mega",65,["Psychic"],1,"Alakazite"],["machop","Machop",66,["Fighting"]],["machoke","Machoke",67,["Fighting"]],["machamp","Machamp",68,["Fighting"]],["bellsprout","Bellsprout",69,["Grass","Poison"]],["weepinbell","Weepinbell",70,["Grass","Poison"]],["victreebel","Victreebel",71,["Grass","Poison"]],["tentacool","Tentacool",72,["Water","Poison"]],["tentacruel","Tentacruel",73,["Water","Poison"]],["geodude","Geodude",74,["Rock","Ground"]],["geodudealola","Geodude-Alola",74,["Rock","Electric"]],["graveler","Graveler",75,["Rock","Ground"]],["graveleralola","Graveler-Alola",75,["Rock","Electric"]],["golem","Golem",76,["Rock","Ground"]],["golemalola","Golem-Alola",76,["Rock","Electric"]],["ponyta","Ponyta",77,["Fire"]],["ponytagonal","Ponyta-Galar",77,["Psychic"]],["rapidash","Rapidash",78,["Fire"]],["rapidashgalar","Rapidash-Galar",78,["Psychic","Fairy"]],["slowpoke","Slowpoke",79,["Water","Psychic"]],["slowpokegalar","Slowpoke-Galar",79,["Psychic"]],["slowbro","Slowbro",80,["Water","Psychic"]],["slowbromega","Slowbro-Mega",80,["Water","Psychic"],1,"Slowbronite"],["slowbrogalar","Slowbro-Galar",80,["Poison","Psychic"]],["magnemite","Magnemite",81,["Electric","Steel"]],["magneton","Magneton",82,["Electric","Steel"]],["farfetchd","Farfetch'd",83,["Normal","Flying"]],["farfetchdgalar","Farfetch'd-Galar",83,["Fighting"]],["doduo","Doduo",84,["Normal","Flying"]],["dodrio","Dodrio",85,["Normal","Flying"]],["seel","Seel",86,["Water"]],["dewgong","Dewgong",87,["Water","Ice"]],["grimer","Grimer",88,["Poison"]],["grimeralola","Grimer-Alola",88,["Poison","Dark"]],["muk","Muk",89,["Poison"]],["mukalola","Muk-Alola",89,["Poison","Dark"]],["shellder","Shellder",90,["Water"]],["cloyster","Cloyster",91,["Water","Ice"]],["gastly","Gastly",92,["Ghost","Poison"]],["haunter","Haunter",93,["Ghost","Poison"]],["gengar","Gengar",94,["Ghost","Poison"]],["gengarmega","Gengar-Mega",94,["Ghost","Poison"],1,"Gengarite"],["onix","Onix",95,["Rock","Ground"]],["drowzee","Drowzee",96,["Psychic"]],["hypno","Hypno",97,["Psychic"]],["krabby","Krabby",98,["Water"]],["kingler","Kingler",99,["Water"]],["voltorb","Voltorb",100,["Electric"]],["voltorbhisui","Voltorb-Hisui",100,["Electric","Grass"]],["electrode","Electrode",101,["Electric"]],["electrodehisui","Electrode-Hisui",101,["Electric","Grass"]],["exeggcute","Exeggcute",102,["Grass","Psychic"]],["exeggutor","Exeggutor",103,["Grass","Psychic"]],["exeggutoralola","Exeggutor-Alola",103,["Grass","Dragon"]],["cubone","Cubone",104,["Ground"]],["marowak","Marowak",105,["Ground"]],["marowakalola","Marowak-Alola",105,["Fire","Ghost"]],["hitmonlee","Hitmonlee",106,["Fighting"]],["hitmonchan","Hitmonchan",107,["Fighting"]],["lickitung","Lickitung",108,["Normal"]],["koffing","Koffing",109,["Poison"]],["weezing","Weezing",110,["Poison"]],["weezinggalar","Weezing-Galar",110,["Poison","Fairy"]],["rhyhorn","Rhyhorn",111,["Ground","Rock"]],["rhydon","Rhydon",112,["Ground","Rock"]],["chansey","Chansey",113,["Normal"]],["tangela","Tangela",114,["Grass"]],["kangaskhan","Kangaskhan",115,["Normal"]],["kangaskhanmega","Kangaskhan-Mega",115,["Normal"],1,"Kangaskhanite"],["horsea","Horsea",116,["Water"]],["seadra","Seadra",117,["Water"]],["goldeen","Goldeen",118,["Water"]],["seaking","Seaking",119,["Water"]],["staryu","Staryu",120,["Water"]],["starmie","Starmie",121,["Water","Psychic"]],["mrmime","Mr. Mime",122,["Psychic","Fairy"]],["mrmimegalar","Mr. Mime-Galar",122,["Ice","Psychic"]],["scyther","Scyther",123,["Bug","Flying"]],["jynx","Jynx",124,["Ice","Psychic"]],["electabuzz","Electabuzz",125,["Electric"]],["magmar","Magmar",126,["Fire"]],["pinsir","Pinsir",127,["Bug"]],["pinsirmega","Pinsir-Mega",127,["Bug","Flying"],1,"Pinsirite"],["tauros","Tauros",128,["Normal"]],["taurospaldea","Tauros-Paldea",128,["Fighting"]],["taurospaldeafire","Tauros-Paldea-Fire",128,["Fighting","Fire"]],["taurospaldeawater","Tauros-Paldea-Water",128,["Fighting","Water"]],["magikarp","Magikarp",129,["Water"]],["gyarados","Gyarados",130,["Water","Flying"]],["gyaradosmega","Gyarados-Mega",130,["Water","Dark"],1,"Gyaradosite"],["lapras","Lapras",131,["Water","Ice"]],["ditto","Ditto",132,["Normal"]],["eevee","Eevee",133,["Normal"]],["vaporeon","Vaporeon",134,["Water"]],["jolteon","Jolteon",135,["Electric"]],["flareon","Flareon",136,["Fire"]],["porygon","Porygon",137,["Normal"]],["omanyte","Omanyte",138,["Rock","Water"]],["omastar","Omastar",139,["Rock","Water"]],["kabuto","Kabuto",140,["Rock","Water"]],["kabutops","Kabutops",141,["Rock","Water"]],["aerodactyl","Aerodactyl",142,["Rock","Flying"]],["aerodactylmega","Aerodactyl-Mega",142,["Rock","Flying"],1,"Aerodactylite"],["snorlax","Snorlax",143,["Normal"]],["articuno","Articuno",144,["Ice","Flying"]],["articunogalar","Articuno-Galar",144,["Psychic","Flying"]],["zapdos","Zapdos",145,["Electric","Flying"]],["zapdosgalar","Zapdos-Galar",145,["Fighting","Flying"]],["moltres","Moltres",146,["Fire","Flying"]],["moltresgalar","Moltres-Galar",146,["Dark","Flying"]],["dratini","Dratini",147,["Dragon"]],["dragonair","Dragonair",148,["Dragon"]],["dragonite","Dragonite",149,["Dragon","Flying"]],["mewtwo","Mewtwo",150,["Psychic"]],["mew","Mew",151,["Psychic"]],["chikorita","Chikorita",152,["Grass"]],["bayleef","Bayleef",153,["Grass"]],["meganium","Meganium",154,["Grass"]],["cyndaquil","Cyndaquil",155,["Fire"]],["quilava","Quilava",156,["Fire"]],["typhlosion","Typhlosion",157,["Fire"]],["typhlosionhisui","Typhlosion-Hisui",157,["Fire","Ghost"]],["totodile","Totodile",158,["Water"]],["croconaw","Croconaw",159,["Water"]],["feraligatr","Feraligatr",160,["Water"]],["sentret","Sentret",161,["Normal"]],["furret","Furret",162,["Normal"]],["hoothoot","Hoothoot",163,["Normal","Flying"]],["noctowl","Noctowl",164,["Normal","Flying"]],["ledyba","Ledyba",165,["Bug","Flying"]],["ledian","Ledian",166,["Bug","Flying"]],["spinarak","Spinarak",167,["Bug","Poison"]],["ariados","Ariados",168,["Bug","Poison"]],["crobat","Crobat",169,["Poison","Flying"]],["chinchou","Chinchou",170,["Water","Electric"]],["lanturn","Lanturn",171,["Water","Electric"]],["pichu","Pichu",172,["Electric"]],["cleffa","Cleffa",173,["Fairy"]],["igglybuff","Igglybuff",174,["Normal","Fairy"]],["togepi","Togepi",175,["Fairy"]],["togetic","Togetic",176,["Fairy","Flying"]],["natu","Natu",177,["Psychic","Flying"]],["xatu","Xatu",178,["Psychic","Flying"]],["mareep","Mareep",179,["Electric"]],["flaaffy","Flaaffy",180,["Electric"]],["ampharos","Ampharos",181,["Electric"]],["ampharosmega","Ampharos-Mega",181,["Electric","Dragon"],1,"Ampharosite"],["bellossom","Bellossom",182,["Grass"]],["marill","Marill",183,["Water","Fairy"]],["azumarill","Azumarill",184,["Water","Fairy"]],["sudowoodo","Sudowoodo",185,["Rock"]],["politoed","Politoed",186,["Water"]],["hoppip","Hoppip",187,["Grass","Flying"]],["skiploom","Skiploom",188,["Grass","Flying"]],["jumpluff","Jumpluff",189,["Grass","Flying"]],["aipom","Aipom",190,["Normal"]],["sunkern","Sunkern",191,["Grass"]],["sunflora","Sunflora",192,["Grass"]],["yanma","Yanma",193,["Bug","Flying"]],["wooper","Wooper",194,["Water","Ground"]],["wooperpaldea","Wooper-Paldea",194,["Poison","Ground"]],["quagsire","Quagsire",195,["Water","Ground"]],["espeon","Espeon",196,["Psychic"]],["umbreon","Umbreon",197,["Dark"]],["murkrow","Murkrow",198,["Dark","Flying"]],["slowking","Slowking",199,["Water","Psychic"]],["slowkinggalar","Slowking-Galar",199,["Poison","Psychic"]],["misdreavus","Misdreavus",200,["Ghost"]],["unown","Unown",201,["Psychic"]],["wobbuffet","Wobbuffet",202,["Psychic"]],["girafarig","Girafarig",203,["Normal","Psychic"]],["pineco","Pineco",204,["Bug"]],["forretress","Forretress",205,["Bug","Steel"]],["dunsparce","Dunsparce",206,["Normal"]],["gligar","Gligar",207,["Ground","Flying"]],["steelix","Steelix",208,["Steel","Ground"]],["steelixmega","Steelix-Mega",208,["Steel","Ground"],1,"Steelixite"],["snubbull","Snubbull",209,["Fairy"]],["granbull","Granbull",210,["Fairy"]],["qwilfish","Qwilfish",211,["Water","Poison"]],["qwilfishhisui","Qwilfish-Hisui",211,["Dark","Poison"]],["scizor","Scizor",212,["Bug","Steel"]],["scizormega","Scizor-Mega",212,["Bug","Steel"],1,"Scizorite"],["shuckle","Shuckle",213,["Bug","Rock"]],["heracross","Heracross",214,["Bug","Fighting"]],["heracrossmega","Heracross-Mega",214,["Bug","Fighting"],1,"Heracronite"],["sneasel","Sneasel",215,["Dark","Ice"]],["sneaselhisui","Sneasel-Hisui",215,["Fighting","Poison"]],["teddiursa","Teddiursa",216,["Normal"]],["ursaring","Ursaring",217,["Normal"]],["slugma","Slugma",218,["Fire"]],["magcargo","Magcargo",219,["Fire","Rock"]],["swinub","Swinub",220,["Ice","Ground"]],["piloswine","Piloswine",221,["Ice","Ground"]],["corsola","Corsola",222,["Water","Rock"]],["corsolagalar","Corsola-Galar",222,["Ghost"]],["remoraid","Remoraid",223,["Water"]],["octillery","Octillery",224,["Water"]],["delibird","Delibird",225,["Ice","Flying"]],["mantine","Mantine",226,["Water","Flying"]],["skarmory","Skarmory",227,["Steel","Flying"]],["houndour","Houndour",228,["Dark","Fire"]],["houndoom","Houndoom",229,["Dark","Fire"]],["houndoommega","Houndoom-Mega",229,["Dark","Fire"],1,"Houndoominite"],["kingdra","Kingdra",230,["Water","Dragon"]],["phanpy","Phanpy",231,["Ground"]],["donphan","Donphan",232,["Ground"]],["porygon2","Porygon2",233,["Normal"]],["stantler","Stantler",234,["Normal"]],["smeargle","Smeargle",235,["Normal"]],["tyrogue","Tyrogue",236,["Fighting"]],["hitmontop","Hitmontop",237,["Fighting"]],["smoochum","Smoochum",238,["Ice","Psychic"]],["elekid","Elekid",239,["Electric"]],["magby","Magby",240,["Fire"]],["miltank","Miltank",241,["Normal"]],["blissey","Blissey",242,["Normal"]],["raikou","Raikou",243,["Electric"]],["entei","Entei",244,["Fire"]],["suicune","Suicune",245,["Water"]],["larvitar","Larvitar",246,["Rock","Ground"]],["pupitar","Pupitar",247,["Rock","Ground"]],["tyranitar","Tyranitar",248,["Rock","Dark"]],["tyranitarmega","Tyranitar-Mega",248,["Rock","Dark"],1,"Tyranitarite"],["lugia","Lugia",249,["Psychic","Flying"]],["hooh","Ho-Oh",250,["Fire","Flying"]],["celebi","Celebi",251,["Psychic","Grass"]],["treecko","Treecko",252,["Grass"]],["grovyle","Grovyle",253,["Grass"]],["sceptile","Sceptile",254,["Grass"]],["sceptilemega","Sceptile-Mega",254,["Grass","Dragon"],1,"Sceptilite"],["torchic","Torchic",255,["Fire"]],["combusken","Combusken",256,["Fire","Fighting"]],["blaziken","Blaziken",257,["Fire","Fighting"]],["blazikenmega","Blaziken-Mega",257,["Fire","Fighting"],1,"Blazikenite"],["mudkip","Mudkip",258,["Water"]],["marshtomp","Marshtomp",259,["Water","Ground"]],["swampert","Swampert",260,["Water","Ground"]],["swampertmega","Swampert-Mega",260,["Water","Ground"],1,"Swampertite"],["poochyena","Poochyena",261,["Dark"]],["mightyena","Mightyena",262,["Dark"]],["zigzagoon","Zigzagoon",263,["Normal"]],["zigzagoongalar","Zigzagoon-Galar",263,["Dark","Normal"]],["linoone","Linoone",264,["Normal"]],["linoonegalar","Linoone-Galar",264,["Dark","Normal"]],["wurmple","Wurmple",265,["Bug"]],["silcoon","Silcoon",266,["Bug"]],["beautifly","Beautifly",267,["Bug","Flying"]],["cascoon","Cascoon",268,["Bug"]],["dustox","Dustox",269,["Bug","Poison"]],["lotad","Lotad",270,["Water","Grass"]],["lombre","Lombre",271,["Water","Grass"]],["ludicolo","Ludicolo",272,["Water","Grass"]],["seedot","Seedot",273,["Grass"]],["nuzleaf","Nuzleaf",274,["Grass","Dark"]],["shiftry","Shiftry",275,["Grass","Dark"]],["taillow","Taillow",276,["Normal","Flying"]],["swellow","Swellow",277,["Normal","Flying"]],["wingull","Wingull",278,["Water","Flying"]],["pelipper","Pelipper",279,["Water","Flying"]],["ralts","Ralts",280,["Psychic","Fairy"]],["kirlia","Kirlia",281,["Psychic","Fairy"]],["gardevoir","Gardevoir",282,["Psychic","Fairy"]],["gardevoirmega","Gardevoir-Mega",282,["Psychic","Fairy"],1,"Gardevoirite"],["surskit","Surskit",283,["Bug","Water"]],["masquerain","Masquerain",284,["Bug","Flying"]],["shroomish","Shroomish",285,["Grass"]],["breloom","Breloom",286,["Grass","Fighting"]],["slakoth","Slakoth",287,["Normal"]],["vigoroth","Vigoroth",288,["Normal"]],["slaking","Slaking",289,["Normal"]],["nincada","Nincada",290,["Bug","Ground"]],["ninjask","Ninjask",291,["Bug","Flying"]],["shedinja","Shedinja",292,["Bug","Ghost"]],["whismur","Whismur",293,["Normal"]],["loudred","Loudred",294,["Normal"]],["exploud","Exploud",295,["Normal"]],["makuhita","Makuhita",296,["Fighting"]],["hariyama","Hariyama",297,["Fighting"]],["azurill","Azurill",298,["Normal","Fairy"]],["nosepass","Nosepass",299,["Rock"]],["skitty","Skitty",300,["Normal"]],["delcatty","Delcatty",301,["Normal"]],["sableye","Sableye",302,["Dark","Ghost"]],["sableyemega","Sableye-Mega",302,["Dark","Ghost"],1,"Sablenite"],["mawile","Mawile",303,["Steel","Fairy"]],["mawilemega","Mawile-Mega",303,["Steel","Fairy"],1,"Mawilite"],["aron","Aron",304,["Steel","Rock"]],["lairon","Lairon",305,["Steel","Rock"]],["aggron","Aggron",306,["Steel","Rock"]],["aggronmega","Aggron-Mega",306,["Steel"],1,"Aggronite"],["meditite","Meditite",307,["Fighting","Psychic"]],["medicham","Medicham",308,["Fighting","Psychic"]],["medichammega","Medicham-Mega",308,["Fighting","Psychic"],1,"Medichamite"],["electrike","Electrike",309,["Electric"]],["manectric","Manectric",310,["Electric"]],["manectricmega","Manectric-Mega",310,["Electric"],1,"Manectite"],["plusle","Plusle",311,["Electric"]],["minun","Minun",312,["Electric"]],["volbeat","Volbeat",313,["Bug"]],["illumise","Illumise",314,["Bug"]],["roselia","Roselia",315,["Grass","Poison"]],["gulpin","Gulpin",316,["Poison"]],["swalot","Swalot",317,["Poison"]],["carvanha","Carvanha",318,["Water","Dark"]],["sharpedo","Sharpedo",319,["Water","Dark"]],["sharpedomega","Sharpedo-Mega",319,["Water","Dark"],1,"Sharpedonite"],["wailmer","Wailmer",320,["Water"]],["wailord","Wailord",321,["Water"]],["numel","Numel",322,["Fire","Ground"]],["camerupt","Camerupt",323,["Fire","Ground"]],["cameruptmega","Camerupt-Mega",323,["Fire","Ground"],1,"Cameruptite"],["torkoal","Torkoal",324,["Fire"]],["spoink","Spoink",325,["Psychic"]],["grumpig","Grumpig",326,["Psychic"]],["spinda","Spinda",327,["Normal"]],["trapinch","Trapinch",328,["Ground"]],["vibrava","Vibrava",329,["Ground","Dragon"]],["flygon","Flygon",330,["Ground","Dragon"]],["cacnea","Cacnea",331,["Grass"]],["cacturne","Cacturne",332,["Grass","Dark"]],["swablu","Swablu",333,["Normal","Flying"]],["altaria","Altaria",334,["Dragon","Flying"]],["altariamega","Altaria-Mega",334,["Dragon","Fairy"],1,"Altarianite"],["zangoose","Zangoose",335,["Normal"]],["seviper","Seviper",336,["Poison"]],["lunatone","Lunatone",337,["Rock","Psychic"]],["solrock","Solrock",338,["Rock","Psychic"]],["barboach","Barboach",339,["Water","Ground"]],["whiscash","Whiscash",340,["Water","Ground"]],["corphish","Corphish",341,["Water"]],["crawdaunt","Crawdaunt",342,["Water","Dark"]],["baltoy","Baltoy",343,["Ground","Psychic"]],["claydol","Claydol",344,["Ground","Psychic"]],["lileep","Lileep",345,["Rock","Grass"]],["cradily","Cradily",346,["Rock","Grass"]],["anorith","Anorith",347,["Rock","Bug"]],["armaldo","Armaldo",348,["Rock","Bug"]],["feebas","Feebas",349,["Water"]],["milotic","Milotic",350,["Water"]],["castform","Castform",351,["Normal"]],["kecleon","Kecleon",352,["Normal"]],["shuppet","Shuppet",353,["Ghost"]],["banette","Banette",354,["Ghost"]],["banettemega","Banette-Mega",354,["Ghost"],1,"Banettite"],["duskull","Duskull",355,["Ghost"]],["dusclops","Dusclops",356,["Ghost"]],["tropius","Tropius",357,["Grass","Flying"]],["chimecho","Chimecho",358,["Psychic"]],["absol","Absol",359,["Dark"]],["absolmega","Absol-Mega",359,["Dark"],1,"Absolite"],["wynaut","Wynaut",360,["Psychic"]],["snorunt","Snorunt",361,["Ice"]],["glalie","Glalie",362,["Ice"]],["glaliemega","Glalie-Mega",362,["Ice"],1,"Glalitite"],["spheal","Spheal",363,["Ice","Water"]],["sealeo","Sealeo",364,["Ice","Water"]],["walrein","Walrein",365,["Ice","Water"]],["clamperl","Clamperl",366,["Water"]],["huntail","Huntail",367,["Water"]],["gorebyss","Gorebyss",368,["Water"]],["relicanth","Relicanth",369,["Water","Rock"]],["luvdisc","Luvdisc",370,["Water"]],["bagon","Bagon",371,["Dragon"]],["shelgon","Shelgon",372,["Dragon"]],["salamence","Salamence",373,["Dragon","Flying"]],["salamencemega","Salamence-Mega",373,["Dragon","Flying"],1,"Salamencite"],["beldum","Beldum",374,["Steel","Psychic"]],["metang","Metang",375,["Steel","Psychic"]],["metagross","Metagross",376,["Steel","Psychic"]],["metagrossmega","Metagross-Mega",376,["Steel","Psychic"],1,"Metagrossite"],["regirock","Regirock",377,["Rock"]],["regice","Regice",378,["Ice"]],["registeel","Registeel",379,["Steel"]],["latias","Latias",380,["Dragon","Psychic"]],["latiasmega","Latias-Mega",380,["Dragon","Psychic"],1,"Latiasite"],["latios","Latios",381,["Dragon","Psychic"]],["latiosmega","Latios-Mega",381,["Dragon","Psychic"],1,"Latiosite"],["kyogre","Kyogre",382,["Water"]],["groudon","Groudon",383,["Ground"]],["rayquaza","Rayquaza",384,["Dragon","Flying"]],["jirachi","Jirachi",385,["Steel","Psychic"]],["deoxys","Deoxys",386,["Psychic"]],["deoxysattack","Deoxys-Attack",386,["Psychic"]],["deoxysdefense","Deoxys-Defense",386,["Psychic"]],["deoxysspeed","Deoxys-Speed",386,["Psychic"]],["turtwig","Turtwig",387,["Grass"]],["grotle","Grotle",388,["Grass"]],["torterra","Torterra",389,["Grass","Ground"]],["chimchar","Chimchar",390,["Fire"]],["monferno","Monferno",391,["Fire","Fighting"]],["infernape","Infernape",392,["Fire","Fighting"]],["piplup","Piplup",393,["Water"]],["prinplup","Prinplup",394,["Water"]],["empoleon","Empoleon",395,["Water","Steel"]],["starly","Starly",396,["Normal","Flying"]],["staravia","Staravia",397,["Normal","Flying"]],["staraptor","Staraptor",398,["Normal","Flying"]],["bidoof","Bidoof",399,["Normal"]],["bibarel","Bibarel",400,["Normal","Water"]],["kricketot","Kricketot",401,["Bug"]],["kricketune","Kricketune",402,["Bug"]],["shinx","Shinx",403,["Electric"]],["luxio","Luxio",404,["Electric"]],["luxray","Luxray",405,["Electric"]],["budew","Budew",406,["Grass","Poison"]],["roserade","Roserade",407,["Grass","Poison"]],["cranidos","Cranidos",408,["Rock"]],["rampardos","Rampardos",409,["Rock"]],["shieldon","Shieldon",410,["Rock","Steel"]],["bastiodon","Bastiodon",411,["Rock","Steel"]],["burmy","Burmy",412,["Bug"]],["wormadam","Wormadam",413,["Bug","Grass"]],["wormadamsandy","Wormadam-Sandy",413,["Bug","Ground"]],["wormadamtrash","Wormadam-Trash",413,["Bug","Steel"]],["mothim","Mothim",414,["Bug","Flying"]],["combee","Combee",415,["Bug","Flying"]],["vespiquen","Vespiquen",416,["Bug","Flying"]],["pachirisu","Pachirisu",417,["Electric"]],["buizel","Buizel",418,["Water"]],["floatzel","Floatzel",419,["Water"]],["cherubi","Cherubi",420,["Grass"]],["cherrim","Cherrim",421,["Grass"]],["shellos","Shellos",422,["Water"]],["gastrodon","Gastrodon",423,["Water","Ground"]],["ambipom","Ambipom",424,["Normal"]],["drifloon","Drifloon",425,["Ghost","Flying"]],["drifblim","Drifblim",426,["Ghost","Flying"]],["buneary","Buneary",427,["Normal"]],["lopunny","Lopunny",428,["Normal"]],["lopunnymega","Lopunny-Mega",428,["Normal","Fighting"],1,"Lopunnite"],["mismagius","Mismagius",429,["Ghost"]],["honchkrow","Honchkrow",430,["Dark","Flying"]],["glameow","Glameow",431,["Normal"]],["purugly","Purugly",432,["Normal"]],["chingling","Chingling",433,["Psychic"]],["stunky","Stunky",434,["Poison","Dark"]],["skuntank","Skuntank",435,["Poison","Dark"]],["bronzor","Bronzor",436,["Steel","Psychic"]],["bronzong","Bronzong",437,["Steel","Psychic"]],["bonsly","Bonsly",438,["Rock"]],["mimejr","Mime Jr.",439,["Psychic","Fairy"]],["happiny","Happiny",440,["Normal"]],["chatot","Chatot",441,["Normal","Flying"]],["spiritomb","Spiritomb",442,["Ghost","Dark"]],["gible","Gible",443,["Dragon","Ground"]],["gabite","Gabite",444,["Dragon","Ground"]],["garchomp","Garchomp",445,["Dragon","Ground"]],["garchompmega","Garchomp-Mega",445,["Dragon","Ground"],1,"Garchompite"],["munchlax","Munchlax",446,["Normal"]],["riolu","Riolu",447,["Fighting"]],["lucario","Lucario",448,["Fighting","Steel"]],["lucariomega","Lucario-Mega",448,["Fighting","Steel"],1,"Lucarionite"],["hippopotas","Hippopotas",449,["Ground"]],["hippowdon","Hippowdon",450,["Ground"]],["skorupi","Skorupi",451,["Poison","Bug"]],["drapion","Drapion",452,["Poison","Dark"]],["croagunk","Croagunk",453,["Poison","Fighting"]],["toxicroak","Toxicroak",454,["Poison","Fighting"]],["carnivine","Carnivine",455,["Grass"]],["finneon","Finneon",456,["Water"]],["lumineon","Lumineon",457,["Water"]],["mantyke","Mantyke",458,["Water","Flying"]],["snover","Snover",459,["Grass","Ice"]],["abomasnow","Abomasnow",460,["Grass","Ice"]],["abomasnowmega","Abomasnow-Mega",460,["Grass","Ice"],1,"Abomasite"],["weavile","Weavile",461,["Dark","Ice"]],["magnezone","Magnezone",462,["Electric","Steel"]],["lickilicky","Lickilicky",463,["Normal"]],["rhyperior","Rhyperior",464,["Ground","Rock"]],["tangrowth","Tangrowth",465,["Grass"]],["electivire","Electivire",466,["Electric"]],["magmortar","Magmortar",467,["Fire"]],["togekiss","Togekiss",468,["Fairy","Flying"]],["yanmega","Yanmega",469,["Bug","Flying"]],["leafeon","Leafeon",470,["Grass"]],["glaceon","Glaceon",471,["Ice"]],["gliscor","Gliscor",472,["Ground","Flying"]],["mamoswine","Mamoswine",473,["Ice","Ground"]],["porygonz","Porygon-Z",474,["Normal"]],["gallade","Gallade",475,["Psychic","Fighting"]],["galladem ega","Gallade-Mega",475,["Psychic","Fighting"],1,"Galladite"],["probopass","Probopass",476,["Rock","Steel"]],["dusknoir","Dusknoir",477,["Ghost"]],["froslass","Froslass",478,["Ice","Ghost"]],["rotom","Rotom",479,["Electric","Ghost"]],["rotomheat","Rotom-Heat",479,["Electric","Fire"]],["rotomwash","Rotom-Wash",479,["Electric","Water"]],["rotomfrost","Rotom-Frost",479,["Electric","Ice"]],["rotomfan","Rotom-Fan",479,["Electric","Flying"]],["rotommow","Rotom-Mow",479,["Electric","Grass"]],["uxie","Uxie",480,["Psychic"]],["mesprit","Mesprit",481,["Psychic"]],["azelf","Azelf",482,["Psychic"]],["dialga","Dialga",483,["Steel","Dragon"]],["dialgaorigin","Dialga-Origin",483,["Steel","Dragon"]],["palkia","Palkia",484,["Water","Dragon"]],["palkiaorigin","Palkia-Origin",484,["Water","Dragon"]],["heatran","Heatran",485,["Fire","Steel"]],["regigigas","Regigigas",486,["Normal"]],["giratina","Giratina",487,["Ghost","Dragon"]],["giratinaorigin","Giratina-Origin",487,["Ghost","Dragon"]],["cresselia","Cresselia",488,["Psychic"]],["phione","Phione",489,["Water"]],["manaphy","Manaphy",490,["Water"]],["darkrai","Darkrai",491,["Dark"]],["shaymin","Shaymin",492,["Grass"]],["shayminsky","Shaymin-Sky",492,["Grass","Flying"]],["arceus","Arceus",493,["Normal"]],["victini","Victini",494,["Psychic","Fire"]],["snivy","Snivy",495,["Grass"]],["servine","Servine",496,["Grass"]],["serperior","Serperior",497,["Grass"]],["tepig","Tepig",498,["Fire"]],["pignite","Pignite",499,["Fire","Fighting"]],["emboar","Emboar",500,["Fire","Fighting"]],["oshawott","Oshawott",501,["Water"]],["dewott","Dewott",502,["Water"]],["samurott","Samurott",503,["Water"]],["samurotthisui","Samurott-Hisui",503,["Water","Dark"]],["patrat","Patrat",504,["Normal"]],["watchog","Watchog",505,["Normal"]],["lillipup","Lillipup",506,["Normal"]],["herdier","Herdier",507,["Normal"]],["stoutland","Stoutland",508,["Normal"]],["purrloin","Purrloin",509,["Dark"]],["liepard","Liepard",510,["Dark"]],["pansage","Pansage",511,["Grass"]],["simisage","Simisage",512,["Grass"]],["pansear","Pansear",513,["Fire"]],["simisear","Simisear",514,["Fire"]],["panpour","Panpour",515,["Water"]],["simipour","Simipour",516,["Water"]],["munna","Munna",517,["Psychic"]],["musharna","Musharna",518,["Psychic"]],["pidove","Pidove",519,["Normal","Flying"]],["tranquill","Tranquill",520,["Normal","Flying"]],["unfezant","Unfezant",521,["Normal","Flying"]],["blitzle","Blitzle",522,["Electric"]],["zebstrika","Zebstrika",523,["Electric"]],["roggenrola","Roggenrola",524,["Rock"]],["boldore","Boldore",525,["Rock"]],["gigalith","Gigalith",526,["Rock"]],["woobat","Woobat",527,["Psychic","Flying"]],["swoobat","Swoobat",528,["Psychic","Flying"]],["drilbur","Drilbur",529,["Ground"]],["excadrill","Excadrill",530,["Ground","Steel"]],["audino","Audino",531,["Normal"]],["audiinomega","Audino-Mega",531,["Normal","Fairy"],1,"Audinite"],["timburr","Timburr",532,["Fighting"]],["gurdurr","Gurdurr",533,["Fighting"]],["conkeldurr","Conkeldurr",534,["Fighting"]],["tympole","Tympole",535,["Water"]],["palpitoad","Palpitoad",536,["Water","Ground"]],["seismitoad","Seismitoad",537,["Water","Ground"]],["throh","Throh",538,["Fighting"]],["sawk","Sawk",539,["Fighting"]],["sewaddle","Sewaddle",540,["Bug","Grass"]],["swadloon","Swadloon",541,["Bug","Grass"]],["leavanny","Leavanny",542,["Bug","Grass"]],["venipede","Venipede",543,["Bug","Poison"]],["whirlipede","Whirlipede",544,["Bug","Poison"]],["scolipede","Scolipede",545,["Bug","Poison"]],["cottonee","Cottonee",546,["Grass","Fairy"]],["whimsicott","Whimsicott",547,["Grass","Fairy"]],["petilil","Petilil",548,["Grass"]],["lilligant","Lilligant",549,["Grass"]],["lilliganthisui","Lilligant-Hisui",549,["Grass","Fighting"]],["basculin","Basculin",550,["Water"]],["basculinbluestriped","Basculin-Blue-Striped",550,["Water"]],["basculinwhitestriped","Basculin-White-Striped",550,["Water"]],["sandile","Sandile",551,["Ground","Dark"]],["krokorok","Krokorok",552,["Ground","Dark"]],["krookodile","Krookodile",553,["Ground","Dark"]],["darumaka","Darumaka",554,["Fire"]],["darumakagalar","Darumaka-Galar",554,["Ice"]],["darmanitan","Darmanitan",555,["Fire"]],["darmanitangalar","Darmanitan-Galar",555,["Ice"]],["maractus","Maractus",556,["Grass"]],["dwebble","Dwebble",557,["Bug","Rock"]],["crustle","Crustle",558,["Bug","Rock"]],["scraggy","Scraggy",559,["Dark","Fighting"]],["scrafty","Scrafty",560,["Dark","Fighting"]],["sigilyph","Sigilyph",561,["Psychic","Flying"]],["yamask","Yamask",562,["Ghost"]],["yamaskgalar","Yamask-Galar",562,["Ground","Ghost"]],["cofagrigus","Cofagrigus",563,["Ghost"]],["tirtouga","Tirtouga",564,["Water","Rock"]],["carracosta","Carracosta",565,["Water","Rock"]],["archen","Archen",566,["Rock","Flying"]],["archeops","Archeops",567,["Rock","Flying"]],["trubbish","Trubbish",568,["Poison"]],["garbodor","Garbodor",569,["Poison"]],["zorua","Zorua",570,["Dark"]],["zoruahisui","Zorua-Hisui",570,["Normal","Ghost"]],["zoroark","Zoroark",571,["Dark"]],["zoroarkhisui","Zoroark-Hisui",571,["Normal","Ghost"]],["minccino","Minccino",572,["Normal"]],["cinccino","Cinccino",573,["Normal"]],["gothita","Gothita",574,["Psychic"]],["gothorita","Gothorita",575,["Psychic"]],["gothitelle","Gothitelle",576,["Psychic"]],["solosis","Solosis",577,["Psychic"]],["duosion","Duosion",578,["Psychic"]],["reuniclus","Reuniclus",579,["Psychic"]],["ducklett","Ducklett",580,["Water","Flying"]],["swanna","Swanna",581,["Water","Flying"]],["vanillite","Vanillite",582,["Ice"]],["vanillish","Vanillish",583,["Ice"]],["vanilluxe","Vanilluxe",584,["Ice"]],["deerling","Deerling",585,["Normal","Grass"]],["sawsbuck","Sawsbuck",586,["Normal","Grass"]],["emolga","Emolga",587,["Electric","Flying"]],["karrablast","Karrablast",588,["Bug"]],["escavalier","Escavalier",589,["Bug","Steel"]],["foongus","Foongus",590,["Grass","Poison"]],["amoonguss","Amoonguss",591,["Grass","Poison"]],["frillish","Frillish",592,["Water","Ghost"]],["jellicent","Jellicent",593,["Water","Ghost"]],["alomomola","Alomomola",594,["Water"]],["joltik","Joltik",595,["Bug","Electric"]],["galvantula","Galvantula",596,["Bug","Electric"]],["ferroseed","Ferroseed",597,["Grass","Steel"]],["ferrothorn","Ferrothorn",598,["Grass","Steel"]],["klink","Klink",599,["Steel"]],["klang","Klang",600,["Steel"]],["klinklang","Klinklang",601,["Steel"]],["tynamo","Tynamo",602,["Electric"]],["eelektrik","Eelektrik",603,["Electric"]],["eelektross","Eelektross",604,["Electric"]],["elgyem","Elgyem",605,["Psychic"]],["beheeyem","Beheeyem",606,["Psychic"]],["litwick","Litwick",607,["Ghost","Fire"]],["lampent","Lampent",608,["Ghost","Fire"]],["chandelure","Chandelure",609,["Ghost","Fire"]],["axew","Axew",610,["Dragon"]],["fraxure","Fraxure",611,["Dragon"]],["haxorus","Haxorus",612,["Dragon"]],["cubchoo","Cubchoo",613,["Ice"]],["beartic","Beartic",614,["Ice"]],["cryogonal","Cryogonal",615,["Ice"]],["shelmet","Shelmet",616,["Bug"]],["accelgor","Accelgor",617,["Bug"]],["stunfisk","Stunfisk",618,["Ground","Electric"]],["stunfiskgalar","Stunfisk-Galar",618,["Ground","Steel"]],["mienfoo","Mienfoo",619,["Fighting"]],["mienshao","Mienshao",620,["Fighting"]],["druddigon","Druddigon",621,["Dragon"]],["golett","Golett",622,["Ground","Ghost"]],["golurk","Golurk",623,["Ground","Ghost"]],["pawniard","Pawniard",624,["Dark","Steel"]],["bisharp","Bisharp",625,["Dark","Steel"]],["bouffalant","Bouffalant",626,["Normal"]],["rufflet","Rufflet",627,["Normal","Flying"]],["braviary","Braviary",628,["Normal","Flying"]],["braviaryhisui","Braviary-Hisui",628,["Psychic","Flying"]],["vullaby","Vullaby",629,["Dark","Flying"]],["mandibuzz","Mandibuzz",630,["Dark","Flying"]],["heatmor","Heatmor",631,["Fire"]],["durant","Durant",632,["Bug","Steel"]],["deino","Deino",633,["Dark","Dragon"]],["zweilous","Zweilous",634,["Dark","Dragon"]],["hydreigon","Hydreigon",635,["Dark","Dragon"]],["larvesta","Larvesta",636,["Bug","Fire"]],["volcarona","Volcarona",637,["Bug","Fire"]],["cobalion","Cobalion",638,["Steel","Fighting"]],["terrakion","Terrakion",639,["Rock","Fighting"]],["virizion","Virizion",640,["Grass","Fighting"]],["tornadus","Tornadus",641,["Flying"]],["tornadustherian","Tornadus-Therian",641,["Flying"]],["thundurus","Thundurus",642,["Electric","Flying"]],["thundurustherian","Thundurus-Therian",642,["Electric","Flying"]],["reshiram","Reshiram",643,["Dragon","Fire"]],["zekrom","Zekrom",644,["Dragon","Electric"]],["landorus","Landorus",645,["Ground","Flying"]],["landorustherian","Landorus-Therian",645,["Ground","Flying"]],["kyurem","Kyurem",646,["Dragon","Ice"]],["kyuremblack","Kyurem-Black",646,["Dragon","Ice"]],["kyuremwhite","Kyurem-White",646,["Dragon","Ice"]],["keldeo","Keldeo",647,["Water","Fighting"]],["meloetta","Meloetta",648,["Normal","Psychic"]],["genesect","Genesect",649,["Bug","Steel"]],["chespin","Chespin",650,["Grass"]],["quilladin","Quilladin",651,["Grass"]],["chesnaught","Chesnaught",652,["Grass","Fighting"]],["fennekin","Fennekin",653,["Fire"]],["braixen","Braixen",654,["Fire"]],["delphox","Delphox",655,["Fire","Psychic"]],["froakie","Froakie",656,["Water"]],["frogadier","Frogadier",657,["Water"]],["greninja","Greninja",658,["Water","Dark"]],["bunnelby","Bunnelby",659,["Normal"]],["diggersby","Diggersby",660,["Normal","Ground"]],["fletchling","Fletchling",661,["Normal","Flying"]],["fletchinder","Fletchinder",662,["Fire","Flying"]],["talonflame","Talonflame",663,["Fire","Flying"]],["scatterbug","Scatterbug",664,["Bug"]],["spewpa","Spewpa",665,["Bug"]],["vivillon","Vivillon",666,["Bug","Flying"]],["litleo","Litleo",667,["Fire","Normal"]],["pyroar","Pyroar",668,["Fire","Normal"]],["flabebe","Flabébé",669,["Fairy"]],["floette","Floette",670,["Fairy"]],["florges","Florges",671,["Fairy"]],["skiddo","Skiddo",672,["Grass"]],["gogoat","Gogoat",673,["Grass"]],["pancham","Pancham",674,["Fighting"]],["pangoro","Pangoro",675,["Fighting","Dark"]],["furfrou","Furfrou",676,["Normal"]],["espurr","Espurr",677,["Psychic"]],["meowstic","Meowstic",678,["Psychic"]],["honedge","Honedge",679,["Steel","Ghost"]],["doublade","Doublade",680,["Steel","Ghost"]],["aegislash","Aegislash",681,["Steel","Ghost"]],["spritzee","Spritzee",682,["Fairy"]],["aromatisse","Aromatisse",683,["Fairy"]],["swirlix","Swirlix",684,["Fairy"]],["slurpuff","Slurpuff",685,["Fairy"]],["inkay","Inkay",686,["Dark","Psychic"]],["malamar","Malamar",687,["Dark","Psychic"]],["binacle","Binacle",688,["Rock","Water"]],["barbaracle","Barbaracle",689,["Rock","Water"]],["skrelp","Skrelp",690,["Poison","Water"]],["dragalge","Dragalge",691,["Poison","Dragon"]],["clauncher","Clauncher",692,["Water"]],["clawitzer","Clawitzer",693,["Water"]],["helioptile","Helioptile",694,["Electric","Normal"]],["heliolisk","Heliolisk",695,["Electric","Normal"]],["tyrunt","Tyrunt",696,["Rock","Dragon"]],["tyrantrum","Tyrantrum",697,["Rock","Dragon"]],["amaura","Amaura",698,["Rock","Ice"]],["aurorus","Aurorus",699,["Rock","Ice"]],["sylveon","Sylveon",700,["Fairy"]],["hawlucha","Hawlucha",701,["Fighting","Flying"]],["dedenne","Dedenne",702,["Electric","Fairy"]],["carbink","Carbink",703,["Rock","Fairy"]],["goomy","Goomy",704,["Dragon"]],["sliggoo","Sliggoo",705,["Dragon"]],["sliggoohisui","Sliggoo-Hisui",705,["Steel","Dragon"]],["goodra","Goodra",706,["Dragon"]],["goodrahisui","Goodra-Hisui",706,["Steel","Dragon"]],["klefki","Klefki",707,["Steel","Fairy"]],["phantump","Phantump",708,["Ghost","Grass"]],["trevenant","Trevenant",709,["Ghost","Grass"]],["pumpkaboo","Pumpkaboo",710,["Ghost","Grass"]],["gourgeist","Gourgeist",711,["Ghost","Grass"]],["bergmite","Bergmite",712,["Ice"]],["avalugg","Avalugg",713,["Ice"]],["avalugghisui","Avalugg-Hisui",713,["Ice","Rock"]],["noibat","Noibat",714,["Flying","Dragon"]],["noivern","Noivern",715,["Flying","Dragon"]],["xerneas","Xerneas",716,["Fairy"]],["yveltal","Yveltal",717,["Dark","Flying"]],["zygarde","Zygarde",718,["Dragon","Ground"]],["zygarde10","Zygarde-10%",718,["Dragon","Ground"]],["diancie","Diancie",719,["Rock","Fairy"]],["dianciemega","Diancie-Mega",719,["Rock","Fairy"],1,"Diancite"],["hoopa","Hoopa",720,["Psychic","Ghost"]],["hoopaunbound","Hoopa-Unbound",720,["Psychic","Dark"]],["volcanion","Volcanion",721,["Fire","Water"]],["rowlet","Rowlet",722,["Grass","Flying"]],["dartrix","Dartrix",723,["Grass","Flying"]],["decidueye","Decidueye",724,["Grass","Ghost"]],["decidueyehisui","Decidueye-Hisui",724,["Grass","Fighting"]],["litten","Litten",725,["Fire"]],["torracat","Torracat",726,["Fire"]],["incineroar","Incineroar",727,["Fire","Dark"]],["popplio","Popplio",728,["Water"]],["brionne","Brionne",729,["Water"]],["primarina","Primarina",730,["Water","Fairy"]],["pikipek","Pikipek",731,["Normal","Flying"]],["trumbeak","Trumbeak",732,["Normal","Flying"]],["toucannon","Toucannon",733,["Normal","Flying"]],["yungoos","Yungoos",734,["Normal"]],["gumshoos","Gumshoos",735,["Normal"]],["grubbin","Grubbin",736,["Bug"]],["charjabug","Charjabug",737,["Bug","Electric"]],["vikavolt","Vikavolt",738,["Bug","Electric"]],["crabrawler","Crabrawler",739,["Fighting"]],["crabominable","Crabominable",740,["Fighting","Ice"]],["oricorio","Oricorio",741,["Fire","Flying"]],["cutiefly","Cutiefly",742,["Bug","Fairy"]],["ribombee","Ribombee",743,["Bug","Fairy"]],["rockruff","Rockruff",744,["Rock"]],["lycanroc","Lycanroc",745,["Rock"]],["lycanrocmidnight","Lycanroc-Midnight",745,["Rock"]],["lycanrocdusk","Lycanroc-Dusk",745,["Rock"]],["wishiwashi","Wishiwashi",746,["Water"]],["mareanie","Mareanie",747,["Poison","Water"]],["toxapex","Toxapex",748,["Poison","Water"]],["mudbray","Mudbray",749,["Ground"]],["mudsdale","Mudsdale",750,["Ground"]],["dewpider","Dewpider",751,["Water","Bug"]],["araquanid","Araquanid",752,["Water","Bug"]],["fomantis","Fomantis",753,["Grass"]],["lurantis","Lurantis",754,["Grass"]],["morelull","Morelull",755,["Grass","Fairy"]],["shiinotic","Shiinotic",756,["Grass","Fairy"]],["salandit","Salandit",757,["Poison","Fire"]],["salazzle","Salazzle",758,["Poison","Fire"]],["stufful","Stufful",759,["Normal","Fighting"]],["bewear","Bewear",760,["Normal","Fighting"]],["bounsweet","Bounsweet",761,["Grass"]],["steenee","Steenee",762,["Grass"]],["tsareena","Tsareena",763,["Grass"]],["comfey","Comfey",764,["Fairy"]],["oranguru","Oranguru",765,["Normal","Psychic"]],["passimian","Passimian",766,["Fighting"]],["wimpod","Wimpod",767,["Bug","Water"]],["golisopod","Golisopod",768,["Bug","Water"]],["sandygast","Sandygast",769,["Ghost","Ground"]],["palossand","Palossand",770,["Ghost","Ground"]],["pyukumuku","Pyukumuku",771,["Water"]],["typenull","Type: Null",772,["Normal"]],["silvally","Silvally",773,["Normal"]],["minior","Minior",774,["Rock","Flying"]],["komala","Komala",775,["Normal"]],["turtonator","Turtonator",776,["Fire","Dragon"]],["togedemaru","Togedemaru",777,["Electric","Steel"]],["mimikyu","Mimikyu",778,["Ghost","Fairy"]],["bruxish","Bruxish",779,["Water","Psychic"]],["drampa","Drampa",780,["Normal","Dragon"]],["dhelmise","Dhelmise",781,["Ghost","Grass"]],["jangmoo","Jangmo-o",782,["Dragon"]],["hakamoo","Hakamo-o",783,["Dragon","Fighting"]],["kommoo","Kommo-o",784,["Dragon","Fighting"]],["tapukoko","Tapu Koko",785,["Electric","Fairy"]],["tapulele","Tapu Lele",786,["Psychic","Fairy"]],["tapubulu","Tapu Bulu",787,["Grass","Fairy"]],["tapufini","Tapu Fini",788,["Water","Fairy"]],["cosmog","Cosmog",789,["Psychic"]],["cosmoem","Cosmoem",790,["Psychic"]],["solgaleo","Solgaleo",791,["Psychic","Steel"]],["lunala","Lunala",792,["Psychic","Ghost"]],["nihilego","Nihilego",793,["Rock","Poison"]],["buzzwole","Buzzwole",794,["Bug","Fighting"]],["pheromosa","Pheromosa",795,["Bug","Fighting"]],["xurkitree","Xurkitree",796,["Electric"]],["celesteela","Celesteela",797,["Steel","Flying"]],["kartana","Kartana",798,["Grass","Steel"]],["guzzlord","Guzzlord",799,["Dark","Dragon"]],["necrozma","Necrozma",800,["Psychic"]],["magearna","Magearna",801,["Steel","Fairy"]],["marshadow","Marshadow",802,["Fighting","Ghost"]],["poipole","Poipole",803,["Poison"]],["naganadel","Naganadel",804,["Poison","Dragon"]],["stakataka","Stakataka",805,["Rock","Steel"]],["blacephalon","Blacephalon",806,["Fire","Ghost"]],["zeraora","Zeraora",807,["Electric"]],["meltan","Meltan",808,["Steel"]],["melmetal","Melmetal",809,["Steel"]],["grookey","Grookey",810,["Grass"]],["thwackey","Thwackey",811,["Grass"]],["rillaboom","Rillaboom",812,["Grass"]],["scorbunny","Scorbunny",813,["Fire"]],["raboot","Raboot",814,["Fire"]],["cinderace","Cinderace",815,["Fire"]],["sobble","Sobble",816,["Water"]],["drizzile","Drizzile",817,["Water"]],["inteleon","Inteleon",818,["Water"]],["skwovet","Skwovet",819,["Normal"]],["greedent","Greedent",820,["Normal"]],["rookidee","Rookidee",821,["Flying"]],["corvisquire","Corvisquire",822,["Flying"]],["corviknight","Corviknight",823,["Flying","Steel"]],["blipbug","Blipbug",824,["Bug"]],["dottler","Dottler",825,["Bug","Psychic"]],["orbeetle","Orbeetle",826,["Bug","Psychic"]],["nickit","Nickit",827,["Dark"]],["thievul","Thievul",828,["Dark"]],["gossifleur","Gossifleur",829,["Grass"]],["eldegoss","Eldegoss",830,["Grass"]],["wooloo","Wooloo",831,["Normal"]],["dubwool","Dubwool",832,["Normal"]],["chewtle","Chewtle",833,["Water"]],["drednaw","Drednaw",834,["Water","Rock"]],["yamper","Yamper",835,["Electric"]],["boltund","Boltund",836,["Electric"]],["rolycoly","Rolycoly",837,["Rock"]],["carkol","Carkol",838,["Rock","Fire"]],["coalossal","Coalossal",839,["Rock","Fire"]],["applin","Applin",840,["Grass","Dragon"]],["flapple","Flapple",841,["Grass","Dragon"]],["appletun","Appletun",842,["Grass","Dragon"]],["silicobra","Silicobra",843,["Ground"]],["sandaconda","Sandaconda",844,["Ground"]],["cramorant","Cramorant",845,["Flying","Water"]],["arrokuda","Arrokuda",846,["Water"]],["barraskewda","Barraskewda",847,["Water"]],["toxel","Toxel",848,["Electric","Poison"]],["toxtricity","Toxtricity",849,["Electric","Poison"]],["toxtricitylowkey","Toxtricity-Low-Key",849,["Electric","Poison"]],["sizzlipede","Sizzlipede",850,["Fire","Bug"]],["centiskorch","Centiskorch",851,["Fire","Bug"]],["clobbopus","Clobbopus",852,["Fighting"]],["grapploct","Grapploct",853,["Fighting"]],["sinistea","Sinistea",854,["Ghost"]],["polteageist","Polteageist",855,["Ghost"]],["hatenna","Hatenna",856,["Psychic"]],["hattrem","Hattrem",857,["Psychic"]],["hatterene","Hatterene",858,["Psychic","Fairy"]],["impidimp","Impidimp",859,["Dark","Fairy"]],["morgrem","Morgrem",860,["Dark","Fairy"]],["grimmsnarl","Grimmsnarl",861,["Dark","Fairy"]],["obstagoon","Obstagoon",862,["Dark","Normal"]],["perrserker","Perrserker",863,["Steel"]],["cursola","Cursola",864,["Ghost"]],["sirfetchd","Sirfetch'd",865,["Fighting"]],["mrrime","Mr. Rime",866,["Ice","Psychic"]],["runerigus","Runerigus",867,["Ground","Ghost"]],["milcery","Milcery",868,["Fairy"]],["alcremie","Alcremie",869,["Fairy"]],["falinks","Falinks",870,["Fighting"]],["pincurchin","Pincurchin",871,["Electric"]],["snom","Snom",872,["Ice","Bug"]],["frosmoth","Frosmoth",873,["Ice","Bug"]],["stonjourner","Stonjourner",874,["Rock"]],["eiscue","Eiscue",875,["Ice"]],["indeedee","Indeedee",876,["Psychic","Normal"]],["morpeko","Morpeko",877,["Electric","Dark"]],["cufant","Cufant",878,["Steel"]],["copperajah","Copperajah",879,["Steel"]],["dracozolt","Dracozolt",880,["Electric","Dragon"]],["arctozolt","Arctozolt",881,["Electric","Ice"]],["dracovish","Dracovish",882,["Water","Dragon"]],["arctovish","Arctovish",883,["Water","Ice"]],["duraludon","Duraludon",884,["Steel","Dragon"]],["dreepy","Dreepy",885,["Dragon","Ghost"]],["drakloak","Drakloak",886,["Dragon","Ghost"]],["dragapult","Dragapult",887,["Dragon","Ghost"]],["zacian","Zacian",888,["Fairy"]],["zamazenta","Zamazenta",889,["Fighting"]],["eternatus","Eternatus",890,["Poison","Dragon"]],["kubfu","Kubfu",891,["Fighting"]],["urshifu","Urshifu",892,["Fighting","Dark"]],["urshifurapidstrike","Urshifu-Rapid-Strike",892,["Fighting","Water"]],["zarude","Zarude",893,["Dark","Grass"]],["regieleki","Regieleki",894,["Electric"]],["regidrago","Regidrago",895,["Dragon"]],["glastrier","Glastrier",896,["Ice"]],["spectrier","Spectrier",897,["Ghost"]],["calyrex","Calyrex",898,["Psychic","Grass"]],["enamorus","Enamorus",905,["Fairy","Flying"]],["enamorustherian","Enamorus-Therian",905,["Fairy","Flying"]],["sprigatito","Sprigatito",906,["Grass"]],["floragato","Floragato",907,["Grass"]],["meowscarada","Meowscarada",908,["Grass","Dark"]],["fuecoco","Fuecoco",909,["Fire"]],["crocalor","Crocalor",910,["Fire"]],["skeledirge","Skeledirge",911,["Fire","Ghost"]],["quaxly","Quaxly",912,["Water"]],["quaxwell","Quaxwell",913,["Water"]],["quaquaval","Quaquaval",914,["Water","Fighting"]],["lechonk","Lechonk",915,["Normal"]],["oinkologne","Oinkologne",916,["Normal"]],["tarountula","Tarountula",917,["Bug"]],["spidops","Spidops",918,["Bug"]],["nymble","Nymble",919,["Bug"]],["lokix","Lokix",920,["Bug","Dark"]],["pawmi","Pawmi",921,["Electric"]],["pawmo","Pawmo",922,["Electric","Fighting"]],["pawmot","Pawmot",923,["Electric","Fighting"]],["tandemaus","Tandemaus",924,["Normal"]],["maushold","Maushold",925,["Normal"]],["fidough","Fidough",926,["Fairy"]],["dachsbun","Dachsbun",927,["Fairy"]],["smoliv","Smoliv",928,["Grass","Normal"]],["dolliv","Dolliv",929,["Grass","Normal"]],["arboliva","Arboliva",930,["Grass","Normal"]],["squawkabilly","Squawkabilly",931,["Normal","Flying"]],["nacli","Nacli",932,["Rock"]],["naclstack","Naclstack",933,["Rock"]],["garganacl","Garganacl",934,["Rock"]],["charcadet","Charcadet",935,["Fire"]],["armarouge","Armarouge",936,["Fire","Psychic"]],["ceruledge","Ceruledge",937,["Fire","Ghost"]],["tadbulb","Tadbulb",938,["Electric"]],["bellibolt","Bellibolt",939,["Electric"]],["wattrel","Wattrel",940,["Electric","Flying"]],["kilowattrel","Kilowattrel",941,["Electric","Flying"]],["maschiff","Maschiff",942,["Dark"]],["mabosstiff","Mabosstiff",943,["Dark"]],["shroodle","Shroodle",944,["Poison","Normal"]],["grafaiai","Grafaiai",945,["Poison","Normal"]],["bramblin","Bramblin",946,["Grass","Ghost"]],["brambleghast","Brambleghast",947,["Grass","Ghost"]],["toedscool","Toedscool",948,["Ground","Grass"]],["toedscruel","Toedscruel",949,["Ground","Grass"]],["klawf","Klawf",950,["Rock"]],["capsakid","Capsakid",951,["Grass"]],["scovillain","Scovillain",952,["Grass","Fire"]],["rellor","Rellor",953,["Bug"]],["rabsca","Rabsca",954,["Bug","Psychic"]],["flittle","Flittle",955,["Psychic"]],["espathra","Espathra",956,["Psychic"]],["tinkatink","Tinkatink",957,["Fairy","Steel"]],["tinkatuff","Tinkatuff",958,["Fairy","Steel"]],["tinkaton","Tinkaton",959,["Fairy","Steel"]],["wiglett","Wiglett",960,["Water"]],["wugtrio","Wugtrio",961,["Water"]],["bombirdier","Bombirdier",962,["Flying","Dark"]],["finizen","Finizen",963,["Water"]],["palafin","Palafin",964,["Water"]],["varoom","Varoom",965,["Steel","Poison"]],["revavroom","Revavroom",966,["Steel","Poison"]],["cyclizar","Cyclizar",967,["Dragon","Normal"]],["orthworm","Orthworm",968,["Steel"]],["glimmet","Glimmet",969,["Rock","Poison"]],["glimmora","Glimmora",970,["Rock","Poison"]],["greavard","Greavard",971,["Ghost"]],["houndstone","Houndstone",972,["Ghost"]],["flamigo","Flamigo",973,["Flying","Fighting"]],["cetoddle","Cetoddle",974,["Ice"]],["cetitan","Cetitan",975,["Ice"]],["veluza","Veluza",976,["Water","Psychic"]],["dondozo","Dondozo",977,["Water"]],["tatsugiri","Tatsugiri",978,["Dragon","Water"]],["annihilape","Annihilape",979,["Fighting","Ghost"]],["clodsire","Clodsire",980,["Poison","Ground"]],["farigiraf","Farigiraf",981,["Normal","Psychic"]],["dudunsparce","Dudunsparce",982,["Normal"]],["kingambit","Kingambit",983,["Dark","Steel"]],["greattusk","Great Tusk",984,["Ground","Fighting"]],["screamtail","Scream Tail",985,["Fairy","Psychic"]],["brutebonnet","Brute Bonnet",986,["Grass","Dark"]],["fluttermane","Flutter Mane",987,["Ghost","Fairy"]],["slitherwing","Slither Wing",988,["Bug","Fighting"]],["sandyshocks","Sandy Shocks",989,["Electric","Ground"]],["irontreads","Iron Treads",990,["Ground","Steel"]],["ironbundle","Iron Bundle",991,["Ice","Water"]],["ironhands","Iron Hands",992,["Fighting","Electric"]],["ironjugulis","Iron Jugulis",993,["Dark","Flying"]],["ironmoth","Iron Moth",994,["Fire","Poison"]],["ironthorns","Iron Thorns",995,["Rock","Electric"]],["frigibax","Frigibax",996,["Dragon","Ice"]],["arctibax","Arctibax",997,["Dragon","Ice"]],["baxcalibur","Baxcalibur",998,["Dragon","Ice"]],["gimmighoul","Gimmighoul",999,["Ghost"]],["gholdengo","Gholdengo",1000,["Steel","Ghost"]],["wochien","Wo-Chien",1001,["Dark","Grass"]],["chienpao","Chien-Pao",1002,["Dark","Ice"]],["tinglu","Ting-Lu",1003,["Dark","Ground"]],["chiyu","Chi-Yu",1004,["Dark","Fire"]],["roaringmoon","Roaring Moon",1005,["Dragon","Dark"]],["ironvaliant","Iron Valiant",1006,["Fairy","Fighting"]],["koraidon","Koraidon",1007,["Fighting","Dragon"]],["miraidon","Miraidon",1008,["Electric","Dragon"]],["walkingwake","Walking Wake",1009,["Water","Dragon"]],["ironleaves","Iron Leaves",1010,["Grass","Psychic"]],["dipplin","Dipplin",1011,["Grass","Dragon"]],["poltchageist","Poltchageist",1012,["Grass","Ghost"]],["sinistcha","Sinistcha",1013,["Grass","Ghost"]],["okidogi","Okidogi",1014,["Poison","Fighting"]],["munkidori","Munkidori",1015,["Poison","Psychic"]],["fezandipiti","Fezandipiti",1016,["Poison","Fairy"]],["ogerpon","Ogerpon",1017,["Grass"]],["archaludon","Archaludon",1018,["Steel","Dragon"]],["hydrapple","Hydrapple",1019,["Grass","Dragon"]],["gougingfire","Gouging Fire",1020,["Fire","Dragon"]],["ragingbolt","Raging Bolt",1021,["Electric","Dragon"]],["ironboulder","Iron Boulder",1022,["Rock","Psychic"]],["ironcrown","Iron Crown",1023,["Steel","Psychic"]],["terapagos","Terapagos",1024,["Normal"]],["pecharunt","Pecharunt",1025,["Poison","Ghost"]]];

const MOVES = [["Absorb","Grass","S"],["Accelerock","Rock","P"],["Acid Spray","Poison","S"],["Acrobatics","Flying","P"],["Aerial Ace","Flying","P"],["After You","Normal","Z"],["Agility","Psychic","Z"],["Air Slash","Flying","S"],["Amnesia","Psychic","Z"],["Ancient Power","Rock","S"],["Aqua Jet","Water","P"],["Aqua Step","Water","P"],["Aqua Tail","Water","P"],["Armor Cannon","Fire","S"],["Aromatherapy","Grass","Z"],["Assurance","Dark","P"],["Aura Sphere","Fighting","S"],["Aurora Beam","Ice","S"],["Aurora Veil","Ice","Z"],["Autotomize","Steel","Z"],["Avalanche","Ice","P"],["Baton Pass","Normal","Z"],["Bitter Blade","Fire","P"],["Blizzard","Ice","S"],["Body Press","Fighting","P"],["Body Slam","Normal","P"],["Bolt Strike","Electric","P"],["Boomburst","Normal","S"],["Brave Bird","Flying","P"],["Breaking Swipe","Dragon","P"],["Brick Break","Fighting","P"],["Bug Buzz","Bug","S"],["Bulk Up","Fighting","Z"],["Bulldoze","Ground","P"],["Calm Mind","Psychic","Z"],["Ceaseless Edge","Dark","P"],["Charge Beam","Electric","S"],["Charm","Fairy","Z"],["Chilling Water","Water","S"],["Close Combat","Fighting","P"],["Coaching","Fighting","Z"],["Coil","Poison","Z"],["Comeuppance","Dark","P"],["Core Enforcer","Dragon","S"],["Cosmic Power","Psychic","Z"],["Counter","Fighting","P"],["Court Change","Normal","Z"],["Crunch","Dark","P"],["Curse","Ghost","Z"],["Dark Pulse","Dark","S"],["Dazzling Gleam","Fairy","S"],["Destiny Bond","Ghost","Z"],["Detect","Fighting","Z"],["Diamond Storm","Rock","P"],["Dig","Ground","P"],["Disable","Normal","Z"],["Discharge","Electric","S"],["Dive","Water","P"],["Double-Edge","Normal","P"],["Double Hit","Normal","P"],["Draco Meteor","Dragon","S"],["Dragon Claw","Dragon","P"],["Dragon Dance","Dragon","Z"],["Dragon Energy","Dragon","S"],["Dragon Pulse","Dragon","S"],["Dragon Rush","Dragon","P"],["Dragon Tail","Dragon","P"],["Draining Kiss","Fairy","S"],["Drain Punch","Fighting","P"],["Drill Peck","Flying","P"],["Drill Run","Ground","P"],["Dual Wingbeat","Flying","P"],["Earth Power","Ground","S"],["Earthquake","Ground","P"],["Eerie Impulse","Electric","Z"],["Electric Terrain","Electric","Z"],["Electro Ball","Electric","S"],["Electro Shot","Electric","S"],["Electroweb","Electric","S"],["Ember","Fire","S"],["Encore","Normal","Z"],["Endeavor","Normal","P"],["Endure","Normal","Z"],["Energy Ball","Grass","S"],["Eruption","Fire","S"],["Esper Wing","Psychic","S"],["Explosion","Normal","P"],["Extrasensory","Psychic","S"],["Extreme Speed","Normal","P"],["Facade","Normal","P"],["Fake Out","Normal","P"],["Fake Tears","Dark","Z"],["Feint","Normal","P"],["Fiery Wrath","Dark","S"],["Final Gambit","Fighting","S"],["Fire Blast","Fire","S"],["Fire Fang","Fire","P"],["Fire Lash","Fire","P"],["Fire Punch","Fire","P"],["Fire Spin","Fire","S"],["First Impression","Bug","P"],["Fishious Rend","Water","P"],["Flame Charge","Fire","P"],["Flamethrower","Fire","S"],["Flare Blitz","Fire","P"],["Flash Cannon","Steel","S"],["Fling","Dark","P"],["Focus Blast","Fighting","S"],["Focus Energy","Normal","Z"],["Follow Me","Normal","Z"],["Force Palm","Fighting","P"],["Foul Play","Dark","P"],["Freeze-Dry","Ice","S"],["Freezing Glare","Psychic","S"],["Frost Breath","Ice","S"],["Fury Cutter","Bug","P"],["Future Sight","Psychic","S"],["Gastro Acid","Poison","Z"],["Gear Grind","Steel","P"],["Geomancy","Fairy","Z"],["Giga Drain","Grass","S"],["Giga Impact","Normal","P"],["Glacial Lance","Ice","P"],["Glaive Rush","Dragon","P"],["Glare","Normal","Z"],["Grass Knot","Grass","S"],["Grassy Terrain","Grass","Z"],["Grav Apple","Grass","P"],["Gravity","Psychic","Z"],["Gunk Shot","Poison","P"],["Gyro Ball","Steel","P"],["Hard Press","Steel","P"],["Haze","Ice","Z"],["Head Smash","Rock","P"],["Heal Bell","Normal","Z"],["Heal Pulse","Psychic","Z"],["Heat Crash","Fire","P"],["Heat Wave","Fire","S"],["Heavy Slam","Steel","P"],["Helping Hand","Normal","Z"],["Hex","Ghost","S"],["High Horsepower","Ground","P"],["High Jump Kick","Fighting","P"],["Hone Claws","Dark","Z"],["Horn Leech","Grass","P"],["Hurricane","Flying","S"],["Hydro Pump","Water","S"],["Hyper Beam","Normal","S"],["Hyper Drill","Normal","P"],["Hyper Voice","Normal","S"],["Ice Beam","Ice","S"],["Ice Fang","Ice","P"],["Ice Hammer","Ice","P"],["Ice Punch","Ice","P"],["Ice Shard","Ice","P"],["Ice Spinner","Ice","P"],["Icicle Crash","Ice","P"],["Icicle Spear","Ice","P"],["Icy Wind","Ice","S"],["Imprison","Psychic","Z"],["Incinerate","Fire","S"],["Infernal Parade","Ghost","S"],["Instruct","Psychic","Z"],["Iron Defense","Steel","Z"],["Iron Head","Steel","P"],["Iron Tail","Steel","P"],["Jaw Lock","Dark","P"],["Jet Punch","Water","P"],["Jungle Healing","Grass","Z"],["Knock Off","Dark","P"],["Leaf Blade","Grass","P"],["Leaf Storm","Grass","S"],["Leech Life","Bug","P"],["Leech Seed","Grass","Z"],["Life Dew","Water","Z"],["Light Screen","Psychic","Z"],["Liquidation","Water","P"],["Low Kick","Fighting","P"],["Low Sweep","Fighting","P"],["Lumina Crash","Psychic","S"],["Lunar Blessing","Psychic","Z"],["Lunar Dance","Psychic","Z"],["Lunge","Bug","P"],["Mach Punch","Fighting","P"],["Magical Leaf","Grass","S"],["Magical Torque","Fairy","P"],["Magic Coat","Psychic","Z"],["Magic Room","Psychic","Z"],["Magma Storm","Fire","S"],["Misty Explosion","Fairy","S"],["Misty Terrain","Fairy","Z"],["Moonblast","Fairy","S"],["Moongeist Beam","Ghost","S"],["Moonlight","Fairy","Z"],["Morning Sun","Normal","Z"],["Muddy Water","Water","S"],["Mystical Fire","Fire","S"],["Nasty Plot","Dark","Z"],["Night Daze","Dark","S"],["Night Shade","Ghost","S"],["Night Slash","Dark","P"],["Nuzzle","Electric","P"],["Obstruct","Dark","Z"],["Origin Pulse","Water","S"],["Outrage","Dragon","P"],["Overheat","Fire","S"],["Pain Split","Pain Split","Z"],["Parting Shot","Dark","Z"],["Payback","Dark","P"],["Perish Song","Normal","Z"],["Phantom Force","Ghost","P"],["Photon Geyser","Psychic","S"],["Play Rough","Fairy","P"],["Poison Fang","Poison","P"],["Poison Jab","Poison","P"],["Poison Tail","Poison","P"],["Population Bomb","Normal","P"],["Power Gem","Rock","S"],["Power Whip","Grass","P"],["Precipice Blades","Ground","P"],["Protect","Normal","Z"],["Psybeam","Psychic","S"],["Psychic","Psychic","S"],["Psychic Fangs","Psychic","P"],["Psychic Noise","Psychic","S"],["Psychic Terrain","Psychic","Z"],["Psycho Boost","Psychic","S"],["Psycho Cut","Psychic","P"],["Psystrike","Psychic","S"],["Quiver Dance","Bug","Z"],["Rage Powder","Bug","Z"],["Rapid Spin","Normal","P"],["Razor Shell","Water","P"],["Recover","Normal","Z"],["Reflect","Psychic","Z"],["Rest","Psychic","Z"],["Return","Normal","P"],["Reversal","Fighting","P"],["Rising Voltage","Electric","S"],["Roar","Normal","Z"],["Rock Blast","Rock","P"],["Rock Polish","Rock","Z"],["Rock Slide","Rock","P"],["Rock Tomb","Rock","P"],["Roost","Flying","Z"],["Round","Normal","S"],["Sacred Sword","Fighting","P"],["Sandstorm","Rock","Z"],["Scale Shot","Dragon","P"],["Scary Face","Normal","Z"],["Scorching Sands","Ground","S"],["Seed Bomb","Grass","P"],["Shadow Ball","Ghost","S"],["Shadow Bone","Ghost","P"],["Shadow Claw","Ghost","P"],["Shadow Force","Ghost","P"],["Shadow Sneak","Ghost","P"],["Shell Smash","Normal","Z"],["Shift Gear","Steel","Z"],["Shock Wave","Electric","S"],["Skill Swap","Psychic","Z"],["Sleep Talk","Normal","Z"],["Sludge Bomb","Poison","S"],["Sludge Wave","Poison","S"],["Smart Strike","Steel","P"],["Snowscape","Ice","Z"],["Soft-Boiled","Normal","Z"],["Solar Beam","Grass","S"],["Solar Blade","Grass","P"],["Spacial Rend","Dragon","S"],["Sparkling Aria","Water","S"],["Spectral Thief","Ghost","P"],["Spikes","Ground","Z"],["Spiky Shield","Grass","Z"],["Spirit Break","Fairy","P"],["Spirit Shackle","Ghost","P"],["Spore","Grass","Z"],["Stealth Rock","Rock","Z"],["Steel Beam","Steel","S"],["Steel Roller","Steel","P"],["Stomping Tantrum","Ground","P"],["Stored Power","Psychic","S"],["Strange Steam","Fairy","S"],["Strength Sap","Grass","Z"],["String Shot","Bug","Z"],["Stun Spore","Grass","Z"],["Substitute","Normal","Z"],["Sucker Punch","Dark","P"],["Sunsteel Strike","Steel","P"],["Superpower","Fighting","P"],["Surf","Water","S"],["Surging Strikes","Water","P"],["Swagger","Normal","Z"],["Swords Dance","Normal","Z"],["Synthesis","Grass","Z"],["Tackle","Normal","P"],["Tail Glow","Bug","Z"],["Taunt","Dark","Z"],["Tea Time","Normal","Z"],["Techno Blast","Normal","S"],["Teleport","Psychic","Z"],["Tera Blast","Normal","P"],["Terrain Pulse","Normal","S"],["Thief","Dark","P"],["Throat Chop","Dark","P"],["Thunder","Electric","S"],["Thunderbolt","Electric","S"],["Thunderclap","Electric","P"],["Thunder Fang","Electric","P"],["Thunder Punch","Electric","P"],["Thunder Wave","Electric","Z"],["Torment","Dark","Z"],["Toxic","Poison","Z"],["Toxic Spikes","Poison","Z"],["Trailblaze","Grass","P"],["Trick","Psychic","Z"],["Trick Room","Psychic","Z"],["Triple Axel","Ice","P"],["Trop Kick","Grass","P"],["Twin Beam","Psychic","S"],["U-turn","Bug","P"],["Upper Hand","Fighting","P"],["Vacuum Wave","Fighting","S"],["V-create","Fire","P"],["Victory Dance","Fighting","Z"],["Vine Whip","Grass","P"],["Volt Switch","Electric","S"],["Volt Tackle","Electric","P"],["Waterfall","Water","P"],["Water Pulse","Water","S"],["Water Spout","Water","S"],["Water Gun","Water","S"],["Weather Ball","Normal","S"],["Wicked Blow","Dark","P"],["Wicked Torque","Dark","P"],["Wild Charge","Electric","P"],["Will-O-Wisp","Fire","Z"],["Wish","Normal","Z"],["Wood Hammer","Grass","P"],["Work Up","Normal","Z"],["X-Scissor","Bug","P"],["Yawn","Normal","Z"],["Zen Headbutt","Psychic","P"],["Zing Zap","Electric","P"],["Alluring Voice","Normal","S"],["Burning Jealousy","Fire","S"],["Corrosive Gas","Poison","Z"],["Glaciate","Ice","S"],["Hyper Drill","Normal","P"],["Ice Ball","Ice","P"],["Lash Out","Dark","P"],["Skitter Smack","Bug","P"],["Snap Trap","Grass","P"],["Tar Shot","Rock","Z"],["Terrain Pulse","Normal","S"],["Triple Arrows","Fighting","P"],["Wring Out","Normal","S"]];

const ITEMS = [["Ability Shield",null],["Abomasite","Abomasnow-Mega"],["Absolite","Absol-Mega"],["Absorb Bulb",null],["Aerodactylite","Aerodactyl-Mega"],["Aggronite","Aggron-Mega"],["Aguav Berry",null],["Air Balloon",null],["Alakazite","Alakazam-Mega"],["Altarianite","Altaria-Mega"],["Ampharosite","Ampharos-Mega"],["Assault Vest",null],["Audinite","Audino-Mega"],["Banettite","Banette-Mega"],["Big Root",null],["Black Belt",null],["Black Glasses",null],["Black Sludge",null],["Blastoisinite","Blastoise-Mega"],["Blazikenite","Blaziken-Mega"],["Blue Orb",null],["Booster Energy",null],["Bright Powder",null],["Cameruptite","Camerupt-Mega"],["Cell Battery",null],["Charizardite X","Charizard-Mega-X"],["Charizardite Y","Charizard-Mega-Y"],["Charcoal",null],["Choice Band",null],["Choice Scarf",null],["Choice Specs",null],["Chople Berry",null],["Clear Amulet",null],["Covert Cloak",null],["Custap Berry",null],["Damp Rock",null],["Diancite","Diancie-Mega"],["Dragon Fang",null],["Eject Button",null],["Eject Pack",null],["Electric Seed",null],["Enigma Berry",null],["Eviolite",null],["Expert Belt",null],["Flame Orb",null],["Focus Band",null],["Focus Sash",null],["Galladite","Gallade-Mega"],["Garchompite","Garchomp-Mega"],["Gardevoirite","Gardevoir-Mega"],["Gengarite","Gengar-Mega"],["Glalitite","Glalie-Mega"],["Grassy Seed",null],["Gyaradosite","Gyarados-Mega"],["Hard Stone",null],["Heat Rock",null],["Heavy-Duty Boots",null],["Heracronite","Heracross-Mega"],["Houndoominite","Houndoom-Mega"],["Icy Rock",null],["Iron Ball",null],["Jaboca Berry",null],["Kangaskhanite","Kangaskhan-Mega"],["Kee Berry",null],["King's Rock",null],["Latiasite","Latias-Mega"],["Latiosite","Latios-Mega"],["Leftovers",null],["Leppa Berry",null],["Life Orb",null],["Light Ball",null],["Light Clay",null],["Lopunnite","Lopunny-Mega"],["Lucarionite","Lucario-Mega"],["Luminous Moss",null],["Magnet",null],["Mago Berry",null],["Manectite","Manectric-Mega"],["Mawilite","Mawile-Mega"],["Metagrossite","Metagross-Mega"],["Metal Coat",null],["Metronome",null],["Mirror Herb",null],["Misty Seed",null],["Muscle Band",null],["Mystic Water",null],["Never-Melt Ice",null],["Occa Berry",null],["Oran Berry",null],["Passho Berry",null],["Petaya Berry",null],["Pidgeotite","Pidgeot-Mega"],["Pinsirite","Pinsir-Mega"],["Poison Barb",null],["Psychic Seed",null],["Quick Claw",null],["Razor Claw",null],["Red Card",null],["Red Orb",null],["Rindo Berry",null],["Rocky Helmet",null],["Room Service",null],["Roseli Berry",null],["Sablenite","Sableye-Mega"],["Safety Goggles",null],["Salamencite","Salamence-Mega"],["Salac Berry",null],["Scizorite","Scizor-Mega"],["Scope Lens",null],["Sharp Beak",null],["Sharpedonite","Sharpedo-Mega"],["Shell Bell",null],["Shuca Berry",null],["Silk Scarf",null],["Sitrus Berry",null],["Snowball",null],["Soft Sand",null],["Spell Tag",null],["Steelixite","Steelix-Mega"],["Swampertite","Swampert-Mega"],["Terrain Extender",null],["Throat Spray",null],["Toxic Orb",null],["Tyranitarite","Tyranitar-Mega"],["Utility Umbrella",null],["Venusaurite","Venusaur-Mega"],["Weakness Policy",null],["White Herb",null],["Wide Lens",null],["Wiki Berry",null],["Wise Glasses",null],["Zoom Lens",null]];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getSpriteUrl(num) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${num}.png`;
}
function calcStat(base, ev, iv, nature_mod, is_hp, level = 50) {
  if (is_hp) return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level / 100) + level + 10);
  return Math.floor(Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level / 100) + 5) * nature_mod);
}
function exportShowdown(team) {
  if (!team?.pokemon) return "";
  return team.pokemon.filter(p => p?.species).map(p => {
    const sp = SPECIES.find(s => s[0] === p.species);
    const lines = [];
    const spName = sp?.[1] || p.species;
    lines.push(`${p.nickname ? `${p.nickname} (${spName})` : spName}${p.item ? ` @ ${p.item}` : ""}`);
    if (p.ability) lines.push(`Ability: ${p.ability}`);
    lines.push(`Level: ${p.level || 50}`);
    if (p.tera_type) lines.push(`Tera Type: ${p.tera_type}`);
    const evs = p.evs || {};
    const evStr = STAT_KEYS.filter(k => evs[k] > 0).map(k => `${evs[k]} ${STAT_NAMES[k]}`).join(" / ");
    if (evStr) lines.push(`EVs: ${evStr}`);
    if (p.nature) lines.push(`${p.nature} Nature`);
    const ivs = p.ivs || {};
    const ivStr = STAT_KEYS.filter(k => ivs[k] !== undefined && ivs[k] < 31).map(k => `${ivs[k]} ${STAT_NAMES[k]}`).join(" / ");
    if (ivStr) lines.push(`IVs: ${ivStr}`);
    (p.moves || []).filter(Boolean).forEach(m => lines.push(`- ${m}`));
    return lines.join("\n");
  }).join("\n\n");
}
function parseShowdown(text) {
  return text.trim().split(/\n\n+/).map(block => {
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
    if (!lines.length) return null;
    const p = { moves: [], evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }, level: 50 };
    const itemM = lines[0].match(/^(.+?) @ (.+)$/);
    const nameStr = itemM ? itemM[1] : lines[0];
    if (itemM) p.item = itemM[2].trim();
    const nickM = nameStr.match(/^(.+) \((.+)\)$/);
    const spName = nickM ? nickM[2].trim() : nameStr.trim();
    if (nickM) p.nickname = nickM[1].trim();
    const sp = SPECIES.find(s => s[1].toLowerCase() === spName.toLowerCase());
    if (sp) p.species = sp[0];
    for (const line of lines.slice(1)) {
      if (line.startsWith("Ability: ")) p.ability = line.slice(9);
      else if (line.startsWith("Level: ")) p.level = parseInt(line.slice(7)) || 50;
      else if (line.startsWith("Tera Type: ")) p.tera_type = line.slice(11);
      else if (line.startsWith("EVs: ")) line.slice(5).split(" / ").forEach(s => { const m = s.trim().match(/^(\d+) (.+)$/); if (m) { const k = STAT_KEYS.find(k2 => STAT_NAMES[k2] === m[2]); if (k) p.evs[k] = parseInt(m[1]); } });
      else if (line.endsWith(" Nature")) p.nature = line.replace(" Nature", "");
      else if (line.startsWith("IVs: ")) line.slice(5).split(" / ").forEach(s => { const m = s.trim().match(/^(\d+) (.+)$/); if (m) { const k = STAT_KEYS.find(k2 => STAT_NAMES[k2] === m[2]); if (k) p.ivs[k] = parseInt(m[1]); } });
      else if (line.startsWith("- ")) p.moves.push(line.slice(2));
    }
    return p;
  }).filter(Boolean);
}
function emptyPoke() { return { species: "", nickname: "", item: "", ability: "", tera_type: "", nature: "", level: 50, moves: ["", "", "", ""], evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 } }; }
function emptyTeam() { return { name: "Nuevo equipo", format: "doubles", regulation: "reg-m-a", is_public: false, pokemon: Array(6).fill(null).map(emptyPoke) }; }

// ─── SUPABASE OPERATIONS ──────────────────────────────────────────────────────
async function dbGetTeams(userId) {
  const { data: teams, error: e1 } = await supabase.from("teams").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
  if (e1) throw new Error(e1.message);
  if (!teams.length) return [];
  const { data: pokes, error: e2 } = await supabase.from("team_pokemon").select("*").in("team_id", teams.map(t => t.id));
  if (e2) throw new Error(e2.message);
  return teams.map(t => ({
    ...t,
    pokemon: Array(6).fill(null).map((_, i) => {
      const p = (pokes || []).find(p2 => p2.team_id === t.id && p2.slot === i + 1);
      return p ? { species: p.species, nickname: p.nickname, item: p.item, ability: p.ability, tera_type: p.tera_type, nature: p.nature, level: p.level, moves: p.moves || [], evs: p.evs, ivs: p.ivs } : emptyPoke();
    })
  }));
}
async function dbSaveTeam(team, userId) {
  const payload = { user_id: userId, name: team.name, format: team.format, regulation: team.regulation || "reg-m-a", showdown_export: exportShowdown(team), is_public: !!team.is_public };
  let teamId = team.id;
  if (teamId) {
    const { error: e1 } = await supabase.from("teams").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", teamId);
    if (e1) throw new Error(e1.message);
    const { error: e2 } = await supabase.from("team_pokemon").delete().eq("team_id", teamId);
    if (e2) throw new Error(e2.message);
  } else {
    const { data, error } = await supabase.from("teams").insert(payload).select().single();
    if (error) throw new Error(error.message);
    teamId = data.id;
  }
  const rows = (team.pokemon || []).map((p, i) => p?.species ? { team_id: teamId, slot: i + 1, species: p.species, nickname: p.nickname || null, item: p.item || null, ability: p.ability || null, tera_type: p.tera_type || null, nature: p.nature || null, level: p.level || 50, moves: p.moves || [], evs: p.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, ivs: p.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 } } : null).filter(Boolean);
  if (rows.length) { const { error } = await supabase.from("team_pokemon").insert(rows); if (error) throw new Error(error.message); }
  return teamId;
}
async function dbDeleteTeam(id) { const { error } = await supabase.from("teams").delete().eq("id", id); if (error) throw new Error(error.message); }
async function dbGetBattles(userId) {
  const { data, error } = await supabase.from("battles").select("*,teams(name)").eq("user_id", userId).order("played_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}
async function dbSaveBattle(battle, userId) {
  const payload = { user_id: userId, team_id: battle.team_id || null, format: battle.format, regulation: battle.regulation || "reg-m-a", opponent_name: battle.opponent_name || null, result: battle.result, my_score: battle.my_score !== "" && battle.my_score != null ? parseInt(battle.my_score) : null, opponent_score: battle.opponent_score !== "" && battle.opponent_score != null ? parseInt(battle.opponent_score) : null, notes: battle.notes || null, played_at: battle.played_at || new Date().toISOString() };
  if (battle.id) { const { error } = await supabase.from("battles").update(payload).eq("id", battle.id); if (error) throw new Error(error.message); }
  else { const { error } = await supabase.from("battles").insert(payload); if (error) throw new Error(error.message); }
}
async function dbDeleteBattle(id) { const { error } = await supabase.from("battles").delete().eq("id", id); if (error) throw new Error(error.message); }

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
function TypeBadge({ type, small }) {
  const bg = TYPE_COLORS[type] || "#888";
  return <span style={{ background: bg, color: "#fff", fontSize: small ? 10 : 11, fontWeight: 500, padding: small ? "1px 5px" : "2px 7px", borderRadius: 4, display: "inline-block", whiteSpace: "nowrap" }}>{type}</span>;
}

function Autocomplete({ value, onChange, options, placeholder, getKey, getLabel, renderOpt }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);
  const filtered = useMemo(() => {
    const lq = q.toLowerCase();
    return (q ? options.filter(o => getLabel(o).toLowerCase().includes(lq)) : options).slice(0, 80);
  }, [q, options, getLabel]);
  const sel = value ? options.find(o => getKey(o) === value) : null;
  useEffect(() => { if (!open) setQ(""); }, [open]);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => setOpen(v => !v)} style={{ border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", padding: "5px 10px", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--color-background-primary)", minHeight: 32 }}>
        <span style={{ color: sel ? "var(--color-text-primary)" : "var(--color-text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sel ? getLabel(sel) : placeholder}</span>
        <i className="ti ti-chevron-down" style={{ fontSize: 13, color: "var(--color-text-secondary)", flexShrink: 0 }} aria-hidden />
      </div>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200, background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", marginTop: 2, maxHeight: 260, display: "flex", flexDirection: "column", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
          <div style={{ padding: 6, borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar..." style={{ width: "100%", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, padding: "4px 8px", fontSize: 13, background: "var(--color-background-secondary)", color: "var(--color-text-primary)", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {value && <div onClick={() => { onChange(""); setOpen(false); }} style={{ padding: "6px 10px", cursor: "pointer", fontSize: 12, color: "var(--color-text-danger)" }}>✕ Limpiar</div>}
            {filtered.length === 0 && <div style={{ padding: 12, fontSize: 13, color: "var(--color-text-secondary)", textAlign: "center" }}>Sin resultados</div>}
            {filtered.map(o => (
              <div key={getKey(o)} onClick={() => { onChange(getKey(o)); setOpen(false); }}
                style={{ padding: "5px 10px", cursor: "pointer", fontSize: 13, background: getKey(o) === value ? "var(--color-background-secondary)" : "transparent" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--color-background-secondary)"}
                onMouseLeave={e => e.currentTarget.style.background = getKey(o) === value ? "var(--color-background-secondary)" : "transparent"}>
                {renderOpt ? renderOpt(o) : getLabel(o)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── POKEMON SLOT EDITOR ──────────────────────────────────────────────────────
function PokeSlot({ poke, onChange, idx }) {
  const [tab, setTab] = useState("main");
  const [apiData, setApiData] = useState(null);
  const sp = poke?.species ? SPECIES.find(s => s[0] === poke.species) : null;
  useEffect(() => {
    if (!sp) { setApiData(null); return; }
    fetch(`https://pokeapi.co/api/v2/pokemon/${sp[2]}`)
      .then(r => r.json())
      .then(d => {
        const bs = {};
        d.stats.forEach(s => { const k = s.stat.name === "special-attack" ? "spa" : s.stat.name === "special-defense" ? "spd" : s.stat.name; bs[k] = s.base_stat; });
        setApiData({ baseStats: bs, abilities: d.abilities.map(a => a.ability.name.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")) });
      }).catch(() => setApiData(null));
  }, [poke?.species]);
  const evs = poke?.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  const ivs = poke?.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
  const nat = RAW_NATURES.find(n => n.name === poke?.nature);
  const totalEV = Object.values(evs).reduce((a, b) => a + b, 0);
  function setEV(k, v) { const nv = Math.max(0, Math.min(252, parseInt(v) || 0)); const ne = { ...evs, [k]: nv }; if (Object.values(ne).reduce((a, b) => a + b, 0) <= 508) onChange({ ...poke, evs: ne }); }
  function setIV(k, v) { onChange({ ...poke, ivs: { ...ivs, [k]: Math.max(0, Math.min(31, parseInt(v) || 0)) } }); }
  function cStat(k) {
    if (!apiData?.baseStats) return "—";
    const nm = nat ? (nat.plus === k ? 1.1 : nat.minus === k ? 0.9 : 1) : 1;
    return calcStat(apiData.baseStats[k] || 0, evs[k] || 0, ivs[k] ?? 31, nm, k === "hp");
  }
  const abilities = apiData?.abilities || [];
  return (
    <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
      <div style={{ background: "var(--color-background-secondary)", padding: "8px 12px", display: "flex", alignItems: "center", gap: 10 }}>
        {sp ? <img src={getSpriteUrl(sp[2])} alt={sp[1]} style={{ width: 44, height: 44, objectFit: "contain" }} onError={e => e.target.style.opacity = 0} /> : <div style={{ width: 44, height: 44, background: "var(--color-background-primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "var(--color-text-tertiary)" }}>{idx + 1}</div>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
            {sp ? <><span style={{ fontWeight: 500, fontSize: 13 }}>{sp[1]}</span>{sp[3]?.map(t => <TypeBadge key={t} type={t} small />)}{sp[4] && <span style={{ fontSize: 10, background: "var(--color-background-warning)", color: "var(--color-text-warning)", padding: "1px 5px", borderRadius: 3 }}>MEGA</span>}</> : <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>Slot {idx + 1} vacío</span>}
          </div>
          {poke?.nickname && <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{poke.nickname}</div>}
        </div>
      </div>
      <div style={{ padding: 10 }}>
        <div style={{ marginBottom: 8 }}>
          <Autocomplete value={poke?.species || ""} onChange={v => onChange({ ...emptyPoke(), species: v })} options={SPECIES} placeholder={`Pokémon #${idx + 1}...`} getKey={s => s[0]} getLabel={s => s[1]}
            renderOpt={s => <div style={{ display: "flex", alignItems: "center", gap: 8 }}><img src={getSpriteUrl(s[2])} alt="" style={{ width: 24, height: 24, objectFit: "contain" }} onError={e => e.target.style.display = "none"} /><span style={{ flex: 1 }}>{s[1]}</span><div style={{ display: "flex", gap: 2 }}>{s[3]?.map(t => <TypeBadge key={t} type={t} small />)}</div></div>} />
        </div>
        {sp && <>
          <div style={{ display: "flex", gap: 0, marginBottom: 8, borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
            {[["main", "Principal"], ["evs", "EVs/IVs"], ["moves", "Movimientos"]].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} style={{ padding: "5px 12px", fontSize: 12, background: "transparent", border: "none", borderBottom: `2px solid ${tab === k ? "var(--color-text-primary)" : "transparent"}`, cursor: "pointer", color: tab === k ? "var(--color-text-primary)" : "var(--color-text-secondary)", fontWeight: tab === k ? 500 : 400 }}>{l}</button>
            ))}
          </div>
          {tab === "main" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div><label style={{ fontSize: 11, color: "var(--color-text-secondary)", display: "block", marginBottom: 3 }}>Nickname</label><input value={poke?.nickname || ""} onChange={e => onChange({ ...poke, nickname: e.target.value })} placeholder={sp[1]} style={{ width: "100%", fontSize: 13, padding: "4px 8px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box" }} /></div>
              <div><label style={{ fontSize: 11, color: "var(--color-text-secondary)", display: "block", marginBottom: 3 }}>Objeto</label><Autocomplete value={poke?.item || ""} onChange={v => onChange({ ...poke, item: v })} options={ITEMS} placeholder="Sin objeto" getKey={i => i[0]} getLabel={i => i[0]} renderOpt={i => <span>{i[0]}{i[1] && <span style={{ fontSize: 10, color: "var(--color-text-secondary)", marginLeft: 4 }}>→ {i[1]}</span>}</span>} /></div>
              <div><label style={{ fontSize: 11, color: "var(--color-text-secondary)", display: "block", marginBottom: 3 }}>Habilidad</label><Autocomplete value={poke?.ability || ""} onChange={v => onChange({ ...poke, ability: v })} options={abilities.map(a => ({ id: a }))} placeholder="Elegir..." getKey={a => a.id} getLabel={a => a.id} /></div>
              <div><label style={{ fontSize: 11, color: "var(--color-text-secondary)", display: "block", marginBottom: 3 }}>Naturaleza</label><Autocomplete value={poke?.nature || ""} onChange={v => onChange({ ...poke, nature: v })} options={RAW_NATURES} placeholder="Elegir..." getKey={n => n.name} getLabel={n => { const p = n.plus ? `+${STAT_NAMES[n.plus]}` : ""; const m = n.minus ? `-${STAT_NAMES[n.minus]}` : ""; return `${n.name}${p || m ? ` (${[p, m].filter(Boolean).join(" ")})` : ""}`; }} /></div>
              <div><label style={{ fontSize: 11, color: "var(--color-text-secondary)", display: "block", marginBottom: 3 }}>Tipo Tera</label><Autocomplete value={poke?.tera_type || ""} onChange={v => onChange({ ...poke, tera_type: v })} options={RAW_TYPES.map(t => ({ id: t }))} placeholder="Elegir..." getKey={t => t.id} getLabel={t => t.id} renderOpt={t => <div style={{ display: "flex", alignItems: "center", gap: 6 }}><TypeBadge type={t.id} small /><span>{t.id}</span></div>} /></div>
              <div><label style={{ fontSize: 11, color: "var(--color-text-secondary)", display: "block", marginBottom: 3 }}>Nivel</label><input type="number" min={1} max={100} value={poke?.level || 50} onChange={e => onChange({ ...poke, level: Math.max(1, Math.min(100, parseInt(e.target.value) || 50)) })} style={{ width: "100%", fontSize: 13, padding: "4px 8px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box" }} /></div>
            </div>
          )}
          {tab === "evs" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>EVs: {totalEV}/508</span>
                <div style={{ flex: 1, height: 4, background: "var(--color-background-secondary)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (totalEV / 508) * 100)}%`, background: totalEV > 508 ? "#e24b4a" : "#1d9e75", transition: "width 0.2s" }} />
                </div>
              </div>
              {STAT_KEYS.map(k => {
                const nm = nat ? (nat.plus === k ? 1.1 : nat.minus === k ? 0.9 : 1) : 1;
                const col = nm > 1 ? "#1d9e75" : nm < 1 ? "#e24b4a" : "var(--color-text-secondary)";
                return (
                  <div key={k} style={{ display: "grid", gridTemplateColumns: "32px 1fr 44px 50px 40px", gap: 4, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: col }}>{STAT_NAMES[k]}</span>
                    <input type="range" min={0} max={252} step={4} value={evs[k] || 0} onChange={e => setEV(k, e.target.value)} style={{ margin: 0 }} />
                    <input type="number" min={0} max={252} value={evs[k] || 0} onChange={e => setEV(k, e.target.value)} style={{ fontSize: 11, padding: "2px 3px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 4, background: "var(--color-background-primary)", color: "var(--color-text-primary)", width: "100%", boxSizing: "border-box" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 10, color: "var(--color-text-secondary)" }}>IV<input type="number" min={0} max={31} value={ivs[k] ?? 31} onChange={e => setIV(k, e.target.value)} style={{ width: 28, fontSize: 11, padding: "1px 3px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 3, background: "var(--color-background-primary)", color: "var(--color-text-primary)" }} /></div>
                    <span style={{ fontSize: 11, fontWeight: 500, color: col, textAlign: "right" }}>{cStat(k)}</span>
                  </div>
                );
              })}
            </div>
          )}
          {tab === "moves" && (
            <div>{[0, 1, 2, 3].map(i => {
              const moves = poke?.moves || [];
              return (
                <div key={i} style={{ marginBottom: 6 }}>
                  <label style={{ fontSize: 11, color: "var(--color-text-secondary)", display: "block", marginBottom: 3 }}>Movimiento {i + 1}</label>
                  <Autocomplete value={moves[i] || ""} onChange={v => { const nm = [...(poke?.moves || ["", "", "", ""])]; nm[i] = v; onChange({ ...poke, moves: nm }); }} options={MOVES} placeholder="Elegir movimiento..." getKey={m => m[0]} getLabel={m => m[0]}
                    renderOpt={m => <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}><span>{m[0]}</span><div style={{ display: "flex", gap: 4, alignItems: "center" }}><TypeBadge type={m[1]} small /><span style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{m[2] === "S" ? "Esp" : m[2] === "P" ? "Fís" : "Est"}</span></div></div>} />
                </div>
              );
            })}</div>
          )}
        </>}
      </div>
    </div>
  );
}

// ─── TEAMBUILDER PAGE ─────────────────────────────────────────────────────────
function Teambuilder({ team, onSave, onBack }) {
  const [current, setCurrent] = useState(team ? { ...team } : emptyTeam());
  const [saving, setSaving] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [copied, setCopied] = useState(false);
  const exportText = exportShowdown(current);
  function updatePoke(i, val) { const p = [...current.pokemon]; p[i] = val; setCurrent({ ...current, pokemon: p }); }
  async function handleSave() { setSaving(true); try { await onSave(current); } finally { setSaving(false); } }
  function handleImport() {
    const parsed = parseShowdown(importText);
    if (parsed.length) {
      const p = Array(6).fill(null).map((_, i) => parsed[i] || emptyPoke());
      setCurrent({ ...current, pokemon: p });
      setShowImport(false); setImportText("");
    }
  }
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <button onClick={onBack} style={{ background: "transparent", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", padding: "6px 12px", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}><i className="ti ti-arrow-left" aria-hidden /> Volver</button>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 500, flex: 1 }}>{current.id ? "Editar equipo" : "Nuevo equipo"}</h2>
        <button onClick={() => setShowImport(v => !v)} style={{ background: "transparent", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", padding: "6px 10px", cursor: "pointer", fontSize: 12, color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 5 }}><i className="ti ti-upload" aria-hidden /> Importar</button>
        <button onClick={() => setShowExport(v => !v)} style={{ background: "transparent", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", padding: "6px 10px", cursor: "pointer", fontSize: 12, color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 5 }}><i className="ti ti-download" aria-hidden /> Exportar</button>
        <button onClick={handleSave} disabled={saving} style={{ background: "var(--color-text-primary)", color: "var(--color-background-primary)", border: "none", borderRadius: "var(--border-radius-md)", padding: "6px 16px", cursor: "pointer", fontSize: 13, fontWeight: 500, opacity: saving ? 0.6 : 1 }}>{saving ? "Guardando..." : "Guardar"}</button>
      </div>
      {showImport && (
        <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: 12, marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Importar desde formato Showdown</label>
          <textarea value={importText} onChange={e => setImportText(e.target.value)} rows={8} placeholder="Pega el texto del equipo aquí..." style={{ width: "100%", fontSize: 12, fontFamily: "var(--font-mono)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, padding: 8, background: "var(--color-background-primary)", color: "var(--color-text-primary)", resize: "vertical", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={handleImport} style={{ background: "var(--color-text-primary)", color: "var(--color-background-primary)", border: "none", borderRadius: "var(--border-radius-md)", padding: "6px 14px", cursor: "pointer", fontSize: 13 }}>Importar</button>
            <button onClick={() => { setShowImport(false); setImportText(""); }} style={{ background: "transparent", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", padding: "6px 14px", cursor: "pointer", fontSize: 13, color: "var(--color-text-secondary)" }}>Cancelar</button>
          </div>
        </div>
      )}
      {showExport && (
        <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: 12, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500 }}>Formato Showdown</label>
            <button onClick={() => { navigator.clipboard.writeText(exportText); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ background: "transparent", border: "0.5px solid var(--color-border-secondary)", borderRadius: 6, padding: "2px 10px", cursor: "pointer", fontSize: 12, color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 4 }}><i className={`ti ti-${copied ? "check" : "copy"}`} aria-hidden /> {copied ? "Copiado" : "Copiar"}</button>
          </div>
          <pre style={{ fontSize: 11, fontFamily: "var(--font-mono)", margin: 0, whiteSpace: "pre-wrap", color: "var(--color-text-primary)", maxHeight: 200, overflowY: "auto" }}>{exportText || "(equipo vacío)"}</pre>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div><label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Nombre del equipo</label><input value={current.name} onChange={e => setCurrent({ ...current, name: e.target.value })} style={{ width: "100%", fontSize: 14, fontWeight: 500, border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", padding: "5px 10px", background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box" }} /></div>
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Formato</label>
          <div style={{ display: "flex", gap: 6 }}>
            {[["singles", "Singles"], ["doubles", "Doubles (VGC)"]].map(([v, l]) => (
              <button key={v} onClick={() => setCurrent({ ...current, format: v })} style={{ flex: 1, padding: "5px 8px", fontSize: 12, border: `0.5px solid ${current.format === v ? "var(--color-text-primary)" : "var(--color-border-secondary)"}`, borderRadius: "var(--border-radius-md)", cursor: "pointer", background: current.format === v ? "var(--color-background-secondary)" : "transparent", color: "var(--color-text-primary)", fontWeight: current.format === v ? 500 : 400 }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: "var(--color-text-secondary)" }}>
          <input type="checkbox" checked={!!current.is_public} onChange={e => setCurrent({ ...current, is_public: e.target.checked })} />
          Equipo público (compartible con link)
        </label>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {(current.pokemon || []).map((poke, i) => <PokeSlot key={i} idx={i} poke={poke} onChange={val => updatePoke(i, val)} />)}
      </div>
    </div>
  );
}

// ─── TEAMS LIST ───────────────────────────────────────────────────────────────
function TeamCard({ team, onEdit, onDelete }) {
  const [showExp, setShowExp] = useState(false);
  const [copied, setCopied] = useState(false);
  const filled = (team.pokemon || []).filter(p => p?.species);
  return (
    <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{team.name}</h3>
          <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, background: "var(--color-background-secondary)", color: "var(--color-text-secondary)", padding: "1px 6px", borderRadius: 3 }}>{team.format === "doubles" ? "Doubles VGC" : "Singles"}</span>
            <span style={{ fontSize: 10, background: "var(--color-background-secondary)", color: "var(--color-text-secondary)", padding: "1px 6px", borderRadius: 3 }}>{(team.regulation || "reg-m-a").toUpperCase()}</span>
            {team.is_public && <span style={{ fontSize: 10, background: "var(--color-background-info)", color: "var(--color-text-info)", padding: "1px 6px", borderRadius: 3 }}>Público</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button onClick={() => setShowExp(v => !v)} title="Exportar" style={{ background: "transparent", border: "0.5px solid var(--color-border-secondary)", borderRadius: 6, padding: "4px 7px", cursor: "pointer", fontSize: 13, color: "var(--color-text-secondary)" }}><i className="ti ti-download" aria-hidden /></button>
          <button onClick={() => onEdit(team)} title="Editar" style={{ background: "transparent", border: "0.5px solid var(--color-border-secondary)", borderRadius: 6, padding: "4px 7px", cursor: "pointer", fontSize: 13, color: "var(--color-text-secondary)" }}><i className="ti ti-edit" aria-hidden /></button>
          <button onClick={() => onDelete(team.id)} title="Eliminar" style={{ background: "transparent", border: "0.5px solid var(--color-border-danger)", borderRadius: 6, padding: "4px 7px", cursor: "pointer", fontSize: 13, color: "var(--color-text-danger)" }}><i className="ti ti-trash" aria-hidden /></button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: showExp ? 8 : 0 }}>
        {filled.map((p, i) => { const sp = SPECIES.find(s => s[0] === p.species); return sp ? <div key={i} title={sp[1]}><img src={getSpriteUrl(sp[2])} alt={sp[1]} style={{ width: 36, height: 36, objectFit: "contain" }} onError={e => e.target.style.opacity = 0} /></div> : null; })}
        {filled.length === 0 && <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>Equipo vacío</span>}
      </div>
      {showExp && (
        <div style={{ background: "var(--color-background-secondary)", borderRadius: 6, padding: 8 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
            <button onClick={() => { navigator.clipboard.writeText(team.showdown_export || ""); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ fontSize: 11, background: "transparent", border: "0.5px solid var(--color-border-secondary)", borderRadius: 4, padding: "2px 8px", cursor: "pointer", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 3 }}><i className={`ti ti-${copied ? "check" : "copy"}`} aria-hidden /> {copied ? "Copiado" : "Copiar"}</button>
          </div>
          <pre style={{ fontSize: 11, fontFamily: "var(--font-mono)", margin: 0, whiteSpace: "pre-wrap", color: "var(--color-text-secondary)", maxHeight: 140, overflowY: "auto" }}>{team.showdown_export || "(sin export)"}</pre>
        </div>
      )}
    </div>
  );
}

function TeamsPage({ userId }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState("list");
  const [err, setErr] = useState("");
  async function load() { setLoading(true); try { setTeams(await dbGetTeams(userId)); setErr(""); } catch (e) { setErr(e.message); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  async function handleSave(team) { try { await dbSaveTeam(team, userId); await load(); setView("list"); } catch (e) { alert("Error al guardar: " + e.message); } }
  async function handleDelete(id) { if (!window.confirm("¿Eliminar este equipo?")) return; try { await dbDeleteTeam(id); await load(); } catch (e) { alert("Error: " + e.message); } }
  if (view === "edit") return <Teambuilder team={editing} onSave={handleSave} onBack={() => { setView("list"); setEditing(null); }} />;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Mis equipos</h2>
        <button onClick={() => { setEditing(null); setView("edit"); }} style={{ background: "var(--color-text-primary)", color: "var(--color-background-primary)", border: "none", borderRadius: "var(--border-radius-md)", padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}><i className="ti ti-plus" aria-hidden /> Nuevo equipo</button>
      </div>
      {err && <div style={{ color: "var(--color-text-danger)", fontSize: 13, marginBottom: 10, padding: "8px 12px", background: "var(--color-background-danger)", borderRadius: "var(--border-radius-md)" }}>{err}</div>}
      {loading ? <div style={{ textAlign: "center", padding: 40, color: "var(--color-text-secondary)" }}>Cargando equipos...</div> :
        teams.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: "var(--color-text-secondary)" }}><div style={{ fontSize: 32, marginBottom: 8 }}>⚔️</div><p style={{ margin: 0 }}>No tenés equipos todavía. ¡Creá el primero!</p></div> :
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {teams.map(t => <TeamCard key={t.id} team={t} onEdit={t => { setEditing(t); setView("edit"); }} onDelete={handleDelete} />)}
          </div>}
    </div>
  );
}

// ─── BATTLES PAGE ─────────────────────────────────────────────────────────────
function BattlesPage({ userId }) {
  const [battles, setBattles] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ format: "doubles", regulation: "reg-m-a", result: "win", my_score: "", opponent_score: "", opponent_name: "", notes: "", team_id: "", played_at: new Date().toISOString().slice(0, 16) });
  const [saving, setSaving] = useState(false);
  async function load() {
    setLoading(true);
    try {
      const [b, t] = await Promise.all([dbGetBattles(userId), dbGetTeams(userId)]);
      setBattles(b); setTeams(t);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  async function submit() {
    if (!form.result) return;
    setSaving(true);
    try { await dbSaveBattle(form, userId); await load(); setShowForm(false); setForm({ format: "doubles", regulation: "reg-m-a", result: "win", my_score: "", opponent_score: "", opponent_name: "", notes: "", team_id: "", played_at: new Date().toISOString().slice(0, 16) }); }
    finally { setSaving(false); }
  }
  async function delBattle(id) { if (!window.confirm("¿Eliminar este combate?")) return; await dbDeleteBattle(id); await load(); }
  const stats = useMemo(() => {
    const w = battles.filter(b => b.result === "win").length;
    const l = battles.filter(b => b.result === "loss").length;
    const t = battles.filter(b => b.result === "tie").length;
    const total = battles.length;
    return { w, l, t, total, wr: total ? Math.round((w / total) * 100) : 0 };
  }, [battles]);
  const resultColor = { win: "#1d9e75", loss: "#e24b4a", tie: "#ba7517" };
  const resultLabel = { win: "Victoria", loss: "Derrota", tie: "Empate" };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Registro de combates</h2>
        <button onClick={() => setShowForm(v => !v)} style={{ background: "var(--color-text-primary)", color: "var(--color-background-primary)", border: "none", borderRadius: "var(--border-radius-md)", padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}><i className="ti ti-plus" aria-hidden /> Nuevo combate</button>
      </div>
      {stats.total > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
          {[["Combates", stats.total, "#888"], ["Victorias", stats.w, "#1d9e75"], ["Derrotas", stats.l, "#e24b4a"], ["Win Rate", `${stats.wr}%`, stats.wr >= 50 ? "#1d9e75" : "#e24b4a"]].map(([l, v, c]) => (
            <div key={l} style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "8px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: c }}>{v}</div>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: 14, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 500 }}>Registrar combate</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 3 }}>Rival</label><input value={form.opponent_name} onChange={e => setForm({ ...form, opponent_name: e.target.value })} placeholder="Nombre del rival" style={{ width: "100%", fontSize: 13, padding: "5px 8px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box" }} /></div>
            <div><label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 3 }}>Formato</label><div style={{ display: "flex", gap: 5 }}>{[["singles", "Singles"], ["doubles", "Doubles"]].map(([v, l]) => <button key={v} onClick={() => setForm({ ...form, format: v })} style={{ flex: 1, padding: "5px", fontSize: 12, border: `0.5px solid ${form.format === v ? "var(--color-text-primary)" : "var(--color-border-secondary)"}`, borderRadius: 6, cursor: "pointer", background: form.format === v ? "var(--color-background-primary)" : "transparent", color: "var(--color-text-primary)", fontWeight: form.format === v ? 500 : 400 }}>{l}</button>)}</div></div>
            <div><label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 3 }}>Resultado</label><div style={{ display: "flex", gap: 5 }}>{[["win", "Victoria", "#1d9e75"], ["loss", "Derrota", "#e24b4a"], ["tie", "Empate", "#ba7517"]].map(([v, l, c]) => <button key={v} onClick={() => setForm({ ...form, result: v })} style={{ flex: 1, padding: "5px", fontSize: 12, border: `0.5px solid ${form.result === v ? c : "var(--color-border-secondary)"}`, borderRadius: 6, cursor: "pointer", background: form.result === v ? c + "22" : "transparent", color: form.result === v ? c : "var(--color-text-secondary)", fontWeight: form.result === v ? 500 : 400 }}>{l}</button>)}</div></div>
            <div><label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 3 }}>Marcador (tuyo / rival)</label><div style={{ display: "flex", gap: 6, alignItems: "center" }}><input type="number" min={0} max={4} value={form.my_score} onChange={e => setForm({ ...form, my_score: e.target.value })} placeholder="0" style={{ width: 50, fontSize: 13, padding: "4px 6px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, background: "var(--color-background-primary)", color: "var(--color-text-primary)", textAlign: "center" }} /><span style={{ color: "var(--color-text-secondary)" }}>-</span><input type="number" min={0} max={4} value={form.opponent_score} onChange={e => setForm({ ...form, opponent_score: e.target.value })} placeholder="0" style={{ width: 50, fontSize: 13, padding: "4px 6px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, background: "var(--color-background-primary)", color: "var(--color-text-primary)", textAlign: "center" }} /></div></div>
            <div><label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 3 }}>Equipo usado</label><Autocomplete value={form.team_id} onChange={v => setForm({ ...form, team_id: v })} options={[{ id: "", name: "Sin especificar" }, ...teams.map(t => ({ id: t.id, name: t.name }))]} placeholder="Opcional..." getKey={t => t.id} getLabel={t => t.name} /></div>
            <div><label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 3 }}>Fecha</label><input type="datetime-local" value={form.played_at} onChange={e => setForm({ ...form, played_at: e.target.value })} style={{ width: "100%", fontSize: 12, padding: "5px 8px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box" }} /></div>
            <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 3 }}>Notas</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Estrategia usada, qué salió bien/mal..." style={{ width: "100%", fontSize: 13, padding: "5px 8px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, background: "var(--color-background-primary)", color: "var(--color-text-primary)", resize: "vertical", boxSizing: "border-box" }} /></div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={submit} disabled={saving} style={{ background: "var(--color-text-primary)", color: "var(--color-background-primary)", border: "none", borderRadius: "var(--border-radius-md)", padding: "6px 16px", cursor: "pointer", fontSize: 13, opacity: saving ? 0.6 : 1 }}>{saving ? "Guardando..." : "Guardar"}</button>
            <button onClick={() => setShowForm(false)} style={{ background: "transparent", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", padding: "6px 14px", cursor: "pointer", fontSize: 13, color: "var(--color-text-secondary)" }}>Cancelar</button>
          </div>
        </div>
      )}
      {loading ? <div style={{ textAlign: "center", padding: 40, color: "var(--color-text-secondary)" }}>Cargando...</div> :
        battles.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: "var(--color-text-secondary)" }}><div style={{ fontSize: 32, marginBottom: 8 }}>🥊</div><p style={{ margin: 0 }}>No hay combates registrados todavía.</p></div> :
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {battles.map(b => (
              <div key={b.id} style={{ background: "var(--color-background-primary)", border: `0.5px solid var(--color-border-tertiary)`, borderLeft: `3px solid ${resultColor[b.result]}`, borderRadius: "var(--border-radius-md)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 70, flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: resultColor[b.result] }}>{resultLabel[b.result]}</div>
                  {(b.my_score != null || b.opponent_score != null) && <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{b.my_score ?? "?"} - {b.opponent_score ?? "?"}</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{b.opponent_name || <span style={{ color: "var(--color-text-tertiary)" }}>Rival desconocido</span>}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 2, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{b.format === "doubles" ? "Doubles" : "Singles"}</span>
                    {b.teams?.name && <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>· {b.teams.name}</span>}
                    <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>· {new Date(b.played_at).toLocaleDateString("es")}</span>
                  </div>
                  {b.notes && <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.notes}</div>}
                </div>
                <button onClick={() => delBattle(b.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-tertiary)", fontSize: 16, padding: 4, flexShrink: 0 }}><i className="ti ti-trash" aria-hidden /></button>
              </div>
            ))}
          </div>}
    </div>
  );
}

// ── AUTH PAGE ─────────────────────────────────────────────────────────────────
function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  async function submit() {
    setErr(""); setLoading(true);
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        onAuth({ userId: data.user.id, email: data.user.email });
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password: pass, options: { data: { username, display_name: username } } });
        if (error) throw error;
        if (data.session) onAuth({ userId: data.user.id, email: data.user.email });
        else setDone(true);
      }
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  if (done) return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <i className="ti ti-mail" style={{ fontSize: 44, display: "block", marginBottom: 12, color: "var(--color-text-secondary)" }} aria-hidden />
      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>Revisá tu email</div>
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Te enviamos un link de confirmación a <strong>{email}</strong>. Luego podés iniciar sesión.</div>
      <button onClick={() => { setDone(false); setMode("login"); }} style={{ marginTop: 16, background: "transparent", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", padding: "6px 16px", cursor: "pointer", fontSize: 13, color: "var(--color-text-secondary)" }}>Volver al login</button>
    </div>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 4 }}>PokePlayVGC</div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Tu tracker de combates Pokémon Champions</div>
        </div>
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "24px" }}>
          <div style={{ display: "flex", marginBottom: 20, borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
            {[["login", "Iniciar sesión"], ["register", "Registrarse"]].map(([m, l]) => (
              <button key={m} onClick={() => { setMode(m); setErr(""); }} style={{ flex: 1, padding: "8px", fontSize: 13, background: "transparent", border: "none", borderBottom: `2px solid ${mode === m ? "var(--color-text-primary)" : "transparent"}`, cursor: "pointer", color: mode === m ? "var(--color-text-primary)" : "var(--color-text-secondary)", fontWeight: mode === m ? 500 : 400 }}>{l}</button>
            ))}
          </div>
          {err && <div style={{ color: "var(--color-text-danger)", fontSize: 12, marginBottom: 12, padding: "7px 10px", background: "var(--color-background-danger)", borderRadius: "var(--border-radius-md)" }}>{err}</div>}
          {mode === "register" && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Nombre de entrenador</label>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="TrainerRed99" style={{ width: "100%", fontSize: 14, padding: "7px 10px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box" }} />
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="trainer@pokemon.com" style={{ width: "100%", fontSize: 14, padding: "7px 10px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Contraseña</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="••••••••" style={{ width: "100%", fontSize: 14, padding: "7px 10px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box" }} />
          </div>
          <button onClick={submit} disabled={loading || !email || !pass} style={{ width: "100%", background: "var(--color-text-primary)", color: "var(--color-background-primary)", border: "none", borderRadius: "var(--border-radius-md)", padding: "9px", fontSize: 14, fontWeight: 500, cursor: "pointer", opacity: loading || !email || !pass ? 0.6 : 1 }}>
            {loading ? "..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [auth, setAuth] = useState(null);
  const [page, setPage] = useState("teams");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setAuth({ userId: session.user.id, email: session.user.email });
      setChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) setAuth({ userId: session.user.id, email: session.user.email });
      else setAuth(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() { await supabase.auth.signOut(); setAuth(null); }

  if (checking) return <div style={{ textAlign: "center", padding: 60, color: "var(--color-text-secondary)" }}>Cargando...</div>;
  if (!auth) return <AuthPage onAuth={setAuth} />;

  return (
    <div>
      <div style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "0 16px", display: "flex", alignItems: "center", gap: 0, background: "var(--color-background-primary)" }}>
        <span style={{ fontWeight: 500, fontSize: 15, padding: "12px 0", marginRight: 16, letterSpacing: "-0.01em" }}>PokePlayVGC</span>
        <div style={{ flex: 1, display: "flex" }}>
          {[["teams", "Equipos", "ti-shield"], ["battles", "Combates", "ti-sword"]].map(([p, l, ic]) => (
            <button key={p} onClick={() => setPage(p)} style={{ padding: "12px 14px", fontSize: 13, background: "transparent", border: "none", borderBottom: `2px solid ${page === p ? "var(--color-text-primary)" : "transparent"}`, cursor: "pointer", color: page === p ? "var(--color-text-primary)" : "var(--color-text-secondary)", fontWeight: page === p ? 500 : 400, display: "flex", alignItems: "center", gap: 5 }}>
              <i className={`ti ${ic}`} aria-hidden /> {l}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{auth.email}</span>
          <button onClick={handleLogout} style={{ background: "transparent", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", padding: "4px 10px", cursor: "pointer", fontSize: 12, color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
            <i className="ti ti-logout" aria-hidden /> Salir
          </button>
        </div>
      </div>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 16px" }}>
        {page === "teams" && <TeamsPage userId={auth.userId} />}
        {page === "battles" && <BattlesPage userId={auth.userId} />}
      </div>
    </div>
  );
}
